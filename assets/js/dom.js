/**
 * Small DOM helpers.
 *
 * Everything here builds nodes with createElement/textContent rather than
 * innerHTML, so content coming from portfolio.json can never be interpreted as
 * markup. The old build interpolated JSON straight into innerHTML.
 */

/**
 * @param {string} tag
 * @param {object|null} [props] attributes; `class`, `dataset`, `on` (event map)
 *   and `html` (trusted markup only) get special handling.
 * @param {...(Node|string|null|undefined|Array)} children
 */
export function el(tag, props = null, ...children) {
  const node = document.createElement(tag);

  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (value == null || value === false) continue;

      if (key === 'class') {
        node.className = value;
      } else if (key === 'dataset') {
        Object.assign(node.dataset, value);
      } else if (key === 'on') {
        for (const [evt, handler] of Object.entries(value)) {
          node.addEventListener(evt, handler);
        }
      } else if (key === 'text') {
        node.textContent = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(node.style, value);
      } else if (value === true) {
        node.setAttribute(key, '');
      } else {
        node.setAttribute(key, value);
      }
    }
  }

  append(node, children);
  return node;
}

export function append(parent, children) {
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    parent.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return parent;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/**
 * Renders `text` with every occurrence of any term in `terms` wrapped in a
 * <mark>. Builds real text nodes, so a term containing markup characters is
 * still inert.
 *
 * @param {string} text
 * @param {string[]} terms
 * @returns {DocumentFragment}
 */
export function highlight(text, terms) {
  const frag = document.createDocumentFragment();
  const source = String(text ?? '');

  const cleaned = (terms || [])
    .map((t) => String(t).trim())
    .filter((t) => t.length > 1)
    .sort((a, b) => b.length - a.length);

  if (!cleaned.length) {
    frag.append(source);
    return frag;
  }

  const pattern = new RegExp(`(${cleaned.map(escapeRegExp).join('|')})`, 'gi');
  let last = 0;

  for (const match of source.matchAll(pattern)) {
    const start = match.index;
    if (start > last) frag.append(source.slice(last, start));
    frag.append(el('mark', null, match[0]));
    last = start + match[0].length;
  }

  if (last < source.length) frag.append(source.slice(last));
  return frag;
}

export function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Trailing-edge debounce. */
export function debounce(fn, wait = 180) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

/** Strips diacritics and lowercases, so "supérieure" matches "superieure". */
export function fold(str) {
  return String(str ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/** "Big Data & Cloud" -> "big-data-cloud" */
export function slugify(str) {
  return fold(str)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** "bigdata" -> "Bigdata"; "smart-car" -> "Smart Car" */
export function titleCase(str) {
  return String(str ?? '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
