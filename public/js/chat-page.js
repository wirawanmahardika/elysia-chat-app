document.body.addEventListener('htmx:wsAfterSend', () => (htmx.find('#input-message').value = ''));
document.body.addEventListener('htmx:wsAfterMessage', scrollToBottom);

function scrollToBottom() {
    const chatWindow = document.querySelector('[chat-window]');
    if (chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight;
}
