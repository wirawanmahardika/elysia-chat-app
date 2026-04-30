import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import { createClient } from '@libsql/client';
import { env } from '../../config/env';

export const sqlite = createClient({ url: env.DB_URL });
// // Enable WAL mode for better concurrency and performance
// sqlite.exec('PRAGMA journal_mode = WAL;');
// // Enable foreign keys
// sqlite.exec('PRAGMA foreign_keys = ON;');

// export const db = drizzle({ client: sqlite });
export const db = drizzle(sqlite, { schema });
