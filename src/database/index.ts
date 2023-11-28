import { setDebug } from '../config';
import { sleep } from '../utils/sleep';
import { createConnectionPool, isServerConnected } from './connection';

setTimeout(async () => {
  setDebug();

  while (!isServerConnected) {
    await createConnectionPool();

    if (!isServerConnected) await sleep(30000);
  }
});

setInterval(() => {
  setDebug();
}, 1000);

export * from './connection';
export * from './rawQuery';
export * from './rawExecute';
export * from './rawTransaction';
