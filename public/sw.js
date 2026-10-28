/* Offline storage is opt-in. A package becomes usable only after every file is cached. */
const PREFIX =
  "dead-air-offline-" +
  encodeURIComponent(new URL(self.registration.scope).pathname) +
  "-";
const COMPLETE = new URL("__offline_complete__", self.registration.scope).href;
let preparing = false;
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim()),
);
self.addEventListener("message", (event) => {
  if (event.data?.type !== "PREPARE_OFFLINE" || !event.ports[0]) return;
  const port = event.ports[0];
  event.waitUntil(
    (async () => {
      let name;
      let ownsPreparation = false;
      try {
        if (preparing)
          throw new Error(
            "An offline download is already running. Keep that tab open.",
          );
        preparing = true;
        ownsPreparation = true;
        const { version, assets } = event.data.manifest || {};
        if (
          !/^[a-f0-9]{16,64}$/.test(version) ||
          !Array.isArray(assets) ||
          assets.length > 300
        )
          throw new Error("Invalid offline package.");
        const urls = [
          ...new Set(
            [...assets, "offline-assets.json"].map((path) => {
              const url = new URL(path, self.registration.scope);
              if (
                url.origin !== self.location.origin ||
                !url.pathname.startsWith(
                  new URL(self.registration.scope).pathname,
                )
              )
                throw new Error("Invalid offline file.");
              return url.href;
            }),
          ),
        ];
        name = PREFIX + version;
        const cache = await caches.open(name);
        // Preserve a complete package on repeat clicks; do not destroy a working
        // offline copy merely because the network is unavailable during a retry.
        if (await cache.match(COMPLETE)) {
          const existing = await Promise.all(
            urls.map((url) => cache.match(url)),
          );
          if (existing.every(Boolean)) {
            port.postMessage({ type: "ready" });
            return;
          }
        }
        // An incomplete preparation is never used as a fallback.
        await cache.delete(COMPLETE);
        for (let i = 0; i < urls.length; i++) {
          const response = await fetch(urls[i], { cache: "reload" });
          if (!response.ok)
            throw new Error(
              "An offline file could not download. Retry while connected.",
            );
          await cache.put(urls[i], response);
          port.postMessage({
            type: "progress",
            completed: i + 1,
            total: urls.length,
          });
        }
        await cache.put(COMPLETE, new Response(version));
        for (const key of await caches.keys())
          if (key.startsWith(PREFIX) && key !== name) await caches.delete(key);
        port.postMessage({ type: "ready" });
      } catch (error) {
        if (name) await caches.delete(name);
        port.postMessage({ type: "error", message: error.message });
      } finally {
        if (ownsPreparation) preparing = false;
        port.close();
      }
    })(),
  );
});
self.addEventListener("fetch", (event) => {
  if (
    event.request.method !== "GET" ||
    new URL(event.request.url).origin !== self.location.origin
  )
    return;
  event.respondWith(
    (async () => {
      try {
        return await fetch(event.request);
      } catch (error) {
        for (const key of await caches.keys()) {
          if (!key.startsWith(PREFIX)) continue;
          const cache = await caches.open(key);
          if (!(await cache.match(COMPLETE))) continue;
          // Static package files are identical across Origin/Accept-Encoding variants.
          const cached = await cache.match(event.request, { ignoreVary: true });
          if (cached) return cached;
          if (event.request.mode === "navigate") {
            const index = await cache.match(
              new URL("index.html", self.registration.scope).href,
            );
            if (index) return index;
          }
        }
        throw error;
      }
    })(),
  );
});
