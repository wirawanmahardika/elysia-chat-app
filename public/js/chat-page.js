document.body.addEventListener('htmx:wsAfterSend', () => (htmx.find('#input-message').value = ''));
document.body.addEventListener('htmx:wsAfterMessage', scrollToBottom);

function scrollToBottom() {
    const chatWindow = document.querySelector('[chat-window]');
    if (chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight;
}

function formatChatTime(dateInput) {
    const date = new Date(dateInput);
    const now = new Date();

    // Cek apakah hari ini
    const isToday = date.toDateString() === now.toDateString();

    // Cek apakah kemarin
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    // Format jam (misal: "14.30")
    const timeStr = date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });

    if (isToday) {
        return timeStr; // Contoh: "14.30"
    }

    if (isYesterday) {
        return `Kemarin ${timeStr}`; // Contoh: "Kemarin 14.30"
    }

    // Jika lebih dari 2 hari yang lalu
    const dateStr = date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
    });

    return `${dateStr} ${timeStr}`; // Contoh: "09 Agt 14.30"
}
