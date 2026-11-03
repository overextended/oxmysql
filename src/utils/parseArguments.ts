import type { CFXParameters } from '../types';
import { countPlaceholders } from '../database/driver';

const isIdentifierStart = (char?: string) => !!char && /[A-Za-z_]/.test(char);
const isIdentifierPart = (char?: string) => !!char && /[A-Za-z0-9_]/.test(char);
const hasOwn = (value: object, key: string) => Object.prototype.hasOwnProperty.call(value, key);

/**
 * Normalize MySQL-style @name and :name parameters to positional ? bindings.
 * Handles Lua table keys with or without their marker, positional arrays, and
 * quoted/commented SQL so markers in literals are never treated as bindings.
 */
export const convertNamedArguments = (query: string, parameters: Record<string, unknown> | unknown[]) => {
  const values: unknown[] = [];
  const positional = Array.isArray(parameters) ? parameters : null;
  const bag = parameters as Record<string, unknown>;
  let positionalIndex = 0;
  let output = '';
  let index = 0;
  let quote: string | null = null;
  let lineComment = false;
  let blockComment = false;
  let dollarTag: string | null = null;

  const positionalValue = () => {
    let value: unknown;
    if (positional) {
      value = positional[positionalIndex];
    } else {
      const key = String(positionalIndex + 1);
      if (hasOwn(bag, key)) value = bag[key];
    }
    positionalIndex++;
    return value ?? null;
  };

  const namedValue = (prefix: string, name: string) => {
    const candidates = [prefix + name, name];
    for (const key of candidates) {
      if (hasOwn(bag, key)) return bag[key];
    }

    // An array can carry custom Lua-table string keys in addition to numeric
    // entries. Prefer those names; fall back to positional values if absent.
    if (positional && positionalIndex < positional.length) return positionalValue();
    return null;
  };

  while (index < query.length) {
    const char = query[index];
    const next = query[index + 1];

    if (dollarTag) {
      if (query.startsWith(dollarTag, index)) {
        output += dollarTag;
        index += dollarTag.length;
        dollarTag = null;
      } else {
        output += char;
        index++;
      }
      continue;
    }

    if (lineComment) {
      output += char;
      index++;
      if (char === '\n') lineComment = false;
      continue;
    }

    if (blockComment) {
      output += char;
      index++;
      if (char === '*' && next === '/') {
        output += '/';
        index++;
        blockComment = false;
      }
      continue;
    }

    if (quote) {
      output += char;
      index++;
      if (char === '\\\\' && next && (quote === "'" || quote === '"')) {
        output += next;
        index++;
      } else if (char === quote) {
        if (next === quote) {
          output += next;
          index++;
        } else quote = null;
      }
      continue;
    }

    if (char === '-' && next === '-') {
      output += '--';
      index += 2;
      lineComment = true;
      continue;
    }

    if (char === '/' && next === '*') {
      output += '/*';
      index += 2;
      blockComment = true;
      continue;
    }

    if (char === '$') {
      const match = query.slice(index).match(/^\$[A-Za-z_][A-Za-z_0-9]*\$|^\$\$/);
      if (match) {
        dollarTag = match[0];
        output += dollarTag;
        index += dollarTag.length;
        continue;
      }
    }

    if (char === "'" || char === '"' || char === String.fromCharCode(96)) {
      quote = char;
      output += char;
      index++;
      continue;
    }

    if ((char === '@' && next !== '@' && next !== '>') ||
        (char === ':' && next !== ':' && query[index - 1] !== ':')) {
      if (isIdentifierStart(next)) {
        let end = index + 2;
        while (isIdentifierPart(query[end])) end++;
        const name = query.slice(index + 1, end);
        values.push(namedValue(char, name));
        output += '?';
        index = end;
        continue;
      }
    }

    if (char === '?') {
      values.push(positionalValue());
      output += '?';
      index++;
      continue;
    }

    output += char;
    index++;
  }

  return [output, values] as [string, unknown[]];
};

export const parseArguments = (query: string, parameters?: CFXParameters): [string, CFXParameters] => {
  if (typeof query !== 'string') throw new Error(`Expected query to be a string but received ${typeof query} instead.`);

  if (!parameters || typeof parameters === 'function') parameters = [];

  if (query.includes('@') || query.includes(':')) {
    [query, parameters] = convertNamedArguments(query, parameters as Record<string, unknown> | unknown[]);
  }

  const placeholders = countPlaceholders(query);

  if (parameters && !Array.isArray(parameters)) {
    const arr: unknown[] = [];
    for (let i = 0; i < placeholders; i++) arr[i] = parameters[i + 1] ?? null;
    parameters = arr;
  } else if (placeholders) {
    const diff = placeholders - parameters.length;
    if (diff > 0) parameters = [...parameters, ...new Array(diff).fill(null)];
    else if (diff < 0) throw new Error(`Expected ${placeholders} parameters, but received ${parameters.length}.`);
  }

  return [query, parameters];
};
