const SWORKER_VERSION = 'infinite-craft-dictionary-v1';

async function deleteCache(key) {
	await caches.delete(key);
};

async function deleteOldCaches() {
	const cacheKeepList = [SWORKER_VERSION];
	const keyList = await caches.keys();
	const cachesToDelete = keyList.filter((key) => !cacheKeepList.includes(key));
	await Promise.all(cachesToDelete.map(deleteCache));
};

self.addEventListener('activate', (event) => {
	event.waitUntil(deleteOldCaches());
});

async function putInCache(request, response) {
	const cache = await caches.open(SWORKER_VERSION);
	await cache.put(request, response);
};

async function cacheFirst(request) {
	const responseFromCache = await caches.match(request);
	if (responseFromCache) {
		return responseFromCache;
	}

	try {
		const responseFromNetwork = await fetch(request);
		putInCache(request, responseFromNetwork.clone());
		return responseFromNetwork;
	} catch (e) {
		return new Response('Network error happened', {
			status: 408,
			headers: { 'Content-Type': 'text/plain' },
		});
	}
}

async function cacheFallback(request) {
	try {
		const responseFromNetwork = await fetch(request);
		putInCache(request, responseFromNetwork.clone());
		return responseFromNetwork;
	} catch (e) {
		const responseFromCache = await caches.match(request);
		if (responseFromCache) {
			return responseFromCache;
		}

		return new Response('Network error happened', {
			status: 408,
			headers: { 'Content-Type': 'text/plain' },
		});
	}
}

self.addEventListener('fetch', (event) => {
	const req = event.request;
	if (req.method == 'GET') {
		if (req.url.endsWith('.js') || req.url.endsWith('.css')) {
			event.respondWith(cacheFirst(req));
		} else {
			event.respondWith(cacheFallback(req));
		}
	}
});
