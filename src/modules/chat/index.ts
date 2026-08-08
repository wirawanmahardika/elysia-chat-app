import { Elysia, t } from 'elysia';
import { authService } from '../auth/service';
import { chatService } from './service';
import { ChatPage, ChatPanel, ChatPartial, Chats } from './views';
import type { User } from '../auth/model';

interface WSClientState {
    user: User;
    subscribedRooms: Set<string>;
}

const states = new Map<string, WSClientState>();

export const chatModule = new Elysia()
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

            return ChatPage({
                currentUsername: user.username,
                userRooms,
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
    .get('/room/:roomId', async ({ params: { roomId }, set, cookie: { session } }) => {
        try {
            if (!session.value) {
                set.headers['HX-Redirect'] = '/auth/login';
                return;
            }

            const user = await authService.validateSession(session.value as string);
            if (!user) {
                session.remove();
                set.headers['HX-Redirect'] = '/auth/login';
                return;
            }

            const isMember = await chatService.isUserInRoom(user.id, roomId);
            if (!isMember) {
                set.headers['HX-Redirect'] = '/';
                return;
            }

            const initialMessages = await chatService.getRoomHistory(roomId, 10);
            const roomAndOpponent = await chatService.getRoomAndOpponent(roomId, user.id);

            return ChatPanel({
                messages: initialMessages,
                username: user.username,
                room: {
                    id: roomAndOpponent?.id || '',
                    name: roomAndOpponent?.name || '',
                    opponentName: roomAndOpponent?.opponentName || '',
                },
            });
        } catch (error) {
            return new Response(null, { status: 500 });
        }
    })
    .get(
        '/messages/:roomId',
        async ({ params: { roomId }, query: { beforeDate }, set, cookie: { session } }) => {
            try {
                if (!session.value) {
                    set.headers['HX-Redirect'] = '/auth/login';
                    return;
                }

                const user = await authService.validateSession(session.value as string);
                if (!user) {
                    session.remove();
                    set.headers['HX-Redirect'] = '/auth/login';
                    return;
                }

                const msgs = await chatService.getPreviousMessages(roomId, beforeDate);
                if (msgs.length <= 0) {
                    set.headers['HX-Retarget'] = '#message-loader-btn';
                    set.headers['HX-Reswap'] = 'innerHTML';
                    return 'Tidak ada lagi pesan';
                }
                return Chats(user.id, msgs);
            } catch (error) {
                return new Response(null, { status: 500 });
            }
        },
        {
            params: t.Object({ roomId: t.String() }),
            query: t.Object({ beforeDate: t.Date() }),
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

            const roomId = data?.roomId;
            const message = data?.message;
            const user = clientState.user;

            switch (data.type) {
                case 'chatting':
                    if (!roomId || !message) return;
                    const isMember = await chatService.isUserInRoom(user.id, roomId);
                    if (!isMember) return;
                    if (!clientState.subscribedRooms.has(roomId)) {
                        ws.subscribe(roomId);
                        clientState.subscribedRooms.add(roomId);
                    }

                    await chatService.createMessage({
                        roomId,
                        userId: user.id,
                        content: message,
                    });

                    const response = ChatPartial(false, user.username, message, roomId);
                    ws.publish(roomId, response);
                    const selfResponse = ChatPartial(true, user.username, message, roomId);
                    ws.send(selfResponse);
                    break;
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
