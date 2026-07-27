/**
 * Site configuration.
 *
 * To publish a content change you only ever touch data/portfolio.json and push
 * it. To move content somewhere else later — a separate repo, a content
 * branch — change DATA_SOURCE here and nothing else.
 */

export const DATA_SOURCE = {
  owner: 'taoudi-abdelbasset',
  repo: 'Portfolio',
  branch: 'main',
  path: 'data/portfolio.json',

  /** Shipped with the site; used when every remote fetch fails. */
  localFallback: 'data/portfolio.json',

  /** How long a cached copy is served without revalidating, in minutes. */
  cacheTtlMinutes: 10,

  /** Give up on a remote source after this long and try the next one. */
  timeoutMs: 6000,
};

export const GA_MEASUREMENT_ID = 'G-D9ZV8TZTZ5';

export const STORAGE_KEYS = {
  theme: 'portfolio:theme',
  dataCache: 'portfolio:data-cache',
};

/**
 * How many technology chips to show before the "more" disclosure, and how many
 * tags fit on a project card before collapsing into a "+N".
 */
export const UI = {
  techChipsVisible: 10,
  cardTagLimit: 4,
};
