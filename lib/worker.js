const crypto = require("crypto");
const nano = require("nanocurrency");
const { parentPort, workerData } = require("worker_threads");

async function run() {
  await nano.init();

  const searchParam = workerData.searchParam;
  const stopOnFound = workerData.stopOnFound;

  if (!searchParam) {
    return;
  }

  const searchParamEndIndex = 5 + searchParam.length;

  let running = true;
  const buf = Buffer.alloc(32);
  while (running) {
    let count = 0;
    while (count < 10000 && running) {
      const seed = crypto.randomFillSync(buf).toString("hex");
      const secretKey = nano.deriveSecretKey(seed, 0);
      const publicKey = nano.derivePublicKey(secretKey);
      const address = nano.deriveAddress(publicKey);

      if (address.slice(5, searchParamEndIndex) === searchParam) {
        if (stopOnFound) {
          parentPort.postMessage({ stop: true });
          return { seed: seed, address: address };
        }

        parentPort.postMessage({ seed: seed, address: address });
      }

      count = count + 1;
    }

    parentPort.postMessage({ count: 10000 });
  }

  return { found: false };
}

run().then((response) => {
  parentPort.postMessage(response);
});
