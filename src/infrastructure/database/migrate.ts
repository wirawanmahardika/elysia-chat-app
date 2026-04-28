import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { db, sqlite } from './connection';

console.log('Running migrations...');
migrate(db, { migrationsFolder: './drizzle' });
console.log('Migrations complete!');
sqlite.close();
