const CACHE_NAME = 'okey-pro-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// Kurulum (Install) Aşaması - Dosyaları önbelleğe al
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Dosyalar önbelleğe alınıyor');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Aktivasyon (Activate) Aşaması - Eski önbellekleri temizle
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Eski önbellek siliniyor', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Ağ İsteklerini Yakalama (Fetch) - Önce önbellek, yoksa ağ
self.addEventListener('fetch', event => {
    // CDN bağlantılarını (PeerJS vb.) önbelleğe almaya çalışmaması için filtre
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Önbellekte varsa onu döndür, yoksa ağdan çek
                return response || fetch(event.request).catch(() => {
                    // Çevrimdışıysa ve istek atılamıyorsa ana sayfayı göster
                    if(event.request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }
                });
            })
    );
});
