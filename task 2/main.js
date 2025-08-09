const conversations = [
    {
        wa_id: "1234567890",
        name: "John Smith",
        number: "+1 234 567 890",
        messages: [
            {
                id: 1,
                text: "Hey! How are you doing? 🚀",
                timestamp: "2024-01-15T10:30:00Z",
                from_me: false,
                status: "read"
            },
            {
                id: 2,
                text: "I'm doing amazing! Thanks for asking 😊✨",
                timestamp: "2024-01-15T10:32:00Z",
                from_me: true,
                status: "read"
            },
            {
                id: 3,
                text: "That's fantastic! Are we still meeting tomorrow? Can't wait! 🎉",
                timestamp: "2024-01-15T10:35:00Z",
                from_me: false,
                status: "read"
            },
            {
                id: 4,
                text: "Absolutely! See you at 2 PM at the new coffee place ☕️",
                timestamp: "2024-01-15T10:36:00Z",
                from_me: true,
                status: "delivered"
            }
        ]
    },
    {
        wa_id: "0987654321",
        name: "Sarah Johnson",
        number: "+1 098 765 4321",
        messages: [
            {
                id: 5,
                text: "Can you send me that amazing presentation from yesterday? 📊",
                timestamp: "2024-01-14T14:20:00Z",
                from_me: false,
                status: "read"
            },
            {
                id: 6,
                text: "Of course! Sending it over right now 🚀",
                timestamp: "2024-01-14T14:22:00Z",
                from_me: true,
                status: "sent"
            }
        ]
    },
    {
        wa_id: "1122334455",
        name: "Mike Wilson",
        number: "+1 112 233 4455",
        messages: [
            {
                id: 7,
                text: "Happy birthday! Hope your day is absolutely wonderful! 🎉🎂",
                timestamp: "2024-01-13T09:15:00Z",
                from_me: false,
                status: "read"
            },
            {
                id: 8,
                text: "Thank you so much! You made my day even brighter ❤️✨",
                timestamp: "2024-01-13T09:18:00Z",
                from_me: true,
                status: "read"
            }
        ]
    },
    {
        wa_id: "5566778899",
        name: "Emma Davis",
        number: "+1 556 677 8899",
        messages: [
            {
                id: 9,
                text: "The new project looks incredible! When do we start? 💼",
                timestamp: "2024-01-12T16:45:00Z",
                from_me: false,
                status: "read"
            },
            {
                id: 10,
                text: "Next Monday! Can't wait to work with you on this 🔥",
                timestamp: "2024-01-12T16:50:00Z",
                from_me: true,
                status: "read"
            }
        ]
    }
];

let currentChat = null;

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    }
}

function getStatusIcon(status) {
    const baseClasses = 'w-4 h-4 status-indicator';
    switch (status) {
        case 'sent':
            return `<svg class="${baseClasses} status-sent" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>`;
        case 'delivered':
            return `<svg class="${baseClasses} status-delivered" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/><path d="M20.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-1-1a1 1 0 011.414-1.414l.293.293 7.293-7.293a1 1 0 011.414 0z"/></svg>`;
        case 'read':
            return `<svg class="${baseClasses} status-read" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/><path d="M20.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-1-1a1 1 0 011.414-1.414l.293.293 7.293-7.293a1 1 0 011.414 0z"/></svg>`;
        default:
            return '';
    }
}

function getLastMessage(messages) {
    if (messages.length === 0) return '';
    const lastMessage = messages[messages.length - 1];
    return lastMessage.text.length > 35 ? 
        lastMessage.text.substring(0, 35) + '...' : 
        lastMessage.text;
}

function renderChatList() {
    const chatList = document.getElementById('chatList');
    chatList.innerHTML = '';

    conversations.forEach((conv, index) => {
        const lastMessage = conv.messages[conv.messages.length - 1];
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item flex items-center p-4 cursor-pointer';
        chatItem.style.animationDelay = `${index * 0.1}s`;
        chatItem.onclick = () => openChat(conv);

        chatItem.innerHTML = `
            <div class="w-14 h-14 avatar rounded-full flex items-center justify-center mr-4 flex-shrink-0 relative">
                <span class="text-white font-bold text-sm z-10 relative">${conv.name.split(' ').map(n => n[0]).join('')}</span>
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex justify-between items-center mb-1">
                    <h3 class="font-bold text-gray-800 truncate text-lg">${conv.name}</h3>
                    <span class="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">${formatDate(lastMessage.timestamp)}</span>
                </div>
                <p class="text-sm text-gray-600 truncate font-medium">${getLastMessage(conv.messages)}</p>
                <div class="flex items-center justify-between mt-2">
                    <div class="flex items-center space-x-1">
                        ${lastMessage.from_me ? getStatusIcon(lastMessage.status) : ''}
                    </div>
                    <div class="w-2 h-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full animate-pulse"></div>
                </div>
            </div>
        `;

        chatList.appendChild(chatItem);
    });
}

function openChat(conversation) {
    currentChat = conversation;
    
    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('chatArea').classList.remove('hidden');
    
    if (window.innerWidth < 768) {
        document.getElementById('sidebar').classList.add('hidden');
    }

    document.getElementById('chatName').textContent = conversation.name;
    document.getElementById('chatNumber').textContent = conversation.number;
    document.getElementById('chatAvatar').textContent = conversation.name.split(' ').map(n => n[0]).join('');

    renderMessages(conversation.messages);
}

function renderMessages(messages) {
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.innerHTML = '';

    let currentDate = '';

    messages.forEach((message, index) => {
        const messageDate = formatDate(message.timestamp);
        
        if (messageDate !== currentDate) {
            currentDate = messageDate;
            const dateSeparator = document.createElement('div');
            dateSeparator.className = 'flex justify-center my-6';
            dateSeparator.innerHTML = `
                <span class="date-pill px-4 py-2 rounded-full text-xs font-semibold text-gray-600 shadow-lg">
                    ${messageDate}
                </span>
            `;
            messagesContainer.appendChild(dateSeparator);
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `flex mb-6 ${message.from_me ? 'justify-end' : 'justify-start'}`;
        messageDiv.style.animationDelay = `${index * 0.1}s`;

        const bubbleClass = message.from_me 
            ? 'sent-bubble text-white rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl' 
            : 'received-bubble text-gray-800 rounded-tl-3xl rounded-tr-3xl rounded-br-3xl';

        messageDiv.innerHTML = `
            <div class="message-bubble ${bubbleClass} px-6 py-4 relative overflow-hidden">
                <p class="text-sm font-medium mb-2 leading-relaxed">${message.text}</p>
                <div class="flex items-center justify-end space-x-2">
                    <span class="text-xs font-medium opacity-80">${formatTime(message.timestamp)}</span>
                    ${message.from_me ? getStatusIcon(message.status) : ''}
                </div>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

document.getElementById('backButton').onclick = () => {
    document.getElementById('chatArea').classList.add('hidden');
    document.getElementById('welcomeScreen').classList.remove('hidden');
    document.getElementById('sidebar').classList.remove('hidden');
    currentChat = null;
};

function handleResize() {
    if (window.innerWidth >= 768) {
        document.getElementById('sidebar').classList.remove('hidden');
    } else if (currentChat) {
        document.getElementById('sidebar').classList.add('hidden');
    }
}

window.addEventListener('resize', handleResize);

const searchInput = document.querySelector('input[placeholder="Search conversations..."]');
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const chatItems = document.querySelectorAll('.chat-item');
    
    chatItems.forEach(item => {
        const name = item.querySelector('h3').textContent.toLowerCase();
        const message = item.querySelector('p').textContent.toLowerCase();
        
        if (name.includes(searchTerm) || message.includes(searchTerm)) {
            item.style.display = 'flex';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        } else {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            setTimeout(() => {
                if (item.style.opacity === '0') {
                    item.style.display = 'none';
                }
            }, 300);
        }
    });
});

const messageInput = document.querySelector('input[placeholder="Type your message..."]');
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && currentChat && messageInput.value.trim()) {
        const newMessage = {
            id: Date.now(),
            text: messageInput.value.trim(),
            timestamp: new Date().toISOString(),
            from_me: true,
            status: 'sent'
        };
        
        currentChat.messages.push(newMessage);
        renderMessages(currentChat.messages);
        messageInput.value = '';
        
        setTimeout(() => {
            newMessage.status = 'delivered';
            renderMessages(currentChat.messages);
        }, 1000);
        
        setTimeout(() => {
            newMessage.status = 'read';
            renderMessages(currentChat.messages);
        }, 2000);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    renderChatList();
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.message-bubble').forEach(bubble => {
        observer.observe(bubble);
    });
});

setInterval(() => {
    const dots = document.querySelectorAll('.typing-dot');
    dots.forEach((dot, index) => {
        setTimeout(() => {
            dot.style.transform = 'scale(1.2)';
            setTimeout(() => {
                dot.style.transform = 'scale(1)';
            }, 200);
        }, index * 100);
    });
}, 2000);

renderChatList();