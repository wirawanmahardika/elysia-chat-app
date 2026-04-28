import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from './schema';

export const sqlite = new Database('storage/chat.sqlite');
// Enable WAL mode for better concurrency and performance
sqlite.exec('PRAGMA journal_mode = WAL;');
// Enable foreign keys
sqlite.exec('PRAGMA foreign_keys = ON;');

export const db = drizzle(sqlite, { schema });
