import { t, Static } from 'elysia';

export const roomSchema = t.Object({
    id: t.String(),
    name: t.Nullable(t.String()),
    type: t.Union([t.Literal('direct'), t.Literal('group')]),
    createdAt: t.Date(),
});

export type Room = Static<typeof roomSchema>;

export const roomWithDetailsSchema = t.Object({
    id: t.String(),
    name: t.Nullable(t.String()),
    type: t.Union([t.Literal('direct'), t.Literal('group')]),
    opponentId: t.Nullable(t.String()),
    opponentName: t.Nullable(t.String()),
    lastMessage: t.Nullable(
        t.Object({
            content: t.String(),
            createdAt: t.Date(),
        })
    ),
});

export type RoomWithDetails = Static<typeof roomWithDetailsSchema>;

export const messageSchema = t.Object({
    id: t.Number(),
    roomId: t.String(),
    userId: t.String(),
    content: t.String(),
    createdAt: t.Date(),
});

export type Message = Static<typeof messageSchema>;

export const messageWithUserSchema = t.Object({
    id: t.Number(),
    roomId: t.String(),
    userId: t.String(),
    content: t.String(),
    createdAt: t.Date(),
    username: t.String(),
});

export type MessageWithUser = Static<typeof messageWithUserSchema>;

export const sendMessageSchema = t.Object({
    roomId: t.String(),
    content: t.String({
        minLength: 1,
        maxLength: 1000,
    }),
});

export type SendMessage = Static<typeof sendMessageSchema>;
