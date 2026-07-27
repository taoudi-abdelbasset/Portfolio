import { $, el, clear } from './dom.js';
import { icon } from './icons.js';
import { loadPortfolioDataWithCache } from './data-source.js';
import { normalize } from './normalize.js';
import { initAnalytics, track } from './analytics.js';
import { initTheme } from './theme.js';
import { initReveal } from './reveal.js';
import { initNav } from './nav.js';
import { renderHero } from './sections/hero.js';
import { renderLedger } from './sections/ledger.js';
import { renderSkills } from './sections/skills.js';
import { renderContact } from './sections/contact.js';
import { createProjectsController } from './projects/controller.js';
import { createViewer } from './projects/viewer.js';

let controller = null;
let viewer = null;

boot();

async function boot() {
  initAnalytics();
  initTheme();

  try {
    const result = await loadPortfolioDataWithCache(onFreshData);
    apply(result);
  } catch (error) {
    console.error('[portfolio] no data source available', error);
    showFatal();
  }
}

/**
 * Called only when a background revalidation finds genuinely different
 * content, so a returning visitor sees an update without a reload.
 */
function onFreshData(result) {
  apply(result);
  notify('Content updated.', { level: 'info' });
}

function apply({ data: raw, origin, degraded }) {
  const data = normalize(raw);

  renderSections(data);
  applyMetadata(data);

  initNav();
  initReveal();

  if (degraded) {
    notify(
      origin === 'cache-stale'
        ? 'Showing a saved copy — the live content could not be reached.'
        : 'Showing the bundled copy — the live content could not be reached.',
    );
  }

  console.info(`[portfolio] data source: ${origin}`);
}

/* ------------------------------------------------------------- rendering -- */

function renderSections(data) {
  renderHero(data);

  toggleSection('experience', data.experience.length, () =>
    renderLedger($('[data-experience]'), data.experience, { kind: 'experience' }));

  toggleSection('education', data.education.length, () =>
    renderLedger($('[data-education]'), data.education, { kind: 'education' }));

  toggleSection('skills', data.skills.length, () =>
    renderSkills($('[data-skills]'), data.skills));

  toggleSection('contact', data.contact.length, () =>
    renderContact($('[data-contact]'), data.contact, data.main));

  toggleSection('work', data.projects.length, () => setupWork(data));

  const footer = $('[data-footer-copy]');
  if (footer) {
    clear(footer);
    footer.append(`© ${new Date().getFullYear()} ${data.main.name}`);
  }
}

/** A section with no data is removed from the page and from the nav. */
function toggleSection(name, hasContent, render) {
  const section = document.querySelector(`[data-section="${name}"]`);
  if (!section) return;

  section.hidden = !hasContent;
  if (hasContent) render();
}

function setupWork(data) {
  /* Rebuilt on refresh so the viewer always walks the current result list.
     The old controller is torn down first, or its listeners would double up. */
  controller?.destroy();

  controller = createProjectsController({
    data,
    onOpen: (project) => viewer?.open(project),
  });

  if (!viewer) {
    viewer = createViewer({ controller: proxyController() });
    viewer.handleHash();
  } else {
    viewer.updateNav();
  }
}

/** Keeps the viewer pointed at the live controller across re-renders. */
function proxyController() {
  return {
    getVisible: () => controller?.getVisible() ?? [],
    findBySlug: (slug) => controller?.findBySlug(slug),
  };
}

/* -------------------------------------------------------------- metadata -- */

/** Title, description, OG tags and Person schema, all derived from the JSON. */
function applyMetadata(data) {
  const { main } = data;
  const role = main.roles[0] || 'Portfolio';
  const title = `${main.name} — ${role}`;
  const description = main.bio || main.statement || title;

  document.title = title;
  setMeta('name', 'description', description);
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  if (main.img) setMeta('property', 'og:image', main.img);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: main.name,
    description: main.bio || undefined,
    image: main.img || undefined,
    jobTitle: main.roles.join(', ') || undefined,
    url: location.origin + location.pathname,
    address: main.location || undefined,
    sameAs: data.contact.filter((c) => c.external).map((c) => c.href),
    knowsAbout: data.technologies.slice(0, 20).map((t) => t.label),
  };

  let script = document.getElementById('person-schema');
  if (!script) {
    script = el('script', { type: 'application/ld+json', id: 'person-schema' });
    document.head.append(script);
  }
  script.textContent = JSON.stringify(schema, null, 0);
}

function setMeta(attr, key, value) {
  if (!value) return;
  let node = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!node) {
    node = el('meta', { [attr]: key });
    document.head.append(node);
  }
  node.setAttribute('content', value);
}

/* ----------------------------------------------------------------- toast -- */

let toastTimer;

function notify(message, { level = 'warn' } = {}) {
  const toast = $('[data-toast]');
  if (!toast) return;

  clearTimeout(toastTimer);
  clear(toast);

  toast.style.borderInlineStartColor = level === 'info' ? 'var(--good)' : 'var(--warn)';
  toast.append(
    icon(level === 'info' ? 'check' : 'alert', { size: 16 }),
    el('span', null, message),
    el('button', {
      type: 'button',
      'aria-label': 'Dismiss',
      on: { click: () => { toast.hidden = true; } },
    }, '×'),
  );

  toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 8000);

  track('data_source_notice', { message, level });
}

function showFatal() {
  const hero = $('[data-hero-statement]');
  if (!hero) return;
  clear(hero);
  hero.append('Content unavailable');

  const bio = $('[data-hero-bio]');
  if (bio) {
    clear(bio);
    bio.hidden = false;
    bio.append(
      'The portfolio data could not be loaded from any source. ',
      el('a', { href: 'data/portfolio.json' }, 'View the raw data'),
      ' or try reloading.',
    );
  }
}
