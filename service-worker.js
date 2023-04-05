importScripts("/precache-manifest.96e54545d3cf7131b8d79b43230924aa.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

const CACHE_NAME = "PWA-version-1";
const dynamicCache = "dynamic-v1";
const urlsToCache = ["/"];
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.setConfig({ debug: false });
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
workbox.routing.registerNavigationRoute("/index.html", { allowlist: ["/*"] });

self.addEventListener("install", function (event) {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.url.match(/\.(mpd|m4s|flv|mp4)\s*$/gm)) {
    return false;
  }
  if (event.request.url.match(/.*api\..*\/(auth)/gm)) {
    return false;
  }
  event.respondWith(
    caches.open(dynamicCache).then(function (cache) {
      return fetch(event.request).then(function (response) {
        cache.put(event.request, response.clone());
        return response;
      });
    })
    /*caches.match(event.request).then((cacheRes) => {
      return (
        cacheRes ||
        fetch(event.request).then((fetchRes) => {
          return caches.open(dynamicCache).then((cache) => {
            cache.put(event.request.url, fetchRes.clone());
            return fetchRes;
          });
        })
      );
    })*/
  );
});
const expectedCaches = [];
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (expectedCaches.includes(key)) {
              return caches.delete(key);
            }
          })
        )
      )
      .then(() => {
        event.waitUntil(self.clients.claim());
      })
  );
});
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

