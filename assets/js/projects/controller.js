import { el, clear, $, highlight, debounce, fold } from '../dom.js';
import { icon, iconFor } from '../icons.js';
import { UI } from '../config.js';
import { track } from '../analytics.js';

/**
 * Search, filtering, sorting and URL state for the work section.
 *
 * Filtering is faceted: values within a dimension are OR'd, dimensions are
 * AND'd, and each chip carries the count you'd get by selecting it. The whole
 * state lives in the query string, so any view is linkable and the back button
 * steps through it.
 */
export function createProjectsController({ data, onOpen }) {
  const projects = data.projects;

  /* A background data refresh rebuilds the controller. Every listener it owns
     hangs off this signal so the old set is dropped rather than stacking up
     and firing twice. */
  const listeners = new AbortController();
  const { signal } = listeners;

  const grid = $('[data-work-grid]');
  const emptyNode = $('[data-work-empty]');
  const filtersNode = $('[data-filters]');
  const countNode = $('[data-result-count]');
  const searchWrap = $('[data-search]');
  const searchInput = $('[data-search-input]');
  const searchClear = $('[data-search-clear]');
  const sortSelect = $('[data-sort]');

  const state = {
    query: '',
    cats: new Set(),
    techs: new Set(),
    sort: 'featured',
    techExpanded: false,
  };

  /** The current result list, in display order. The viewer walks this. */
  let visible = projects.slice();

  /* ------------------------------------------------------------ matching -- */

  const terms = () => fold(state.query).split(/\s+/).filter(Boolean);

  /** Every term must appear somewhere; the score only decides the order. */
  function matchesQuery(project, list) {
    return list.every((t) => project.haystack.includes(t));
  }

  function score(project, list) {
    let total = 0;
    for (const t of list) {
      if (project.titleFold.startsWith(t)) total += 24;
      else if (project.titleFold.includes(t)) total += 12;
      if (project.techFold.includes(t)) total += 6;
      if (project.haystack.includes(t)) total += 1;
    }
    return total;
  }

  const hasCat = (p) => !state.cats.size || p.categories.some((c) => state.cats.has(c));
  const hasTech = (p) => !state.techs.size || p.technologies.some((t) => state.techs.has(fold(t)));

  /**
   * @param {{skip?: 'cats'|'techs'}} [opts] omit one dimension, so facet counts
   *   reflect what selecting a sibling value would actually return.
   */
  function filtered({ skip } = {}) {
    const list = terms();
    return projects.filter((p) =>
      matchesQuery(p, list)
      && (skip === 'cats' || hasCat(p))
      && (skip === 'techs' || hasTech(p)));
  }

  function sorted(list) {
    const q = terms();
    const out = list.slice();

    if (q.length) {
      out.sort((a, b) => score(b, q) - score(a, q) || a.index - b.index);
      return out;
    }

    if (state.sort === 'az') out.sort((a, b) => a.title.localeCompare(b.title));
    else if (state.sort === 'newest') out.sort((a, b) => (b.year - a.year) || a.index - b.index);
    else out.sort((a, b) => (b.featured - a.featured) || a.index - b.index);

    return out;
  }

  /* --------------------------------------------------------------- chips -- */

  function renderFilters() {
    clear(filtersNode);

    const catBase = filtered({ skip: 'cats' });
    const techBase = filtered({ skip: 'techs' });

    if (data.categories.length > 1) {
      filtersNode.append(chipset({
        label: 'Type',
        items: data.categories.map((c) => ({
          key: c.slug,
          label: c.label,
          count: catBase.filter((p) => p.categories.includes(c.slug)).length,
        })),
        selected: state.cats,
        onToggle: (key) => toggle(state.cats, key, 'category'),
      }));
    }

    const techs = state.techExpanded
      ? data.technologies
      : data.technologies.slice(0, UI.techChipsVisible);

    if (data.technologies.length > 1) {
      const set = chipset({
        label: 'Tech',
        items: techs.map((t) => ({
          key: t.key,
          label: t.label,
          count: techBase.filter((p) => p.technologies.some((x) => fold(x) === t.key)).length,
        })),
        selected: state.techs,
        onToggle: (key) => toggle(state.techs, key, 'technology'),
      });

      if (data.technologies.length > UI.techChipsVisible) {
        set.append(el('button', {
          class: 'chip chip--more',
          type: 'button',
          on: {
            click: () => {
              state.techExpanded = !state.techExpanded;
              renderFilters();
            },
          },
        }, state.techExpanded
          ? 'Show fewer'
          : `+${data.technologies.length - UI.techChipsVisible} more`));
      }

      filtersNode.append(set);
    }

    if (isFiltered()) {
      filtersNode.append(
        el('div', { class: 'chipset' },
          el('button', {
            class: 'chip chip--clear',
            type: 'button',
            on: { click: () => reset() },
          }, 'Clear all filters'),
        ),
      );
    }
  }

  function chipset({ label, items, selected, onToggle }) {
    return el('div', { class: 'chipset', role: 'group', 'aria-label': `Filter by ${label}` },
      el('span', { class: 'chipset__label' }, label),
      items.map((item) => {
        const on = selected.has(item.key);
        return el('button', {
          class: 'chip',
          type: 'button',
          'aria-pressed': String(on),
          dataset: { empty: String(!on && item.count === 0) },
          disabled: !on && item.count === 0,
          on: { click: () => onToggle(item.key) },
        },
          item.label,
          el('span', { class: 'chip__count tabular' }, String(item.count)),
        );
      }),
    );
  }

  function toggle(set, key, dimension) {
    if (set.has(key)) set.delete(key);
    else set.add(key);
    track('project_filter', { dimension, value: key, active: set.has(key) });
    apply({ push: true });
  }

  const isFiltered = () => Boolean(state.query || state.cats.size || state.techs.size);

  function reset() {
    state.query = '';
    state.cats.clear();
    state.techs.clear();
    if (searchInput) searchInput.value = '';
    apply({ push: true });
  }

  /* ---------------------------------------------------------------- grid -- */

  /** First paint animates in; every later render is a direct user action. */
  let hasPainted = false;

  function renderGrid() {
    clear(grid);
    const q = terms();

    for (const project of visible) {
      grid.append(card(project, q));
    }

    /* Cards carry `.reveal`, which starts at opacity 0 and is cleared by the
       page-level IntersectionObserver pass. That pass only runs once, so a
       card created later by a filter or search would sit invisible forever,
       waiting for a scroll that never comes. Re-renders are a response to the
       user acting on the grid they are already looking at, so show them now. */
    if (hasPainted) {
      for (const node of grid.querySelectorAll('.reveal')) {
        node.classList.add('is-visible');
      }
    }
    hasPainted = true;

    const empty = visible.length === 0;
    grid.hidden = empty;
    emptyNode.hidden = !empty;

    if (empty) {
      clear(emptyNode);
      emptyNode.append(
        el('h3', null, 'No projects match'),
        el('p', null, state.query
          ? `Nothing matches “${state.query}” with the filters you have on.`
          : 'No projects match the filters you have on.'),
        el('button', {
          class: 'btn btn--ghost',
          type: 'button',
          on: { click: () => reset() },
        }, 'Clear filters'),
      );
    }

    renderCount();
  }

  function renderCount() {
    clear(countNode);
    countNode.append(
      el('b', null, String(visible.length)),
      ` of ${projects.length} project${projects.length === 1 ? '' : 's'}`,
      isFiltered() ? ' · filtered' : '',
    );
  }

  function card(project, q) {
    const media = project.cover
      ? el('div', { class: 'workcard__cover' },
          el('img', {
            src: project.cover,
            alt: '',
            loading: 'lazy',
            decoding: 'async',
            width: 640,
            height: 400,
            on: {
              error: (e) => {
                const wrap = e.target.parentElement;
                clear(wrap);
                wrap.classList.add('workcard__cover--icon');
                wrap.append(icon(iconKey(project), { size: 36 }));
              },
            },
          }))
      : el('div', { class: 'workcard__cover workcard__cover--icon' },
          icon(iconKey(project), { size: 36 }));

    /* When a search matched on a technology rather than the title, float the
       matching tags to the front so the card shows *why* it is in the results
       instead of leaving the reason off-card. */
    const ranked = q.length
      ? project.technologies
        .map((t, i) => ({ t, i, hit: q.some((term) => fold(t).includes(term)) }))
        .sort((a, b) => (b.hit - a.hit) || (a.i - b.i))
        .map((x) => x.t)
      : project.technologies;

    const tags = ranked.slice(0, UI.cardTagLimit);
    const overflow = ranked.length - tags.length;

    return el('li', null,
      el('article', { class: 'workcard reveal' },
        media,
        el('div', { class: 'workcard__body' },
          project.categoryNames.length
            ? el('p', { class: 'workcard__cats' },
                project.categoryNames.map((c) => el('span', null, highlight(c, q))))
            : null,
          el('h3', { class: 'workcard__title' },
            el('button', {
              class: 'workcard__open',
              type: 'button',
              on: { click: () => onOpen(project) },
            }, highlight(project.title, q)),
          ),
          project.description
            ? el('p', { class: 'workcard__desc' }, highlight(project.description, q))
            : null,
          tags.length
            ? el('ul', { class: 'workcard__tags' },
                tags.map((t) => el('li', { class: 'tag' }, highlight(t, q))),
                overflow > 0 ? el('li', { class: 'tag tag--overflow' }, `+${overflow}`) : null)
            : null,
        ),
        projectLinks(project),
      ),
    );
  }

  function projectLinks(project) {
    const entries = [
      ['github', 'Source on GitHub', project.links.github],
      ['book', 'Documentation', project.links.docs],
      ['play', 'Demo video', project.links.demo],
      ['globe', 'Live site', project.links.live],
    ].filter(([, , href]) => href);

    if (!entries.length) return null;

    return el('div', { class: 'workcard__links' },
      entries.map(([name, label, href]) => el('a', {
        href,
        target: '_blank',
        rel: 'noopener',
        'aria-label': `${label} — ${project.title}`,
        title: label,
        dataset: {
          track: 'project_link_click',
          trackLabel: project.title,
          trackLink: name,
        },
      }, icon(name, { size: 15 }))),
    );
  }

  /* ----------------------------------------------------------- URL state -- */

  function toUrl() {
    const params = new URLSearchParams(location.search);
    setOrDelete(params, 'q', state.query);
    setOrDelete(params, 'cat', [...state.cats].join(','));
    setOrDelete(params, 'tech', [...state.techs].join(','));
    setOrDelete(params, 'sort', state.sort === 'featured' ? '' : state.sort);
    const qs = params.toString();
    return `${location.pathname}${qs ? `?${qs}` : ''}${location.hash}`;
  }

  function setOrDelete(params, key, value) {
    if (value) params.set(key, value);
    else params.delete(key);
  }

  function fromUrl() {
    const params = new URLSearchParams(location.search);
    state.query = params.get('q') || '';
    state.cats = new Set(splitParam(params.get('cat')));
    state.techs = new Set(splitParam(params.get('tech')));
    const sort = params.get('sort');
    state.sort = sortOptions().includes(sort) ? sort : 'featured';

    if (searchInput) searchInput.value = state.query;
    if (sortSelect) sortSelect.value = state.sort;
  }

  const splitParam = (v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : []);

  /** Whatever the <select> actually offers — "newest" may have been removed. */
  const sortOptions = () => (sortSelect
    ? Array.from(sortSelect.options, (o) => o.value)
    : ['featured']);

  /* --------------------------------------------------------------- apply -- */

  function apply({ push = false, replace = false } = {}) {
    visible = sorted(filtered());

    if (searchWrap) searchWrap.dataset.filled = String(Boolean(state.query));

    renderFilters();
    renderGrid();

    const url = toUrl();
    if (push && url !== location.pathname + location.search + location.hash) {
      history.pushState(null, '', url);
    } else if (replace) {
      history.replaceState(null, '', url);
    }
  }

  /* ---------------------------------------------------------------- wire -- */

  const onSearch = debounce(() => {
    state.query = searchInput.value.trim();
    apply({ replace: true });
    if (state.query.length > 2) {
      track('project_search', { search_term: state.query, results: visible.length });
    }
  }, 160);

  if (searchInput) {
    searchInput.addEventListener('input', onSearch, { signal });
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && searchInput.value) {
        e.preventDefault();
        searchInput.value = '';
        state.query = '';
        apply({ replace: true });
      }
    }, { signal });
  }

  if (searchClear) {
    clear(searchClear);
    searchClear.append(icon('x', { size: 14 }));
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      state.query = '';
      apply({ replace: true });
      searchInput.focus();
    }, { signal });
  }

  /* "Newest" only means something once projects carry a `year`; without it the
     option would silently duplicate "Featured", so drop it. */
  if (sortSelect && !projects.some((p) => p.year > 0)) {
    sortSelect.querySelector('option[value="newest"]')?.remove();
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      state.sort = sortSelect.value;
      track('project_filter', { dimension: 'sort', value: state.sort, active: true });
      apply({ push: true });
    }, { signal });
  }

  const searchIcon = $('[data-search-icon]');
  if (searchIcon) searchIcon.replaceWith(withClass(icon('search', { size: 16 }), 'search__icon'));

  /* `/` focuses search from anywhere that isn't already a text field. */
  document.addEventListener('keydown', (e) => {
    if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (document.activeElement?.isContentEditable) return;
    e.preventDefault();
    searchInput?.focus();
    searchInput?.select();
  }, { signal });

  window.addEventListener('popstate', () => {
    fromUrl();
    apply();
  }, { signal });

  fromUrl();
  apply();

  return {
    /** Current results, in display order — the viewer's prev/next walk this. */
    getVisible: () => visible,
    findBySlug: (slug) => projects.find((p) => p.slug === slug),
    refresh: () => apply(),
    destroy: () => listeners.abort(),
  };
}

function withClass(node, className) {
  node.setAttribute('class', className);
  return node;
}

const iconKey = (project) => iconFor(project.icon, 'folder');
