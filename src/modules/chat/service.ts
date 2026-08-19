import { desc, lt, eq, and, ne } from 'drizzle-orm';
import { db, messagesTable, usersTable, roomsTable, roomMembersTable } from '../../shared/db';
import type { Message, MessageWithUser, RoomWithDetails } from './model';

export class ChatService {
    async getOrCreateDirectRoom(userAId: string, userBId: string): Promise<string> {
        // Find existing direct rooms where userA is a member
        const userARooms = await db
            .select({ roomId: roomMembersTable.roomId })
            .from(roomMembersTable)
            .innerJoin(roomsTable, eq(roomMembersTable.roomId, roomsTable.id))
            .where(and(eq(roomMembersTable.userId, userAId), eq(roomsTable.type, 'direct')));

        for (const r of userARooms) {
            const hasUserB = await db
                .select()
                .from(roomMembersTable)
                .where(
                    and(eq(roomMembersTable.roomId, r.roomId), eq(roomMembersTable.userId, userBId))
                );
            if (hasUserB.length > 0) {
                return r.roomId;
            }
        }

        // Create new direct room if none exists
        const newRoomId = crypto.randomUUID();
        await db.insert(roomsTable).values({
            id: newRoomId,
            type: 'direct',
        });

        await db.insert(roomMembersTable).values([
            { roomId: newRoomId, userId: userAId },
            { roomId: newRoomId, userId: userBId },
        ]);

        return newRoomId;
    }

    async getUserRooms(userId: string): Promise<RoomWithDetails[]> {
        const userRooms = await db
            .select({
                id: roomsTable.id,
                name: roomsTable.name,
                type: roomsTable.type,
                createdAt: roomsTable.createdAt,
            })
            .from(roomMembersTable)
            .innerJoin(roomsTable, eq(roomMembersTable.roomId, roomsTable.id))
            .where(eq(roomMembersTable.userId, userId));

        const result: RoomWithDetails[] = [];

        for (const room of userRooms) {
            let opponentId: string | null = null;
            let opponentName: string | null = null;

            if (room.type === 'direct') {
                const opponents = await db
                    .select({
                        id: usersTable.id,
                        username: usersTable.username,
                    })
                    .from(roomMembersTable)
                    .innerJoin(usersTable, eq(roomMembersTable.userId, usersTable.id))
                    .where(
                        and(
                            eq(roomMembersTable.roomId, room.id),
                            ne(roomMembersTable.userId, userId)
                        )
                    );

                if (opponents.length > 0) {
                    opponentId = opponents[0].id;
                    opponentName = opponents[0].username;
                }
            }

            const latestMessage = await db
                .select({
                    userId: messagesTable.userId,
                    content: messagesTable.content,
                    createdAt: messagesTable.createdAt,
                })
                .from(messagesTable)
                .where(eq(messagesTable.roomId, room.id))
                .orderBy(desc(messagesTable.id))
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
                id: messagesTable.id,
                roomId: messagesTable.roomId,
                userId: messagesTable.userId,
                content: messagesTable.content,
                createdAt: messagesTable.createdAt,
                username: usersTable.username,
            })
            .from(messagesTable)
            .innerJoin(usersTable, eq(messagesTable.userId, usersTable.id))
            .orderBy(desc(messagesTable.id));

        if (cursorId !== undefined) {
            query = query.where(
                and(eq(messagesTable.roomId, roomId), lt(messagesTable.id, cursorId))
            ) as any;
        } else {
            query = query.where(eq(messagesTable.roomId, roomId)) as any;
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
            .insert(messagesTable)
            .values({
                roomId: data.roomId,
                userId: data.userId,
                content: data.content,
            })
            .returning({
                id: messagesTable.id,
                roomId: messagesTable.roomId,
                userId: messagesTable.userId,
                content: messagesTable.content,
                createdAt: messagesTable.createdAt,
            });

        return result[0];
    }

    async isUserInRoom(userId: string, roomId: string): Promise<boolean> {
        const members = await db
            .select()
            .from(roomMembersTable)
            .where(and(eq(roomMembersTable.roomId, roomId), eq(roomMembersTable.userId, userId)));
        return members.length > 0;
    }

    async getAllOtherUsers(currentUserId: string): Promise<{ id: string; username: string }[]> {
        return await db
            .select({
                id: usersTable.id,
                username: usersTable.username,
            })
            .from(usersTable)
            .where(ne(usersTable.id, currentUserId))
            .orderBy(usersTable.username);
    }

    async getRoomAndOpponent(roomId: string, userId: string) {
        const [result] = await db
            .select({
                id: roomsTable.id,
                name: roomsTable.name,
                opponentName: usersTable.username,
            })
            .from(roomsTable)
            .innerJoin(roomMembersTable, eq(roomMembersTable.roomId, roomsTable.id))
            .innerJoin(usersTable, eq(usersTable.id, roomMembersTable.userId))
            .where(and(eq(roomsTable.id, roomId), ne(usersTable.id, userId)))
            .limit(1);

        if (!result) {
            return null; // Atau lempar error sesuai skenario penanganan aplikasi
        }

        return result;
    }

    async getPreviousMessages(roomId: string, beforeDate: Date, limit: number) {
        return await db
            .select({
                senderId: messagesTable.userId,
                sender: usersTable.username,
                content: messagesTable.content,
                createdAt: messagesTable.createdAt,
            })
            .from(messagesTable)
            .innerJoin(usersTable, eq(usersTable.id, messagesTable.userId))
            .where(and(eq(messagesTable.roomId, roomId), lt(messagesTable.createdAt, beforeDate)))
            .orderBy(desc(messagesTable.createdAt))
            .limit(limit);
    }
}

export const chatService = new ChatService();
