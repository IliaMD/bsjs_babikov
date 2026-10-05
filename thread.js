const cache = {
  result: null,
};

const slowFunction = (timeout = 3000) => {
  const start = performance.now();
  let x = 0;
  let i = 0;

  do {
    i += 1;
    x += (Math.random() - 0.5) * i;
  } while (performance.now() - start < timeout);

  return x;
};

const recalculate = (timeout) => {
  cache.result = slowFunction(timeout);
  return cache.result;
};

const getCachedResult = (timeout) => {
  if (cache.result !== null) {
    return cache.result;
  }

  return recalculate(timeout);
};

const broadcast = async (msg) => {
  const clients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  });

  for (const client of clients) {
    client.postMessage(msg);
  }
};

self.addEventListener('install', (evt) => {
  evt.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (evt) => {
  console.log('activate', evt);
  evt.waitUntil(self.clients.claim());
});

self.addEventListener('message', async (evt) => {
  console.log('message', evt);

  const { type, payload = {} } = evt.data || {};
  const timeout = payload.timeout || 3000;

  if (type === 'GET_CACHED_RESULT') {
    const fromCache = cache.result !== null;
    const result = getCachedResult(timeout);

    await broadcast({
      type: 'RESULT',
      payload: {
        result,
        fromCache,
        timeout,
      },
    });
    return;
  }

  if (type === 'RECALCULATE') {
    const result = recalculate(timeout);

    await broadcast({
      type: 'RESULT',
      payload: {
        result,
        fromCache: false,
        timeout,
      },
    });
  }
});
