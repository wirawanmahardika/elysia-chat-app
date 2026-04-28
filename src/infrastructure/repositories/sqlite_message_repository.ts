import { desc, lt, eq } from 'drizzle-orm';
import { db } from '../database/connection';
import { messages, users } from '../database/schema';
import type { MessageRepository } from '../../domain/repositories';
import type { Message, MessageWithUser } from '../../domain/entities';
import type { MessageId, UserId } from '../../domain/types';

export class SqliteMessageRepository implements MessageRepository {
    async create(message: Omit<Message, 'id'>): Promise<Message> {
        const result = await db.insert(messages).values({
            userId: message.userId,
            content: message.content,
            createdAt: message.createdAt,
        }).returning({ id: messages.id });
        
        return {
            id: result[0].id as MessageId,
            userId: message.userId,
            content: message.content,
            createdAt: message.createdAt,
        };
    }

    async getHistory(limit: number, cursorId?: MessageId): Promise<MessageWithUser[]> {
        let query = db.select({
            id: messages.id,
            userId: messages.userId,
            content: messages.content,
            createdAt: messages.createdAt,
            username: users.username,
        })
        .from(messages)
        .innerJoin(users, eq(messages.userId, users.id))
        .orderBy(desc(messages.id));

        if (cursorId !== undefined) {
            query = query.where(lt(messages.id, cursorId as number)) as any;
        }

        const results = await query.limit(limit);

        return results.map(r => ({
            id: r.id as MessageId,
            userId: r.userId as UserId,
            content: r.content,
            createdAt: r.createdAt,
            username: r.username,
        }));
    }
}
