import { Elysia } from 'elysia';
import type { AuthService } from '../../application/services/auth_service';
import type { SessionId } from '../../domain/types';
import type { User } from '../../domain/entities';
import { UserService } from '../../application/services/user_service';
import { chatPartial } from '../views/partials/chat';

export const chatSocket = (authService: AuthService, userService: UserService) => {
    const states = new Map<string, User>();

    return new Elysia().ws('/ws', {
        async beforeHandle({ cookie: { session } }) {
            const sessionId = session.value as SessionId;
            if (!sessionId) {
                return new Response(null, { status: 404 });
            }

            const user = await authService.validateSession(sessionId);
            if (!user) {
                return new Response(null, { status: 404 });
            }
        },
        async open(ws) {
            const sessionId = ws.data.cookie.session.value as SessionId;
            const user = await authService.validateSession(sessionId);
            if (!user) return;
            ws.subscribe('global');
            states.set(ws.id, user);
        },
        async message(ws, data: any) {
            const user = states.get(ws.id);
            if (!user) return;
            const response = chatPartial(user.username, data.message);
            ws.publish('global', response);
        },
        close(ws) {
            const user = states.get(ws.id);
            if (user) {
                console.log('menutup koneksi');
                ws.unsubscribe('global');
                states.delete(ws.id);
            }
        },
    });
};
