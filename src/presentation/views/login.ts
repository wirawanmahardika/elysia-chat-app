import { Layout } from './layout';

export const LoginView = (error?: string) => Layout('Login', `
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
`);

export const RegisterView = (error?: string) => Layout('Register', `
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
`);
