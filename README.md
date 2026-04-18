# Big Al's Lighting Emporium — Quote Builder

A single-page quote generator for Big Al's Lighting Emporium, deployable to GitHub Pages and installable as a home-screen app on iPad.

## What's in the repo

- `index.html` — the entire application. Self-contained: React, Tailwind, jsPDF, and fonts all load from CDNs.

## Hosting on GitHub Pages

1. Create a new GitHub repository (it can be public or private).
2. Upload `index.html` to the root of the repo.
3. Go to **Settings → Pages**.
4. Under "Source", choose **Deploy from a branch**.
5. Set branch to `main` and folder to `/ (root)`. Click **Save**.
6. Wait 1–2 minutes. Your site will be live at `https://<your-username>.github.io/<your-repo-name>/`.

## Installing on the iPad home screen

1. Open the GitHub Pages URL in **Safari** on the iPad.
2. Tap the **Share** button (square with an upward arrow).
3. Scroll down and tap **Add to Home Screen**.
4. Name it ("Big Al's" is already set as the default) and tap **Add**.

The app icon now lives on the home screen and launches in full-screen mode — no Safari browser chrome, no address bar. Works offline for the core app after the first launch (quote drafts, catalog, editing). PDF generation needs an internet connection the first time to fetch jsPDF; after that it's cached.

## Where quotes are stored

Saved quotes and the current draft live in the iPad's local storage, scoped to this site. They survive app closures, device restarts, and iPadOS updates. They do NOT sync between devices. If you clear Safari's website data, saved quotes are wiped.

## Updating the app

Edit `index.html` locally, push to GitHub. Pages rebuilds automatically within a minute or two. The next time you open the home-screen app, iPadOS may take a moment to fetch the update — force-close and reopen if you don't see changes.

## Troubleshooting

**PDF won't download on iPad.** Make sure you're online the first time. Check that pop-ups aren't blocked for the site.

**Home-screen app shows a blank page.** You're probably offline and the browser cache expired. Open in Safari with a connection, then reinstall.

**Fonts look wrong.** Google Fonts is occasionally blocked on corporate networks. The app falls back to system fonts, which look fine but less distinctive.
