
let processedMessages = [];
let totalCount = 0;
let processedCount = 0;
let errorCount = 0;

function showNotification(type, title, message) {
    const notification = document.getElementById('notification');
    const icon = document.getElementById('notificationIcon');
    const titleEl = document.getElementById('notificationTitle');
    const messageEl = document.getElementById('notificationMessage');
    
    const config = {
        success: { bg: 'bg-green-500', icon: '✅', border: 'border-green-500' },
        error: { bg: 'bg-red-500', icon: '❌', border: 'border-red-500' },
        info: { bg: 'bg-blue-500', icon: 'ℹ️', border: 'border-blue-500' },
        warning: { bg: 'bg-yellow-500', icon: '⚠️', border: 'border-yellow-500' }
    };
    
    const style = config[type] || config.info;
    icon.className = `w-8 h-8 rounded-full flex items-center justify-center ${style.bg} text-white`;
    icon.textContent = style.icon;
    titleEl.textContent = title;
    messageEl.textContent = message;
    notification.querySelector('div').className = `bg-white rounded-2xl shadow-2xl p-4 min-w-80 border-l-4 ${style.border}`;
    
    notification.classList.remove('translate-x-full');
    setTimeout(() => notification.classList.add('translate-x-full'), 4000);
}

function updateCounters() {
    document.getElementById('totalMessages').textContent = totalCount;
    document.getElementById('processedCount').textContent = processedCount;
    document.getElementById('errorCount').textContent = errorCount;
}

function updateProgress(current, total, status) {
    const progressSection = document.getElementById('progressSection');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    progressSection.classList.remove('hidden');
    const percentage = (current / total) * 100;
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${status} (${current}/${total})`;
    
    if (current === total) {
        setTimeout(() => progressSection.classList.add('hidden'), 2000);
    }
}

function renderMessage(message, index) {
    const statusColors = {
        sent: 'text-yellow-400 bg-yellow-400',
        delivered: 'text-blue-400 bg-blue-400',
        read: 'text-green-400 bg-green-400',
        error: 'text-red-400 bg-red-400'
    };

    const statusColor = statusColors[message.status] || statusColors.error;
    
    return `
        <div class="message-card bg-white bg-opacity-10 rounded-2xl p-6 slide-in" style="animation-delay: ${index * 0.1}s">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            ${message.from ? message.from.slice(-2) : 'WA'}
                        </div>
                        <div>
                            <h4 class="font-bold text-white text-lg">${message.contact_name || 'Unknown User'}</h4>
                            <p class="text-blue-200 text-sm">${message.from || 'No phone number'}</p>
                        </div>
                    </div>
                    <div class="bg-white bg-opacity-20 rounded-xl p-4 mb-3">
                        <p class="text-white font-medium">${message.text_body || 'No message content'}</p>
                    </div>
                    <div class="flex flex-wrap gap-2 text-sm">
                        <span class="bg-purple-500 bg-opacity-30 text-purple-200 px-3 py-1 rounded-full">
                            📱 ${message.type || 'text'}
                        </span>
                        <span class="bg-blue-500 bg-opacity-30 text-blue-200 px-3 py-1 rounded-full">
                            🕐 ${new Date(parseInt(message.timestamp) * 1000).toLocaleString()}
                        </span>
                        <span class="bg-gray-500 bg-opacity-30 text-gray-200 px-3 py-1 rounded-full">
                            🆔 ${message.message_id?.slice(-8) || 'N/A'}
                        </span>
                    </div>
                </div>
                <div class="flex flex-col items-center gap-3">
                    <div class="flex items-center gap-2">
                        <div class="${statusColor.split(' ')[1]} bg-opacity-20 w-3 h-3 rounded-full animate-pulse"></div>
                        <span class="${statusColor.split(' ')[0]} font-bold capitalize">${message.status}</span>
                    </div>
                    <button onclick="updateMessageStatus('${message.message_id}', 'delivered')" 
                            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm transition-colors duration-300">
                        Update Status
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderMessages() {
    const messagesList = document.getElementById('messagesList');
    if (processedMessages.length === 0) {
        messagesList.innerHTML = `
            <div class="text-center text-white text-lg opacity-70 py-8">
                No messages processed yet. Click "Process Webhooks" to start!
            </div>
        `;
        return;
    }
    
    messagesList.innerHTML = processedMessages
        .slice(0, 50)
        .map((message, index) => renderMessage(message, index))
        .join('');
}

async function processWebhooks() {
    const jsonPath = document.getElementById('jsonPath').value;
    const mongoUri = document.getElementById('mongoUri').value;
    
    if (!jsonPath) {
        showNotification('warning', 'Input Required', 'Please enter the JSON files path');
        return;
    }
    
    showNotification('info', 'Processing Started', 'Reading webhook payloads...');
    
    try {
        const samplePayloads = [
            {
                "_id": "conv1-msg1-user",
                "metaData": {
                    "entry": [{
                        "changes": [{
                            "field": "messages",
                            "value": {
                                "contacts": [{ "profile": { "name": "Ravi Kumar" }, "wa_id": "919937320320" }],
                                "messages": [{
                                    "from": "919937320320",
                                    "id": "wamid.HBgMOTE5OTY3NTc4NzIwFQIAEhggMTIzQURFRjEyMzQ1Njc4OTA=",
                                    "timestamp": "1754400000",
                                    "text": { "body": "Hi, I'd like to know more about your services." },
                                    "type": "text"
                                }]
                            }
                        }]
                    }]
                }
            },
            {
                "_id": "conv2-msg2-user",
                "metaData": {
                    "entry": [{
                        "changes": [{
                            "field": "messages",
                            "value": {
                                "contacts": [{ "profile": { "name": "Priya Sharma" }, "wa_id": "918765432109" }],
                                "messages": [{
                                    "from": "918765432109",
                                    "id": "wamid.ABcDeFgHiJkLmNoPqRsTuVwXyZ123456789=",
                                    "timestamp": "1754400060",
                                    "text": { "body": "Can you send me the pricing details?" },
                                    "type": "text"
                                }]
                            }
                        }]
                    }]
                }
            },
            {
                "_id": "conv3-msg3-user",
                "metaData": {
                    "entry": [{
                        "changes": [{
                            "field": "messages",
                            "value": {
                                "contacts": [{ "profile": { "name": "Amit Patel" }, "wa_id": "917890123456" }],
                                "messages": [{
                                    "from": "917890123456",
                                    "id": "wamid.XyZaBcDeFgHiJkLmNoPqRsTuV987654321=",
                                    "timestamp": "1754400120",
                                    "text": { "body": "Is your support available 24/7?" },
                                    "type": "text"
                                }]
                            }
                        }]
                    }]
                }
            }
        ];

        totalCount = samplePayloads.length;
        updateCounters();

        for (let i = 0; i < samplePayloads.length; i++) {
            const payload = samplePayloads[i];
            updateProgress(i + 1, totalCount, `Processing payload ${i + 1}`);
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            try {
                if (payload.metaData?.entry?.[0]?.changes?.[0]?.value?.messages) {
                    const messages = payload.metaData.entry[0].changes[0].value.messages;
                    const contacts = payload.metaData.entry[0].changes[0].value.contacts || [];
                    
                    messages.forEach(msg => {
                        const contact = contacts.find(c => c.wa_id === msg.from);
                        const processedMsg = {
                            message_id: msg.id,
                            from: msg.from,
                            contact_name: contact?.profile?.name || 'Unknown User',
                            text_body: msg.text?.body || '',
                            type: msg.type,
                            timestamp: msg.timestamp,
                            status: 'sent',
                            created_at: new Date().toISOString(),
                            payload_id: payload._id
                        };
                        
                        processedMessages.unshift(processedMsg);
                        processedCount++;
                    });
                }
            } catch (err) {
                console.error('Error processing payload:', err);
                errorCount++;
            }
        }
        
        updateCounters();
        renderMessages();
        showNotification('success', 'Processing Complete!', `Processed ${processedCount} messages successfully`);
        
    } catch (error) {
        console.error('Processing error:', error);
        errorCount++;
        updateCounters();
        showNotification('error', 'Processing Failed', error.message);
    }
}

async function updateStatuses() {
    if (processedMessages.length === 0) {
        showNotification('warning', 'No Messages', 'No messages to update status for');
        return;
    }

    showNotification('info', 'Updating Statuses', 'Processing status updates...');

    const statuses = ['delivered', 'read'];
    let updateCount = 0;

    for (let i = 0; i < Math.min(processedMessages.length, 10); i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        processedMessages[i].status = randomStatus;
        processedMessages[i].updated_at = new Date().toISOString();
        updateCount++;
        
        updateProgress(i + 1, Math.min(processedMessages.length, 10), `Updating message ${i + 1}`);
    }

    renderMessages();
    showNotification('success', 'Status Updated!', `Updated ${updateCount} message statuses`);
}

function updateMessageStatus(messageId, newStatus) {
    const message = processedMessages.find(msg => msg.message_id === messageId);
    if (message) {
        message.status = newStatus;
        message.updated_at = new Date().toISOString();
        renderMessages();
        showNotification('success', 'Status Updated', `Message status changed to ${newStatus}`);
    }
}

function clearData() {
    if (confirm('Are you sure you want to clear all processed messages?')) {
        processedMessages = [];
        totalCount = 0;
        processedCount = 0;
        errorCount = 0;
        updateCounters();
        renderMessages();
        showNotification('info', 'Data Cleared', 'All messages have been removed');
    }
}

document.getElementById('jsonPath').value = '/path/to/webhook/json/files';
document.getElementById('mongoUri').value = 'mongodb://localhost:27017/whatsapp';