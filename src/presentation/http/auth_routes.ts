import { Elysia, t } from 'elysia';
import type { AuthService } from '../../application/services/auth_service';
import { LoginView, RegisterView } from '../views/login';
import type { SessionId } from '../../domain/types';

import { html } from '@elysiajs/html';

export const authRoutes = (authService: AuthService) =>
    new Elysia({ prefix: '/auth' })
        .use(html())
        .get('/login', ({ html }) => html(LoginView()))
        .post(
            '/login',
            async ({ body, redirect, cookie: { session }, html, set }) => {
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

                    return redirect('/');
                } catch (error: any) {
                    return html(LoginView(error.message));
                }
            },
            {
                body: t.Object({
                    username: t.String(),
                    password: t.String(),
                }),
            }
        )
        .get('/register', ({ html }) => html(RegisterView()))
        .post(
            '/register',
            async ({ redirect, body, html, set }) => {
                try {
                    const { username, password } = body;
                    await authService.register({ username, password });
                    return redirect('/');
                } catch (error: any) {
                    return html(RegisterView(error.message));
                }
            },
            {
                body: t.Object({
                    username: t.String(),
                    password: t.String(),
                }),
            }
        )
        .get('/logout', async ({ cookie: { session }, set }) => {
            if (session.value) {
                await authService.logout(session.value as SessionId);
                session.remove();
            }
            set.redirect = '/auth/login';
        });
