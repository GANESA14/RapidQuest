let processedMessages = JSON.parse(localStorage.getItem('whatsapp_messages') || '[]');
let currentContact = 'Demo Contact';

const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const chatMessages = document.getElementById('chatMessages');
const charCount = document.getElementById('charCount');

const mobileMessageInput = document.getElementById('mobileMessageInput');
const mobileSendButton = document.getElementById('mobileSendButton');
const mobileChat = document.getElementById('mobileChat');
const mobileChatMessages = document.getElementById('mobileChatMessages');

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
}

function saveToDatabase(message) {
    processedMessages.push(message);
    localStorage.setItem('whatsapp_messages', JSON.stringify(processedMessages));
}

function addMessageToUI(message, isDesktop = true) {
    const container = isDesktop ? chatMessages : mobileChatMessages;
    const messagesContainer = container.querySelector('.space-y-4') || container;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex justify-end';
    
    const messageBubble = document.createElement('div');
    messageBubble.className = 'message-bubble max-w-xs lg:max-w-md bg-green-500 text-white rounded-lg p-3 shadow-lg';
    
    const messageText = document.createElement('p');
    messageText.textContent = message.text;
    
    const messageTime = document.createElement('div');
    messageTime.className = 'text-xs text-green-100 mt-1 flex items-center justify-end space-x-1';
    messageTime.innerHTML = `
        <span>${formatTime(message.timestamp)}</span>
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
        </svg>
        <svg class="w-3 h-3 -ml-1" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
        </svg>
    `;
    
    messageBubble.appendChild(messageText);
    messageBubble.appendChild(messageTime);
    messageDiv.appendChild(messageBubble);
    messagesContainer.appendChild(messageDiv);
    
    container.scrollTop = container.scrollHeight;
}

function sendMessage(inputElement, isDesktop = true) {
    const text = inputElement.value.trim();
    if (!text) return;
    
    const message = {
        id: Date.now(),
        text: text,
        timestamp: new Date(),
        contact: currentContact,
        sender: 'me'
    };
    
    saveToDatabase(message);
    addMessageToUI(message, isDesktop);
    
    inputElement.value = '';
    updateSendButton(isDesktop);
    
    if (isDesktop) {
        charCount.textContent = '0/1000';
    }
    
    setTimeout(() => {
        const responses = [
            "That's interesting! 🤔",
            "Thanks for sharing! 😊",
            "Got it! 👍",
            "Sounds good to me!",
            "I'll check that out later.",
            "Perfect timing! ⏰",
            "Thanks for the update! 📱"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const responseMessage = {
            id: Date.now() + 1,
            text: randomResponse,
            timestamp: new Date(),
            contact: currentContact,
            sender: 'contact'
        };
        
        saveToDatabase(responseMessage);
        addContactMessageToUI(responseMessage, isDesktop);
    }, 1000 + Math.random() * 2000);
}

function addContactMessageToUI(message, isDesktop = true) {
    const container = isDesktop ? chatMessages : mobileChatMessages;
    const messagesContainer = container.querySelector('.space-y-4') || container;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex justify-start';
    
    const messageBubble = document.createElement('div');
    messageBubble.className = 'message-bubble max-w-xs lg:max-w-md bg-white rounded-lg p-3 shadow-sm';
    
    const messageText = document.createElement('p');
    messageText.className = 'text-gray-800';
    messageText.textContent = message.text;
    
    const messageTime = document.createElement('div');
    messageTime.className = 'text-xs text-gray-500 mt-1';
    messageTime.textContent = formatTime(message.timestamp);
    
    messageBubble.appendChild(messageText);
    messageBubble.appendChild(messageTime);
    messageDiv.appendChild(messageBubble);
    messagesContainer.appendChild(messageDiv);
    
    container.scrollTop = container.scrollHeight;
}

function updateSendButton(isDesktop = true) {
    const input = isDesktop ? messageInput : mobileMessageInput;
    const button = isDesktop ? sendButton : mobileSendButton;
    
    if (input.value.trim()) {
        button.disabled = false;
        button.classList.remove('opacity-50');
    } else {
        button.disabled = true;
        button.classList.add('opacity-50');
    }
}

function selectContact(element, name, status) {
    document.querySelectorAll('.contact-item').forEach(item => {
        item.classList.remove('border-l-4', 'border-green-500', 'bg-green-50');
    });
    
    element.classList.add('border-l-4', 'border-green-500', 'bg-green-50');
    currentContact = name;
    
    if (window.innerWidth >= 768) {
        document.getElementById('noChat').style.display = 'none';
        document.querySelector('.flex-col.flex-1.bg-gray-50').style.display = 'flex';
        
        document.querySelector('#chatHeader h2').textContent = name;
        document.querySelector('#chatHeader p').textContent = status;
        document.querySelector('#chatHeader .rounded-full span').textContent = name.split(' ').map(n => n[0]).join('');
    } else {
        document.getElementById('mobileChatName').textContent = name;
        document.getElementById('mobileChatStatus').textContent = status;
        document.getElementById('mobileChatInitials').textContent = name.split(' ').map(n => n[0]).join('');
        
        mobileChat.classList.remove('translate-x-full');
    }
}

function closeMobileChat() {
    mobileChat.classList.add('translate-x-full');
}

messageInput.addEventListener('input', (e) => {
    const length = e.target.value.length;
    charCount.textContent = `${length}/1000`;
    updateSendButton(true);
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(messageInput, true);
    }
});

sendButton.addEventListener('click', () => {
    sendMessage(messageInput, true);
});

mobileMessageInput.addEventListener('input', () => {
    updateSendButton(false);
});

mobileMessageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(mobileMessageInput, false);
    }
});

mobileSendButton.addEventListener('click', () => {
    sendMessage(mobileMessageInput, false);
});

document.querySelectorAll('.contact-item').forEach(item => {
    item.addEventListener('click', () => {
        if (window.innerWidth < 768) {
            const name = item.querySelector('h3').textContent;
            const status = item.querySelector('p').textContent === 'Click to start messaging...' ? 'online' : 'last seen recently';
            selectContact(item, name, status);
        }
    });
});

window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
        mobileChat.classList.add('translate-x-full');
    }
});

if (window.innerWidth >= 768) {
    document.getElementById('noChat').style.display = 'flex';
    document.querySelector('.flex-col.flex-1.bg-gray-50').style.display = 'none';
}

const welcomeMessages = [
    { text: "Welcome to WhatsApp Web demo! 👋", delay: 0 },
    { text: "This is a fully functional messaging interface", delay: 2000 },
    { text: "Try sending a message to see it in action! 🚀", delay: 4000 }
];

setTimeout(() => {
    welcomeMessages.forEach((msg, index) => {
        setTimeout(() => {
            const message = {
                id: Date.now() + index,
                text: msg.text,
                timestamp: new Date(),
                contact: currentContact,
                sender: 'contact'
            };
            
            saveToDatabase(message);
            addContactMessageToUI(message, true);
            addContactMessageToUI(message, false);
        }, msg.delay);
    });
}, 1000);

document.addEventListener('click', (e) => {
    if (e.target.closest('.emoji-hover')) {
        e.target.style.transform = 'scale(1.1)';
        setTimeout(() => {
            e.target.style.transform = '';
        }, 150);
    }
});