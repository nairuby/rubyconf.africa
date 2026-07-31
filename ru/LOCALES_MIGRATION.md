# i18n Spec — RubyConf Africa Jekyll Site

## Approach

One physical file per language per page, mirroring the ruby-lang.org pattern. Each language lives in its own top-level folder. All page files in a language folder share the same structure — only the front matter and translated content differ.

---

## Folder Structure

```
/
├── en/
│   ├── contact.html
│   ├── tickets.html
│   ├── about.html
│   └── speakers/
│       └── _posts/        ← speaker markdown files (English)
├── fr/
│   ├── contact.html
│   ├── tickets.html
│   ├── about.html
│   └── speakers/
│       └── _posts/        ← speaker markdown files (French)
├── sw/
│   └── ...
└── _includes/
    ├── contact-content.html
    ├── tickets-content.html
    └── ...                ← shared page bodies
```

---

## Front Matter Convention

Every page file must declare `locale` and `permalink` explicitly.

```yaml
---
layout: modern/application
permalink: /fr/contact
locale: fr
title: "Contactez-nous"
---
{ % include contact-content.html % }
```

The English pages live under `/en/` (not at root), so all language URLs follow the same pattern consistently:

| Language | URL           |
| -------- | ------------- |
| English  | `/en/contact` |
| French   | `/fr/contact` |
| Swahili  | `/sw/contact` |

A redirect from `/contact` → `/en/contact` can be handled at the CDN/hosting layer.

---

## Locale Resolution

Replace the current `site.locale` lookup with `page.locale` everywhere:

```liquid
{% assign current_locale = page.locale | default: 'en' %}
{% assign translations = site.data.translations[current_locale] %}
```

This is the **only change** needed in shared includes and layouts.

---

## Translation Data

Translation strings live in `_data/translations/` as before, one file per locale:

```
_data/
  translations/
    en.yml
    fr.yml
    sw.yml
```

---

## Shared Includes Pattern

Page body content lives in `_includes/`. Each locale's page file is just a front matter block + a single include call. This means content changes happen in one place only.

```
en/contact.html     ← front matter only
fr/contact.html     ← front matter only
sw/contact.html     ← front matter only
_includes/contact-content.html  ← the actual HTML/Liquid
```

---

## Speaker Pages

Speaker pages are generated from `_posts` collections inside each language folder. Each speaker post is translated independently and placed in the correct language folder. The front matter `locale` field drives the translation lookup identically to static pages.

```
en/speakers/_posts/2026-01-01-matz.md    ← locale: en
fr/speakers/_posts/2026-01-01-matz.md    ← locale: fr
```

---

## Language Switcher

The language switcher in the nav constructs alternate URLs by swapping the locale segment:

```liquid
{% assign path_parts = page.url | split: '/' %}
{% assign page_path = path_parts | slice: 2, 100 | join: '/' %}

<a href="/fr/{{ page_path }}">Français</a>
<a href="/sw/{{ page_path }}">Kiswahili</a>
```

---

## What Does NOT Change

- `_data/translations/` structure and keys — no migration needed
- All existing Liquid translation calls (`{{ translations.contact_page.title }}` etc.)
- Layouts, includes, CSS, JS
- The Pretix ticketing widget integration

---

## Migration Steps

1. Create `en/`, `fr/`, `sw/` top-level folders
2. Move existing pages into `en/`, adding `locale: en` to each front matter
3. Extract page body HTML into `_includes/*-content.html` files
4. Replace page body with `{% include *-content.html %}`
5. Update locale resolution in layouts/includes: `page.locale` instead of `site.locale`
6. Create `fr/` and `sw/` page stubs (front matter + include only)
7. Populate `fr.yml` and `sw.yml` translation files
8. Add language switcher to nav
9. Configure `/contact` → `/en/contact` redirect at hosting layer
