import { t, Static } from 'elysia';

export const registerBodySchema = t.Object({
    username: t.String({
        minLength: 3,
        maxLength: 30,
        pattern: '^[a-zA-Z0-9_]+$',
        error: 'Username can only contain alphanumeric characters and underscores.',
    }),
    password: t.String({
        minLength: 8,
        maxLength: 100,
    }),
});

export type RegisterBody = Static<typeof registerBodySchema>;

export const loginBodySchema = t.Object({
    username: t.String(),
    password: t.String(),
});

export type LoginBody = Static<typeof loginBodySchema>;

export const userSchema = t.Object({
    id: t.String(),
    username: t.String(),
    passwordHash: t.String(),
    createdAt: t.Date(),
});

export type User = Static<typeof userSchema>;

export const sessionSchema = t.Object({
    id: t.String(),
    userId: t.String(),
    expiresAt: t.Date(),
});

export type Session = Static<typeof sessionSchema>;
