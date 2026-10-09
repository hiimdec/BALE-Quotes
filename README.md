# Big Al's Lighting Emporium — Quote Builder

A single-page quote generator for Big Al's Lighting Emporium, deployable to GitHub Pages and installable as a home-screen app on iPhone. It still works on an iPad.

## What's in the repo

- `index.html` — the entire application. React, Tailwind and jsPDF are all inlined. There's no build step, nothing to install, and no CDN to go down.
- `sw.js` — the service worker, which is what makes the app work offline. It has to be a separate file (a service worker can't be inlined into the HTML), so it's the only part of the app living outside `index.html`.

The only external request the app makes is the Google Fonts stylesheet in `<head>` — Fraunces, Manrope and JetBrains Mono.

## Hosting on GitHub Pages

1. Create a new GitHub repository (it can be public or private).
2. Upload **both** `index.html` and `sw.js` to the root of the repo. They must sit alongside each other — the app registers the worker by relative path, so a nested `sw.js` won't be found and won't control the page.
3. Go to **Settings → Pages**.
4. Under "Source", choose **Deploy from a branch**.
5. Set branch to `main` and folder to `/ (root)`. Click **Save**.
6. Wait 1–2 minutes. Your site will be live at `https://<your-username>.github.io/<your-repo-name>/`.

## Installing on the iPhone home screen

1. Open the GitHub Pages URL in **Safari** on the iPhone.
2. Tap the **Share** button (square with an upward arrow — on newer iOS it's in the **⋯** menu).
3. Tap **Add to Home Screen**.
4. Name it ("Quotes" is already set as the default) and tap **Add**.

The app icon — Al's face — now lives on the home screen and launches in full-screen mode, with no Safari browser chrome and no address bar. Installing on an iPad works the same way, and the iPad keeps its wider layout.

Do use the home-screen icon rather than a Safari tab. It isn't only cosmetic — see [Where quotes are stored](#where-quotes-are-stored).

## Changing the icon

iOS takes a copy of the icon when the app is added to the home screen and never refreshes it. A new icon only appears after removing the app from the home screen and adding it again from Safari.

⚠️ **Removing the app from the home screen deletes its saved quotes.** On iOS a home-screen app keeps its own storage, which goes when the app does — and it's the only copy. Before removing it, export every quote you need to keep as a PDF. Treat the icon as cosmetic: if there are quotes you can't afford to lose, keep the old icon.

## Working offline

Everything the app needs is on the device after the first launch. React, Tailwind and jsPDF are inlined, so building a PDF fetches nothing and works with no connection at all.

`sw.js` serves `index.html` from a cache, stale-while-revalidate:

- On launch, the cached copy is served immediately. The app opens instantly and works with no signal — basements, stages, wherever it ends up.
- In the background it fetches a fresh copy and updates the cache for next time.

It is deliberately never network-first. A weak signal is worse than no signal: network-first would leave the app hanging on every launch, waiting for a timeout before showing anything.

Google Fonts are cached opportunistically the first time they load. If they've never been fetched, the app falls back to system fonts — cosmetic, and fine.

## Updating the app

Edit `index.html` locally and push to `main`. Pages rebuilds automatically within a minute or two.

Because the worker serves from cache first, **changes land on the next launch, not the current one**. Open the app once while online so it can fetch the new copy in the background, then force-close and reopen to see it. When it has picked up an update you'll get an "Update ready — reopen to apply" toast. It never reloads by itself — that would risk wiping a quote in progress.

## Quote numbering

Quotes are numbered `{PREFIX}-{YYYY}-{NNN}` — for example `ALQ-2026-014`.

- The prefix is a setting (gear icon → **Quote number prefix**). It defaults to `ALQ`.
- A quote is given its number the first time it's saved or exported to PDF, whichever happens first. Starting a draft and abandoning it doesn't use a number up. A duplicated quote gets its own number the same way.
- Once assigned, a number is frozen on that quote and never changes.
- The count restarts each year. It's stored per year, under `alq:quoteCounter:{year}` — e.g. `alq:quoteCounter:2026`.

**The counter is per-device and does not sync.** It's just a number in that phone's local storage. Two devices — Al's iPhone and the old iPad, say — each keep their own tally and know nothing about each other, so both will happily issue an `ALQ-2026-001`: you'd get duplicate numbers on quotes for different jobs. If more than one device is issuing quotes, give each device its own prefix so the numbers can't collide.

Quotes saved before numbering existed don't have a number and will be given one the next time they're saved. Older numbers are therefore roughly, rather than strictly, chronological.

## Where quotes are stored

Saved quotes and the current draft live in the phone's local storage, scoped to this site, under keys prefixed `alq:`. They survive app closures, phone restarts and iOS updates. They do **not** sync between devices, and there is no copy anywhere else.

Saving a quote you've opened offers **Update** (overwrite it in place) or **Save as new**, so re-saving the same job doesn't pile up copies in the list.

Installing to the home screen is what protects them. iOS evicts local storage for ordinary Safari sites after seven days without a visit — but home-screen web apps are exempt from that. Opening the app in a Safari tab instead of from the home-screen icon is **not** equivalent: the home-screen app keeps its own storage, separate from Safari's, so a Safari tab won't show the quotes saved in the app — and anything saved in the tab is on the seven-day clock.

Removing the app from the home screen, or clearing Safari's website data for the site, wipes saved quotes.

## Troubleshooting

**Changes you pushed aren't showing.** Expected on the first launch after a deploy — see [Updating the app](#updating-the-app). Open the app once while online, then force-close and reopen.

**Getting the PDF off the phone.** In the home-screen app the preview's button is **Share PDF**: send it straight to the producer, or choose **Save to Files**. (In a Safari tab it's **Download PDF** — check that pop-ups aren't blocked for the site.) Neither needs a connection — jsPDF is inlined.

**Fonts look wrong.** Google Fonts is occasionally blocked on corporate networks, and the fonts are the one thing not inlined. The app falls back to system fonts, which look fine but less distinctive. Once they've loaded on any connection, the worker keeps them cached.

## Resetting the app

A service worker is considerably stickier than the old browser cache. If a broken one ever installs, force-closing and reopening will **not** clear it — the worker itself is what's serving the page, so it will keep serving the bad copy however many times you relaunch.

The escape hatch is to remove the site's data entirely:

1. Delete the app from the home screen (touch and hold the icon → **Remove App**).
2. On the iPhone, go to **Settings → Safari → Advanced → Website Data**.
3. Find the entry for your Pages site and swipe left to delete it.
4. Reopen the Pages URL in Safari and add it to the home screen again.

⚠️ **This wipes every saved quote on that phone.** Removing the app deletes the storage the quotes live in, and it's the only copy — see [Where quotes are stored](#where-quotes-are-stored). If the app still opens at all, export anything you need as a PDF before you start.
