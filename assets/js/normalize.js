/**
 * Turns whatever portfolio.json currently contains into a predictable shape.
 *
 * The point is that a bad content push degrades instead of blanking the page:
 * a missing section disappears (along with its nav link), a missing field gets
 * a default, and an old field name still works. Renderers downstream can
 * therefore assume every array exists and every string is a string.
 */

import { fold, slugify, titleCase } from './dom.js';

const str = (v, fallback = '') => (typeof v === 'string' ? v.trim() : v == null ? fallback : String(v));
const arr = (v) => (Array.isArray(v) ? v.filter((x) => x != null && x !== '') : []);
const strArr = (v) => arr(v).map((x) => str(x)).filter(Boolean);

/** Human labels for category slugs, overridable from the JSON. */
const DEFAULT_CATEGORY_LABELS = {
  ai: 'AI & ML',
  bigdata: 'Big Data',
  web: 'Web',
  iot: 'IoT',
  gamedev: 'Game Dev',
  mobile: 'Mobile',
  data: 'Data',
  devops: 'DevOps',
};

export function normalize(raw) {
  const data = raw && typeof raw === 'object' ? raw : {};
  const categoryLabels = { ...DEFAULT_CATEGORY_LABELS, ...(data.categoryLabels || {}) };

  const projects = normalizeProjects(arr(data.projects), categoryLabels);

  return {
    main: normalizeMain(data.main),
    education: arr(data.education).map(normalizeMilestone),
    experience: arr(data.experience).map(normalizeMilestone),
    skills: arr(data.skills).map(normalizeSkill),
    projects,
    contact: arr(data.contact).map(normalizeContact).filter((c) => c.href),
    categoryLabels,
    /** Every category present in the data, in first-seen order. */
    categories: uniqueCategories(projects, categoryLabels),
    /** Every technology, most-used first. */
    technologies: rankedTechnologies(projects),
  };
}

/* ------------------------------------------------------------------ main -- */

function normalizeMain(main = {}) {
  const m = main && typeof main === 'object' ? main : {};
  const name = str(m.name, 'Portfolio');
  return {
    name,
    img: str(m.img),
    roles: strArr(m.roles),
    education: str(m.education),
    bio: str(m.bio),
    /* Optional, all opt-in — absent fields simply don't render. */
    statement: str(m.statement),
    location: str(m.location),
    availability: str(m.availability),
    resumeUrl: str(m.resumeUrl),
    tagline: str(m.tagline),
  };
}

/* ------------------------------------------- education & experience -- */

/** Education and experience share a shape; only the org field differs. */
function normalizeMilestone(item = {}, index = 0) {
  const i = item && typeof item === 'object' ? item : {};
  const title = str(i.title, 'Untitled');
  return {
    id: index,
    title,
    slug: slugify(title) || `item-${index}`,
    from: str(i.from),
    to: str(i.to),
    /* Experience uses `company`, education uses `location`. */
    org: str(i.company) || str(i.location),
    place: str(i.company) ? str(i.location) : '',
    logo: str(i.logo),
    icon: str(i.icon),
    description: str(i.description),
    achievements: strArr(i.achievements),
    skills: strArr(i.skills),
    sortKey: yearOf(i.to) || yearOf(i.from) || 0,
  };
}

/** Pulls a 4-digit year out of "Sep 2023", "2023", "Present". */
function yearOf(value) {
  const m = String(value ?? '').match(/(19|20)\d{2}/);
  if (m) return Number(m[0]);
  return /present|current|now/i.test(String(value ?? '')) ? 9999 : 0;
}

/* ---------------------------------------------------------------- skills -- */

function normalizeSkill(skill = {}, index = 0) {
  const s = skill && typeof skill === 'object' ? skill : {};
  const title = str(s.title, 'Skills');
  return {
    id: str(s.id) || slugify(title) || `skill-${index}`,
    title,
    icon: str(s.icon),
    description: str(s.description),
    techTags: strArr(s.techTags),
    certificates: arr(s.certificates)
      .map((c) => ({
        name: str(c?.name),
        issuer: str(c?.issuer),
        link: str(c?.link),
      }))
      .filter((c) => c.name),
  };
}

/* -------------------------------------------------------------- projects -- */

function normalizeProjects(list, categoryLabels) {
  const seenSlugs = new Set();

  return list.map((project = {}, index) => {
    const p = project && typeof project === 'object' ? project : {};
    const title = str(p.title, `Project ${index + 1}`);

    /* Back-compat: older entries used a single `category` string. */
    const categories = strArr(p.categories).length
      ? strArr(p.categories)
      : str(p.category)
        ? [str(p.category)]
        : [];

    let slug = str(p.slug) || slugify(title) || `project-${index + 1}`;
    while (seenSlugs.has(slug)) slug = `${slug}-${index + 1}`;
    seenSlugs.add(slug);

    const technologies = strArr(p.technologies);
    const features = strArr(p.features);
    const description = str(p.description);
    const fullDescription = str(p.fullDescription);

    return {
      index,
      id: p.id ?? index,
      slug,
      title,
      categories,
      categoryNames: categories.map((c) => categoryLabels[c] || titleCase(c)),
      description,
      fullDescription: fullDescription || description,
      icon: str(p.image),
      cover: str(p.imgBg),
      technologies,
      features,
      year: Number(p.year) || yearOf(p.year) || 0,
      featured: p.featured === true,
      links: {
        github: str(p.githubLink),
        docs: str(p.documentation),
        demo: str(p.demoVideo),
        live: str(p.liveUrl),
      },
      team: arr(p.teamMembers)
        .map((m) => ({
          name: str(m?.name),
          role: str(m?.role),
          contact: str(m?.contact),
          img: str(m?.img),
        }))
        .filter((m) => m.name),

      /* Precomputed once so filtering never re-folds strings per keystroke. */
      haystack: fold(
        [title, description, fullDescription, technologies.join(' '), features.join(' '),
          categories.join(' '), categories.map((c) => categoryLabels[c] || '').join(' ')].join(' '),
      ),
      titleFold: fold(title),
      techFold: fold(technologies.join(' ')),
    };
  });
}

function uniqueCategories(projects, labels) {
  const counts = new Map();
  for (const p of projects) {
    for (const c of p.categories) counts.set(c, (counts.get(c) || 0) + 1);
  }
  return Array.from(counts, ([slug, count]) => ({
    slug,
    label: labels[slug] || titleCase(slug),
    count,
  })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function rankedTechnologies(projects) {
  const counts = new Map();
  for (const p of projects) {
    for (const t of p.technologies) {
      const key = t.trim();
      if (!key) continue;
      const existing = counts.get(fold(key));
      counts.set(fold(key), { label: existing?.label || key, count: (existing?.count || 0) + 1 });
    }
  }
  return Array.from(counts, ([key, v]) => ({ key, label: v.label, count: v.count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/* --------------------------------------------------------------- contact -- */

function normalizeContact(item = {}) {
  const c = item && typeof item === 'object' ? item : {};
  const type = str(c.type, 'link').toLowerCase();
  const value = str(c.value);
  let href = str(c.link) || value;

  if (href) {
    if (type === 'email' && !href.startsWith('mailto:')) href = `mailto:${value}`;
    else if (type === 'phone' && !href.startsWith('tel:')) href = `tel:${value.replace(/\s+/g, '')}`;
  }

  return {
    type,
    label: str(c.label) || value,
    value,
    href: safeHref(href),
    icon: str(c.icon),
    external: /^https?:/i.test(href),
  };
}

/**
 * Only allows schemes we intend to link to. Blocks javascript: and data: URLs
 * arriving from the JSON.
 */
export function safeHref(href) {
  const value = str(href);
  if (!value) return '';
  if (/^(https?:|mailto:|tel:|#|\/|\.\/)/i.test(value)) return value;
  return '';
}
