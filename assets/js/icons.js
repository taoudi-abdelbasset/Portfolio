/**
 * Inline SVG icon set, replacing the Font Awesome stylesheet.
 *
 * portfolio.json still stores Font Awesome class names ("fas fa-briefcase"),
 * so `iconFor()` maps those onto this set. Unknown classes fall back to a
 * neutral glyph rather than rendering nothing, which means adding a new FA
 * name to the JSON degrades gracefully instead of leaving a hole.
 */

const STROKE = { fill: 'none', stroke: 'currentColor', width: 1.75 };

/** Each entry is either a stroke path list, or {solid: pathData}. */
const ICONS = {
  search: ['<circle cx="11" cy="11" r="7"/>', '<path d="M20.5 20.5 16.7 16.7"/>'],
  x: ['<path d="M6 6 18 18M18 6 6 18"/>'],
  menu: ['<path d="M4 7h16M4 12h16M4 17h16"/>'],
  'chevron-down': ['<path d="m6 9 6 6 6-6"/>'],
  'chevron-left': ['<path d="m15 6-6 6 6 6"/>'],
  'chevron-right': ['<path d="m9 6 6 6-6 6"/>'],
  'arrow-up-right': ['<path d="M7 17 17 7"/>', '<path d="M8 7h9v9"/>'],
  external: [
    '<path d="M14 4h6v6"/>',
    '<path d="M20 4 11 13"/>',
    '<path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  ],
  link: [
    '<path d="M10.5 13.5a5 5 0 0 0 7.1 0l2.5-2.5a5 5 0 0 0-7.1-7.1l-1.2 1.2"/>',
    '<path d="M13.5 10.5a5 5 0 0 0-7.1 0l-2.5 2.5a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',
  ],
  check: ['<path d="M20 6 9 17l-5-5"/>'],
  sun: [
    '<circle cx="12" cy="12" r="4"/>',
    '<path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"/>',
  ],
  moon: ['<path d="M21 12.9A9 9 0 1 1 11.1 3a7 7 0 0 0 9.9 9.9z"/>'],
  alert: [
    '<path d="M12 3.5 2.5 20.5h19z"/>',
    '<path d="M12 10v4"/>',
    '<circle cx="12" cy="17.4" r=".7" fill="currentColor" stroke="none"/>',
  ],
  play: ['<path d="M7.5 4.8 19 12 7.5 19.2z"/>'],
  folder: ['<path d="M3 7a2 2 0 0 1 2-2h3.8l2 2.5H19a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'],
  image: [
    '<rect x="3" y="4.5" width="18" height="15" rx="2"/>',
    '<circle cx="8.6" cy="10" r="1.6"/>',
    '<path d="M21 15.5 16 10.5 7 19.5"/>',
  ],
  globe: [
    '<circle cx="12" cy="12" r="9"/>',
    '<path d="M3 12h18"/>',
    '<path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/>',
  ],

  /* --- content icons referenced by portfolio.json ------------------------ */
  'graduation-cap': [
    '<path d="M12 4 2.5 8.5 12 13l9.5-4.5z"/>',
    '<path d="M6.5 10.7V16c0 1.6 2.5 2.9 5.5 2.9s5.5-1.3 5.5-2.9v-5.3"/>',
  ],
  award: ['<circle cx="12" cy="9" r="5"/>', '<path d="M9 13.4 8 21.5l4-2.2 4 2.2-1-8.1"/>'],
  school: [
    '<path d="M12 3 21 8l-9 5-9-5z"/>',
    '<path d="M5.5 10.8V18h13v-7.2"/>',
    '<path d="M10 18v-3.5h4V18"/>',
  ],
  briefcase: [
    '<rect x="3" y="7.5" width="18" height="12.5" rx="2"/>',
    '<path d="M8.5 7.5V5.5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2"/>',
    '<path d="M3 12.5h18"/>',
  ],
  users: [
    '<circle cx="9" cy="8" r="3.2"/>',
    '<path d="M3.2 19.5a5.8 5.8 0 0 1 11.6 0"/>',
    '<path d="M16.2 5.2a3.2 3.2 0 0 1 0 5.6"/>',
    '<path d="M17.6 19.5a5.9 5.9 0 0 0-2-4.4"/>',
  ],
  code: ['<path d="m9 7-5 5 5 5"/>', '<path d="m15 7 5 5-5 5"/>'],
  eye: ['<path d="M2.5 12S6 6.2 12 6.2 21.5 12 21.5 12 18 17.8 12 17.8 2.5 12 2.5 12z"/>', '<circle cx="12" cy="12" r="2.6"/>'],
  database: [
    '<ellipse cx="12" cy="6" rx="8" ry="3"/>',
    '<path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/>',
    '<path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
  ],
  activity: ['<path d="m3 16.5 5-6.5 4 4 4.5-7.5L21 11"/>'],
  brain: [
    '<path d="M12 5.5a3 3 0 0 0-5.8-1A3 3 0 0 0 4 9.4a3 3 0 0 0 1.4 5.3A3 3 0 0 0 12 16z"/>',
    '<path d="M12 5.5a3 3 0 0 1 5.8-1A3 3 0 0 1 20 9.4a3 3 0 0 1-1.4 5.3A3 3 0 0 1 12 16z"/>',
  ],
  settings: [
    '<circle cx="12" cy="12" r="3"/>',
    '<path d="M12 2.5V5M12 19v2.5M4.4 4.4 6.2 6.2M17.8 17.8l1.8 1.8M2.5 12H5M19 12h2.5M4.4 19.6 6.2 17.8M17.8 6.2l1.8-1.8"/>',
  ],
  layers: ['<path d="M12 3 21 8l-9 5-9-5z"/>', '<path d="m3 13 9 5 9-5"/>'],
  'user-check': [
    '<circle cx="9" cy="8" r="3.4"/>',
    '<path d="M3 19.5a6 6 0 0 1 11 -3.3"/>',
    '<path d="m15.5 16.5 2 2 4-4"/>',
  ],
  sliders: [
    '<path d="M4 6.5h9M19 6.5h1M4 12h5M15 12h5M4 17.5h11M21 17.5h-1"/>',
    '<circle cx="15.5" cy="6.5" r="2"/>',
    '<circle cx="11.5" cy="12" r="2"/>',
    '<circle cx="17.5" cy="17.5" r="2"/>',
  ],
  bot: [
    '<rect x="4" y="8.5" width="16" height="10.5" rx="2.5"/>',
    '<path d="M12 8.5V5.4"/>',
    '<circle cx="12" cy="4" r="1.3"/>',
    '<path d="M9.2 13v1.6M14.8 13v1.6"/>',
  ],
  store: [
    '<path d="M4.5 9.5h15V19a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1z"/>',
    '<path d="m3 9.5 1.7-4.6a1 1 0 0 1 .9-.6h12.8a1 1 0 0 1 .9.6L21 9.5"/>',
    '<path d="M9.5 20v-5.5h5V20"/>',
  ],
  car: [
    '<path d="M3.5 15.5v-3l2.2-4.4A2 2 0 0 1 7.5 7h9a2 2 0 0 1 1.8 1.1l2.2 4.4v3a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z"/>',
    '<path d="M4 12.5h16"/>',
    '<circle cx="7.6" cy="16.8" r="1.7"/>',
    '<circle cx="16.4" cy="16.8" r="1.7"/>',
  ],
  book: [
    '<path d="M6.5 2.5H20v19H6.5A2.5 2.5 0 0 1 4 19V5a2.5 2.5 0 0 1 2.5-2.5z"/>',
    '<path d="M4 19a2.5 2.5 0 0 1 2.5-2.5H20"/>',
  ],
  gamepad: [
    '<path d="M17.2 6.5H6.8a4.6 4.6 0 0 0-4.5 3.7l-.9 4.6A3.5 3.5 0 0 0 4.8 19c1.1 0 2.2-.6 2.8-1.5l1-1.4h6.8l1 1.4c.6.9 1.7 1.5 2.8 1.5a3.5 3.5 0 0 0 3.4-4.2l-.9-4.6a4.6 4.6 0 0 0-4.5-3.7z"/>',
    '<path d="M7 12h3M8.5 10.5v3"/>',
    '<circle cx="15.6" cy="11" r=".9" fill="currentColor" stroke="none"/>',
    '<circle cx="17.6" cy="13.4" r=".9" fill="currentColor" stroke="none"/>',
  ],
  mail: ['<rect x="2.5" y="5" width="19" height="14" rx="2"/>', '<path d="m3.2 7 8.8 6 8.8-6"/>'],
  phone: ['<path d="M6.3 3h3.1l1.5 4.4-2 1.5a12.4 12.4 0 0 0 6.2 6.2l1.5-2 4.4 1.5v3.1a2 2 0 0 1-2.2 2A17.3 17.3 0 0 1 4.3 5.2 2 2 0 0 1 6.3 3z"/>'],
  linkedin: [
    '<rect x="3" y="3" width="18" height="18" rx="2.5"/>',
    '<path d="M7.6 10.6V17"/>',
    '<circle cx="7.6" cy="7.4" r="1" fill="currentColor" stroke="none"/>',
    '<path d="M11.6 17v-6.4"/>',
    '<path d="M11.6 13.6a2.4 2.4 0 0 1 4.8 0V17"/>',
  ],

  /* GitHub's mark is a solid logo, not a stroke glyph. */
  github: {
    solid:
      'M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 ' +
      'v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.34-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 ' +
      '1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 ' +
      '0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 ' +
      '3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.39-5.25 5.67.41.36.78 ' +
      '1.06.78 2.14v3.17c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z',
  },
};

/**
 * Font Awesome class name -> icon key. Matching is done on the `fa-*` part, so
 * the fas/far/fab prefix is irrelevant.
 */
const FA_ALIASES = {
  'graduation-cap': 'graduation-cap',
  certificate: 'award',
  award: 'award',
  school: 'school',
  university: 'school',
  briefcase: 'briefcase',
  users: 'users',
  'user-friends': 'users',
  code: 'code',
  'laptop-code': 'code',
  /* LeetCode's own mark reduces to a left-arrow at 15px, which would misread
     next to the other channels — the generic code glyph is clearer. */
  leetcode: 'code',
  eye: 'eye',
  database: 'database',
  'chart-line': 'activity',
  'chart-bar': 'activity',
  brain: 'brain',
  cogs: 'settings',
  cog: 'settings',
  gear: 'settings',
  'layer-group': 'layers',
  'user-check': 'user-check',
  tools: 'sliders',
  toolbox: 'sliders',
  wrench: 'sliders',
  robot: 'bot',
  store: 'store',
  shop: 'store',
  car: 'car',
  book: 'book',
  'book-open': 'book',
  gamepad: 'gamepad',
  envelope: 'mail',
  'envelope-open': 'mail',
  phone: 'phone',
  'phone-alt': 'phone',
  mobile: 'phone',
  linkedin: 'linkedin',
  'linkedin-in': 'linkedin',
  github: 'github',
  globe: 'globe',
  link: 'link',
  folder: 'folder',
  image: 'image',
};

/**
 * Resolves a Font Awesome class string from the JSON to a key in ICONS.
 * @param {string} faClass e.g. "fas fa-graduation-cap"
 * @param {string} fallback
 */
export function iconFor(faClass, fallback = 'folder') {
  if (!faClass || typeof faClass !== 'string') return fallback;
  const match = faClass.match(/fa-([a-z0-9-]+)/i);
  const name = match ? match[1].toLowerCase() : faClass.trim().toLowerCase();
  if (ICONS[name]) return name;
  return FA_ALIASES[name] || fallback;
}

/**
 * Builds an <svg> element. Returns a neutral glyph for unknown names so a
 * caller never has to null-check.
 *
 * @param {string} name key in ICONS
 * @param {{size?: number, label?: string}} [opts] `label` makes it meaningful
 *   to assistive tech; without it the icon is marked decorative.
 */
export function icon(name, opts = {}) {
  const def = ICONS[name] || ICONS.folder;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', opts.size || 24);
  svg.setAttribute('height', opts.size || 24);

  if (Array.isArray(def)) {
    svg.setAttribute('fill', STROKE.fill);
    svg.setAttribute('stroke', STROKE.stroke);
    svg.setAttribute('stroke-width', STROKE.width);
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.innerHTML = def.join('');
  } else {
    svg.setAttribute('fill', 'currentColor');
    svg.innerHTML = `<path d="${def.solid}"/>`;
  }

  if (opts.label) {
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', opts.label);
  } else {
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
  }
  return svg;
}

/** Picks a link icon from a URL, for project/contact links of unknown type. */
export function iconForUrl(url = '') {
  const u = String(url).toLowerCase();
  if (u.includes('github.com')) return 'github';
  if (u.includes('linkedin.com')) return 'linkedin';
  if (u.includes('leetcode.com')) return 'code';
  if (u.startsWith('mailto:')) return 'mail';
  if (u.startsWith('tel:')) return 'phone';
  if (u.includes('docs.google.com') || u.includes('notion.')) return 'book';
  if (u.includes('youtube.com') || u.includes('youtu.be') || u.includes('drive.google.com')) return 'play';
  return 'globe';
}
