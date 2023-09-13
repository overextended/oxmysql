import { setDebug } from '../config';
import { getPoolConnection } from './connection';

setTimeout(() => {
  setDebug();
  getPoolConnection();
});

setInterval(() => {
  setDebug();
}, 1000);

export * from './connection';
export * from './rawQuery';
export * from './rawExecute';
export * from './rawTransaction';
