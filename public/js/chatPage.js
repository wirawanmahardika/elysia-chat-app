document.body.addEventListener('htmx:wsOpen', () => {
    console.log('ws connection established');
});

document.body.addEventListener('htmx:wsConnecting', () => {
    console.log('connecting to ws...');
});

document.body.addEventListener('htmx:wsClose', () => {
    console.log('ws connection closed');
});

document.body.addEventListener('htmx:wsAfterSend', function () {
    const inputMessage = document.getElementById('input-message');
    if (inputMessage) inputMessage.value = '';
});

document.body.addEventListener('htmx:oobAfterSwap', () => {
    scrollToBottom();
});

function scrollToBottom() {
    const chatWindow = document.querySelector('[chat-window]');
    if (chatWindow) {
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
}
