import { Elysia } from 'elysia';
import { html } from '@elysiajs/html';
import { authService } from '../auth/service';
import { chatService } from './service';
import { ChatPage, chatPartial } from './views';
import type { User } from '../auth/model';

const states = new Map<string, User>();

export const chatModule = new Elysia()
    .use(html())
    .get('/', async ({ redirect, cookie: { session } }) => {
        try {
            if (!session.value) {
                return redirect('/auth/login');
            }

            const user = await authService.validateSession(session.value as string);
            if (!user) {
                session.remove();
                return redirect('/auth/login');
            }
            const initialMessages = await chatService.getHistory(50);
            return ChatPage(initialMessages, user.username);
        } catch (error) {
            return new Response(null, { status: 500 });
        }
    })
    .ws('/ws', {
        async beforeHandle({ cookie: { session } }) {
            const sessionId = session.value as string;
            if (!sessionId) {
                return new Response(null, { status: 404 });
            }

            const user = await authService.validateSession(sessionId);
            if (!user) {
                return new Response(null, { status: 404 });
            }
        },
        async open(ws) {
            const sessionId = ws.data.cookie.session.value as string;
            const user = await authService.validateSession(sessionId);
            if (!user) return;
            ws.subscribe('global');
            states.set(ws.id, user);
        },
        async message(ws, data: any) {
            const user = states.get(ws.id);
            if (!user) return;
            if (data?.message) {
                await chatService.createMessage({ userId: user.id, content: data.message });
            }
            const response = chatPartial(user.username, data.message);
            ws.publish('global', response);
        },
        close(ws) {
            const user = states.get(ws.id);
            if (user) {
                ws.unsubscribe('global');
                states.delete(ws.id);
            }
        },
    });

export const chatRoutes = chatModule;
