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
    const chatWindow = document.querySelector('[chat-window]');
    if (chatWindow) {
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
}

document.body.addEventListener('htmx:wsAfterSend', function () {
    const inputMessage = document.getElementById('input-message');
    if (inputMessage) inputMessage.value = '';
});

document.addEventListener('DOMContentLoaded', scrollToBottom);
window.addEventListener('load', scrollToBottom);
document.body.addEventListener('htmx:oobAfterSwap', scrollToBottom);
