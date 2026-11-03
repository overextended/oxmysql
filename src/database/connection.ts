import type { Connection, PoolConnection } from './driver';
import { scheduleTick } from '../utils/scheduleTick';
import { sleep } from '../utils/sleep';
import { pool } from './pool';

(Symbol as any).dispose ??= Symbol('Symbol.dispose');
(Symbol as any).asyncDispose ??= Symbol('Symbol.asyncDispose');

const activeConnections: Record<string, MySql> = {};

interface PromisePoolConnection extends Connection {
  connection: { threadId: number };
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

  async query(query: string, values: any[] = []) {
    scheduleTick();
    const [result] = await this.connection.query(query, values);
    return result;
  }

  async execute(query: string, values: any[] = []) {
    scheduleTick();
    const [result] = await this.connection.execute({ sql: query, values });
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

    return Object.assign(Object.create(existing) as MySql, {
      async [Symbol.asyncDispose]() {},
    });
  }

  return new MySql((await pool.getConnection()) as PromisePoolConnection);
}
