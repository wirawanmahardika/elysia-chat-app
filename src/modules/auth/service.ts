import { randomBytes } from 'crypto';
import { eq } from 'drizzle-orm';
import { db, users, sessions } from '../../shared/db';
import type { RegisterBody, LoginBody, User, Session } from './model';

export class AuthService {
    async register(dto: RegisterBody): Promise<User> {
        const existingUsers = await db.select().from(users).where(eq(users.username, dto.username));
        if (existingUsers.length > 0) {
            throw new Error('Username already exists');
        }

        const passwordHash = await Bun.password.hash(dto.password);
        const user: User = {
            id: crypto.randomUUID(),
            username: dto.username,
            passwordHash,
            createdAt: new Date(),
        };

        await db.insert(users).values(user);
        return user;
    }

    async login(dto: LoginBody): Promise<Session> {
        const foundUsers = await db.select().from(users).where(eq(users.username, dto.username));
        const user = foundUsers[0];
        if (!user) {
            throw new Error('Invalid username or password');
        }

        const isValid = await Bun.password.verify(dto.password, user.passwordHash);
        if (!isValid) {
            throw new Error('Invalid username or password');
        }

        const sessionId = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const session: Session = {
            id: sessionId,
            userId: user.id,
            expiresAt,
        };

        await db.insert(sessions).values(session);
        return session;
    }

    async validateSession(sessionId: string): Promise<User | null> {
        const foundSessions = await db.select().from(sessions).where(eq(sessions.id, sessionId));
        const session = foundSessions[0];
        if (!session) {
            return null;
        }

        if (session.expiresAt.getTime() < Date.now()) {
            await db.delete(sessions).where(eq(sessions.id, sessionId));
            return null;
        }

        const foundUsers = await db.select().from(users).where(eq(users.id, session.userId));
        return foundUsers[0] || null;
    }

    async logout(sessionId: string): Promise<void> {
        await db.delete(sessions).where(eq(sessions.id, sessionId));
    }

    async getUserById(id: string): Promise<User | null> {
        const foundUsers = await db.select().from(users).where(eq(users.id, id));
        return foundUsers[0] || null;
    }
}

export const authService = new AuthService();
