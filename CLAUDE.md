# CLAUDE.md — Big Al's Lighting Emporium Quote Builder

## What this is

A single-page quote generator for film lighting kit hire. Used on an iPad, installed to
the home screen from GitHub Pages. **`index.html` is the entire application** — React,
Tailwind, jsPDF and fonts all load from CDNs. There is no build step, no `npm install`,
no bundler, no framework scaffolding.

## Hard rules

- **Never split the app into multiple files.** Self-containment is a feature, not an
  oversight. It must keep working as a single file served from GitHub Pages.
- **Never add a build step.** No Vite, no Webpack, no JSX transpilation at build time.
  The React inside is already compiled to `React.createElement(...)` calls — match that
  style when adding components. Do not introduce raw JSX.
- **Never use `localStorage` keys outside the `alq:` namespace**, and never change or
  remove an existing key. Doing so wipes saved quotes on the iPad, which are the only
  copy — they don't sync anywhere.
- **Never reorder or renumber `QUOTE_VERSION`** without writing a migration for older
  saved quotes.
- British English and `£` throughout. Money is rendered via the `money()` helper
  (`en-GB`, two decimals) — don't hand-roll currency formatting.

## Catalogue

`CATALOG_DEFAULT` (near the top of the script block) is the source of truth. Shape:

```js
sectionKey: {
  label: "Human readable",
  excludeFromDiscount: true,   // optional — consumables only
  items: [
    { name: "ITEM NAME IN CAPS", price: 24, default: 2 }  // `default` = qty pre-filled
  ]
}
```

Sections in order: `lights`, `modifiers`, `effects`, `power`, `stands`, `booms`, `grip`,
`textiles`, `consumables`.

Conventions:

- Item names are **UPPERCASE**. Textiles are size-prefixed (`8x8 …`, `12x12 …`).
- Items are listed price-descending within a section. `applyOverrides()` re-sorts at
  runtime anyway, so source order is cosmetic — but keep it tidy.
- `default` is the quantity pre-filled on a fresh quote. Omit it for items that aren't
  standard on a truck.
- Adding an item to `CATALOG_DEFAULT` is safe with existing saved quotes: user-side
  catalogue edits live separately in `alq:catalogOverrides` and merge on top via
  `applyOverrides()` (`priceEdits` / `additions` / `removals`).

## Deployment

Push to `main` → GitHub Pages rebuilds in a minute or two. The home-screen app may need
a force-close and reopen to pick up changes. **Verify changes render before pushing** —
a syntax error in `index.html` is a white screen on set, with no console to check.

## When making changes

1. Say what you're changing and where before touching the file.
2. Prefer the smallest possible diff. This file is ~4,000 lines; don't reformat it.
3. After any edit, sanity-check the script parses (e.g. `node --check` won't work on
   HTML — extract the script block or open the file in a browser and check the console).
4. Commit messages: short, imperative, lowercase. e.g. `add caligri air tube to modifiers`.
