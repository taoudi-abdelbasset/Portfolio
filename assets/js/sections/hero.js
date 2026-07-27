import { el, clear, $ } from '../dom.js';
import { icon } from '../icons.js';

/**
 * Hero: the statement, a quiet rotating role line, bio, actions, metadata,
 * and the portrait plate. Everything is optional except the statement.
 */
export function renderHero(data) {
  const { main, projects } = data;

  const statementText = main.statement || main.name;
  const showNameAsEyebrow = Boolean(main.statement) && main.statement !== main.name;

  setText($('[data-hero-eyebrow]'), showNameAsEyebrow ? main.name : '');

  const statement = $('[data-hero-statement]');
  clear(statement);
  statement.append(emphasise(statementText));

  renderRoles($('[data-hero-role]'), main.roles);
  setText($('[data-hero-bio]'), main.bio);
  renderActions($('[data-hero-actions]'), main, projects);
  renderMeta($('[data-hero-meta]'), main, projects);
  renderPlate($('[data-hero-plate]'), main);
}

/**
 * `*word*` in the statement becomes the one italic accent on the page, so the
 * emphasis is authored in the JSON rather than hard-coded here.
 */
function emphasise(text) {
  const frag = document.createDocumentFragment();
  const parts = String(text).split(/\*([^*]+)\*/g);
  parts.forEach((part, i) => {
    if (!part) return;
    frag.append(i % 2 ? el('em', null, part) : document.createTextNode(part));
  });
  return frag;
}

function setText(node, value) {
  if (!node) return;
  clear(node);
  if (value) node.append(value);
  node.hidden = !value;
}

/* ----------------------------------------------------------------- roles -- */

let rolesTimer;

function renderRoles(node, roles) {
  if (!node) return;
  clearTimeout(rolesTimer);
  clear(node);

  if (!roles.length) {
    node.hidden = true;
    return;
  }
  node.hidden = false;

  /* With reduced motion the cycle is pointless noise — show them all at once. */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    node.append(roles.join(' · '));
    return;
  }

  const text = el('span');
  const caret = el('span', { class: 'caret', 'aria-hidden': 'true' });
  node.append(text, caret);

  /* The full list is available to assistive tech without the animation. */
  node.setAttribute('aria-label', roles.join(', '));
  text.setAttribute('aria-hidden', 'true');

  let roleIndex = 0;
  let charIndex = 0;
  let erasing = false;

  const tick = () => {
    const role = roles[roleIndex];

    if (!erasing) {
      charIndex += 1;
      text.textContent = role.slice(0, charIndex);
      if (charIndex >= role.length) {
        erasing = true;
        rolesTimer = setTimeout(tick, 2200);
        return;
      }
      rolesTimer = setTimeout(tick, 62);
    } else {
      charIndex -= 1;
      text.textContent = role.slice(0, charIndex);
      if (charIndex <= 0) {
        erasing = false;
        roleIndex = (roleIndex + 1) % roles.length;
        rolesTimer = setTimeout(tick, 320);
        return;
      }
      rolesTimer = setTimeout(tick, 26);
    }
  };

  tick();
}

/* --------------------------------------------------------------- actions -- */

function renderActions(node, main, projects) {
  if (!node) return;
  clear(node);

  if (projects.length) {
    node.append(
      el('a', {
        class: 'btn btn--primary',
        href: '#work',
        dataset: { track: 'cta_click', trackLabel: 'View work' },
      }, 'View work', icon('arrow-up-right', { size: 16 })),
    );
  }

  if (main.resumeUrl) {
    node.append(
      el('a', {
        class: 'btn btn--ghost',
        href: main.resumeUrl,
        rel: 'noopener',
        target: '_blank',
        dataset: { track: 'resume_download', trackLabel: 'Resume' },
      }, icon('book', { size: 16 }), 'Résumé'),
    );
  }

  node.append(
    el('a', {
      class: 'btn btn--ghost',
      href: '#contact',
      dataset: { track: 'cta_click', trackLabel: 'Get in touch' },
    }, icon('mail', { size: 16 }), 'Get in touch'),
  );

  node.hidden = !node.childElementCount;
}

/* ------------------------------------------------------------------ meta -- */

function renderMeta(node, main, projects) {
  if (!node) return;
  clear(node);

  const rows = [];
  if (main.availability) rows.push(['Status', main.availability, true]);
  if (main.location) rows.push(['Based in', main.location]);
  if (main.education) rows.push(['Focus', main.education]);
  if (projects.length) rows.push(['Projects', String(projects.length)]);

  for (const [label, value, withDot] of rows) {
    node.append(
      el('div', null,
        el('dt', null, label),
        el('dd', null, withDot ? el('span', { class: 'dot', 'aria-hidden': 'true' }) : null, value),
      ),
    );
  }

  node.hidden = !rows.length;
}

/* ----------------------------------------------------------------- plate -- */

function renderPlate(node, main) {
  if (!node) return;
  clear(node);

  if (!main.img) {
    node.hidden = true;
    return;
  }
  node.hidden = false;

  node.append(
    el('img', {
      src: main.img,
      alt: `Portrait of ${main.name}`,
      width: 640,
      height: 800,
      loading: 'eager',
      decoding: 'async',
      on: {
        /* A broken portrait URL should collapse the plate, not leave a hole. */
        error: () => { node.hidden = true; },
      },
    }),
  );
}
