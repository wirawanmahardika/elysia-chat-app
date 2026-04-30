import { eq } from 'drizzle-orm';
import { db } from '../database/connection';
import { sessions } from '../database/schema';
import type { SessionRepository } from '../../domain/repositories';
import type { Session } from '../../domain/entities';
import type { SessionId, UserId } from '../../domain/types';

export class SqliteSessionRepository implements SessionRepository {
    async create(session: Session): Promise<void> {
        await db.insert(sessions).values({
            id: session.id,
            userId: session.userId,
            expiresAt: session.expiresAt,
        });
    }

    async findById(id: SessionId): Promise<Session | null> {
        try {
            const result = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
            if (result.length === 0) return null;
            return {
                id: result[0].id as SessionId,
                userId: result[0].userId as UserId,
                expiresAt: result[0].expiresAt,
            };
        } catch (error: any) {
            return null;
        }
    }

    async delete(id: SessionId): Promise<void> {
        await db.delete(sessions).where(eq(sessions.id, id));
    }

    async deleteByUserId(userId: UserId): Promise<void> {
        await db.delete(sessions).where(eq(sessions.userId, userId));
    }
}
