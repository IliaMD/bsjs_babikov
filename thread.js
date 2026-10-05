let worker2 = null;

self.addEventListener('message', (evt) => {
  if (!worker2) {
    worker2 = new Worker('./thread2.js');

    worker2.addEventListener('message', (messageEvent) => {
      self.postMessage(messageEvent.data);
    });

    worker2.addEventListener('error', (errorEvent) => {
      self.postMessage({ error: errorEvent.message });
    });
  }

  worker2.postMessage(evt.data);
});
