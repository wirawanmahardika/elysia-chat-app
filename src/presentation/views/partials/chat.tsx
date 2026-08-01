import { Html } from '@elysiajs/html';

export const chatPartial = (username: string, content: string) => {
    return (
        <div id={'chat-window'} hx-swap-oob="beforeend">
            <div class={`chat chat-start`}>
                <div class="chat-header text-xs opacity-70 mb-1">{username}</div>
                <div class={`chat-bubble max-w-[80%] chat-bubble-neutral`}>{content}</div>
            </div>
        </div>
    );
};
