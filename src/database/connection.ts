import type { Connection, PoolConnection, TypeCast } from 'mysql2/promise';
import { scheduleTick } from '../utils/scheduleTick';
import { sleep } from '../utils/sleep';
import { pool } from './pool';
import type { CFXParameters } from 'types';
import { typeCastExecute } from 'utils/typeCast';

(Symbol as any).dispose ??= Symbol('Symbol.dispose');

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

  [Symbol.dispose]() {
    if (this.transaction) this.commit();

    delete activeConnections[this.id];
    this.connection.release();
  }
}

export async function getConnection(connectionId?: number) {
  while (!pool) await sleep(0);

  return connectionId
    ? activeConnections[connectionId]
    : new MySql((await pool.getConnection()) as unknown as PromisePoolConnection);
}
