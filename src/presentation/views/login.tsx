import { Html } from '@elysiajs/html';
import { Layout } from './layout';

export const LoginPage = () => {
    return (
        <html lang="en">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="stylesheet" href="/public/style.css" />
                <script src="/public/htmx.js"></script>
            </head>
            <body>
                <div class={'grid place-items-center h-screen'}>
                    <form
                        hx-post="/auth/login"
                        hx-target=".toast"
                        class={'flex flex-col items-center gap-y-5'}
                    >
                        <h1 class={'font-bold text-xl'}>Login To Chatify</h1>
                        <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                            <label class="label">Username</label>
                            <input
                                name="username"
                                type="text"
                                class="input"
                                placeholder="Username"
                            />

                            <label class="label">Password</label>
                            <input
                                name="password"
                                type="password"
                                class="input"
                                placeholder="Password"
                            />

                            <button type="submit" class="btn btn-neutral mt-4">
                                Login
                            </button>
                        </fieldset>
                    </form>
                </div>

                <div class="toast toast-top toast-center"></div>
            </body>
        </html>
    );
};

export const LoginView = (error?: string) =>
    Layout(
        'Login',
        `
    <h1>Welcome to Chatify</h1>
    ${error ? `<div class="error">${error}</div>` : ''}
    <form method="POST" action="/auth/login">
        <label>Username</label>
        <input type="text" name="username" required minlength="3" maxlength="30" pattern="^[a-zA-Z0-9_]+$">
        
        <label>Password</label>
        <input type="password" name="password" required minlength="8">
        
        <button type="submit">Login</button>
    </form>
    <p style="text-align: center; margin-top: 1rem;">
        Don't have an account? <a href="/auth/register">Register</a>
    </p>
`
    );

export const RegisterView = (error?: string) =>
    Layout(
        'Register',
        `
    <h1>Create an Account</h1>
    ${error ? `<div class="error">${error}</div>` : ''}
    <form method="POST" action="/auth/register">
        <label>Username (alphanumeric and underscores)</label>
        <input type="text" name="username" required minlength="3" maxlength="30" pattern="^[a-zA-Z0-9_]+$">
        
        <label>Password (min 8 characters)</label>
        <input type="password" name="password" required minlength="8">
        
        <button type="submit">Register</button>
    </form>
    <p style="text-align: center; margin-top: 1rem;">
        Already have an account? <a href="/auth/login">Login</a>
    </p>
`
    );
