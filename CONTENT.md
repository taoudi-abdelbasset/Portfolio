# Updating the site

The whole site renders from one file: **`data/portfolio.json`**. Change it, push
it, done — you never touch HTML, CSS or JS to update content.

```bash
# edit data/portfolio.json, then:
git add data/portfolio.json
git commit -m "content: add the X project"
git push
```

The live site reads the JSON straight from GitHub at
`raw.githubusercontent.com/taoudi-abdelbasset/Portfolio/main/data/portfolio.json`,
so your change shows up within a minute or so — you don't have to wait for the
GitHub Pages build. You can also edit the file directly in GitHub's web editor
from your phone.

## Where the data comes from

`assets/js/data-source.js` tries these in order and takes the first that works:

| # | Source | Why |
|---|--------|-----|
| 1 | `?data=<url>` | Preview a draft or another branch before merging |
| 2 | Fresh `localStorage` copy | Instant paint; revalidates in the background |
| 3 | **raw.githubusercontent.com** | The real source of truth |
| 4 | jsDelivr mirror | Only if raw is unreachable (caches ~12h, so never primary) |
| 5 | Bundled `data/portfolio.json` | Shipped with the site |
| 6 | Stale `localStorage` copy | Better stale than blank |

If it falls through to 5 or 6, a toast tells you — a bad push is visible, not
silent. To move content to a different repo or branch later, change
`DATA_SOURCE` in `assets/js/config.js`. Nothing else needs to change.

**Preview before merging:**
`https://taoudi-abdelbasset.me/?data=https://raw.githubusercontent.com/taoudi-abdelbasset/Portfolio/some-branch/data/portfolio.json`

## Safety net

Anything missing degrades instead of breaking:

- A section that's empty or absent disappears — **and so does its nav link**.
- A missing field falls back to a sensible default.
- A broken image URL collapses to an icon rather than leaving a hole.
- `javascript:` and `data:` URLs in the JSON are stripped.
- Content is inserted as text, never as markup, so it can't inject HTML.

Run `python3 -m json.tool data/portfolio.json` before pushing to catch a stray
comma. That single check prevents nearly every content-push mistake.

---

# The schema

Only `main` is really required. Everything else is optional: leave a section out
and it simply won't render.

## `main`

```json
{
  "main": {
    "name": "TAOUDI Abdelbasset",
    "statement": "Data engineer building systems that *see*.",
    "roles": ["Data Scientist", "Backend Developer"],
    "education": "Big Data & Cloud Computing, ENSET Mohammedia",
    "location": "Mohammedia, Morocco",
    "availability": "Open to opportunities",
    "resumeUrl": "",
    "img": "data/src/imgs/user.png",
    "bio": "Motivated engineering student…"
  }
}
```

| Field | Notes |
|---|---|
| `name` | Required. Used in the wordmark, page title and schema.org data. |
| `statement` | The big hero line. Wrap one word in `*asterisks*` to render it as the italic accent — that's the single coloured moment on the page. Falls back to `name`. |
| `roles` | Cycles in the mono line under the statement. Shown as a plain list when the visitor prefers reduced motion. |
| `location`, `availability` | Optional; each renders a metadata row only if present. `availability` gets a green status dot. |
| `resumeUrl` | Leave `""` and the Résumé button doesn't appear anywhere. Fill it and it shows in the hero and the contact list. |
| `img` | Use a **relative** path like `data/src/imgs/user.png` so it works locally and live. |

## `experience` and `education`

Same shape. Experience uses `company`, education uses `location` as the
organisation.

```json
{
  "from": "Jul 2024",
  "to": "Sep 2024",
  "title": "Data & Process Optimization Intern",
  "company": "Annour Technologies",
  "location": "Casablanca, Morocco",
  "logo": "",
  "icon": "fas fa-briefcase",
  "description": "One paragraph…",
  "achievements": ["Bullet one", "Bullet two"],
  "skills": ["Laravel", "D3.js"]
}
```

Entries render in the order you list them. An entry with no `description`,
`achievements` or `skills` renders as a plain row with no expander.

## `skills`

```json
{
  "id": "bigdata",
  "title": "Big Data & Analytics",
  "icon": "fas fa-chart-line",
  "description": "One sentence…",
  "techTags": ["Spark", "Kafka"],
  "certificates": [
    { "name": "Supervised ML", "issuer": "Coursera", "link": "https://…" }
  ]
}
```

A certificate with no `link` renders as plain text instead of a dead link.

## `projects`

```json
{
  "title": "RetailVision Analytics",
  "slug": "retailvision",
  "categories": ["ai", "bigdata", "web"],
  "description": "One line for the card.",
  "fullDescription": "The longer version for the detail panel.",
  "image": "fas fa-store",
  "imgBg": "data/src/imgs/projects/default.png",
  "technologies": ["YOLOv8", "Spark", "Kafka"],
  "features": ["Feature one", "Feature two"],
  "githubLink": "",
  "documentation": "",
  "demoVideo": "",
  "liveUrl": "",
  "year": 2025,
  "featured": true,
  "teamMembers": [
    { "name": "Abdelbasset TAOUDI", "role": "Lead Developer", "contact": "you@example.com", "img": "" }
  ]
}
```

| Field | Notes |
|---|---|
| `categories` | Drives the **Type** filter chips. Give them readable names via `categoryLabels` (below), otherwise the slug gets title-cased. A legacy single `category` string still works. |
| `technologies` | Drives the **Tech** filter chips *and* search. The chips are ranked by how often a technology appears. |
| `slug` | Optional — the shareable `#project/<slug>` link. Derived from the title when omitted, so only set it if you want a shorter URL. |
| `imgBg` | Card and panel cover image. Falls back to the `image` icon if empty or broken. |
| `year` | Optional. **The "Newest" sort option only appears once at least one project has a year** — otherwise it would silently duplicate "Featured". |
| `featured` | `true` floats it to the top under the default sort. |
| `demoVideo` | YouTube, Vimeo, or a Google Drive share link — embedded automatically. Anything else falls back to the cover image. |

## `categoryLabels`

Maps category slugs to display names, so filters read properly instead of
showing `BIGDATA`:

```json
{
  "categoryLabels": {
    "ai": "AI & Computer Vision",
    "bigdata": "Big Data",
    "web": "Web"
  }
}
```

## `contact`

```json
{ "type": "email", "value": "you@example.com", "label": "you@example.com",
  "icon": "fas fa-envelope", "link": "mailto:you@example.com" }
```

`mailto:` / `tel:` prefixes are added automatically for `email` and `phone`
types, so you can leave `link` out for those. Recognised types get a nicer
label: `email`, `phone`, `linkedin`, `github`, `twitter`, `website`.

## Icons

Icons are inline SVG now — Font Awesome is gone. Your existing `"fas fa-…"`
values still work: they're mapped to the built-in set in
`assets/js/icons.js`. An unrecognised name falls back to a neutral glyph rather
than rendering nothing. To add a new one, add a path to `ICONS` and an entry to
`FA_ALIASES` in that file.

---

# Running it locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

A server is required — `fetch()` and ES modules don't work from `file://`.

Useful URLs while testing:

- `?q=spark&cat=bigdata` — search and filters are shareable and restore on load
- `#project/javadevllm` — opens that project's panel directly
- `?data=<url>` — render from a different JSON without deploying

Keyboard: `/` focuses search, `Esc` clears it or closes the panel, `←`/`→` move
between projects inside the panel.

---

# Project layout

```
index.html                  semantic shell — no content, no placeholders
data/portfolio.json         all content lives here
assets/css/
  fonts.css                 generated @font-face; regenerate, don't hand-edit
  tokens.css                colour/type/space tokens, both themes
  base.css                  reset, typography, layout primitives
  components.css            every component
assets/fonts/               self-hosted Newsreader + IBM Plex subsets
assets/js/
  config.js                 data source + GA id — the file you'd edit
  data-source.js            the fetch/fallback chain
  normalize.js              tolerant coercion of the JSON
  dom.js, icons.js          helpers
  theme.js nav.js reveal.js analytics.js
  sections/                 hero, ledger, skills, contact renderers
  projects/controller.js    search, filters, sort, URL state
  projects/viewer.js        the <dialog> detail panel
  main.js                   wiring
```
