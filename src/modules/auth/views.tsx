import { Html } from '@elysiajs/html';
import { Layout } from '../../shared/views/layout';

export const LoginPage = () => {
    return (
        <Layout
            title="Register"
            script={{ htmx: true }}
            class="bg-base-300 min-h-screen antialiased"
        >
            <div class="flex min-h-screen items-center justify-center p-4">
                <div class="card bg-base-100 border-base-200/50 w-full max-w-md border shadow-xl">
                    <div class="card-body gap-y-4">
                        {/* Header / Brand Logo */}
                        <div class="text-center">
                            <div class="bg-primary/10 text-primary mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                </svg>
                            </div>
                            <h1 class="text-2xl font-bold tracking-tight">Login to Chatify</h1>
                            <p class="text-base-content/60 mt-1 text-xs">
                                Masukkan akun Anda untuk melanjutkan percakapan
                            </p>
                        </div>

                        {/* Form Login HTMX */}
                        <form
                            hx-post="/auth/login"
                            hx-target=".toast"
                            hx-swap="innerHTML"
                            class="flex flex-col gap-y-3"
                        >
                            {/* Username Field */}
                            <div class="form-control">
                                <label class="label">
                                    <span class="label-text font-medium">Username</span>
                                </label>
                                <label class="input w-full input-bordered focus-within:input-primary flex items-center gap-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        class="text-base-content/40 h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                    <input
                                        name="username"
                                        type="text"
                                        class="grow"
                                        placeholder="Masukkan username"
                                        required
                                    />
                                </label>
                            </div>

                            {/* Password Field */}
                            <div class="form-control">
                                <label class="label">
                                    <span class="label-text font-medium">Password</span>
                                </label>
                                <label class="input w-full input-bordered focus-within:input-primary flex items-center gap-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        class="text-base-content/40 h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                    <input
                                        name="password"
                                        type="password"
                                        class="grow"
                                        placeholder="••••••••"
                                        required
                                    />
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button type="submit" class="btn btn-primary mt-2 w-full">
                                Login
                            </button>
                        </form>

                        {/* Divider */}
                        <div class="divider my-0 text-xs">ATAU</div>

                        {/* Navigasi ke Register */}
                        <div class="text-center text-sm">
                            <span class="text-base-content/70">Belum punya akun? </span>
                            <a
                                href="/auth/register"
                                class="link link-primary font-semibold no-underline hover:underline"
                            >
                                Daftar sekarang
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Container Toast untuk HTMX Response */}
            <div class="toast toast-top toast-center z-50"></div>
        </Layout>
    );
};

export const RegisterView = ({ error }: { error?: string } = {}) => {
    return (
        <Layout
            title="Register"
            script={{ htmx: true }}
            class="bg-base-300 min-h-screen antialiased"
        >
            <div class="flex min-h-screen items-center justify-center p-4">
                <div class="card bg-base-100 border-base-200/50 w-full max-w-md border shadow-xl">
                    <div class="card-body gap-y-4">
                        {/* Header / Brand Logo */}
                        <div class="text-center">
                            <div class="bg-primary/10 text-primary mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                    />
                                </svg>
                            </div>
                            <h1 class="text-2xl font-bold tracking-tight">Create an Account</h1>
                            <p class="text-base-content/60 mt-1 text-xs">
                                Bergabunglah dengan Chatify sekarang
                            </p>
                        </div>

                        {/* Alert Error (Jika ada error dari backend/props) */}
                        {error && (
                            <div class="alert alert-error text-sm py-2 shadow-sm">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-5 w-5 shrink-0 stroke-current"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Form Register HTMX */}
                        <form
                            hx-post="/auth/register"
                            hx-target=".toast"
                            hx-swap="innerHTML"
                            class="flex flex-col gap-y-3"
                        >
                            {/* Username Field */}
                            <div class="form-control">
                                <label class="label">
                                    <span class="label-text font-medium">Username</span>
                                </label>
                                <label class="input w-full input-bordered focus-within:input-primary flex items-center gap-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        class="text-base-content/40 h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                    <input
                                        name="username"
                                        type="text"
                                        class="grow"
                                        placeholder="Username (huruf, angka, _)"
                                        required
                                        minlength={3}
                                        maxlength={30}
                                        pattern="^[a-zA-Z0-9_]+$"
                                    />
                                </label>
                                <label class="label">
                                    <span class="label-text-alt text-base-content/50">
                                        Hanya alfanumerik dan garis bawah (_)
                                    </span>
                                </label>
                            </div>

                            {/* Password Field */}
                            <div class="form-control">
                                <label class="label">
                                    <span class="label-text font-medium">Password</span>
                                </label>
                                <label class="input w-full input-bordered focus-within:input-primary flex items-center gap-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        class="text-base-content/40 h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                    <input
                                        name="password"
                                        type="password"
                                        class="grow"
                                        placeholder="Minimal 8 karakter"
                                        required
                                        minlength={8}
                                    />
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button type="submit" class="btn btn-primary mt-2 w-full">
                                Register
                            </button>
                        </form>

                        {/* Divider */}
                        <div class="divider my-0 text-xs">ATAU</div>

                        {/* Navigasi ke Login */}
                        <div class="text-center text-sm">
                            <span class="text-base-content/70">Sudah punya akun? </span>
                            <a
                                href="/auth/login"
                                class="link link-primary font-semibold no-underline hover:underline"
                            >
                                Login di sini
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Container Toast untuk HTMX Response */}
            <div class="toast toast-top toast-center z-50"></div>
        </Layout>
    );
};
