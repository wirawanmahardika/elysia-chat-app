import type { MessageRepository } from '../../domain/repositories';
import type { MessageWithUser, SendMessageDTO } from '../../domain/entities';
import type { UserId, MessageId } from '../../domain/types';
import { PubSubService } from './pubsub_service';

export class ChatService {
    constructor(
        private messageRepository: MessageRepository,
        private pubSubService: PubSubService
    ) {}

    async sendMessage(
        userId: UserId,
        dto: SendMessageDTO,
        username: string
    ): Promise<MessageWithUser> {
        const messageInput = {
            userId,
            content: dto.content,
            createdAt: new Date(),
        };

        const message = await this.messageRepository.create(messageInput);

        const messageWithUser: MessageWithUser = {
            ...message,
            username,
        };

        this.pubSubService.broadcast(messageWithUser);

        return messageWithUser;
    }

    async getHistory(limit: number, cursorId?: MessageId): Promise<MessageWithUser[]> {
        return await this.messageRepository.getHistory(limit, cursorId);
    }
}
