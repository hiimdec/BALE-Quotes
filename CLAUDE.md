# CLAUDE.md — Big Al's Lighting Emporium Quote Builder

## What this is

A single-page quote generator for film lighting kit hire. Used on an iPhone (the iPad is
still supported), installed to the home screen from GitHub Pages. **`index.html` is the
entire application** — React, Tailwind and jsPDF are inlined into it; the only external
request is the Google Fonts stylesheet. There is no build step, no `npm install`, no
bundler, no framework scaffolding.

## Hard rules

- **Never split the app into multiple files, with one sanctioned exception: `sw.js`.**
  Self-containment is a feature, not an oversight. The app itself must keep working as a
  single `index.html` served from GitHub Pages. The lone exception is the service worker
  (`sw.js`) in the repo root — a service worker *must* be a separate same-origin script
  (it can't be inlined into the HTML or loaded from a blob URL), so offline support is
  impossible without it. That's the only file allowed outside `index.html`; the rule holds
  for everything else.
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
4. Check layout changes at **390px** (iPhone) and **1024px** (iPad). Phone-only layout lives
   behind `useIsPhone()` and the phone media query in the app's own `<style>` block; the
   iPad layout (≥640px, Tailwind's `sm:`) must not change. The inlined Tailwind build only
   contains classes that were already in use, so write a small named rule in `<style>`
   rather than a Tailwind utility that won't exist.
5. Commit messages: short, imperative, lowercase. e.g. `add caligri air tube to modifiers`.
