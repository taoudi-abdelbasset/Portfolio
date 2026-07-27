/**
 * Resolves portfolio.json at runtime so a content push goes live without a
 * code change.
 *
 * Order, first success wins:
 *   1. ?data=<url>            preview a branch or a draft before merging
 *   2. fresh localStorage     paint immediately, then revalidate in background
 *   3. raw.githubusercontent  the real source of truth
 *   4. jsDelivr               only if raw is unreachable (it caches refs ~12h)
 *   5. bundled local copy     shipped with the site
 *   6. stale localStorage     better stale than blank
 */

import { DATA_SOURCE, STORAGE_KEYS } from './config.js';

const rawUrl = () => {
  const { owner, repo, branch, path } = DATA_SOURCE;
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
};

const jsdelivrUrl = () => {
  const { owner, repo, branch, path } = DATA_SOURCE;
  return `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${path}`;
};

/** Defeats the browser cache; the CDN edge cache is handled by its own TTL. */
const bust = (url) => url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();

async function fetchJson(url, { timeoutMs = DATA_SOURCE.timeoutMs } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/* ---------------------------------------------------------------- cache -- */

function readCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.dataCache);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (!entry || typeof entry.at !== 'number' || !entry.data) return null;
    const ageMinutes = (Date.now() - entry.at) / 60000;
    return { data: entry.data, stale: ageMinutes > DATA_SOURCE.cacheTtlMinutes };
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(
      STORAGE_KEYS.dataCache,
      JSON.stringify({ at: Date.now(), data }),
    );
  } catch {
    /* Private mode or quota exceeded — the cache is an optimisation, not a
       requirement, so a failure here must not break the page. */
  }
}

/** Cheap order-sensitive hash, used only to decide whether to re-render. */
function fingerprint(data) {
  const str = JSON.stringify(data);
  let h = 5381;
  for (let i = 0; i < str.length; i += 1) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return `${str.length}:${h}`;
}

/* --------------------------------------------------------------- public -- */

/**
 * @returns {Promise<{data: object, origin: string, degraded: boolean}>}
 *   `degraded` is true when we fell back to the bundled or stale copy, which
 *   the caller surfaces as a toast rather than failing silently.
 */
export async function loadPortfolioData() {
  const override = new URLSearchParams(location.search).get('data');
  if (override) {
    const data = await fetchJson(bust(override));
    return { data, origin: 'override', degraded: false };
  }

  const remotes = [
    { name: 'github-raw', url: rawUrl() },
    { name: 'jsdelivr', url: jsdelivrUrl() },
  ];

  for (const remote of remotes) {
    try {
      const data = await fetchJson(bust(remote.url));
      writeCache(data);
      return { data, origin: remote.name, degraded: false };
    } catch (err) {
      console.warn(`[data] ${remote.name} unavailable:`, err.message);
    }
  }

  try {
    const data = await fetchJson(bust(DATA_SOURCE.localFallback));
    return { data, origin: 'local', degraded: true };
  } catch (err) {
    console.warn('[data] bundled copy unavailable:', err.message);
  }

  const cached = readCache();
  if (cached) return { data: cached.data, origin: 'cache-stale', degraded: true };

  throw new Error('No portfolio data could be loaded from any source.');
}

/**
 * Serves a cached copy immediately when one is fresh, then revalidates against
 * the remote and calls `onFresh` only if the content actually changed.
 *
 * @param {(result: {data: object, origin: string, degraded: boolean}) => void} onFresh
 */
export async function loadPortfolioDataWithCache(onFresh) {
  const cached = readCache();

  if (cached && !cached.stale) {
    revalidate(cached.data, onFresh);
    return { data: cached.data, origin: 'cache', degraded: false };
  }

  return loadPortfolioData();
}

function revalidate(currentData, onFresh) {
  const before = fingerprint(currentData);
  loadPortfolioData()
    .then((result) => {
      if (fingerprint(result.data) !== before) onFresh(result);
    })
    .catch(() => {
      /* We already painted from cache; a failed revalidation changes nothing. */
    });
}
