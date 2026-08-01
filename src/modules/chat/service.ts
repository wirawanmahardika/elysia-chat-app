import { desc, lt, eq } from 'drizzle-orm';
import { db, messages, users } from '../../shared/db';
import type { Message, MessageWithUser } from './model';

export class ChatService {
    async createMessage(data: { userId: string; content: string }): Promise<Message> {
        const result = await db.insert(messages).values({
            userId: data.userId,
            content: data.content,
        }).returning({
            id: messages.id,
            userId: messages.userId,
            content: messages.content,
            createdAt: messages.createdAt,
        });

        return result[0];
    }

    async getHistory(limit: number, cursorId?: number): Promise<MessageWithUser[]> {
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
            query = query.where(lt(messages.id, cursorId)) as any;
        }

        const results = await query.limit(limit);

        return results.map(r => ({
            id: r.id,
            userId: r.userId,
            content: r.content,
            createdAt: r.createdAt,
            username: r.username,
        }));
    }
}

export const chatService = new ChatService();
