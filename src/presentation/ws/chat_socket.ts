import { Elysia } from 'elysia';
import type { AuthService } from '../../application/services/auth_service';
import type { ChatService } from '../../application/services/chat_service';
import type { PubSubService } from '../../application/services/pubsub_service';
import type { SessionId, UserId, MessageId } from '../../domain/types';

import type { User } from '../../domain/entities';

interface SocketState {
    user: User;
    unsubscribe: () => void;
}

export const chatSocket = (authService: AuthService, chatService: ChatService, pubSubService: PubSubService) => {
    const states = new Map<string, SocketState>();

    return new Elysia()
    .ws('/ws', {
        async open(ws) {
            const cookies = ws.data.cookie;
            const sessionId = cookies.session?.value as SessionId | undefined;
            
            if (!sessionId) {
                ws.close();
                return;
            }

            const user = await authService.validateSession(sessionId);
            if (!user) {
                ws.close();
                return;
            }

            const unsubscribe = pubSubService.subscribe('message', (message) => {
                ws.send(JSON.stringify({ type: 'message', payload: message }));
            });

            states.set(ws.id, { user, unsubscribe });
        },
        async message(ws, message: any) {
            const state = states.get(ws.id);
            if (!state) return;
            const user = state.user;

            if (message.type === 'ping') {
                ws.send(JSON.stringify({ type: 'pong' }));
            } else if (message.type === 'send' && typeof message.content === 'string') {
                const content = message.content.trim();
                if (content.length > 0 && content.length <= 1000) {
                    await chatService.sendMessage(user.id as UserId, { content }, user.username);
                }
            } else if (message.type === 'get_history' && typeof message.cursorId === 'number') {
                const history = await chatService.getHistory(50, message.cursorId as MessageId);
                ws.send(JSON.stringify({ type: 'history', payload: history }));
            }
        },
        close(ws) {
            const state = states.get(ws.id);
            if (state) {
                state.unsubscribe();
                states.delete(ws.id);
            }
        }
    });
};
