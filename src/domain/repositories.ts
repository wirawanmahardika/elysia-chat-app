import type { User, Session, Message, MessageWithUser } from './entities';
import type { UserId, SessionId, MessageId } from './types';

export interface UserRepository {
    create(user: User): Promise<void>;
    findById(id: UserId): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
}

export interface SessionRepository {
    create(session: Session): Promise<void>;
    findById(id: SessionId): Promise<Session | null>;
    delete(id: SessionId): Promise<void>;
    deleteByUserId(userId: UserId): Promise<void>;
}

export interface MessageRepository {
    create(message: Omit<Message, 'id'>): Promise<Message>;
    /**
     * Get chat history with cursor-based pagination.
     * @param limit Max number of messages to fetch
     * @param cursorId The ID of the oldest message currently loaded
     */
    getHistory(limit: number, cursorId?: MessageId): Promise<MessageWithUser[]>;
}
