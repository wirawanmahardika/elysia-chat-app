import { Elysia } from 'elysia';
import { authService } from './service';
import { loginBodySchema, registerBodySchema } from './model';
import { LoginPage, RegisterView } from './views';

export const authModule = new Elysia({ prefix: '/auth' })
    .get('/login', () => LoginPage())
    .post(
        '/login',
        async ({ body, set, cookie: { session } }) => {
            try {
                const { username, password } = body;
                const newSession = await authService.login({ username, password });

                session.set({
                    value: newSession.id,
                    httpOnly: true,
                    sameSite: 'strict',
                    secure: process.env.NODE_ENV === 'production',
                    expires: newSession.expiresAt,
                    path: '/',
                });
                set.headers['HX-Redirect'] = '/';
            } catch (error: any) {
                return `<div class="alert alert-error">
                    <span>${error.message || error}</span>
                </div>`;
            }
        },
        {
            body: loginBodySchema,
        }
    )
    .get('/register', () => RegisterView())
    .post(
        '/register',
        async ({ set, body }) => {
            try {
                const { username, password } = body;
                await authService.register({ username, password });
                set.headers['HX-Redirect'] = '/auth/login';
            } catch (error: any) {
                return `<div class="alert alert-error">
                    <span>${error.message || error}</span>
                </div>`;
            }
        },
        {
            body: registerBodySchema,
        }
    )
    .get('/logout', async ({ cookie: { session }, redirect }) => {
        if (session.value) {
            await authService.logout(session.value as string);
            session.remove();
        }
        return redirect('/auth/login');
    });

export const authRoutes = authModule;
