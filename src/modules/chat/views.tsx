import { Html } from '@elysiajs/html';
import type { MessageWithUser, RoomWithDetails } from './model';
import { Layout, Scripts } from '../../shared/views/layout';

interface ChatPageProps {
    userRooms: RoomWithDetails[];
    activeRoomId: string | null;
    messages: MessageWithUser[];
    currentUsername: string;
    availableUsers: { id: string; username: string }[];
}

export const ChatPage = ({
    userRooms,
    activeRoomId,
    messages,
    currentUsername,
    availableUsers,
}: ChatPageProps) => {
    const scripts: Scripts = {
        htmx: true,
        htmxWebSocket: true,
        customScript: [{ src: '/public/js/chatPage.js', defer: true }],
    };

    const activeRoom = userRooms.find((r) => r.id === activeRoomId);
    const activeTitle = activeRoom
        ? activeRoom.opponentName || activeRoom.name || 'Obrolan'
        : 'Chatify';

    return (
        <Layout title={`Chat - ${activeTitle}`} script={scripts}>
            <div class="bg-base-200 min-h-screen flex items-center justify-center p-0 md:p-4 font-sans text-base-content">
                <div
                    hx-ext="ws"
                    ws-connect="/ws"
                    class="w-full max-w-6xl h-screen md:h-[88vh] bg-base-100 md:rounded-2xl md:shadow-2xl flex flex-col md:flex-row border border-base-300 overflow-hidden"
                >
                    {/* Left Sidebar */}
                    <div class="w-full md:w-80 lg:w-96 border-r border-base-300 flex flex-col bg-base-100 shrink-0">
                        {/* Profile Header */}
                        <div class="p-4 border-b border-base-300 flex justify-between items-center bg-base-200/50">
                            <div class="flex items-center gap-3">
                                <div class="avatar placeholder">
                                    <div class="bg-primary text-primary-content rounded-full w-10 h-10 flex items-center justify-center font-bold">
                                        {currentUsername.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div class="overflow-hidden">
                                    <h2 class="font-bold text-sm truncate">{currentUsername}</h2>
                                    <span class="text-[11px] text-success flex items-center gap-1">
                                        <span class="w-2 h-2 rounded-full bg-success inline-block"></span>{' '}
                                        Aktif
                                    </span>
                                </div>
                            </div>
                            <a
                                href="/auth/logout"
                                class="btn btn-ghost btn-circle btn-sm text-error"
                                title="Logout"
                            >
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
                                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                                    />
                                </svg>
                            </a>
                        </div>

                        {/* Direct Messages Section Title & New Chat Button */}
                        <div class="p-3 border-b border-base-300 flex justify-between items-center bg-base-100">
                            <span class="text-xs font-bold uppercase tracking-wider text-base-content/60">
                                Direct Messages
                            </span>
                            <button
                                onclick="new_chat_modal.showModal()"
                                class="btn btn-primary btn-xs gap-1"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke-width="2"
                                    stroke="currentColor"
                                    class="w-3.5 h-3.5"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M12 4.5v15m7.5-7.5h-15"
                                    />
                                </svg>
                                Obrolan Baru
                            </button>
                        </div>

                        {/* Rooms List */}
                        <div class="flex-1 overflow-y-auto p-2 space-y-1">
                            {userRooms.length === 0 ? (
                                <div class="text-center p-6 text-base-content/50 text-sm">
                                    Belum ada percakapan.
                                    <br />
                                    Klik <strong>"Obrolan Baru"</strong> untuk memulai.
                                </div>
                            ) : (
                                userRooms.map((room) => {
                                    const isActive = room.id === activeRoomId;
                                    const title =
                                        room.opponentName || room.name || 'Direct Message';
                                    const initial = title.charAt(0).toUpperCase();
                                    const lastMsg = room.lastMessage
                                        ? room.lastMessage.content
                                        : 'Belum ada pesan';

                                    return (
                                        <a
                                            href={`/room/${room.id}`}
                                            class={`flex items-center gap-3 p-3 rounded-xl transition ${
                                                isActive
                                                    ? 'bg-primary text-primary-content shadow-md'
                                                    : 'hover:bg-base-200 text-base-content'
                                            }`}
                                        >
                                            <div class="avatar placeholder shrink-0">
                                                <div
                                                    class={`rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm ${
                                                        isActive
                                                            ? 'bg-primary-content text-primary'
                                                            : 'bg-neutral text-neutral-content'
                                                    }`}
                                                >
                                                    {initial}
                                                </div>
                                            </div>
                                            <div class="flex-1 min-w-0">
                                                <div class="flex justify-between items-baseline">
                                                    <h3 class="font-semibold text-sm truncate">
                                                        {title}
                                                    </h3>
                                                </div>
                                                <p
                                                    class={`text-xs truncate mt-0.5 ${
                                                        isActive
                                                            ? 'text-primary-content/80'
                                                            : 'text-base-content/60'
                                                    }`}
                                                >
                                                    {lastMsg}
                                                </p>
                                            </div>
                                        </a>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right Panel - Chat Panel */}
                    <div class="flex-1 flex flex-col h-full bg-base-100 overflow-hidden">
                        {activeRoom ? (
                            <>
                                {/* Chat Header */}
                                <header class="p-4 bg-base-100 border-b border-base-300 flex justify-between items-center z-10 shadow-sm">
                                    <div class="flex items-center gap-3">
                                        <div class="avatar placeholder">
                                            <div class="bg-neutral text-neutral-content rounded-full w-10 h-10 flex items-center justify-center font-bold">
                                                {(activeRoom.opponentName || activeRoom.name || 'D')
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                        </div>
                                        <div>
                                            <h1 class="font-bold text-base leading-tight">
                                                {activeRoom.opponentName ||
                                                    activeRoom.name ||
                                                    'Direct Message'}
                                            </h1>
                                            <span class="text-xs text-success flex items-center gap-1 mt-0.5">
                                                <span class="w-2 h-2 rounded-full bg-success inline-block"></span>{' '}
                                                Direct Chat
                                            </span>
                                        </div>
                                    </div>
                                </header>

                                {/* Chat Window (Scrollable Area) */}
                                <div
                                    id="chat-window"
                                    data-username={currentUsername}
                                    class="flex-1 overflow-y-auto p-4 space-y-4 bg-base-200/40"
                                >
                                    {messages
                                        .slice()
                                        .reverse()
                                        .map((m) => {
                                            const isSelf = m.username === currentUsername;
                                            return (
                                                <div
                                                    class={`chat ${isSelf ? 'chat-end' : 'chat-start'}`}
                                                >
                                                    <div class="chat-header text-xs opacity-70 mb-1">
                                                        {m.username}
                                                    </div>
                                                    <div
                                                        class={`chat-bubble max-w-[80%] ${
                                                            isSelf
                                                                ? 'chat-bubble-primary'
                                                                : 'chat-bubble-neutral'
                                                        }`}
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
                                    <input type="hidden" name="roomId" value={activeRoom.id} />
                                    <input
                                        id="input-message"
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
                            </>
                        ) : (
                            <div class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-base-200/20">
                                <div class="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke-width="1.5"
                                        stroke="currentColor"
                                        class="w-8 h-8"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-1.074-.85l1.052-3.76-A8.967 8.967 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                                        />
                                    </svg>
                                </div>
                                <h2 class="text-xl font-bold mb-2">Selamat Datang di Chatify</h2>
                                <p class="text-base-content/60 max-w-sm mb-6 text-sm">
                                    Pilih percakapan dari sidebar di sebelah kiri atau buat obrolan
                                    baru untuk mulai berkomunikasi secara privat.
                                </p>
                                <button
                                    onclick="new_chat_modal.showModal()"
                                    class="btn btn-primary"
                                >
                                    Mulai Obrolan Baru
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal - New Chat Selection */}
            <dialog id="new_chat_modal" class="modal">
                <div class="modal-box">
                    <h3 class="font-bold text-lg mb-4">Pilih Pengguna untuk Memulai DM</h3>
                    <div class="space-y-2 max-h-60 overflow-y-auto">
                        {availableUsers.length === 0 ? (
                            <p class="text-sm text-base-content/60 text-center py-4">
                                Tidak ada pengguna lain yang tersedia.
                            </p>
                        ) : (
                            availableUsers.map((user) => (
                                <form
                                    method="POST"
                                    action="/direct"
                                    class="flex items-center justify-between p-3 rounded-lg hover:bg-base-200 border border-base-300"
                                >
                                    <input type="hidden" name="targetUserId" value={user.id} />
                                    <div class="flex items-center gap-3">
                                        <div class="avatar placeholder">
                                            <div class="bg-neutral text-neutral-content rounded-full w-8 h-8 flex items-center justify-center font-bold text-xs">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                        </div>
                                        <span class="font-semibold text-sm">{user.username}</span>
                                    </div>
                                    <button type="submit" class="btn btn-primary btn-sm">
                                        Kirim Pesan
                                    </button>
                                </form>
                            ))
                        )}
                    </div>
                    <div class="modal-action">
                        <form method="dialog">
                            <button class="btn btn-ghost btn-sm">Batal</button>
                        </form>
                    </div>
                </div>
                <form method="dialog" class="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </Layout>
    );
};

export const ChatPartial = (username: string, content: string) => {
    return (
        <div id="chat-window" hx-swap-oob="beforeend">
            <div class="chat chat-start">
                <div class="chat-header text-xs opacity-70 mb-1">{username}</div>
                <div class="chat-bubble max-w-[80%] chat-bubble-neutral">{content}</div>
            </div>
        </div>
    );
};
