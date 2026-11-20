import { createHash } from 'node:crypto';
import { ConflictException } from '@nestjs/common';
import type { PoolClient } from 'pg';

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, canonical(item)]),
    );
  return value;
}
/** Must run on the same transaction/connection as the domain writes. */
export async function adminMutation<T>(
  client: PoolClient,
  actorId: string,
  operationId: string,
  action: string,
  input: object,
  work: () => Promise<T>,
  onReplay?: () => void,
): Promise<T> {
  const hash = createHash('sha256')
    .update(JSON.stringify(canonical(input)))
    .digest('hex');
  await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [
    `${actorId}:${operationId}`,
  ]);
  const { rows } = await client.query<{
    action: string;
    request_hash: string;
    response: T;
  }>(
    'SELECT action,request_hash,response FROM admin_mutations WHERE actor_id=$1 AND operation_id=$2',
    [actorId, operationId],
  );
  if (rows[0]) {
    if (rows[0].action !== action || rows[0].request_hash !== hash)
      throw new ConflictException(
        'Confirmation already used for a different action',
      );
    onReplay?.();
    return rows[0].response;
  }
  const result = await work();
  await client.query(
    'INSERT INTO admin_mutations(actor_id,operation_id,action,request_hash,response) VALUES($1,$2,$3,$4,$5::jsonb)',
    [actorId, operationId, action, hash, JSON.stringify(result ?? null)],
  );
  return result;
}
