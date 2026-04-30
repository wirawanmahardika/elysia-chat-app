import { Elysia } from 'elysia';
import { html } from '@elysiajs/html';
import { env } from './config/env';

// Repositories
import { SqliteUserRepository } from './infrastructure/repositories/sqlite_user_repository';
import { SqliteSessionRepository } from './infrastructure/repositories/sqlite_session_repository';
import { SqliteMessageRepository } from './infrastructure/repositories/sqlite_message_repository';

// Services
import { AuthService } from './application/services/auth_service';
import { ChatService } from './application/services/chat_service';
import { PubSubService } from './application/services/pubsub_service';

// Routes
import { authRoutes } from './presentation/http/auth_routes';
import { chatRoutes } from './presentation/http/chat_routes';
import { chatSocket } from './presentation/ws/chat_socket';

// Initialize Repositories
const userRepository = new SqliteUserRepository();
const sessionRepository = new SqliteSessionRepository();
const messageRepository = new SqliteMessageRepository();

// Initialize Services
const authService = new AuthService(userRepository, sessionRepository);
const pubSubService = new PubSubService();
const chatService = new ChatService(messageRepository, pubSubService);

// Initialize App
const app = new Elysia({
    cookie: {
        secrets: env.COOKIE_SECRET,
        sign: ['session'],
    },
})
    .use(html())
    .use(authRoutes(authService))
    .use(chatRoutes(authService, chatService))
    .use(chatSocket(authService, chatService, pubSubService))
    .listen(env.PORT);

console.log(`🦊 Chatify server is running at http://${app.server?.hostname}:${app.server?.port}`);
