import type { MessageRepository } from '../../domain/repositories';
import type { MessageWithUser } from '../../domain/entities';
import type { MessageId } from '../../domain/types';

export class ChatService {
    constructor(private messageRepository: MessageRepository) {}

    async getHistory(limit: number, cursorId?: MessageId): Promise<MessageWithUser[]> {
        return await this.messageRepository.getHistory(limit, cursorId);
    }
}
