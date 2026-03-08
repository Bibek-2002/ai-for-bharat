const vscode = require('vscode');
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

const ai = new GoogleGenAI({ apiKey: 'AIzaSyBuoHYeMaxnpbWxckt2PgisqmAzdqQonlc' });

async function callGeminiAPI(prompt) {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
    });
    return response.text;
}

// Chat history file path
let historyFilePath;

function getHistory() {
    try {
        if (fs.existsSync(historyFilePath)) {
            return JSON.parse(fs.readFileSync(historyFilePath, 'utf8'));
        }
    } catch(e) {}
    return [];
}

function saveHistory(history) {
    try {
        fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2));
    } catch(e) {}
}

class DevMentorViewProvider {
    constructor(extensionUri, context) {
        this._extensionUri = extensionUri;
        this._context = context;
        this._view = undefined;
        this._currentChatId = null;
        this._currentMessages = [];
    }

    resolveWebviewView(webviewView) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlContent();

        // Load history on start
        setTimeout(() => {
            this._loadHistoryList();
        }, 500);

        webviewView.webview.onDidReceiveMessage(async (message) => {

            // New chat
            if (message.command === 'newChat') {
                this._currentChatId = Date.now().toString();
                this._currentMessages = [];
                this._sendMessage('clearChat', '');
            }

            // Send message
            if (message.command === 'ask') {
                const userText = message.text;

                // Save user message
                this._currentMessages.push({
                    role: 'user',
                    text: userText
                });

                this._sendMessage('userMessage', userText);
                this._sendMessage('thinking', '🤔 Thinking...');

                try {
                    // Context ke saath prompt banao
                    const fullPrompt = `You are DevMentor AI, a friendly senior engineer mentor.
Chat history so far:
${this._currentMessages.map(m => `${m.role}: ${m.text}`).join('\n')}

Answer the latest user message in a helpful, friendly way.`;

                    const response = await callGeminiAPI(fullPrompt);

                    // Save AI response
                    this._currentMessages.push({
                        role: 'assistant',
                        text: response
                    });

                    // Save to file
                    this._saveChatToHistory(userText);

                    this._sendMessage('response', response);
                    this._loadHistoryList();

                } catch(e) {
                    this._sendMessage('error', e.message);
                }
            }

            // Load old chat
            if (message.command === 'loadChat') {
                const history = getHistory();
                const chat = history.find(c => c.id === message.chatId);
                if (chat) {
                    this._currentChatId = chat.id;
                    this._currentMessages = chat.messages || [];
                    this._sendMessage('loadChat', JSON.stringify(chat));
                }
            }

            // Delete chat
            if (message.command === 'deleteChat') {
                let history = getHistory();
                history = history.filter(c => c.id !== message.chatId);
                saveHistory(history);
                this._sendMessage('clearChat', '');
                this._currentChatId = Date.now().toString();
                this._currentMessages = [];
                this._loadHistoryList();
            }
        });
    }

    _saveChatToHistory(firstMessage) {
        const history = getHistory();
        const existing = history.findIndex(c => c.id === this._currentChatId);

        const chatData = {
            id: this._currentChatId,
            title: firstMessage.substring(0, 40) + '...',
            date: new Date().toLocaleDateString(),
            messages: this._currentMessages
        };

        if (existing >= 0) {
            history[existing] = chatData;
        } else {
            history.unshift(chatData);
        }

        saveHistory(history);
    }

    _loadHistoryList() {
        const history = getHistory();
        this._sendMessage('historyList', JSON.stringify(history));
    }

    _sendMessage(type, text) {
        if (this._view) {
            this._view.webview.postMessage({ type, text });
        }
    }

    updatePanel(title, message) {
        if (this._view) {
            // Auto detected message ko current chat mein add karo
            this._currentMessages.push({
                role: 'assistant',
                text: `**${title}**\n${message}`
            });
            this._sendMessage('autoDetect', JSON.stringify({ title, message }));
            this._saveChatToHistory(title);
            this._loadHistoryList();
        }
    }

    _getHtmlContent() {
        return `<!DOCTYPE html>
<html>
<head>
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
        font-family: sans-serif; 
        background: #1e1e1e; 
        color: #fff;
        display: flex;
        height: 100vh;
        overflow: hidden;
    }

    /* LEFT SIDEBAR - Chat History */
    #sidebar {
        width: 200px;
        background: #252526;
        display: flex;
        flex-direction: column;
        border-right: 1px solid #333;
        min-width: 200px;
    }
    #sidebar-header {
        padding: 10px;
        border-bottom: 1px solid #333;
    }
    #sidebar-header h3 {
        font-size: 12px;
        color: #888;
        margin-bottom: 8px;
        text-transform: uppercase;
    }
    #newChatBtn {
        width: 100%;
        background: #007acc;
        color: white;
        border: none;
        padding: 6px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
    }
    #newChatBtn:hover { background: #005a9e; }
    #historyList {
        flex: 1;
        overflow-y: auto;
        padding: 5px;
    }
    .chat-item {
        padding: 8px;
        border-radius: 4px;
        cursor: pointer;
        margin-bottom: 4px;
        position: relative;
        font-size: 11px;
    }
    .chat-item:hover { background: #2d2d2d; }
    .chat-item.active { background: #094771; }
    .chat-title {
        color: #ccc;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 140px;
    }
    .chat-date {
        color: #666;
        font-size: 10px;
        margin-top: 2px;
    }
    .delete-btn {
        position: absolute;
        right: 4px;
        top: 50%;
        transform: translateY(-50%);
        background: #c0392b;
        color: white;
        border: none;
        border-radius: 3px;
        padding: 2px 5px;
        cursor: pointer;
        font-size: 10px;
        display: none;
    }
    .chat-item:hover .delete-btn { display: block; }

    /* RIGHT - Main Chat */
    #main {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    #header {
        padding: 10px;
        border-bottom: 1px solid #333;
        background: #252526;
    }
    #header h2 {
        color: #007acc;
        font-size: 14px;
    }
    #messages {
        flex: 1;
        overflow-y: auto;
        padding: 10px;
    }
    .message {
        border-radius: 8px;
        padding: 10px;
        margin-bottom: 8px;
        font-size: 12px;
        line-height: 1.5;
    }
    .message.user {
        background: #0e4c8a;
        margin-left: 20px;
    }
    .message.mentor {
        background: #1e3a1e;
        border-left: 3px solid #4ec9b0;
        margin-right: 20px;
    }
    .message.auto {
        background: #3a2d00;
        border-left: 3px solid #ffd700;
        margin-right: 20px;
    }
    .message.error {
        background: #3a0000;
        border-left: 3px solid #ff4444;
    }
    .label {
        font-size: 10px;
        color: #888;
        margin-bottom: 4px;
    }
    #input-area {
        padding: 10px;
        border-top: 1px solid #333;
        display: flex;
        gap: 8px;
    }
    #userInput {
        flex: 1;
        background: #2d2d2d;
        border: 1px solid #444;
        color: #fff;
        padding: 8px;
        border-radius: 6px;
        font-size: 12px;
        resize: none;
        height: 55px;
    }
    #sendBtn {
        background: #007acc;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
    }
    #sendBtn:hover { background: #005a9e; }
    .welcome {
        color: #888;
        font-size: 12px;
        text-align: center;
        margin: 20px 0;
    }
    #emptyHistory {
        color: #555;
        font-size: 11px;
        text-align: center;
        padding: 20px 10px;
    }
</style>
</head>
<body>

    <!-- LEFT SIDEBAR -->
    <div id="sidebar">
        <div id="sidebar-header">
            <h3>💬 Chats</h3>
            <button id="newChatBtn">+ New Chat</button>
        </div>
        <div id="historyList">
            <p id="emptyHistory">Koi chat nahi hai abhi</p>
        </div>
    </div>

    <!-- MAIN CHAT -->
    <div id="main">
        <div id="header">
            <h2>🧠 DevMentor AI</h2>
        </div>
        <div id="messages">
            <p class="welcome">👋 Main hoon tera AI Mentor!<br>Code likho ya kuch puchho!</p>
        </div>
        <div id="input-area">
            <textarea id="userInput" placeholder="Kuch bhi puchho..."></textarea>
            <button id="sendBtn">Send</button>
        </div>
    </div>

<script>
    const vscode = acquireVsCodeApi();
    const messagesDiv = document.getElementById('messages');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const historyList = document.getElementById('historyList');
    const newChatBtn = document.getElementById('newChatBtn');
    let currentChatId = null;

    function addMessage(type, text, label) {
        const div = document.createElement('div');
        div.className = 'message ' + type;
        div.innerHTML = '<div class="label">' + label + '</div>' + 
            text.replace(/\\n/g, '<br>').replace(/\\*\\*(.*?)\\*\\*/g, '<b>$1</b>');
        messagesDiv.appendChild(div);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function clearMessages() {
        messagesDiv.innerHTML = '<p class="welcome">👋 Naya chat shuru karo!</p>';
    }

    // New Chat
    newChatBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'newChat' });
        clearMessages();
        currentChatId = null;
    });

    // Send message
    sendBtn.addEventListener('click', () => {
        const text = userInput.value.trim();
        if (!text) return;
        vscode.postMessage({ command: 'ask', text });
        userInput.value = '';
    });

    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendBtn.click();
        }
    });

    // Messages from extension
    window.addEventListener('message', (event) => {
        const msg = event.data;

        if (msg.type === 'userMessage') {
            addMessage('user', msg.text, '👤 Tu');
        }
        else if (msg.type === 'thinking') {
            addMessage('mentor', msg.text, '🧠 DevMentor');
        }
        else if (msg.type === 'response') {
            const last = messagesDiv.querySelector('.message.mentor:last-child');
            if (last && last.querySelector('.label').textContent === '🧠 DevMentor') {
                last.remove();
            }
            addMessage('mentor', msg.text, '🧠 DevMentor');
        }
        else if (msg.type === 'autoDetect') {
            const data = JSON.parse(msg.text);
            addMessage('auto', '<b>' + data.title + '</b><br>' + data.message, '⚡ Auto Detect');
        }
        else if (msg.type === 'error') {
            addMessage('error', msg.text, '❌ Error');
        }
        else if (msg.type === 'clearChat') {
            clearMessages();
        }
        else if (msg.type === 'historyList') {
            updateHistoryList(JSON.parse(msg.text));
        }
        else if (msg.type === 'loadChat') {
            const chat = JSON.parse(msg.text);
            currentChatId = chat.id;
            clearMessages();
            chat.messages.forEach(m => {
                if (m.role === 'user') addMessage('user', m.text, '👤 Tu');
                else addMessage('mentor', m.text, '🧠 DevMentor');
            });
        }
    });

    function updateHistoryList(history) {
        const emptyMsg = document.getElementById('emptyHistory');
        
        if (history.length === 0) {
            historyList.innerHTML = '<p id="emptyHistory">Koi chat nahi hai abhi</p>';
            return;
        }

        historyList.innerHTML = '';
        history.forEach(chat => {
            const div = document.createElement('div');
            div.className = 'chat-item' + (chat.id === currentChatId ? ' active' : '');
            div.innerHTML = \`
                <div class="chat-title">\${chat.title}</div>
                <div class="chat-date">\${chat.date}</div>
                <button class="delete-btn" data-id="\${chat.id}">🗑</button>
            \`;
            
            div.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-btn')) return;
                currentChatId = chat.id;
                document.querySelectorAll('.chat-item').forEach(i => i.classList.remove('active'));
                div.classList.add('active');
                vscode.postMessage({ command: 'loadChat', chatId: chat.id });
            });

            div.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                vscode.postMessage({ command: 'deleteChat', chatId: chat.id });
            });

            historyList.appendChild(div);
        });
    }
</script>
</body>
</html>`;
    }
}

let provider;

function activate(context) {

    // History file path set karo
    historyFilePath = path.join(context.globalStorageUri.fsPath, 'chat-history.json');
    
    // Folder banao agar exist nahi karta
    const dir = path.dirname(historyFilePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    provider = new DevMentorViewProvider(context.extensionUri, context);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'devmentor-sidebar',
            provider
        )
    );

    // Copy Paste Detect
    vscode.workspace.onDidChangeTextDocument(async (event) => {
        const changes = event.contentChanges;
        for (const change of changes) {
            if (change.text.length > 50) {
                const pastedCode = change.text.substring(0, 300);
                try {
                    const response = await callGeminiAPI(
                        `A junior developer just pasted this code: ${pastedCode}
As a mentor briefly explain: 1. What this code does 2. Any risks 3. One thing to learn. Be short and friendly.`
                    );
                    provider.updatePanel('📋 Copy Paste Detected!', response);
                } catch(e) {
                    console.log('API error:', e.message);
                }
            }
        }
    });

    // Technology Detection
    vscode.workspace.onDidChangeTextDocument(async (event) => {
        const text = event.document.getText();
        const technologies = ['mongodb', 'firebase', 'mysql', 'postgresql', 'react', 'angular', 'vue'];
        
        for (const tech of technologies) {
            if (text.toLowerCase().includes(tech)) {
                try {
                    const response = await callGeminiAPI(
                        `Junior developer is using ${tech}. As mentor explain: 1. When good choice 2. Trade-offs 3. One warning. Be short and friendly.`
                    );
                    provider.updatePanel('⚡ ' + tech + ' Detected!', response);
                } catch(e) {
                    console.log('API error:', e.message);
                }
                break;
            }
        }
    });

    // Manual Command
    let command = vscode.commands.registerCommand('devmentor-ai.analyze', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('Pehle koi file kholo!');
            return;
        }
        const code = editor.document.getText().substring(0, 500);
        try {
            const response = await callGeminiAPI(
                `Review this code as senior engineer mentor: ${code}
Explain: 1. What it does 2. Issues 3. Best practices. Be friendly.`
            );
            provider.updatePanel('🔍 Code Analysis', response);
        } catch(e) {
            console.log('API error:', e.message);
        }
    });

    context.subscriptions.push(command);
    vscode.window.showInformationMessage('DevMentor AI is now active! 🚀');
}

function deactivate() {}

module.exports = { activate, deactivate };