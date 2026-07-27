import { $, clear } from './dom.js';
import { icon } from './icons.js';
import { STORAGE_KEYS } from './config.js';
import { track } from './analytics.js';

/**
 * Theme toggle. The stored choice is applied by an inline script in <head>
 * before first paint; this only handles switching and the button state.
 */
export function initTheme() {
  const button = $('[data-theme-toggle]');
  if (!button) return;

  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const stored = () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.theme);
    } catch {
      return null;
    }
  };

  const isDark = () => (document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === 'dark'
    : media.matches);

  function paint() {
    const dark = isDark();
    clear(button);
    button.append(icon(dark ? 'sun' : 'moon', { size: 18 }));
    button.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
    button.setAttribute('title', `Switch to ${dark ? 'light' : 'dark'} theme`);
  }

  button.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEYS.theme, next);
    } catch {
      /* Private mode: the theme still applies for this page view. */
    }
    paint();
    track('theme_toggle', { theme: next });
  });

  /* Follow the OS only while the visitor hasn't made an explicit choice. */
  media.addEventListener('change', () => {
    if (!stored()) paint();
  });

  paint();
}
