import { describe, test, expect, spyOn, afterEach } from 'bun:test';
import validateResultSet from 'utils/validateResultSet';

describe('validateResultSet', () => {
  afterEach(() => spyOn(console, 'warn').mockRestore());

  test('warns when the row count reaches the configured threshold', () => {
    const warn = spyOn(console, 'warn').mockImplementation(() => {});
    const rows = new Array(1000).fill({});
    validateResultSet('res', 'SELECT *', rows as any);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('oversized result set (1000 results)');
  });

  test('stays silent below the threshold', () => {
    const warn = spyOn(console, 'warn').mockImplementation(() => {});
    validateResultSet('res', 'SELECT *', new Array(999).fill({}) as any);
    expect(warn).not.toHaveBeenCalled();
  });

  test('treats a non-array result (header) as length 0 and stays silent', () => {
    const warn = spyOn(console, 'warn').mockImplementation(() => {});
    validateResultSet('res', 'INSERT ...', { affectedRows: 1 } as any);
    expect(warn).not.toHaveBeenCalled();
  });
});
