import { Layout } from './layout';
import type { MessageWithUser } from '../../domain/entities';

const escapeHtml = (unsafe: string) => {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

export const ChatView = (messages: MessageWithUser[], username: string) => Layout('Chat Room', `
    <div style="display: flex; justify-content: space-between; align-items: center;">
        <h1>Global Chat</h1>
        <span>Logged in as <strong>${escapeHtml(username)}</strong> | <a href="/auth/logout">Logout</a></span>
    </div>
    <div id="chat-window">
        ${messages.slice().reverse().map(m => `
            <div class="message" data-id="${m.id}">
                <strong>${escapeHtml(m.username)}:</strong> ${escapeHtml(m.content)}
            </div>
        `).join('')}
    </div>
    <form id="chat-form" style="display: flex; gap: 0.5rem;">
        <input type="text" id="message-input" autocomplete="off" required placeholder="Type a message..." style="margin-bottom: 0;">
        <button type="submit" style="width: auto; margin-bottom: 0;">Send</button>
    </form>
    
    <script>
        const chatWindow = document.getElementById('chat-window');
        const form = document.getElementById('chat-form');
        const input = document.getElementById('message-input');
        let oldestMessageId = chatWindow.firstElementChild ? chatWindow.firstElementChild.dataset.id : null;
        let isFetching = false;
        
        // Scroll to bottom initially
        chatWindow.scrollTop = chatWindow.scrollHeight;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(\`\${protocol}//\${window.location.host}/ws\`);
        
        ws.onopen = () => {
            console.log('Connected to WebSocket');
            setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'ping' }));
                }
            }, 30000);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'pong') return;
            
            if (data.type === 'message') {
                const isScrolledToBottom = chatWindow.scrollHeight - chatWindow.clientHeight <= chatWindow.scrollTop + 10;
                
                const msgDiv = document.createElement('div');
                msgDiv.className = 'message';
                msgDiv.dataset.id = data.payload.id;
                
                const strong = document.createElement('strong');
                strong.textContent = data.payload.username + ': ';
                
                msgDiv.appendChild(strong);
                msgDiv.appendChild(document.createTextNode(data.payload.content));
                
                chatWindow.appendChild(msgDiv);
                
                if (isScrolledToBottom) {
                    chatWindow.scrollTop = chatWindow.scrollHeight;
                }
            } else if (data.type === 'history') {
                const messages = data.payload.reverse();
                if (messages.length > 0) {
                    oldestMessageId = messages[0].id;
                    const oldScrollHeight = chatWindow.scrollHeight;
                    
                    messages.forEach(m => {
                        const msgDiv = document.createElement('div');
                        msgDiv.className = 'message';
                        msgDiv.dataset.id = m.id;
                        
                        const strong = document.createElement('strong');
                        strong.textContent = m.username + ': ';
                        
                        msgDiv.appendChild(strong);
                        msgDiv.appendChild(document.createTextNode(m.content));
                        
                        chatWindow.insertBefore(msgDiv, chatWindow.firstChild);
                    });
                    
                    chatWindow.scrollTop = chatWindow.scrollHeight - oldScrollHeight;
                }
                isFetching = false;
            }
        };

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const content = input.value.trim();
            if (content && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'send', content }));
                input.value = '';
            }
        });

        chatWindow.addEventListener('scroll', () => {
            if (chatWindow.scrollTop === 0 && !isFetching && oldestMessageId) {
                isFetching = true;
                ws.send(JSON.stringify({ type: 'get_history', cursorId: parseInt(oldestMessageId) }));
            }
        });
    </script>
`);
