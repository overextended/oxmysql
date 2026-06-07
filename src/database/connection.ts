import type { Connection, PoolConnection } from 'mysql2/promise';
import { scheduleTick } from '../utils/scheduleTick';
import { sleep } from '../utils/sleep';
import { pool } from './pool';
import type { CFXParameters } from 'types';
import { typeCastExecute } from 'utils/typeCast';

(Symbol as any).dispose ??= Symbol('Symbol.dispose');
(Symbol as any).asyncDispose ??= Symbol('Symbol.asyncDispose');

const activeConnections: Record<string, MySql> = {};

interface PromisePoolConnection extends Connection {
  connection: PoolConnection;
  release: PoolConnection['release'];
}

export class MySql {
  id: number;
  connection: PromisePoolConnection;
  transaction?: boolean;

  constructor(connection: PromisePoolConnection) {
    this.id = connection.connection.threadId;
    this.connection = connection;
    activeConnections[this.id] = this;
  }

  async query(query: string, values: CFXParameters = []) {
    scheduleTick();

    const [result] = await this.connection.query(query, values);
    return result;
  }

  async execute(query: string, values: CFXParameters = []) {
    scheduleTick();

    const [result] = await this.connection.execute({
      sql: query,
      values: values,
      typeCast: typeCastExecute,
    });
    return result;
  }

  beginTransaction() {
    this.transaction = true;
    return this.connection.beginTransaction();
  }

  rollback() {
    delete this.transaction;
    return this.connection.rollback();
  }

  commit() {
    delete this.transaction;
    return this.connection.commit();
  }

  async [Symbol.asyncDispose]() {
    // never silently commit a transaction the caller left open; roll it back
    if (this.transaction) await this.rollback().catch(() => {});

    delete activeConnections[this.id];
    this.connection.release();
  }
}

export async function getConnection(connectionId?: number) {
  while (!pool) await sleep(0);

  if (connectionId) {
    const existing = activeConnections[connectionId];
    if (!existing) return;

    // Borrowed connection: its owner is responsible for commit/rollback and
    // release, so the borrow site must not dispose it. Hand back a non-owning
    // view whose disposer is a no-op.
    return Object.assign(Object.create(existing) as MySql, {
      async [Symbol.asyncDispose]() {},
    });
  }

  return new MySql((await pool.getConnection()) as unknown as PromisePoolConnection);
}
