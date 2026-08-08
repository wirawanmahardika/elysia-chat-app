import { desc, lt, eq, and, ne } from 'drizzle-orm';
import { db, messages, users, rooms, roomMembers } from '../../shared/db';
import type { Message, MessageWithUser, RoomWithDetails } from './model';

export class ChatService {
    async getOrCreateDirectRoom(userAId: string, userBId: string): Promise<string> {
        // Find existing direct rooms where userA is a member
        const userARooms = await db
            .select({ roomId: roomMembers.roomId })
            .from(roomMembers)
            .innerJoin(rooms, eq(roomMembers.roomId, rooms.id))
            .where(and(eq(roomMembers.userId, userAId), eq(rooms.type, 'direct')));

        for (const r of userARooms) {
            const hasUserB = await db
                .select()
                .from(roomMembers)
                .where(and(eq(roomMembers.roomId, r.roomId), eq(roomMembers.userId, userBId)));
            if (hasUserB.length > 0) {
                return r.roomId;
            }
        }

        // Create new direct room if none exists
        const newRoomId = crypto.randomUUID();
        await db.insert(rooms).values({
            id: newRoomId,
            type: 'direct',
        });

        await db.insert(roomMembers).values([
            { roomId: newRoomId, userId: userAId },
            { roomId: newRoomId, userId: userBId },
        ]);

        return newRoomId;
    }

    async getUserRooms(userId: string): Promise<RoomWithDetails[]> {
        const userRooms = await db
            .select({
                id: rooms.id,
                name: rooms.name,
                type: rooms.type,
                createdAt: rooms.createdAt,
            })
            .from(roomMembers)
            .innerJoin(rooms, eq(roomMembers.roomId, rooms.id))
            .where(eq(roomMembers.userId, userId));

        const result: RoomWithDetails[] = [];

        for (const room of userRooms) {
            let opponentId: string | null = null;
            let opponentName: string | null = null;

            if (room.type === 'direct') {
                const opponents = await db
                    .select({
                        id: users.id,
                        username: users.username,
                    })
                    .from(roomMembers)
                    .innerJoin(users, eq(roomMembers.userId, users.id))
                    .where(and(eq(roomMembers.roomId, room.id), ne(roomMembers.userId, userId)));

                if (opponents.length > 0) {
                    opponentId = opponents[0].id;
                    opponentName = opponents[0].username;
                }
            }

            const latestMessage = await db
                .select({
                    userId: messages.userId,
                    content: messages.content,
                    createdAt: messages.createdAt,
                })
                .from(messages)
                .where(eq(messages.roomId, room.id))
                .orderBy(desc(messages.id))
                .limit(1);

            result.push({
                id: room.id,
                name: room.name,
                type: room.type,
                opponentId,
                opponentName,
                lastMessage: latestMessage[0]
                    ? {
                          sender: latestMessage[0].userId,
                          content: latestMessage[0].content,
                          createdAt: latestMessage[0].createdAt,
                      }
                    : null,
            });
        }

        // Sort by last message date if available, otherwise by room creation date
        result.sort((a, b) => {
            const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
            const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
            return timeB - timeA;
        });

        return result;
    }

    async getRoomHistory(
        roomId: string,
        limit: number = 50,
        cursorId?: number
    ): Promise<MessageWithUser[]> {
        let query = db
            .select({
                id: messages.id,
                roomId: messages.roomId,
                userId: messages.userId,
                content: messages.content,
                createdAt: messages.createdAt,
                username: users.username,
            })
            .from(messages)
            .innerJoin(users, eq(messages.userId, users.id))
            .orderBy(desc(messages.id));

        if (cursorId !== undefined) {
            query = query.where(and(eq(messages.roomId, roomId), lt(messages.id, cursorId))) as any;
        } else {
            query = query.where(eq(messages.roomId, roomId)) as any;
        }

        const results = await query.limit(limit);

        return results.map((r) => ({
            id: r.id,
            roomId: r.roomId,
            userId: r.userId,
            content: r.content,
            createdAt: r.createdAt,
            username: r.username,
        }));
    }

    async createMessage(data: {
        roomId: string;
        userId: string;
        content: string;
    }): Promise<Message> {
        const result = await db
            .insert(messages)
            .values({
                roomId: data.roomId,
                userId: data.userId,
                content: data.content,
            })
            .returning({
                id: messages.id,
                roomId: messages.roomId,
                userId: messages.userId,
                content: messages.content,
                createdAt: messages.createdAt,
            });

        return result[0];
    }

    async isUserInRoom(userId: string, roomId: string): Promise<boolean> {
        const members = await db
            .select()
            .from(roomMembers)
            .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, userId)));
        return members.length > 0;
    }

    async getAllOtherUsers(currentUserId: string): Promise<{ id: string; username: string }[]> {
        return await db
            .select({
                id: users.id,
                username: users.username,
            })
            .from(users)
            .where(ne(users.id, currentUserId))
            .orderBy(users.username);
    }

    async getRoomAndOpponent(roomId: string, userId: string) {
        const [result] = await db
            .select({
                id: rooms.id,
                name: rooms.name,
                opponentName: users.username,
            })
            .from(rooms)
            .innerJoin(roomMembers, eq(roomMembers.roomId, rooms.id))
            .innerJoin(users, eq(users.id, roomMembers.userId))
            .where(and(eq(rooms.id, roomId), ne(users.id, userId)))
            .limit(1);

        if (!result) {
            return null; // Atau lempar error sesuai skenario penanganan aplikasi
        }

        return result;
    }

    async getPreviousMessages(roomId: string, beforeDate: Date, limit: number = 20) {
        return await db
            .select({
                senderId: messages.userId,
                sender: users.username,
                content: messages.content,
                createdAt: messages.createdAt,
            })
            .from(messages)
            .innerJoin(users, eq(users.id, messages.userId))
            .where(and(eq(messages.roomId, roomId), lt(messages.createdAt, beforeDate)))
            .orderBy(desc(messages.createdAt))
            .limit(limit);
    }
}

export const chatService = new ChatService();
