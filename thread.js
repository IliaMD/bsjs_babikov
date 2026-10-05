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

self.onmessage = (evt) => {
  const timeout = typeof evt.data === 'number' ? evt.data : 3000;
  const result = slowFunction(timeout);
  self.postMessage(result);
};
