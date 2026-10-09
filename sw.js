/* Big Al's Lighting Emporium Quote Builder — service worker.
 *
 * Deliberately tiny and dependency-free (no Workbox). This is the ONE file that
 * lives outside index.html: a service worker must be a separate same-origin
 * script — it can't be inlined into the HTML or loaded from a blob URL.
 *
 * What it does:
 *   - Serves index.html instantly from cache (stale-while-revalidate) so the
 *     home-screen app opens even with no connection — basements, stages, no signal.
 *   - Fetches a fresh copy in the background and, when it's genuinely different,
 *     tells open pages so the user can reopen to apply. Never auto-reloads, which
 *     could wipe an in-progress quote.
 *   - Runtime-caches the Google Fonts CSS + font files opportunistically so they
 *     survive offline too. If they were never fetched, the app falls back to
 *     system fonts — cosmetic and acceptable.
 */

const VERSION = "v1";
const APP_CACHE = "alq-app-" + VERSION;
const FONT_CACHE = "alq-fonts-" + VERSION;

// self.location is this script's URL (…/<repo>/sw.js), so "./" resolves to the
// app root — the Pages subpath, e.g. https://<user>.github.io/<repo>/.
const INDEX_URL = new URL("./", self.location.href).href;

// Set true when this launch's background revalidate finds a new index.html.
// Lets us answer a page that starts listening after we've already detected the
// update (the notify below can otherwise race the page's own startup).
let pendingUpdate = false;

// Precache the app shell (a fresh copy, bypassing the HTTP cache).
self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(APP_CACHE)
      .then(cache => cache.add(new Request(INDEX_URL, { cache: "reload" })))
      .then(() => self.skipWaiting())
  );
});

// Drop caches from older versions, then start controlling open pages.
self.addEventListener("activate", event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(k => k !== APP_CACHE && k !== FONT_CACHE)
            .map(k => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;

  // Navigations → stale-while-revalidate against the cached index.html.
  if (req.mode === "navigate") {
    event.respondWith(handleNavigate(req, event));
    return;
  }

  // Google Fonts (stylesheet + font files) → cache-first runtime cache.
  const host = new URL(req.url).hostname;
  if (host === "fonts.googleapis.com" || host === "fonts.gstatic.com") {
    event.respondWith(cacheFirst(req, FONT_CACHE));
    return;
  }

  // Everything else is inlined into index.html — nothing else to intercept.
});

/* Serve the cached shell immediately; refresh it in the background. Updates
   land on the next launch, which is exactly how the app is used (force-close
   and reopen). Never network-first: a weak signal would hang every launch. */
async function handleNavigate(request, event) {
  pendingUpdate = false; // fresh launch — don't carry a stale flag forward.
  const cache = await caches.open(APP_CACHE);
  const cached = await cache.match(INDEX_URL);
  // Clone up front — the original `cached` is handed to the page below, and we
  // can't clone a response once its body is being consumed.
  const cachedForDiff = cached ? cached.clone() : null;

  // no-cache: revalidate with the server rather than taking GitHub Pages'
  // max-age=600 copy from the HTTP cache, which could be ten minutes stale.
  const network = fetch(INDEX_URL, { cache: "no-cache" })
    .then(async response => {
      if (response && response.ok) {
        await cache.put(INDEX_URL, response.clone());
        if (cachedForDiff) {
          const [oldText, newText] = await Promise.all([
            cachedForDiff.text(),
            response.clone().text(),
          ]);
          if (oldText !== newText) {
            pendingUpdate = true;
            notifyClients();
          }
        }
      }
      return response;
    })
    .catch(() => null);

  // Keep the worker alive for the background fetch/compare/notify — respondWith
  // only holds it until the cached response resolves, which is near-instant.
  event.waitUntil(network);

  // Cache first when we have it; otherwise wait on the network (first load).
  return cached || (await network) || fetch(request);
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    // Cache both clean and opaque (cross-origin, no-cors) responses — we only
    // ever serve them back to the browser, never read their contents.
    if (response && (response.ok || response.type === "opaque")) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (e) {
    return Response.error();
  }
}

async function notifyClients() {
  const clients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  for (const client of clients) {
    client.postMessage({ type: "SW_UPDATE_READY" });
  }
}

// A page announces itself once it's listening; if we already spotted an update
// this launch (and beat it to the punch), tell it now.
self.addEventListener("message", event => {
  const data = event.data;
  if (data && data.type === "CLIENT_READY" && pendingUpdate && event.source) {
    event.source.postMessage({ type: "SW_UPDATE_READY" });
  }
});
