import { randomBytes } from 'crypto';
import type { UserRepository, SessionRepository } from '../../domain/repositories';
import type { RegisterDTO, LoginDTO, User, Session } from '../../domain/entities';
import type { UserId, SessionId } from '../../domain/types';

export class AuthService {
    constructor(
        private userRepository: UserRepository,
        private sessionRepository: SessionRepository
    ) {}

    async register(dto: RegisterDTO): Promise<User> {
        const existingUser = await this.userRepository.findByUsername(dto.username);
        if (existingUser) {
            throw new Error('Username already exists');
        }

        const passwordHash = await Bun.password.hash(dto.password);
        const user: User = {
            id: crypto.randomUUID() as UserId,
            username: dto.username,
            passwordHash,
            createdAt: new Date(),
        };

        await this.userRepository.create(user);
        return user;
    }

    async login(dto: LoginDTO): Promise<Session> {
        const user = await this.userRepository.findByUsername(dto.username);
        if (!user) {
            throw new Error('Invalid username or password');
        }

        const isValid = await Bun.password.verify(dto.password, user.passwordHash);
        if (!isValid) {
            throw new Error('Invalid username or password');
        }

        const sessionId = randomBytes(32).toString('hex') as SessionId;
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        
        const session: Session = {
            id: sessionId,
            userId: user.id,
            expiresAt,
        };

        await this.sessionRepository.create(session);
        return session;
    }

    async validateSession(sessionId: SessionId): Promise<User | null> {
        const session = await this.sessionRepository.findById(sessionId);
        if (!session) {
            return null;
        }

        if (session.expiresAt.getTime() < Date.now()) {
            await this.sessionRepository.delete(sessionId);
            return null;
        }

        return await this.userRepository.findById(session.userId);
    }

    async logout(sessionId: SessionId): Promise<void> {
        await this.sessionRepository.delete(sessionId);
    }
}
