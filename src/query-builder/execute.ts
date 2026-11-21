import { rawQuery } from '../database/rawQuery';
import { logError } from '../logger';
import { setCallback } from '../utils/setCallback';
import type { CFXCallback } from '../types';
import { compileQuery } from './compiler';
import type { BuilderResultMode, CompiledQuery, QuerySpec } from './types';

export async function executeBuilderQuery(
  spec: QuerySpec,
  mode: BuilderResultMode,
  invokingResource: string,
  cb?: CFXCallback,
  isPromise?: boolean,
) {
  cb = setCallback([], cb);
  let compiled: CompiledQuery;

  try {
    compiled = compileQuery(spec);
    if (spec.kind === 'select' ? mode !== 'query' && mode !== 'single' : mode !== spec.kind)
      throw new Error('queryBuilder: result mode must match the statement (select: query or single; insert: insert; update: update).');
  } catch (err) {
    return logError(invokingResource, cb, isPromise, err);
  }

  return rawQuery(mode === 'query' ? null : mode, invokingResource, compiled.sql, compiled.parameters, cb, isPromise);
}
