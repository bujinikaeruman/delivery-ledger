/* フーデリ採算くん Service Worker
   更新するときは CACHE の版番号（v1 → v2 …）を上げてください */
const CACHE = "delivery-ledger-v40";
const FILES = ["./", "./index.html", "./manifest.json",
  "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./icon-180.png"];

// インストール時にキャッシュへ格納
self.addEventListener("install", ev => {
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

// 古い版のキャッシュを掃除
self.addEventListener("activate", ev => {
  ev.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ネット優先・失敗したらキャッシュ（圏外でも起動できる）
self.addEventListener("fetch", ev => {
  if (ev.request.method !== "GET") return;
  ev.respondWith(
    fetch(ev.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(ev.request, copy));
        return res;
      })
      .catch(() => caches.match(ev.request).then(r => r || caches.match("./index.html")))
  );
});
