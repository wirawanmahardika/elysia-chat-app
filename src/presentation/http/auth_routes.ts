import { Elysia, t } from 'elysia';
import type { AuthService } from '../../application/services/auth_service';
import { LoginPage, LoginView, RegisterView } from '../views/login';
import type { SessionId } from '../../domain/types';
import { html, Html } from '@elysiajs/html';

export const authRoutes = (authService: AuthService) =>
    new Elysia({ prefix: '/auth' })
        .use(html())
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
                        <span>${error}</span>
                    </div>`;
                }
            },
            {
                body: t.Object({
                    username: t.String(),
                    password: t.String(),
                }),
            }
        )
        .get('/register', () => RegisterView())
        .post(
            '/register',
            async ({ redirect, body, set }) => {
                try {
                    const { username, password } = body;
                    await authService.register({ username, password });
                    return redirect('/');
                } catch (error: any) {
                    return RegisterView(error.message);
                }
            },
            {
                body: t.Object({
                    username: t.String(),
                    password: t.String(),
                }),
            }
        )
        .get('/logout', async ({ cookie: { session }, redirect }) => {
            if (session.value) {
                await authService.logout(session.value as SessionId);
                session.remove();
            }
            return redirect('/auth/login');
        });
