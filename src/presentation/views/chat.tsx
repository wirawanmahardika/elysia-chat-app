import type { MessageWithUser } from '../../domain/entities';
import { Layout } from './layout';
import { Html } from '@elysiajs/html';

const escapeHtml = (unsafe: string) => {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

export const ChatPage = (messages: MessageWithUser[], username: string) => {
    return (
        <html lang="en" data-theme="slate">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Global Chat</title>
                <link rel="stylesheet" href="/public/style.css" />
                <script src="/public/htmx.js"></script>
                <script src="/public/htmx-ws.js"></script>
                <script src="/public/js/chatPage.js" defer></script>
            </head>
            <body class="bg-base-200 min-h-screen flex items-center justify-center p-0 md:p-4 font-sans text-base-content">
                {/* Main Container Container Card */}
                <div
                    hx-ext="ws"
                    ws-connect="/ws"
                    class="w-full max-w-4xl h-screen md:h-[85vh] bg-base-100 md:rounded-box md:shadow-xl flex flex-col border border-base-300 overflow-hidden"
                >
                    {/* Header */}
                    <header class="p-4 bg-base-100 border-b border-base-300 flex justify-between items-center z-10 shadow-sm">
                        <div class="flex items-center gap-3">
                            <div class="avatar placeholder">
                                <div class="bg-neutral text-neutral-content rounded-full w-10">
                                    <span class="text-xs font-bold">GC</span>
                                </div>
                            </div>
                            <div>
                                <h1 class="font-bold text-lg leading-none">Global Chat</h1>
                                <span class="text-xs text-success flex items-center gap-1 mt-1">
                                    <span class="w-2 h-2 rounded-full bg-success inline-block"></span>{' '}
                                    Online
                                </span>
                            </div>
                        </div>

                        <div class="flex items-center gap-3">
                            <div class="badge badge-ghost gap-2 py-3 px-4">
                                <span class="text-xs text-base-content/70">As:</span>
                                <span class="font-semibold">{username}</span>
                            </div>
                            <a href="/auth/logout" class="btn btn-error btn-outline btn-sm">
                                Logout
                            </a>
                        </div>
                    </header>

                    {/* Chat Window (Scrollable Area) */}
                    <div
                        id="chat-window"
                        data-username={username}
                        class="flex-1 overflow-y-auto p-4 space-y-4 bg-base-200/50"
                    >
                        {messages
                            .slice()
                            .reverse()
                            .map((m) => {
                                const isSelf = m.username === username;
                                return (
                                    <div class={`chat ${isSelf ? 'chat-end' : 'chat-start'}`}>
                                        <div class="chat-header text-xs opacity-70 mb-1">
                                            {m.username}
                                        </div>
                                        <div
                                            class={`chat-bubble max-w-[80%] ${isSelf ? 'chat-bubble-primary' : 'chat-bubble-neutral'}`}
                                        >
                                            {m.content}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>

                    {/* Footer / Input Form */}
                    <form
                        id="form"
                        class="p-4 bg-base-100 border-t border-base-300 flex gap-2 items-center"
                        ws-send
                    >
                        <input
                            id={'input-message'}
                            type="text"
                            name="message"
                            class="input input-bordered input-primary flex-1 focus:outline-none"
                            autocomplete="off"
                            required
                            placeholder="Tulis pesan..."
                        />
                        <button type="submit" class="btn btn-primary px-6">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="w-5 h-5"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                                />
                            </svg>
                            Kirim
                        </button>
                    </form>
                </div>
            </body>
        </html>
    );
};
