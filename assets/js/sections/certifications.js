import { el, clear } from '../dom.js';
import { icon, iconFor } from '../icons.js';

/**
 * Certifications as their own index rather than a footnote under a skill group.
 * A certificate with a link is a real link out to the credential; one without
 * renders as plain text instead of a dead anchor.
 */
export function renderCertifications(node, certifications) {
  if (!node) return;
  clear(node);

  for (const cert of certifications) {
    node.append(
      el('li', { class: 'certcard reveal' },
        el('span', { class: 'certcard__mark' },
          icon(iconFor(cert.icon, 'award'), { size: 18 })),

        el('div', { class: 'certcard__info' },
          el('h3', { class: 'certcard__name' }, name(cert)),
          meta(cert) ? el('p', { class: 'certcard__meta' }, meta(cert)) : null,
          cert.credentialId
            ? el('p', { class: 'certcard__id' }, `ID ${cert.credentialId}`)
            : null,
          cert.skills.length
            ? el('ul', { class: 'certcard__tags' },
                cert.skills.map((s) => el('li', { class: 'tag' }, s)))
            : null,
        ),
      ),
    );
  }
}

function name(cert) {
  if (!cert.link) return cert.name;

  return el('a', {
    href: cert.link,
    target: '_blank',
    rel: 'noopener',
    dataset: { track: 'certificate_click', trackLabel: cert.name },
  }, cert.name);
}

/** "Coursera · Mar 2025", collapsing to whichever half is present. */
function meta(cert) {
  return [cert.issuer, cert.date].filter(Boolean).join(' · ');
}
