import { setDebug } from '../config';
import { sleep } from '../utils/sleep';
import { pool, createConnectionPool } from './pool';

setTimeout(async () => {
  setDebug();

  while (!pool) {
    await createConnectionPool();

    if (!pool) await sleep(30000);
  }
});

setInterval(() => {
  setDebug();
}, 1000);

export * from './connection';
export * from './rawQuery';
export * from './rawExecute';
export * from './rawTransaction';
export * from './pool';
