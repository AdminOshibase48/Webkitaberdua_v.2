// ========================================
// COUPLE DASHBOARD - FINAL VERSION
// ========================================

// Inisialisasi Supabase
const _supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global state (gunakan window object untuk menghindari konflik)
window.appState = {
    currentUser: null,
    currentCouple: null,
    currentPartner: null,
    userProfile: null,
    partnerProfile: null,
    countdownInterval: null,
    heartbeatInterval: null
};

// DOM Elements cache
let domElements = {};

// ========================================
// UTILITY FUNCTIONS (Internal)
// ========================================

function formatDate(date, format = 'long') {
    if (!date) return '';
    const d = new Date(date);
    if (format === 'short') {
        return d.toLocaleDateString('id-ID');
    }
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function showToast(message, type = 'love') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `<i class="fas fa-heart" style="color: #FF6B9D;"></i><span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function createFloatingHearts(count = 10) {
    const container = document.getElementById('floatingHearts');
    if (!container) return;
    
    for (let i = 0; i < count; i++) {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.innerHTML = '<i class="fas fa-heart"></i>';
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDuration = 2 + Math.random() * 3 + 's';
        heart.style.animationDelay = Math.random() * 1 + 's';
        heart.style.fontSize = 0.8 + Math.random() * 1 + 'rem';
        container.appendChild(heart);
        setTimeout(() => heart.remove(), 5000);
    }
}

function calculateRelationshipDuration(startDate) {
    if (!startDate) return { years: 0, months: 0, days: 0, totalDays: 0 };
    const start = new Date(startDate);
    const now = new Date();
    const totalDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return { years: 0, months: 0, days: 0, totalDays };
}

function formatRelationshipDuration(startDate) {
    if (!startDate) return 'Just started our journey';
    const start = new Date(startDate);
    const now = new Date();
    const totalDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    
    if (totalDays >= 365) {
        const years = Math.floor(totalDays / 365);
        return `${years} year${years > 1 ? 's' : ''} of love`;
    } else if (totalDays >= 30) {
        const months = Math.floor(totalDays / 30);
        return `${months} month${months > 1 ? 's' : ''} of love`;
    } else {
        return `${totalDays} day${totalDays > 1 ? 's' : ''} of love`;
    }
}

function getRandomLoveMeter() {
    return Math.floor(Math.random() * 11) + 90;
}

function getLoveMeterMessage(value) {
    if (value >= 98) return "You two are inseparable! ❤️";
    if (value >= 95) return "Perfect match! 💕";
    if (value >= 90) return "Soulmates forever! 💗";
    return "Love is growing everyday! 💖";
}

function getRandomLoveQuote() {
    const quotes = [
        "In every heartbeat, there's your name.",
        "You are my today and all of my tomorrows.",
        "Every love story is beautiful, but ours is my favorite.",
        "Distance means so little when someone means so much.",
        "You are the best thing that's ever been mine."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
}

function getCurrentDateString() {
    const now = new Date();
    return now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// ========================================
// AUTHENTICATION
// ========================================

async function checkAuth() {
    try {
        const { data: { session } } = await _supabaseClient.auth.getSession();
        
        if (session) {
            window.appState.currentUser = session.user;
            const dashboard = document.getElementById('dashboardContainer');
            const loading = document.getElementById('loadingScreen');
            if (dashboard) dashboard.style.display = 'block';
            if (loading) loading.classList.add('hidden');
            await initializeDashboard();
            setupRealtimeListeners();
            startHeartbeat();
        } else {
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Auth error:', error);
        const loading = document.getElementById('loadingScreen');
        if (loading) loading.classList.add('hidden');
        window.location.href = 'login.html';
    }
}

async function logoutUser() {
    if (window.appState.userProfile) {
        await _supabaseClient
            .from('profiles')
            .update({ is_online: false, last_seen: new Date() })
            .eq('id', window.appState.userProfile.id);
    }
    await _supabaseClient.auth.signOut();
    window.location.href = 'login.html';
}

function startHeartbeat() {
    if (window.appState.heartbeatInterval) clearInterval(window.appState.heartbeatInterval);
    
    window.appState.heartbeatInterval = setInterval(async () => {
        if (window.appState.currentUser && window.appState.userProfile) {
            await _supabaseClient
                .from('profiles')
                .update({ is_online: true, last_seen: new Date() })
                .eq('id', window.appState.userProfile.id);
        }
    }, 30000);
}

// ========================================
// DASHBOARD INITIALIZATION
// ========================================

async function initializeDashboard() {
    try {
        const loading = document.getElementById('loadingScreen');
        if (loading) loading.classList.remove('hidden');
        
        await loadUserProfile();
        await loadCoupleData();
        await loadPartnerInfo();
        await loadChatMessages();
        await loadLetters();
        await loadMemories();
        await loadCountdown();
        
        updateWelcomeMessage();
        updateRelationshipInfo();
        updateLoveMeter();
        
        const dateEl = document.getElementById('currentDate');
        if (dateEl) dateEl.textContent = getCurrentDateString();
        
        const quoteEl = document.getElementById('coupleQuote');
        if (quoteEl) quoteEl.textContent = `"${getRandomLoveQuote()}"`;
        
        setInterval(() => createFloatingHearts(3), 8000);
        
        if (loading) loading.classList.add('hidden');
    } catch (error) {
        console.error('Init error:', error);
        const loading = document.getElementById('loadingScreen');
        if (loading) loading.classList.add('hidden');
        showToast('Error loading dashboard', 'error');
    }
}

async function loadUserProfile() {
    try {
        const { data, error } = await _supabaseClient
            .from('profiles')
            .select('*')
            .eq('user_id', window.appState.currentUser.id)
            .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
            console.error('Profile error:', error);
            return;
        }
        
        if (!data) {
            const { data: newProfile, error: insertError } = await _supabaseClient
                .from('profiles')
                .insert({
                    user_id: window.appState.currentUser.id,
                    full_name: window.appState.currentUser.email?.split('@')[0] || 'Love',
                    mood_emoji: '😊',
                    status_text: 'Happy',
                    is_online: true,
                    last_seen: new Date()
                })
                .select()
                .single();
            
            if (!insertError && newProfile) {
                window.appState.userProfile = newProfile;
            }
        } else {
            window.appState.userProfile = data;
            await _supabaseClient
                .from('profiles')
                .update({ is_online: true, last_seen: new Date() })
                .eq('id', data.id);
        }
    } catch (err) {
        console.error('loadUserProfile error:', err);
    }
}

async function loadCoupleData() {
    try {
        const { data, error } = await _supabaseClient
            .from('couples')
            .select('*')
            .or(`partner1_id.eq.${window.appState.currentUser.id},partner2_id.eq.${window.appState.currentUser.id}`)
            .maybeSingle();
        
        if (error) {
            console.error('Couple error:', error);
            return;
        }
        
        if (data) {
            window.appState.currentCouple = data;
            window.appState.currentPartner = data.partner1_id === window.appState.currentUser.id ? data.partner2_id : data.partner1_id;
            
            if (window.appState.userProfile && !window.appState.userProfile.couple_id) {
                await _supabaseClient
                    .from('profiles')
                    .update({ couple_id: data.id })
                    .eq('id', window.appState.userProfile.id);
                window.appState.userProfile.couple_id = data.id;
            }
        }
    } catch (err) {
        console.error('loadCoupleData error:', err);
    }
}

async function loadPartnerInfo() {
    if (!window.appState.currentPartner) return;
    
    try {
        const { data, error } = await _supabaseClient
            .from('profiles')
            .select('*')
            .eq('user_id', window.appState.currentPartner)
            .maybeSingle();
        
        if (error) {
            console.error('Partner error:', error);
            return;
        }
        
        window.appState.partnerProfile = data;
        updatePartnerStatus(data);
    } catch (err) {
        console.error('loadPartnerInfo error:', err);
    }
}

function updatePartnerStatus(profile) {
    const moodEl = document.getElementById('partnerMood');
    const statusEl = document.getElementById('partnerStatusText');
    const locationEl = document.getElementById('partnerLocation');
    const indicatorEl = document.getElementById('onlineIndicator');
    const partnerAvatar = document.getElementById('partnerAvatar');
    const chatPartnerName = document.getElementById('chatPartnerName');
    const typingStatus = document.getElementById('typingStatus');
    
    if (moodEl) moodEl.textContent = profile?.mood_emoji || '😊';
    if (statusEl) statusEl.textContent = profile?.status_text || 'Happy';
    
    const isOnline = profile?.is_online || false;
    if (locationEl) locationEl.innerHTML = isOnline ? '🟢 Online' : '⚫ Offline';
    if (indicatorEl) indicatorEl.style.background = isOnline ? '#22C55E' : '#9CA3AF';
    if (chatPartnerName) chatPartnerName.textContent = profile?.full_name?.split(' ')[0] || 'My Love';
    if (typingStatus) {
        typingStatus.textContent = isOnline ? '🟢 Online' : '⚫ Offline';
        typingStatus.style.color = isOnline ? '#22C55E' : '#9CA3AF';
    }
    
    if (partnerAvatar) {
        const color = profile?.full_name === 'Capi' ? '#FF6B9D' : '#C4B5FD';
        partnerAvatar.style.background = `linear-gradient(135deg, ${color}, ${color}CC)`;
    }
}

// ========================================
// CHAT FUNCTIONALITY
// ========================================

async function loadChatMessages() {
    if (!window.appState.currentCouple) return;
    
    try {
        const { data, error } = await _supabaseClient
            .from('messages')
            .select('*')
            .eq('couple_id', window.appState.currentCouple.id)
            .order('created_at', { ascending: true })
            .limit(100);
        
        if (error) {
            console.error('Messages error:', error);
            return;
        }
        
        const container = document.getElementById('chatMessages');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (data && data.length > 0) {
            data.forEach(msg => displayChatMessage(msg));
        } else {
            container.innerHTML = `<div style="text-align:center; padding:40px; color:#6B7280;"><i class="fas fa-comment-dots" style="font-size:2rem; margin-bottom:10px;"></i><p>Say something to your love 💕</p></div>`;
        }
        
        container.scrollTop = container.scrollHeight;
    } catch (err) {
        console.error('loadChatMessages error:', err);
    }
}

function displayChatMessage(message) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    
    const placeholder = container.querySelector('div[style*="text-align:center"]');
    if (placeholder) placeholder.remove();
    
    const div = document.createElement('div');
    const isMe = message.sender_id === window.appState.currentUser?.id;
    div.className = `chat-message ${isMe ? 'me' : ''}`;
    const time = formatTime(message.created_at);
    const senderName = isMe ? 'Me' : (window.appState.partnerProfile?.full_name || 'Love');
    
    div.innerHTML = `<div class="message-bubble"><strong style="font-size:0.7rem;">${senderName}</strong><br>${escapeHtml(message.message)}</div><div class="message-time">${time}</div>`;
    
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input?.value.trim();
    
    if (!message || !window.appState.currentCouple || !window.appState.currentPartner) return;
    
    input.value = '';
    
    try {
        const { error } = await _supabaseClient
            .from('messages')
            .insert({
                couple_id: window.appState.currentCouple.id,
                sender_id: window.appState.currentUser.id,
                receiver_id: window.appState.currentPartner,
                message: message,
                is_read: false
            });
        
        if (error) {
            console.error('Send error:', error);
            showToast('Failed to send', 'error');
            input.value = message;
        }
    } catch (err) {
        console.error('sendMessage error:', err);
        input.value = message;
    }
}

// ========================================
// POKE FUNCTIONALITY
// ========================================

async function sendPoke(type) {
    if (!window.appState.currentCouple || !window.appState.currentPartner) return;
    
    const messages = { poke: '💗 Poke sent!', kangen: '🥺 Kangen sent!', miss_you: '💌 Miss You sent!' };
    
    try {
        const { error } = await _supabaseClient
            .from('pokes')
            .insert({
                couple_id: window.appState.currentCouple.id,
                from_user_id: window.appState.currentUser.id,
                to_user_id: window.appState.currentPartner,
                type: type
            });
        
        if (error) {
            console.error('Poke error:', error);
            showToast('Failed to send', 'error');
        } else {
            showToast(messages[type], 'poke');
            createFloatingHearts(15);
        }
    } catch (err) {
        console.error('sendPoke error:', err);
    }
}

// ========================================
// LETTERS FUNCTIONALITY
// ========================================

async function loadLetters() {
    const container = document.getElementById('lettersGrid');
    if (!container) return;
    
    try {
        const { data, error } = await _supabaseClient
            .from('letters')
            .select('*')
            .order('created_at', { ascending: true });
        
        let letters = DEFAULT_LETTERS;
        if (!error && data && data.length > 0) letters = data;
        
        container.innerHTML = letters.map(letter => `
            <div class="letter-card" onclick="window.openLetterModal('${escapeHtml(letter.title)}', '${escapeHtml(letter.content)}')">
                <i class="fas fa-envelope-open-heart"></i>
                <h4>${escapeHtml(letter.title)}</h4>
                <p>Open when you need this 💕</p>
            </div>
        `).join('');
    } catch (err) {
        console.error('loadLetters error:', err);
    }
}

// ========================================
// MEMORIES FUNCTIONALITY
// ========================================

async function loadMemories() {
    const container = document.getElementById('galleryGrid');
    if (!container) return;
    
    try {
        const { data, error } = await _supabaseClient
            .from('memories')
            .select('*')
            .eq('couple_id', window.appState.currentCouple?.id)
            .order('date', { ascending: false });
        
        let memories = DEFAULT_MEMORIES;
        if (!error && data && data.length > 0) memories = data;
        
        if (memories.length === 0) {
            container.innerHTML = `<div class="gallery-item"><div class="gallery-placeholder"><i class="fas fa-heart"></i><p>No memories yet.</p></div></div>`;
            return;
        }
        
        container.innerHTML = memories.map(memory => `
            <div class="gallery-item" onclick="window.viewMemory('${escapeHtml(memory.title)}', '${escapeHtml(memory.description)}', '${memory.date}')">
                ${memory.image_url ? `<img src="${memory.image_url}" alt="${escapeHtml(memory.title)}">` : `<div class="gallery-placeholder"><i class="fas fa-camera-retro"></i><p>📸 ${escapeHtml(memory.title)}</p></div>`}
                <div style="padding:12px;"><h4 style="font-size:0.9rem;">${escapeHtml(memory.title)}</h4><p style="font-size:0.75rem; color:#6B7280;">${formatDate(memory.date, 'short')}</p></div>
            </div>
        `).join('');
    } catch (err) {
        console.error('loadMemories error:', err);
    }
}

// ========================================
// COUNTDOWN FUNCTIONALITY
// ========================================

async function loadCountdown() {
    if (!window.appState.currentCouple || !window.appState.currentCouple.next_meeting_date) {
        const infoEl = document.getElementById('nextMeetingInfo');
        if (infoEl) infoEl.innerHTML = '<i class="fas fa-calendar-alt"></i><span>Set your next meeting date</span>';
        return;
    }
    
    const targetDate = new Date(window.appState.currentCouple.next_meeting_date);
    const infoEl = document.getElementById('nextMeetingInfo');
    if (infoEl) infoEl.innerHTML = `<i class="fas fa-map-marker-alt"></i><span>Next meeting: ${formatDate(targetDate)}</span>`;
    
    if (window.appState.countdownInterval) clearInterval(window.appState.countdownInterval);
    
    function update() {
        const now = new Date();
        const diff = targetDate - now;
        if (diff <= 0) {
            ['countdownDays', 'countdownHours', 'countdownMins', 'countdownSecs'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = '00';
            });
            return;
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (86400000)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (3600000)) / (1000 * 60));
        const seconds = Math.floor((diff % (60000)) / 1000);
        
        const daysEl = document.getElementById('countdownDays');
        const hoursEl = document.getElementById('countdownHours');
        const minsEl = document.getElementById('countdownMins');
        const secsEl = document.getElementById('countdownSecs');
        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minsEl) minsEl.textContent = String(minutes).padStart(2, '0');
        if (secsEl) secsEl.textContent = String(seconds).padStart(2, '0');
    }
    
    update();
    window.appState.countdownInterval = setInterval(update, 1000);
}

// ========================================
// UI UPDATES
// ========================================

function updateWelcomeMessage() {
    const userNameEl = document.getElementById('userName');
    if (userNameEl && window.appState.userProfile) {
        userNameEl.textContent = window.appState.userProfile.full_name?.split(' ')[0] || 'Love';
    }
}

function updateRelationshipInfo() {
    if (!window.appState.currentCouple?.started_date) return;
    const durationEl = document.getElementById('relationshipDuration');
    if (durationEl) durationEl.textContent = formatRelationshipDuration(window.appState.currentCouple.started_date);
}

function updateLoveMeter() {
    const value = getRandomLoveMeter();
    const valueEl = document.getElementById('loveMeterValue');
    const fillEl = document.getElementById('loveMeterFill');
    const msgEl = document.getElementById('loveMeterMessage');
    if (valueEl) valueEl.textContent = value + '%';
    if (fillEl) fillEl.style.width = value + '%';
    if (msgEl) msgEl.textContent = getLoveMeterMessage(value);
}

// ========================================
// REALTIME LISTENERS
// ========================================

function setupRealtimeListeners() {
    if (!window.appState.currentCouple) return;
    
    _supabaseClient
        .channel('chat-messages')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `couple_id=eq.${window.appState.currentCouple.id}`
        }, (payload) => {
            if (payload.new.sender_id !== window.appState.currentUser.id) {
                displayChatMessage(payload.new);
                showToast('New message from your love! 💬', 'chat');
            }
        })
        .subscribe();
    
    _supabaseClient
        .channel('pokes')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'pokes',
            filter: `to_user_id=eq.${window.appState.currentUser.id}`
        }, () => {
            showToast('💗 Someone sent you love!', 'poke');
            createFloatingHearts(20);
        })
        .subscribe();
    
    _supabaseClient
        .channel('profiles-online')
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles'
        }, async (payload) => {
            if (payload.new.user_id === window.appState.currentPartner) {
                updatePartnerStatus(payload.new);
            }
        })
        .subscribe();
}

// ========================================
// MODAL FUNCTIONS (Global)
// ========================================

window.openLetterModal = function(title, content) {
    const modal = document.getElementById('letterModal');
    const titleEl = document.getElementById('modalTitle');
    const contentEl = document.getElementById('modalContent');
    if (titleEl) titleEl.textContent = title;
    if (contentEl) contentEl.innerHTML = `<p>${escapeHtml(content)}</p>`;
    if (modal) modal.classList.add('active');
};

window.closeLetterModal = function() {
    const modal = document.getElementById('letterModal');
    if (modal) modal.classList.remove('active');
};

window.openMemoryModal = function() {
    const modal = document.getElementById('memoryModal');
    if (modal) modal.classList.add('active');
};

window.closeMemoryModal = function() {
    const modal = document.getElementById('memoryModal');
    if (modal) modal.classList.remove('active');
};

window.viewMemory = function(title, description, date) {
    const modal = document.getElementById('letterModal');
    const titleEl = document.getElementById('modalTitle');
    const contentEl = document.getElementById('modalContent');
    if (titleEl) titleEl.textContent = `📸 ${title}`;
    if (contentEl) contentEl.innerHTML = `<p>${escapeHtml(description)}</p><p style="margin-top:12px; font-size:0.8rem; color:#FF6B9D;">${formatDate(date)}</p>`;
    if (modal) modal.classList.add('active');
};

window.addMemory = async function(event) {
    event.preventDefault();
    const title = document.getElementById('memoryTitleInput')?.value;
    const description = document.getElementById('memoryDescInput')?.value;
    const date = document.getElementById('memoryDateInput')?.value;
    const imageUrl = document.getElementById('memoryImageInput')?.value;
    
    if (!title || !description || !date) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    const { error } = await _supabaseClient
        .from('memories')
        .insert({
            couple_id: window.appState.currentCouple.id,
            title: title,
            description: description,
            date: date,
            image_url: imageUrl || null
        });
    
    if (error) {
        showToast('Failed to add memory', 'error');
    } else {
        showToast('Memory added! ❤️', 'success');
        window.closeMemoryModal();
        await loadMemories();
        ['memoryTitleInput', 'memoryDescInput', 'memoryDateInput', 'memoryImageInput'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
    }
};

// ========================================
// NAVIGATION
// ========================================

function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.querySelector('.nav-menu');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.getAttribute('data-section');
            if (section) switchSection(section);
            if (navMenu && window.innerWidth <= 768) navMenu.classList.remove('active');
        });
    });
    
    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            if (navMenu) navMenu.classList.toggle('active');
        });
    }
}

function switchSection(section) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.getAttribute('data-section') === section) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    const sections = ['dashboardSection', 'chatSection', 'memoriesSection', 'lettersSection'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === section + 'Section') {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        }
    });
    
    if (section === 'chat') {
        const container = document.getElementById('chatMessages');
        if (container) container.scrollTop = container.scrollHeight;
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    const logoutBtns = document.querySelectorAll('#logoutBtn, #logoutBtnNav');
    logoutBtns.forEach(btn => btn?.addEventListener('click', logoutUser));
    
    const sendBtn = document.getElementById('sendChatBtn');
    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    
    const chatInput = document.getElementById('chatInput');
    if (chatInput) chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
    
    document.querySelectorAll('.poke-btn').forEach(btn => {
        btn.addEventListener('click', () => sendPoke(btn.getAttribute('data-poke')));
    });
    
    const addMemoryBtn = document.getElementById('addMemoryBtn');
    if (addMemoryBtn) addMemoryBtn.addEventListener('click', window.openMemoryModal);
    
    const memoryForm = document.getElementById('memoryForm');
    if (memoryForm) memoryForm.addEventListener('submit', window.addMemory);
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => modal.classList.remove('active'));
        }
    });
    
    document.addEventListener('visibilitychange', async () => {
        if (window.appState.currentUser && window.appState.userProfile) {
            await _supabaseClient
                .from('profiles')
                .update({ is_online: !document.hidden, last_seen: new Date() })
                .eq('id', window.appState.userProfile.id);
        }
    });
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setupNavigation();
    checkAuth();
});
