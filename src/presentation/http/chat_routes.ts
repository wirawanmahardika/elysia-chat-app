import { Elysia } from 'elysia';
import type { AuthService } from '../../application/services/auth_service';
import type { ChatService } from '../../application/services/chat_service';
import { ChatView } from '../views/chat';
import type { SessionId } from '../../domain/types';

import { html } from '@elysiajs/html';

export const chatRoutes = (authService: AuthService, chatService: ChatService) =>
    new Elysia().use(html()).get('/', async ({ redirect, cookie: { session }, set, html }) => {
        try {
            if (!session.value) {
                return redirect('/auth/login');
            }

            const user = await authService.validateSession(session.value as SessionId);
            if (!user) {
                session.remove();
                return redirect('/auth/login');
            }

            const initialMessages = await chatService.getHistory(50);
            return html(ChatView(initialMessages, user.username));
        } catch (error) {
            return 'hello world';
        }
    });
