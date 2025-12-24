// Configuration
const GEMINI_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual API key
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

// State management
let currentConversationId = null;
let conversations = JSON.parse(localStorage.getItem('conversations')) || [];
let isGenerating = false;
let abortController = null;

// DOM Elements
const chatContainer = document.getElementById('chat-container');
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const sidebar = document.getElementById('sidebar');
const conversationsList = document.getElementById('conversations-list');
const newChatBtn = document.getElementById('new-chat-btn');
const clearChatBtn = document.getElementById('clear-chat-btn');
const themeToggle = document.getElementById('theme-toggle');
const welcomeMessage = document.getElementById('welcome-message');
const rateLimitAlert = document.getElementById('rate-limit-alert');
const closeAlertBtn = document.getElementById('close-alert');
const alertOkBtn = document.getElementById('alert-ok');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadConversations();
    setupEventListeners();
    checkThemePreference();
    
    // Load last conversation if exists
    if (conversations.length > 0) {
        loadConversation(conversations[0].id);
    }
});

// Event Listeners
function setupEventListeners() {
    // Send message on button click
    sendButton.addEventListener('click', sendMessage);
    
    // Send message on Enter (but allow Shift+Enter for new line)
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Auto-resize textarea
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 200) + 'px';
    });
    
    // New chat button
    newChatBtn.addEventListener('click', createNewConversation);
    
    // Clear chat button
    clearChatBtn.addEventListener('click', clearCurrentChat);
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Example prompts
    document.querySelectorAll('.example-prompt').forEach(button => {
        button.addEventListener('click', (e) => {
            messageInput.value = e.target.textContent;
            messageInput.focus();
            sendMessage();
        });
    });
    
    // Rate limit alert buttons
    closeAlertBtn.addEventListener('click', hideRateLimitAlert);
    alertOkBtn.addEventListener('click', hideRateLimitAlert);
}

// Theme Management
function checkThemePreference() {
    const isDark = localStorage.getItem('theme') === 'dark' || 
                  (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
        document.documentElement.classList.add('dark');
        themeToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>';
    } else {
        themeToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>';
    }
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    if (isDark) {
        themeToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>';
    } else {
        themeToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>';
    }
}

// Conversation Management
function createNewConversation() {
    const newId = Date.now().toString();
    const newConversation = {
        id: newId,
        title: 'New Chat',
        messages: []
    };
    
    conversations.unshift(newConversation);
    saveConversations();
    loadConversation(newId);
    updateConversationsList();
}

function loadConversation(id) {
    currentConversationId = id;
    const conversation = conversations.find(conv => conv.id === id);
    
    if (!conversation) return;
    
    // Update conversation title if it's still "New Chat"
    if (conversation.title === 'New Chat' && conversation.messages.length > 0) {
        const firstMessage = conversation.messages[0].content;
        conversation.title = firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage;
        saveConversations();
        updateConversationsList();
    }
    
    // Render messages
    renderMessages(conversation.messages);
    updateConversationsList();
    
    // Hide welcome message if there are messages
    welcomeMessage.classList.toggle('hidden', conversation.messages.length > 0);
    
    // Focus input
    setTimeout(() => {
        messageInput.focus();
    }, 100);
}

function clearCurrentChat() {
    if (!currentConversationId) return;
    
    const conversation = conversations.find(conv => conv.id === currentConversationId);
    if (conversation) {
        conversation.messages = [];
        saveConversations();
        renderMessages([]);
        welcomeMessage.classList.remove('hidden');
        messageInput.value = '';
        messageInput.style.height = 'auto';
    }
}

function deleteConversation(id) {
    conversations = conversations.filter(conv => conv.id !== id);
    saveConversations();
    
    if (currentConversationId === id) {
        if (conversations.length > 0) {
            loadConversation(conversations[0].id);
        } else {
            createNewConversation();
        }
    }
    
    updateConversationsList();
}

function saveConversations() {
    localStorage.setItem('conversations', JSON.stringify(conversations));
}

function loadConversations() {
    conversations = JSON.parse(localStorage.getItem('conversations')) || [];
    updateConversationsList();
}

function updateConversationsList() {
    conversationsList.innerHTML = '';
    
    conversations.forEach(conv => {
        const convElement = document.createElement('div');
        convElement.className = `sidebar-item flex items-center gap-3 p-3 rounded-lg cursor-pointer ${currentConversationId === conv.id ? 'active' : ''}`;
        convElement.innerHTML = `
            <div class="w-2 h-2 rounded-full bg-primary-500"></div>
            <div class="flex-1 min-w-0">
                <p class="font-medium truncate">${conv.title}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">${formatDate(conv.messages[0]?.timestamp || conv.id)}</p>
            </div>
            <button class="delete-conv p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" data-id="${conv.id}">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        `;
        
        convElement.addEventListener('click', () => loadConversation(conv.id));
        convElement.querySelector('.delete-conv').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteConversation(conv.id);
        });
        
        conversationsList.appendChild(convElement);
    });
}

// Message Handling
function renderMessages(messages) {
    messagesContainer.innerHTML = '';
    
    messages.forEach((msg, index) => {
        const messageElement = createMessageElement(msg, index);
        messagesContainer.appendChild(messageElement);
    });
    
    scrollToBottom();
}

function createMessageElement(message, index) {
    const isUser = message.role === 'user';
    const messageElement = document.createElement('div');
    messageElement.className = `message-bubble flex ${isUser ? 'justify-end' : 'justify-start'}`;
    
    const bubble = document.createElement('div');
    bubble.className = `max-w-[85%] md:max-w-[70%] rounded-2xl p-4 ${isUser ? 'bg-primary-500 text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-800 rounded-bl-none'}`;
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    // Handle different content types
    if (message.type === 'text') {
        content.innerHTML = renderMarkdown(message.content);
    } else if (message.type === 'code') {
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.className = `language-${message.language || 'plaintext'}`;
        code.textContent = message.content;
        pre.appendChild(code);
        content.appendChild(pre);
        hljs.highlightElement(code);
    } else if (message.type === 'image') {
        const img = document.createElement('img');
        img.src = message.content;
        img.alt = 'Generated image';
        content.appendChild(img);
    }
    
    // Add copy button for AI responses
    if (!isUser) {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'mt-2 text-xs flex items-center gap-1 text-primary-500 hover:text-primary-600';
        copyBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
        `;
        copyBtn.addEventListener('click', () => copyToClipboard(message.content));
        content.appendChild(copyBtn);
    }
    
    bubble.appendChild(content);
    messageElement.appendChild(bubble);
    
    return messageElement;
}

function renderMarkdown(text) {
    // Configure marked
    marked.setOptions({
        breaks: true,
        gfm: true,
        highlight: function(code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        }
    });
    
    return marked.parse(text);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show feedback
        const copyBtn = document.querySelector('.text-primary-500');
        if (copyBtn) {
            copyBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Copied!
            `;
            setTimeout(() => {
                copyBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                `;
            }, 2000);
        }
    });
}

// API Communication
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || isGenerating) return;
    
    // Disable input during generation
    isGenerating = true;
    sendButton.disabled = true;
    messageInput.disabled = true;
    
    // Add user message to conversation
    const userMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        type: 'text'
    };
    
    addMessageToConversation(userMessage);
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Create AI message placeholder
    const aiMessagePlaceholder = {
        role: 'model',
        content: '',
        timestamp: new Date().toISOString(),
        type: 'text'
    };
    
    addMessageToConversation(aiMessagePlaceholder);
    renderTypingIndicator();
    
    // Create abort controller for cancellation
    abortController = new AbortController();
    
    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: message }]
                    }
                ],
                safetySettings: [
                    {
                        category: 'HARM_CATEGORY_HARASSMENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_HATE_SPEECH',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    }
                ]
            }),
            signal: abortController.signal
        });
        
        if (!response.ok) {
            if (response.status === 429) {
                showRateLimitAlert();
                removeTypingIndicator();
                return;
            }
            
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;
        
        // Update AI message with actual response
        const conversation = conversations.find(conv => conv.id === currentConversationId);
        if (conversation) {
            const lastMessage = conversation.messages[conversation.messages.length - 1];
            lastMessage.content = aiResponse;
            saveConversations();
            renderMessages(conversation.messages);
        }
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Error:', error);
            // Update AI message with error
            const conversation = conversations.find(conv => conv.id === currentConversationId);
            if (conversation) {
                const lastMessage = conversation.messages[conversation.messages.length - 1];
                lastMessage.content = "Sorry, I encountered an error. Please try again.";
                saveConversations();
                renderMessages(conversation.messages);
            }
        }
    } finally {
        isGenerating = false;
        sendButton.disabled = false;
        messageInput.disabled = false;
        removeTypingIndicator();
        messageInput.focus();
    }
}

function addMessageToConversation(message) {
    const conversation = conversations.find(conv => conv.id === currentConversationId);
    if (conversation) {
        conversation.messages.push(message);
        saveConversations();
        
        // Update conversation title if it's the first message
        if (conversation.messages.length === 1) {
            conversation.title = message.content.length > 30 ? 
                message.content.substring(0, 30) + '...' : 
                message.content;
            saveConversations();
            updateConversationsList();
        }
    }
}

function renderTypingIndicator() {
    const typingElement = document.createElement('div');
    typingElement.id = 'typing-indicator';
    typingElement.className = 'flex justify-start mb-6';
    typingElement.innerHTML = `
        <div class="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-none p-4">
            <div class="flex space-x-1">
                <div class="typing-dot bg-gray-500 dark:bg-gray-400"></div>
                <div class="typing-dot bg-gray-500 dark:bg-gray-400"></div>
                <div class="typing-dot bg-gray-500 dark:bg-gray-400"></div>
            </div>
        </div>
    `;
    messagesContainer.appendChild(typingElement);
    scrollToBottom();
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// UI Helpers
function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function showRateLimitAlert() {
    rateLimitAlert.classList.remove('hidden');
}

function hideRateLimitAlert() {
    rateLimitAlert.classList.add('hidden');
}