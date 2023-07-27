import type { CFXCallback, CFXParameters } from '../types';

export const setCallback = (parameters?: CFXParameters | CFXCallback, cb?: CFXCallback) => {
  if (cb && typeof cb === 'function') return cb;
  if (parameters && typeof parameters === 'function') return parameters;
};
