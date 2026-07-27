import { el, clear, $ } from '../dom.js';
import { icon } from '../icons.js';
import { track } from '../analytics.js';

/**
 * Project detail viewer, built on a native <dialog>: top layer, backdrop, Esc
 * and focus trapping come from the platform rather than being hand-rolled.
 *
 * Beyond presentation it adds prev/next through the *current filtered set* and
 * a `#project/<slug>` deep link, so a single project can be shared directly.
 */
export function createViewer({ controller }) {
  const dialog = $('[data-viewer]');
  const body = $('[data-viewer-body]');
  const scroll = $('[data-viewer-scroll]');
  const counter = $('[data-viewer-counter]');
  const prevBtn = $('[data-viewer-prev]');
  const nextBtn = $('[data-viewer-next]');
  const copyBtn = $('[data-viewer-copy]');
  const closeBtn = $('[data-viewer-close]');

  let current = null;
  let opener = null;
  let suppressHashHandling = false;

  fill(prevBtn, 'chevron-left');
  fill(nextBtn, 'chevron-right');
  fill(copyBtn, 'link');
  fill(closeBtn, 'x');

  /* ---------------------------------------------------------------- open -- */

  function open(project, { fromHash = false } = {}) {
    if (!project) return;
    current = project;

    if (!fromHash) opener = document.activeElement;

    render(project);
    if (!dialog.open) dialog.showModal();
    scroll.scrollTop = 0;
    document.body.style.overflow = 'hidden';

    setHash(`#project/${project.slug}`);
    updateNav();

    track('project_view', {
      project_name: project.title,
      project_category: project.categories.join(',') || 'uncategorised',
    });
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  dialog.addEventListener('close', () => {
    document.body.style.overflow = '';
    current = null;
    clear(body); // stops any embedded video from playing on
    if (location.hash.startsWith('#project/')) setHash('');
    if (opener && document.contains(opener)) opener.focus();
    opener = null;
  });

  /* Clicking the backdrop (i.e. the dialog element itself) closes. */
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) close();
  });

  closeBtn.addEventListener('click', close);

  /* ------------------------------------------------------------ prev/next -- */

  function siblings() {
    const list = controller.getVisible();
    const at = current ? list.findIndex((p) => p.slug === current.slug) : -1;
    return { list, at };
  }

  function step(delta) {
    const { list, at } = siblings();
    if (at < 0) return;
    const next = list[at + delta];
    if (next) open(next);
  }

  function updateNav() {
    const { list, at } = siblings();
    const known = at >= 0;

    prevBtn.disabled = !known || at === 0;
    nextBtn.disabled = !known || at === list.length - 1;

    clear(counter);
    counter.append(known ? `${at + 1} / ${list.length}` : '');
  }

  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
  });

  /* ------------------------------------------------------------ copy link -- */

  copyBtn.addEventListener('click', async () => {
    if (!current) return;
    const url = `${location.origin}${location.pathname}#project/${current.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      flash(copyBtn, 'check');
      track('project_link_click', { project_name: current.title, link: 'copy' });
    } catch {
      /* Clipboard is permission-gated; putting it in the address bar is the
         next best thing the user can act on. */
      setHash(`#project/${current.slug}`);
      flash(copyBtn, 'link');
    }
  });

  function flash(button, name) {
    clear(button);
    button.append(icon(name, { size: 16 }));
    setTimeout(() => fill(button, 'link'), 1400);
  }

  /* ------------------------------------------------------------- deep link -- */

  function setHash(hash) {
    suppressHashHandling = true;
    const url = `${location.pathname}${location.search}${hash}`;
    history.replaceState(null, '', url);
    requestAnimationFrame(() => { suppressHashHandling = false; });
  }

  function handleHash() {
    if (suppressHashHandling) return;
    const match = location.hash.match(/^#project\/(.+)$/);
    if (!match) {
      if (dialog.open) close();
      return;
    }
    const project = controller.findBySlug(decodeURIComponent(match[1]));
    if (project) open(project, { fromHash: true });
  }

  window.addEventListener('hashchange', handleHash);

  /* ---------------------------------------------------------------- render -- */

  function render(project) {
    clear(body);

    const media = renderMedia(project);
    if (media) body.append(media);

    body.append(
      el('header', { class: 'viewer__head' },
        project.categoryNames.length
          ? el('p', { class: 'viewer__cats' },
              project.categoryNames.map((c) => el('span', null, c)))
          : null,
        el('h2', { class: 'viewer__title' }, project.title),
      ),
    );

    if (project.fullDescription) {
      body.append(section('Overview', el('p', null, project.fullDescription)));
    }

    if (project.features.length) {
      body.append(section('Key features',
        el('ul', { class: 'featurelist' },
          project.features.map((f) => el('li', null, icon('check', { size: 14 }), el('span', null, f)))),
      ));
    }

    if (project.technologies.length) {
      body.append(section('Built with',
        el('ul', { class: 'taglist' },
          project.technologies.map((t) => el('li', { class: 'tag' }, t))),
      ));
    }

    if (project.team.length) {
      body.append(section('Team',
        el('ul', { class: 'team' }, project.team.map(teammate)),
      ));
    }

    const links = renderLinks(project);
    if (links) body.append(section('Links', links));
  }

  function section(title, ...children) {
    return el('section', { class: 'viewer__section' }, el('h4', null, title), ...children);
  }

  function teammate(member) {
    return el('li', { class: 'teammate' },
      el('span', { class: 'teammate__avatar' },
        member.img
          ? el('img', { src: member.img, alt: '', loading: 'lazy' })
          : initials(member.name)),
      el('span', null,
        el('span', { class: 'teammate__name' }, member.name),
        member.role ? el('span', { class: 'teammate__role' }, ` ${member.role}`) : null,
        member.contact
          ? el('a', { href: `mailto:${member.contact}` }, member.contact)
          : null,
      ),
    );
  }

  function renderLinks(project) {
    const entries = [
      ['github', 'View source', project.links.github],
      ['book', 'Documentation', project.links.docs],
      ['play', 'Demo video', project.links.demo],
      ['globe', 'Live site', project.links.live],
    ].filter(([, , href]) => href);

    if (!entries.length) return null;

    return el('div', { class: 'viewer__links' },
      entries.map(([name, label, href], i) => el('a', {
        class: `btn ${i === 0 ? 'btn--primary' : 'btn--ghost'}`,
        href,
        target: '_blank',
        rel: 'noopener',
        dataset: {
          track: 'project_link_click',
          trackLabel: project.title,
          trackLink: name,
        },
      }, icon(name, { size: 15 }), label)),
    );
  }

  /** Called once after wiring, so `#project/<slug>` opens on a cold load. */
  return { open, close, updateNav, handleHash };
}

/* ------------------------------------------------------------------ media -- */

function renderMedia(project) {
  const embed = embedUrl(project.links.demo);

  if (embed) {
    return el('div', { class: 'viewer__media' },
      el('iframe', {
        src: embed,
        title: `${project.title} — demo video`,
        loading: 'lazy',
        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        allowfullscreen: true,
      }));
  }

  if (project.cover) {
    return el('div', { class: 'viewer__media' },
      el('img', { src: project.cover, alt: '', loading: 'lazy', decoding: 'async' }));
  }

  return null;
}

/**
 * Turns a YouTube or Google Drive share link into an embeddable one.
 *
 * The old implementation split on 'v=' and on '/d/' without checking the
 * result, so a URL carrying extra query params produced a broken id and a
 * Drive URL in any other shape threw outright. This returns null instead of
 * guessing, and the caller falls back to the cover image.
 */
export function embedUrl(url) {
  const raw = String(url || '').trim();
  if (!raw) return null;

  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, '');

  if (host === 'youtu.be') {
    const id = parsed.pathname.slice(1).split('/')[0];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  if (host === 'youtube.com' || host === 'm.youtube.com') {
    const id = parsed.searchParams.get('v')
      || parsed.pathname.match(/^\/(?:embed|shorts|v)\/([^/?]+)/)?.[1];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  if (host === 'drive.google.com') {
    const id = parsed.pathname.match(/\/d\/([^/]+)/)?.[1] || parsed.searchParams.get('id');
    return id ? `https://drive.google.com/file/d/${id}/preview` : null;
  }

  if (host === 'vimeo.com') {
    const id = parsed.pathname.split('/').filter(Boolean)[0];
    return /^\d+$/.test(id || '') ? `https://player.vimeo.com/video/${id}` : null;
  }

  return null;
}

/* ------------------------------------------------------------------ utils -- */

function fill(button, name) {
  clear(button);
  button.append(icon(name, { size: 16 }));
}

function initials(name) {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}
