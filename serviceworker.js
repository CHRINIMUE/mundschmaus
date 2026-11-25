---
layout: none
---
const CACHE = "mundschmaus-pwa-v{{ site.time | date: "%Y%m%d%H%M%S" }}";
const OFFLINE_FALLBACK_PAGE = "{{ site.baseurl }}/";
// Cache-Hygiene: Alte Versionen werden beim Aktivieren geloescht, und der
// Laufzeit-Cache hat ein hartes Limit (aelteste Eintraege zuerst verworfen),
// damit er nicht unbegrenzt waechst.
const MAX_ENTRIES = 800;

const PRECACHE_URLS = [
  {% for page in site.html_pages %}"{{ page.url | prepend: site.baseurl }}",
  {% endfor %}{% for recipe in site.recipes %}"{{ recipe.url | prepend: site.baseurl }}",
  {% endfor %}{% for component in site.components %}"{{ component.url | prepend: site.baseurl }}",
  {% endfor %}{% for file in site.static_files %}{% if file.path contains "images/" or file.path contains "icons/" or file.path contains "assets/" or file.path contains "plugins/" or file.path contains "js/" or file.path contains "search.json" %}"{{ file.path | prepend: site.baseurl }}",
  {% endif %}{% endfor %}
];

// Externe Ressourcen, ohne die die App offline ungestylt oder kaputt waere
// (Tailwind erzeugt das CSS zur Laufzeit, Fonts, jQuery). Alles andere
// Cross-Origin-Anfragen werden bewusst NICHT gecacht.
const EXTERNAL_CACHE_HOSTS = [
  "cdn.tailwindcss.com",
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "use.typekit.net",
  "code.jquery.com",
  "cdnjs.cloudflare.com"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      var all = PRECACHE_URLS.concat([OFFLINE_FALLBACK_PAGE]);
      // Einzeln cachen: Ein einzelner Fehler (z. B. 404) bricht das
      // komplette Pre-Caching nicht ab.
      return Promise.all(all.map(function (url) {
        return cache.add(new Request(url, { cache: "reload" })).catch(function () {
          return undefined;
        });
      }));
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

function isExternalCacheable(url) {
  return EXTERNAL_CACHE_HOSTS.indexOf(url.hostname) !== -1;
}

async function trimCache() {
  var cache = await caches.open(CACHE);
  var keys = await cache.keys();
  if (keys.length > MAX_ENTRIES) {
    var removeCount = keys.length - MAX_ENTRIES;
    for (var i = 0; i < removeCount; i++) {
      await cache.delete(keys[i]);
    }
  }
}

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET") return;

  var url = new URL(request.url);

  // Navigationen (HTML): Netz zuerst, Cache als Rueckfallebene,
  // Offline-Startseite als letzter Ausweg.
  if (request.mode === "navigate" || (request.headers.get("accept") || "").indexOf("text/html") !== -1) {
    event.respondWith(
      fetch(request).then(function (response) {
        event.waitUntil(
          caches.open(CACHE).then(function (cache) {
            cache.put(request, response.clone()).then(trimCache);
          })
        );
        return response;
      }).catch(function () {
        return caches.match(request).then(function (matching) {
          if (matching) return matching;
          return caches.match(OFFLINE_FALLBACK_PAGE).then(function (fallback) {
            return fallback || Response.error();
          });
        });
      })
    );
    return;
  }

  // Same-origin Ressourcen (Bilder, CSS, JS, JSON): Cache zuerst,
  // im Hintergrund aktualisieren.
  if (url.origin === location.origin) {
    event.respondWith((async function () {
      var cache = await caches.open(CACHE);
      var cached = await cache.match(request);
      var network = fetch(request).then(function (response) {
        if (response && response.ok) {
          event.waitUntil(
            cache.put(request, response.clone()).then(trimCache)
          );
        }
        return response;
      }).catch(function () {
        return undefined;
      });
      if (cached) {
        event.waitUntil(network.then(function () { return undefined; }).catch(function () {}));
        return cached;
      }
      return (await network) || Response.error();
    })());
    return;
  }

  // Externe, zwingend benoetigte Ressourcen: auch cachen, damit die App
  // offline nicht ungestylt laeuft.
  if (isExternalCacheable(url)) {
    event.respondWith((async function () {
      var cache = await caches.open(CACHE);
      var cached = await cache.match(request);
      var network = fetch(request).then(function (response) {
        if (response && (response.ok || response.type === "opaque")) {
          event.waitUntil(
            cache.put(request, response.clone()).then(trimCache)
          );
        }
        return response;
      }).catch(function () {
        return undefined;
      });
      if (cached) return cached;
      return (await network) || Response.error();
    })());
  }
});
