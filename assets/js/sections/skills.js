import { el, clear } from '../dom.js';
import { icon, iconFor } from '../icons.js';

/**
 * Skills as a grouped index rather than a wall of identical icon cards: the
 * group name reads, the technologies list densely, and certificates are inline
 * links instead of being buried in a modal.
 */
export function renderSkills(node, skills) {
  if (!node) return;
  clear(node);

  for (const group of skills) {
    node.append(
      el('li', { class: 'skillgroup reveal' },
        el('h3', { class: 'skillgroup__title' },
          groupIcon(group.icon),
          group.title,
        ),
        group.description ? el('p', { class: 'skillgroup__desc' }, group.description) : null,
        group.techTags.length
          ? el('ul', { class: 'skillgroup__tags' },
              group.techTags.map((t) => el('li', { class: 'tag' }, t)))
          : null,
        group.certificates.length ? certificates(group.certificates) : null,
      ),
    );
  }
}

function groupIcon(faClass) {
  if (!faClass) return null;
  const glyph = icon(iconFor(faClass, 'layers'), { size: 17 });
  glyph.style.display = 'inline-block';
  glyph.style.verticalAlign = '-1px';
  glyph.style.marginRight = '.5ch';
  glyph.style.color = 'var(--accent)';
  return glyph;
}

function certificates(list) {
  return el('ul', { class: 'skillgroup__certs' },
    list.map((cert) => el('li', null,
      cert.link
        ? el('a', {
            href: cert.link,
            target: '_blank',
            rel: 'noopener',
            dataset: { track: 'certificate_click', trackLabel: cert.name },
          }, cert.name)
        : cert.name,
      cert.issuer ? el('span', { class: 'issuer' }, ` — ${cert.issuer}`) : null,
    )),
  );
}
