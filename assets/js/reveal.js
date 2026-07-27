/**
 * Scroll reveals, replacing the AOS library (and its CDN request).
 * Elements marked `.reveal` fade and rise 12px once, staggered within a row.
 */
export function initReveal(root = document) {
  const items = root.querySelectorAll('.reveal:not(.is-visible)');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach((node) => node.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    /* Stagger only within a single batch, so a long list doesn't accumulate a
       delay that leaves the last card waiting seconds to appear. */
    let step = 0;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.style.setProperty('--reveal-delay', `${Math.min(step, 5) * 55}ms`);
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
      step += 1;
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

  items.forEach((node) => {
    /* Anything already scrolled past will never re-enter from below, so the
       observer would leave it stuck at opacity 0. Show it outright. */
    if (node.getBoundingClientRect().bottom < 0) {
      node.classList.add('is-visible');
      return;
    }
    observer.observe(node);
  });
}
