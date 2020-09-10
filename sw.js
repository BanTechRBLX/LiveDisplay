var CACHE_NAME = 'livedisplay-cache-v1';
var urlsToCache = [
	'./',
	'./css/main.css',
	'./css/normalize.css',
	'./js/main.js',
	'./js/plugins.js',
	'./js/vendor/modernizr-3.11.2.min.js',
	'https://code.jquery.com/jquery-3.5.1.min.js',
];

self.addEventListener('install', function (event) {
	// Perform install steps
	event.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
		console.log('Opened cache');
		return cache.addAll(urlsToCache);
	}));
});

self.addEventListener('fetch', function (event) {
	event.respondWith(caches.match(event.request).then(function (response) {
		// Cache hit - return response
		if (response) {
			return response;
		}
		return fetch(event.request);
	}));
});

self.addEventListener('activate', function (event) {
	event.waitUntil(
		caches.keys().then(function (cacheNames) {
			return Promise.all(
				cacheNames.map(function (cacheName) {
					if (cacheName !== CACHE_NAME) {
						console.log('Deleted cache');
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
});