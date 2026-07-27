import { el, clear } from '../dom.js';
import { icon, iconFor } from '../icons.js';

/**
 * Experience and education share one editorial ledger: a mono date column, the
 * role/qualification in the wide column, and the detail in a native <details>
 * panel — which gets keyboard support and correct semantics for free, unlike
 * the modal this replaces.
 */
export function renderLedger(node, items, { kind }) {
  if (!node) return;
  clear(node);

  for (const item of items) {
    node.append(ledgerItem(item, kind));
  }
}

function ledgerItem(item, kind) {
  const hasDetail = Boolean(item.description || item.achievements.length || item.skills.length);

  const summary = el('summary', { class: 'ledger__row' },
    el('span', { class: 'ledger__date tabular' }, dateRange(item)),
    el('span', { class: 'ledger__main' },
      el('span', { class: 'ledger__title' }, item.title),
      org(item),
    ),
    hasDetail
      ? el('span', { class: 'ledger__chev' }, icon('chevron-down', { size: 18 }))
      : el('span', { class: 'ledger__chev' }),
  );

  const details = el('details', {
    class: 'ledger__item reveal',
    dataset: {
      track: 'section_detail',
      trackKind: kind,
      trackLabel: item.title,
      trackOrg: item.org,
    },
  }, summary);

  if (hasDetail) {
    details.append(
      el('div', { class: 'ledger__panel' },
        el('div', { class: 'ledger__detail' },
          item.description ? el('p', null, item.description) : null,
          item.achievements.length
            ? el('div', { class: 'ledger__block' },
                el('h4', null, kind === 'education' ? 'Highlights' : 'Key achievements'),
                el('ul', { class: 'bullets' }, item.achievements.map((a) => el('li', null, a))),
              )
            : null,
          item.skills.length
            ? el('div', { class: 'ledger__block' },
                el('h4', null, kind === 'education' ? 'Skills gained' : 'Technologies'),
                el('ul', { class: 'taglist' },
                  item.skills.map((s) => el('li', { class: 'tag' }, s))),
              )
            : null,
        ),
      ),
    );
  } else {
    /* Nothing to disclose — don't offer a control that does nothing. */
    summary.style.cursor = 'default';
    summary.addEventListener('click', (e) => e.preventDefault());
  }

  return details;
}

function dateRange(item) {
  if (item.from && item.to) return `${item.from} — ${item.to}`;
  return item.from || item.to || '';
}

function org(item) {
  if (!item.org) return null;
  const node = el('span', { class: 'ledger__org' });

  if (item.logo) {
    node.append(el('img', {
      src: item.logo,
      alt: '',
      width: 16,
      height: 16,
      loading: 'lazy',
      style: { display: 'inline-block', verticalAlign: '-2px', marginRight: '.4ch' },
    }));
  } else if (item.icon) {
    const glyph = icon(iconFor(item.icon, 'briefcase'), { size: 14 });
    glyph.style.display = 'inline-block';
    glyph.style.verticalAlign = '-1px';
    glyph.style.marginRight = '.45ch';
    node.append(glyph);
  }

  node.append(item.org);
  if (item.place) node.append(el('span', { class: 'sep' }, '·'), item.place);
  return node;
}
