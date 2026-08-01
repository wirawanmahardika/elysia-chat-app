import { Elysia } from 'elysia';
import { staticPlugin } from '@elysia/static';
import { html } from '@elysiajs/html';
import { config } from './config';
import { authModule } from './modules/auth';
import { chatModule } from './modules/chat';

const app = new Elysia({
    cookie: {
        secrets: config.COOKIE_SECRET,
        sign: ['session'],
    },
})
    .use(html())
    .use(staticPlugin())
    .use(authModule)
    .use(chatModule)
    .listen(config.PORT);

console.log(`🦊 Chatify server is running at http://${app.server?.hostname}:${app.server?.port}`);
