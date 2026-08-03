document.body.addEventListener('htmx:wsOpen', () => {
    console.log('ws connection established');
    scrollToBottom();
});

document.body.addEventListener('htmx:wsConnecting', () => {
    console.log('connecting to ws...');
});

document.body.addEventListener('htmx:wsClose', () => {
    console.log('ws connection closed');
});

function scrollToBottom() {
    const chatWindow = document.getElementById('chat-window');
    if (chatWindow) {
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
}

document.body.addEventListener('htmx:wsAfterSend', function () {
    const inputMessage = document.getElementById('input-message');
    const chatWindow = document.getElementById('chat-window');

    if (!inputMessage || !chatWindow) return;

    const message = inputMessage.value;
    const username = chatWindow.dataset.username || 'You';

    if (message.trim()) {
        const selfChat = document.createRange().createContextualFragment(`
            <div class="chat chat-end">
                <div class="chat-header text-xs opacity-70 mb-1">${username}</div>
                <div class="chat-bubble max-w-[80%] chat-bubble-primary">${message}</div>
            </div>
        `);

        chatWindow.append(selfChat);
        scrollToBottom();
    }
    inputMessage.value = '';
});

document.addEventListener('DOMContentLoaded', scrollToBottom);
window.addEventListener('load', scrollToBottom);
document.body.addEventListener('htmx:oobAfterSwap', scrollToBottom);
