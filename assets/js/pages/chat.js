import { ChatService } from '../assets/js/services/chat.js';
import { AuthService } from '../assets/js/services/auth.js';
import { NotificationsService } from '../assets/js/services/notifications.js';

export function renderChat(context) {
    const { user, couple } = context;
    
    return `
        <div class="bg-surface text-on-surface min-h-screen pb-32">
            <!-- TopNavBar -->
            <header class="fixed top-0 w-full z-50 flex justify-between items-center px-container-padding-mobile md:px-container-padding-desktop h-16 bg-surface/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(135,78,88,0.08)]">
                <div class="flex items-center gap-3">
                    <button class="p-1 hover:bg-primary-container/20 rounded-full transition-colors" data-page="dashboard">
                        <span class="material-symbols-outlined text-primary">arrow_back</span>
                    </button>
                    <div class="relative">
                        <div class="w-10 h-10 rounded-full overflow-hidden bg-primary-fixed flex items-center justify-center">
                            <img class="w-full h-full object-cover" alt="Partner avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIA-slOgGHU4bfBuo_3sWOQoPe3E4XsVDUISOq1Eb1uYQ17osCrov8bU0x09IFDJWS_7bKG0-WFoMXYhHHfBVY90_mrihEhkoiMRq1rpaHNKzSJ2Ow9SE6JVQxC1q_uybXjPMcushtYzty2auu57hUyPBchwNSCSjEqN9KE14V1QzPUWFW5c43pFMmwOhfo5iogbgLrsW4pHiPVQfr5GT71UEUWx5n3DOwC7SHqbxIXlYobAWpLvFba13Hzsju_54bvmFJtTN6szA" />
                        </div>
                        <div class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-surface rounded-full shadow-sm"></div>
                    </div>
                    <div>
                        <h1 class="text-headline-sm-mobile md:text-headline-sm font-headline-sm text-primary">Chat</h1>
                        <p class="text-[10px] uppercase tracking-wider font-bold text-secondary flex items-center gap-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                            My Person
                        </p>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <button class="p-2 text-on-surface-variant hover:bg-primary-container/20 transition-colors rounded-full active:scale-95 duration-200" data-page="profile">
                        <span class="material-symbols-outlined">favorite</span>
                    </button>
                    <button class="p-2 text-on-surface-variant hover:bg-primary-container/20 transition-colors rounded-full active:scale-95 duration-200" data-page="notifications">
                        <span class="material-symbols-outlined">notifications</span>
                    </button>
                </div>
            </header>
            
            <main class="pt-20 pb-32 min-h-screen max-w-2xl mx-auto px-4 md:px-0">
                <!-- Pinned Messages / Goals Section -->
                <div class="mb-6 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    <div class="flex-shrink-0 glass-card rounded-xl px-4 py-3 flex items-center gap-3 border-l-4 border-l-primary shadow-sm hover:translate-y-[-2px] transition-transform cursor-pointer">
                        <span class="material-symbols-outlined text-primary filled">push_pin</span>
                        <div>
                            <p class="text-label-sm font-label-sm text-on-surface-variant uppercase">Dinner Plan</p>
                            <p class="text-body-md font-body-md text-on-surface">Italian at 8 PM tonight? 🍝</p>
                        </div>
                    </div>
                    <div class="flex-shrink-0 glass-card rounded-xl px-4 py-3 flex items-center gap-3 border-l-4 border-l-secondary shadow-sm hover:translate-y-[-2px] transition-transform cursor-pointer">
                        <span class="material-symbols-outlined text-secondary filled">calendar_today</span>
                        <div>
                            <p class="text-label-sm font-label-sm text-on-surface-variant uppercase">Anniversary</p>
                            <p class="text-body-md font-body-md text-on-surface">14 days to go! ❤️</p>
                        </div>
                    </div>
                </div>
                
                <!-- Chat Messages -->
                <div class="space-y-6 flex flex-col" id="chat-messages">
                    <div class="flex justify-center my-4">
                        <span class="px-3 py-1 bg-surface-container rounded-full text-[10px] font-bold text-outline uppercase tracking-widest">Today</span>
                    </div>
                    
                    <!-- Messages will be rendered here -->
                    <div id="message-container"></div>
                    
                    <!-- Typing Indicator -->
                    <div class="flex items-center gap-2 mt-2 opacity-80 hidden" id="typing-indicator">
                        <div class="bg-surface-container-low px-4 py-3 rounded-full flex items-center gap-1.5 shadow-sm border border-surface-container">
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                        </div>
                        <span class="text-[10px] font-bold text-secondary uppercase tracking-wider">My Person is typing</span>
                    </div>
                </div>
            </main>
            
            <!-- Message Input Bar -->
            <div class="fixed bottom-0 left-0 w-full p-4 md:pb-8 bg-surface/80 backdrop-blur-2xl z-40">
                <div class="max-w-2xl mx-auto">
                    <div class="flex flex-col gap-3">
                        <!-- Action Row -->
                        <div class="flex items-center gap-4 px-2">
                            <button class="text-on-surface-variant hover:text-primary transition-colors attach-btn" data-type="image">
                                <span class="material-symbols-outlined">image</span>
                            </button>
                            <button class="text-on-surface-variant hover:text-primary transition-colors attach-btn" data-type="voice">
                                <span class="material-symbols-outlined">mic</span>
                            </button>
                            <button class="text-on-surface-variant hover:text-primary transition-colors emoji-btn">
                                <span class="material-symbols-outlined">mood</span>
                            </button>
                            <button class="text-on-surface-variant hover:text-primary transition-colors">
                                <span class="material-symbols-outlined">gif_box</span>
                            </button>
                        </div>
                        
                        <!-- Input Box -->
                        <div class="flex items-center gap-2">
                            <div class="flex-1 relative">
                                <input class="w-full bg-surface-container-lowest border-none rounded-full py-4 px-6 text-body-md shadow-[0_10px_30px_rgba(0,0,0,0.04)] focus:ring-2 focus:ring-primary-container placeholder:text-outline/50" id="message-input" placeholder="Message our story..." type="text" />
                            </div>
                            <button class="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(135,78,88,0.3)] hover:scale-105 active:scale-95 transition-all" id="send-message">
                                <span class="material-symbols-outlined filled">send</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- BottomNavBar -->
            <nav class="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-lg z-50 flex justify-around items-center p-2 bg-surface/60 backdrop-blur-2xl rounded-full shadow-[0_20px_50px_rgba(100,84,149,0.15)] border border-white/50">
                ${['home', 'favorite', 'photo_library', 'payments', 'person'].map((icon, i) => `
                    <a class="flex flex-col items-center justify-center ${i === 1 ? 'bg-primary-container text-on-primary-container rounded-full px-5 py-2' : 'text-on-surface-variant p-2 hover:bg-secondary-container/30 rounded-full'} transition-all active:scale-90 duration-300 cursor-pointer" data-page="${['dashboard', 'chat', 'gallery', 'finance', 'profile'][i]}">
                        <span class="material-symbols-outlined ${i === 1 ? 'filled' : ''}">${icon}</span>
                        <span class="font-label-sm text-label-sm">${['Home', 'Chat', 'Gallery', 'Finance', 'Profile'][i]}</span>
                    </a>
                `).join('')}
            </nav>
        </div>
    `;
}

export function initChat() {
    let messageSubscription = null;
    let typingChannel = null;
    let currentUser = null;
    let coupleId = null;
    
    // Initialize chat
    initChatSession();
    
    // Send message
    const sendBtn = document.getElementById('send-message');
    const input = document.getElementById('message-input');
    
    if (sendBtn && input) {
        const sendMessage = async () => {
            const content = input.value.trim();
            if (!content) return;
            
            try {
                const user = await AuthService.getCurrentUser();
                if (!user) return;
                
                // Get couple ID
                const profile = await AuthService.getProfile(user.id);
                if (!profile?.couple_id) return;
                
                // Send message
                const message = await ChatService.sendMessage(
                    profile.couple_id,
                    user.id,
                    content,
                    'text'
                );
                
                // Append message to UI
                appendMessage(message, user.id);
                input.value = '';
                
                // Notify partner
                await NotificationsService.notifyPartnerActivity(
                    profile.couple_id,
                    user.id,
                    'new_message'
                );
            } catch (error) {
                console.error('Error sending message:', error);
                showToast('Failed to send message. Please try again.', 'error');
            }
        };
        
        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // Typing indicator
        input.addEventListener('input', async () => {
            try {
                const user = await AuthService.getCurrentUser();
                if (!user) return;
                
                const profile = await AuthService.getProfile(user.id);
                if (!profile?.couple_id) return;
                
                if (input.value.length > 0) {
                    await ChatService.setTypingStatus(profile.couple_id, user.id, true);
                } else {
                    await ChatService.setTypingStatus(profile.couple_id, user.id, false);
                }
            } catch (error) {
                console.error('Typing indicator error:', error);
            }
        });
    }
    
    // Attach buttons
    document.querySelectorAll('.attach-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.dataset.type;
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = type === 'image' ? 'image/*' : 'audio/*';
            
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                try {
                    const user = await AuthService.getCurrentUser();
                    if (!user) return;
                    
                    const profile = await AuthService.getProfile(user.id);
                    if (!profile?.couple_id) return;
                    
                    let url;
                    if (type === 'image') {
                        url = await ChatService.uploadImageMessage(profile.couple_id, user.id, file);
                    } else {
                        url = await ChatService.uploadVoiceMessage(profile.couple_id, user.id, file);
                    }
                    
                    const message = await ChatService.sendMessage(
                        profile.couple_id,
                        user.id,
                        url,
                        type
                    );
                    
                    appendMessage(message, user.id);
                    showToast(`${type} sent successfully!`, 'success');
                } catch (error) {
                    console.error(`Error sending ${type}:`, error);
                    showToast(`Failed to send ${type}.`, 'error');
                }
            };
            
            input.click();
        });
    });
    
    // Emoji button
    const emojiBtn = document.querySelector('.emoji-btn');
    if (emojiBtn) {
        emojiBtn.addEventListener('click', function() {
            // Simple emoji picker - in production, use a proper emoji picker library
            const emojis = ['❤️', '😊', '🥰', '😂', '😍', '✨', '💕', '🌟', '🎉', '💖'];
            const picker = document.createElement('div');
            picker.className = 'fixed bottom-28 left-1/2 -translate-x-1/2 glass-card p-4 rounded-xl flex flex-wrap gap-2 max-w-[300px] z-50';
            picker.innerHTML = emojis.map(e => 
                `<button class="w-10 h-10 hover:bg-surface-container rounded-lg text-2xl transition-colors">${e}</button>`
            ).join('');
            
            document.body.appendChild(picker);
            
            picker.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', function() {
                    const input = document.getElementById('message-input');
                    if (input) {
                        input.value += this.textContent;
                        input.focus();
                    }
                    picker.remove();
                });
            });
            
            // Close picker on outside click
            setTimeout(() => {
                document.addEventListener('click', function closePicker(e) {
                    if (!picker.contains(e.target) && e.target !== emojiBtn) {
                        picker.remove();
                        document.removeEventListener('click', closePicker);
                    }
                });
            }, 100);
        });
    }
}

async function initChatSession() {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) return;
        
        currentUser = user;
        const profile = await AuthService.getProfile(user.id);
        if (!profile?.couple_id) return;
        
        coupleId = profile.couple_id;
        
        // Load messages
        await loadMessages(coupleId);
        
        // Subscribe to new messages
        messageSubscription = ChatService.subscribeToMessages(coupleId, (message) => {
            appendMessage(message, user.id);
        });
        
        // Subscribe to typing indicators
        typingChannel = ChatService.subscribeToTyping(coupleId, (data) => {
            const indicator = document.getElementById('typing-indicator');
            if (data.user_id !== user.id) {
                if (data.is_typing) {
                    indicator.classList.remove('hidden');
                } else {
                    indicator.classList.add('hidden');
                }
            }
        });
        
        // Mark messages as read
        markMessagesAsRead(coupleId, user.id);
    } catch (error) {
        console.error('Error initializing chat:', error);
    }
}

async function loadMessages(coupleId) {
    try {
        const messages = await ChatService.getMessages(coupleId, 50);
        const container = document.getElementById('message-container');
        if (!container) return;
        
        const user = await AuthService.getCurrentUser();
        if (!user) return;
        
        container.innerHTML = messages.map(msg => 
            createMessageHTML(msg, user.id)
        ).join('');
        
        // Scroll to bottom
        const chatContainer = document.querySelector('.space-y-6');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

function createMessageHTML(message, userId) {
    const isOwn = message.user_id === userId;
    const time = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let content = message.content;
    if (message.type === 'image') {
        content = `<img src="${message.content}" alt="Image message" class="max-w-[200px] rounded-lg" />`;
    } else if (message.type === 'voice') {
        content = `<audio controls class="w-full max-w-[200px]"><source src="${message.content}" /></audio>`;
    }
    
    return `
        <div class="flex flex-col ${isOwn ? 'items-end self-end' : 'items-start'} max-w-[85%]">
            <div class="${isOwn ? 'user-bubble bg-white border border-surface-container-high' : 'partner-bubble bg-secondary-fixed'} px-5 py-3 rounded-lg shadow-[0_4px_12px_rgba(100,84,149,0.08)] relative group">
                ${content}
                ${!isOwn ? `
                    <div class="absolute -bottom-3 -right-2 bg-surface px-1.5 py-0.5 rounded-full shadow-sm text-sm border border-outline-variant scale-90">
                        ❤️
                    </div>
                ` : ''}
            </div>
            <div class="flex items-center gap-1 mt-1 ${isOwn ? 'mr-1' : 'ml-1'}">
                <span class="text-[10px] text-outline font-medium">${time}</span>
                ${isOwn ? `<span class="material-symbols-outlined text-primary text-[14px] filled">done_all</span>` : ''}
            </div>
        </div>
    `;
}

function appendMessage(message, userId) {
    const container = document.getElementById('message-container');
    if (!container) return;
    
    const html = createMessageHTML(message, userId);
    container.insertAdjacentHTML('beforeend', html);
    
    // Scroll to bottom
    const chatContainer = document.querySelector('.space-y-6');
    if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

async function markMessagesAsRead(coupleId, userId) {
    try {
        const messages = await ChatService.getMessages(coupleId, 50);
        const unread = messages
            .filter(m => m.user_id !== userId && !m.read_at)
            .map(m => m.id);
        
        if (unread.length > 0) {
            await ChatService.markAsRead(unread, userId);
        }
    } catch (error) {
        console.error('Error marking messages as read:', error);
    }
}

function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();
    
    const colors = {
        success: 'bg-green-500',
        error: 'bg-error',
        info: 'bg-primary'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast-notification fixed top-20 left-1/2 -translate-x-1/2 z-[999] px-6 py-3 rounded-xl text-white font-label-md shadow-lg ${colors[type] || colors.info} animate-slide-up max-w-[90%]`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
