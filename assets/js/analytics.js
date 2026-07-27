/**
 * GA4 event tracking.
 *
 * One delegated listener on `document` reads `data-track` attributes off
 * whatever was clicked. The previous build bound handlers from two separate
 * files behind `setTimeout(…, 2000)` calls, which raced the render and made
 * every contact click fire twice — inflating the numbers in GA.
 */

const send = (name, params = {}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
  if (window.__portfolioDebugAnalytics) {
    console.debug('[analytics]', name, params);
  }
};

export function track(name, params) {
  send(name, params);
}

/** Reads `data-track-*` into a params object, minus the event name itself. */
function paramsFrom(dataset) {
  const params = {};
  for (const [key, value] of Object.entries(dataset)) {
    if (!key.startsWith('track') || key === 'track') continue;
    const name = key.slice(5);
    params[name.charAt(0).toLowerCase() + name.slice(1)] = value;
  }
  return params;
}

export function initAnalytics() {
  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-track]');
    if (!target) return;
    send(target.dataset.track, paramsFrom(target.dataset));
  });

  /* <details> toggles aren't clicks we can read reliably, so listen for the
     state change instead — and only report opens. */
  document.addEventListener('toggle', (event) => {
    const node = event.target;
    if (!(node instanceof HTMLDetailsElement) || !node.open) return;
    if (!node.dataset.track) return;
    send(node.dataset.track, paramsFrom(node.dataset));
  }, true);

  trackSectionViews();
  trackScrollDepth();
  trackTimeOnPage();
}

/** Fires once per section, the first time it is meaningfully on screen. */
function trackSectionViews() {
  const sections = document.querySelectorAll('[data-section]');
  if (!sections.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      send('section_view', { section_name: entry.target.dataset.section });
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.35 });

  sections.forEach((s) => observer.observe(s));
}

function trackScrollDepth() {
  const thresholds = [25, 50, 75, 90];
  const hit = new Set();

  const onScroll = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const percent = Math.round((window.scrollY / scrollable) * 100);

    for (const t of thresholds) {
      if (percent >= t && !hit.has(t)) {
        hit.add(t);
        send('scroll_depth', { scroll_percent: t });
      }
    }
    if (hit.size === thresholds.length) window.removeEventListener('scroll', onScroll);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
}

/**
 * Reports engaged time once, on the way out. `visibilitychange` is used rather
 * than `beforeunload` because the latter is unreliable on mobile.
 */
function trackTimeOnPage() {
  const start = Date.now();
  let reported = false;

  const report = () => {
    if (reported) return;
    const seconds = Math.round((Date.now() - start) / 1000);
    if (seconds < 5) return;
    reported = true;
    send('page_time', { time_seconds: seconds });
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') report();
  });
  window.addEventListener('pagehide', report);
}
