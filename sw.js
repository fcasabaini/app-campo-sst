/* Service worker — App de Campo SST (FCA & Sabaini)
   Guarda o "esqueleto" do app no aparelho para abrir sem internet.
   Os dados das visitas NÃO passam por aqui: ficam no cache offline do Firestore.
   Ao publicar uma nova versão do index.html, aumente o número em VERSION. */
const VERSION = 'campo-sst-v4';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/logo.png',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js'
];

self.addEventListener('install', e => {
  // Cada arquivo é guardado separadamente: se um falhar (ex.: script externo), a instalação não é abortada
  e.waitUntil(
    caches.open(VERSION)
      .then(c => Promise.all(APP_SHELL.map(u => c.add(u).catch(err => console.warn('Não guardado no cache:', u, err)))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Tráfego do Firestore/Google APIs: nunca interceptar (o SDK cuida do offline)
  if (url.hostname.endsWith('googleapis.com') || url.hostname.endsWith('firebaseio.com') || url.hostname.endsWith('firebaseapp.com')) return;

  // Página: rede primeiro (pega versão nova), cache se estiver sem sinal
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put('./index.html', copy)); return res; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Demais arquivos (ícones, scripts do Firebase): cache primeiro
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res;
    }))
  );
});
