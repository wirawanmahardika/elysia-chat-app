import { randomBytes } from 'crypto';
import { eq } from 'drizzle-orm';
import { db, usersTable, sessionsTable } from '../../shared/db';
import type { RegisterBody, LoginBody, User, Session } from './model';
import { idGenerator6Digit } from '../../shared/idGenerator';

export class AuthService {
    async register(dto: RegisterBody): Promise<User> {
        const existingUsers = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.username, dto.username));
        if (existingUsers.length > 0) {
            throw new Error('Username already exists');
        }

        const countUser = await db.$count(usersTable);
        const passwordHash = await Bun.password.hash(dto.password);
        const user: User = {
            id: idGenerator6Digit.generateId(countUser),
            username: dto.username,
            passwordHash,
            createdAt: new Date(),
        };

        await db.insert(usersTable).values(user);
        return user;
    }

    async login(dto: LoginBody): Promise<Session> {
        const foundUsers = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.username, dto.username));
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

        await db.insert(sessionsTable).values(session);
        return session;
    }

    async validateSession(sessionId: string): Promise<User | null> {
        const foundSessions = await db
            .select()
            .from(sessionsTable)
            .where(eq(sessionsTable.id, sessionId));
        const session = foundSessions[0];
        if (!session) {
            return null;
        }

        if (session.expiresAt.getTime() < Date.now()) {
            await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
            return null;
        }

        const foundUsers = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, session.userId));
        return foundUsers[0] || null;
    }

    async logout(sessionId: string): Promise<void> {
        await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
    }

    async getUserById(id: string): Promise<User | null> {
        const foundUsers = await db.select().from(usersTable).where(eq(usersTable.id, id));
        return foundUsers[0] || null;
    }
}

export const authService = new AuthService();
