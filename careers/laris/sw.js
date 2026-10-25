'use strict';
const CACHE_NAME = 'zanzibaba-laris-shell-v4';
const ROOT = '/careers/laris/';
const SHELL = [ROOT, ROOT+'app.js', ROOT+'analytics-config.js', ROOT+'analytics.js', ROOT+'manifest.webmanifest', ROOT+'icon-192.png', ROOT+'icon-512.png'];
self.addEventListener('install',event => { event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate',event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('zanzibaba-laris-shell-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
// Cache only this public application shell. Profiles are never put in the service-worker cache.
function offlineResponse(response) { if (!response) return new Response('Offline. Please reconnect to load this page.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8','X-Laris-Offline':'1'}}); const headers = new Headers(response.headers); headers.set('X-Laris-Offline','1'); return new Response(response.body,{status:response.status,statusText:response.statusText,headers}); }
self.addEventListener('fetch',event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  const navigation = event.request.mode === 'navigate' && (url.pathname === ROOT || url.pathname === ROOT+'index.html');
  if (!navigation && !SHELL.includes(url.pathname)) return;
  const key = navigation ? ROOT : url.pathname;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(event.request);
      if (response.ok && response.type !== 'opaque' && (!navigation || new URL(response.url).pathname.startsWith(ROOT))) { await cache.put(key,response.clone()); return response; }
      const cached = await cache.match(key); return cached ? offlineResponse(cached) : response;
    } catch { const cached = await cache.match(key); return offlineResponse(cached); }
  })());
});
