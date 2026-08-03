import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { config } from '../config';

export const users = sqliteTable('users', {
    id: text('id').primaryKey(), // UUID string
    username: text('username').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
        .notNull()
        .default(sql`(strftime('%s', 'now'))`),
});

export const sessions = sqliteTable('sessions', {
    id: text('id').primaryKey(),
    userId: text('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});

export const rooms = sqliteTable('rooms', {
    id: text('id').primaryKey(),
    name: text('name'),
    type: text('type').$type<'direct' | 'group'>().notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
        .notNull()
        .default(sql`(strftime('%s', 'now'))`),
});

export const roomMembers = sqliteTable('room_members', {
    roomId: text('room_id')
        .notNull()
        .references(() => rooms.id, { onDelete: 'cascade' }),
    userId: text('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
}, (table) => [
    primaryKey({ columns: [table.roomId, table.userId] })
]);

export const messages = sqliteTable('messages', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    roomId: text('room_id')
        .notNull()
        .references(() => rooms.id, { onDelete: 'cascade' }),
    userId: text('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
        .notNull()
        .default(sql`(strftime('%s', 'now'))`),
});

export const schema = { users, sessions, rooms, roomMembers, messages };

export const sqlite = createClient({ url: config.DB_URL });
export const db = drizzle(sqlite, { schema });
