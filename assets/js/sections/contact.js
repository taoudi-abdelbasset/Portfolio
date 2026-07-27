import { el, clear, $, emphasise } from '../dom.js';
import { icon, iconFor, iconForUrl } from '../icons.js';

/** Used when `main.contactStatement` is absent from the JSON. */
const DEFAULT_STATEMENT = 'Open to opportunities and *collaborations*.';

const TYPE_LABELS = {
  email: 'Email',
  phone: 'Phone',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  leetcode: 'LeetCode',
  twitter: 'Twitter',
  website: 'Website',
  link: 'Link',
};

export function renderContact(node, contacts, main) {
  const statement = $('[data-contact-statement]');
  if (statement) {
    clear(statement);
    statement.append(emphasise(main.contactStatement || DEFAULT_STATEMENT));
  }

  if (!node) return;
  clear(node);

  for (const item of contacts) {
    node.append(row({
      type: TYPE_LABELS[item.type] || item.type,
      value: item.label,
      href: item.href,
      external: item.external,
      glyph: item.icon ? iconFor(item.icon, iconForUrl(item.href)) : iconForUrl(item.href),
      dataset: {
        track: 'contact_click',
        trackType: item.type,
        trackLabel: item.label,
      },
    }));
  }

  if (main.resumeUrl) {
    node.append(row({
      type: 'Résumé',
      value: 'Download PDF',
      href: main.resumeUrl,
      external: true,
      glyph: 'arrow-up-right',
      dataset: { track: 'resume_download', trackLabel: 'Resume' },
    }));
  }
}

/**
 * A <ul> may only contain <li>, so each channel is wrapped. The wrapper uses
 * `display: contents` in CSS, which keeps the anchor itself as the grid item.
 */
function row({ type, value, href, external, glyph, dataset }) {
  return el('li', null,
    el('a', {
      class: 'channel reveal',
      href,
      ...(external ? { target: '_blank', rel: 'noopener' } : {}),
      dataset,
    },
      el('span', { class: 'channel__type' }, type),
      el('span', { class: 'channel__value' }, value),
      el('span', { class: 'channel__arrow' }, icon(glyph, { size: 15 })),
    ),
  );
}
