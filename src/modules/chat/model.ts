import { t, Static } from 'elysia';

export const messageSchema = t.Object({
    id: t.Number(),
    userId: t.String(),
    content: t.String(),
    createdAt: t.Date(),
});

export type Message = Static<typeof messageSchema>;

export const messageWithUserSchema = t.Object({
    id: t.Number(),
    userId: t.String(),
    content: t.String(),
    createdAt: t.Date(),
    username: t.String(),
});

export type MessageWithUser = Static<typeof messageWithUserSchema>;

export const sendMessageSchema = t.Object({
    content: t.String({
        minLength: 1,
        maxLength: 1000,
    }),
});

export type SendMessage = Static<typeof sendMessageSchema>;
