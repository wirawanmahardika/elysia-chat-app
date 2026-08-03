import { Elysia, t } from 'elysia';
import { html } from '@elysiajs/html';
import { authService } from '../auth/service';
import { chatService } from './service';
import { ChatPage, ChatPartial } from './views';
import type { User } from '../auth/model';

interface WSClientState {
    user: User;
    subscribedRooms: Set<string>;
}

const states = new Map<string, WSClientState>();

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

            const userRooms = await chatService.getUserRooms(user.id);
            const availableUsers = await chatService.getAllOtherUsers(user.id);

            if (userRooms.length > 0) {
                const activeRoomId = userRooms[0].id;
                const initialMessages = await chatService.getRoomHistory(activeRoomId, 50);
                return ChatPage({
                    userRooms,
                    activeRoomId,
                    messages: initialMessages,
                    currentUsername: user.username,
                    availableUsers,
                });
            }

            return ChatPage({
                userRooms: [],
                activeRoomId: null,
                messages: [],
                currentUsername: user.username,
                availableUsers,
            });
        } catch (error) {
            return new Response(null, { status: 500 });
        }
    })
    .get('/room/:roomId', async ({ params: { roomId }, redirect, cookie: { session } }) => {
        try {
            if (!session.value) {
                return redirect('/auth/login');
            }

            const user = await authService.validateSession(session.value as string);
            if (!user) {
                session.remove();
                return redirect('/auth/login');
            }

            const isMember = await chatService.isUserInRoom(user.id, roomId);
            if (!isMember) {
                return redirect('/');
            }

            const userRooms = await chatService.getUserRooms(user.id);
            const initialMessages = await chatService.getRoomHistory(roomId, 50);
            const availableUsers = await chatService.getAllOtherUsers(user.id);

            return ChatPage({
                userRooms,
                activeRoomId: roomId,
                messages: initialMessages,
                currentUsername: user.username,
                availableUsers,
            });
        } catch (error) {
            return new Response(null, { status: 500 });
        }
    })
    .post(
        '/direct',
        async ({ body, redirect, set, headers, cookie: { session } }) => {
            if (!session.value) {
                return redirect('/auth/login');
            }

            const user = await authService.validateSession(session.value as string);
            if (!user) {
                session.remove();
                return redirect('/auth/login');
            }

            const { targetUserId } = body;
            if (!targetUserId || targetUserId === user.id) {
                return redirect('/');
            }

            const roomId = await chatService.getOrCreateDirectRoom(user.id, targetUserId);

            if (headers['hx-request']) {
                set.headers['HX-Redirect'] = `/room/${roomId}`;
                return;
            }

            return redirect(`/room/${roomId}`);
        },
        {
            body: t.Object({
                targetUserId: t.String(),
            }),
        }
    )
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

            // Auto-subscribe to all rooms the user is a member of so they can receive updates
            const userRooms = await chatService.getUserRooms(user.id);
            const subscribedRooms = new Set<string>();
            for (const room of userRooms) {
                ws.subscribe(room.id);
                subscribedRooms.add(room.id);
            }

            states.set(ws.id, {
                user,
                subscribedRooms,
            });
        },
        async message(ws, data: any) {
            const clientState = states.get(ws.id);
            if (!clientState) return;

            let payload = data;
            if (typeof data === 'string') {
                try {
                    payload = JSON.parse(data);
                } catch {
                    payload = {};
                }
            }

            const roomId = payload?.roomId;
            const message = payload?.message;

            if (roomId && message) {
                const user = clientState.user;
                const isMember = await chatService.isUserInRoom(user.id, roomId);
                if (!isMember) return;

                if (!clientState.subscribedRooms.has(roomId)) {
                    ws.subscribe(roomId);
                    clientState.subscribedRooms.add(roomId);
                }

                await chatService.createMessage({ roomId, userId: user.id, content: message });
                const response = ChatPartial(user.username, message);
                ws.publish(roomId, response);
            }
        },
        close(ws) {
            const clientState = states.get(ws.id);
            if (clientState) {
                for (const roomId of clientState.subscribedRooms) {
                    ws.unsubscribe(roomId);
                }
                states.delete(ws.id);
            }
        },
    });

export const chatRoutes = chatModule;
