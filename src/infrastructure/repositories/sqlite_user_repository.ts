import { eq } from 'drizzle-orm';
import { db } from '../database/connection';
import { users } from '../database/schema';
import type { UserRepository } from '../../domain/repositories';
import type { User } from '../../domain/entities';
import type { UserId } from '../../domain/types';

export class SqliteUserRepository implements UserRepository {
    async create(user: User): Promise<void> {
        await db.insert(users).values({
            id: user.id,
            username: user.username,
            passwordHash: user.passwordHash,
            createdAt: user.createdAt,
        });
    }

    async findById(id: UserId): Promise<User | null> {
        const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
        if (result.length === 0) return null;
        return {
            id: result[0].id as UserId,
            username: result[0].username,
            passwordHash: result[0].passwordHash,
            createdAt: result[0].createdAt,
        };
    }

    async findByUsername(username: string): Promise<User | null> {
        const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
        if (result.length === 0) return null;
        return {
            id: result[0].id as UserId,
            username: result[0].username,
            passwordHash: result[0].passwordHash,
            createdAt: result[0].createdAt,
        };
    }
}
