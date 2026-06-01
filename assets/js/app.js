// ========================================
// COUPLE DASHBOARD - FINAL VERSION
// FITUR: Chat Realtime, Online/Offline, Typing, Read Receipt, OneSignal
// ========================================

const _supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Simpan ke window untuk akses global
window._supabaseClient = _supabaseClient;

// ========================================
// ONESIGNAL CONFIGURATION
// ========================================
const ONESIGNAL_APP_ID = "db3840ed-d597-4e66-9d22-f69e547d464f";

// Global state
window.appState = {
    currentUser: null,
    currentCouple: null,
    currentPartner: null,
    userProfile: null,
    partnerProfile: null,
    countdownInterval: null,
    heartbeatInterval: null,
    typingTimeout: null,
    isTyping: false,
    unreadCount: 0,
    notificationPermission: false,
    onesignalReady: false
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

function formatDate(date, format = 'long') {
    if (!date) return '';
    const d = new Date(date);
    if (format === 'short') return d.toLocaleDateString('id-ID');
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

function playNotificationSound() {
    try {
        const audio = new Audio('data:audio/wav;base64,U3RlYWx0aCBpcyBhIG1lbG9keS4uLg==');
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Sound play failed:', e));
    } catch(e) {}
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
        heart.style.fontSize = 0.8 + Math.random() * 1 + 'rem';
        container.appendChild(heart);
        setTimeout(() => heart.remove(), 5000);
    }
}

// ========================================
// ONESIGNAL PUSH NOTIFICATION (TETAP SAMA)
// ========================================

function isOneSignalReady() {
    return window.OneSignal && window.OneSignal.User && window.OneSignal.User.PushSubscription;
}

async function sendOneSignalNotification(title, message) {
    if (!isOneSignalReady()) {
        console.log("⏳ OneSignal belum siap, skip notifikasi");
        return false;
    }
    
    if (!document.hidden) {
        console.log("📱 Tab aktif, skip notifikasi");
        return false;
    }
    
    try {
        await window.OneSignal.Notifications.addNotification({
            title: title,
            message: message,
            icon: "https://couple-love.netlify.app/assets/images/icon-192x192.png",
            url: window.location.origin + "/index.html?action=chat"
        });
        console.log("✅ OneSignal notifikasi terkirim");
        return true;
    } catch (error) {
        console.log("❌ OneSignal error:", error);
        return false;
    }
}

async function testOneSignalNotification() {
    if (!isOneSignalReady()) {
        console.log("OneSignal belum siap untuk test");
        return false;
    }
    
    try {
        await window.OneSignal.Notifications.addNotification({
            title: "💕 Couple Love",
            message: "Notifikasi berhasil! Kamu akan mendapat notifikasi saat ada pesan.",
            icon: "https://couple-love.netlify.app/assets/images/icon-192x192.png"
        });
        console.log("✅ Test notifikasi berhasil");
        return true;
    } catch(e) {
        console.log("Test notifikasi gagal:", e);
        return false;
    }
}

async function requestNotificationPermission() {
    console.log("🔔 Meminta izin notifikasi...");
    
    // Cek dulu apakah browser support notifikasi
    if (!('Notification' in window)) {
        showToast("Browser tidak support notifikasi", "error");
        return false;
    }
    
    // Cek permission
    if (Notification.permission === 'granted') {
        showToast("✅ Notifikasi sudah aktif!", "success");
        window.appState.notificationPermission = true;
        return true;
    }
    
    if (Notification.permission === 'denied') {
        showToast("⚠️ Izin notifikasi ditolak. Aktifkan di pengaturan browser", "error");
        return false;
    }
    
    // Minta izin
    try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            showToast("✅ Notifikasi diaktifkan! 💕", "success");
            window.appState.notificationPermission = true;
            
            // Test notifikasi
            setTimeout(() => {
                new Notification("💕 Couple Love", {
                    body: "Notifikasi berhasil! Kamu akan mendapat notifikasi saat ada pesan.",
                    icon: "/assets/images/icon-192x192.png"
                });
            }, 1000);
            return true;
        } else {
            showToast("⚠️ Notifikasi tidak diizinkan", "error");
            return false;
        }
    } catch (error) {
        console.log("Error request permission:", error);
        showToast("Gagal mengaktifkan notifikasi", "error");
        return false;
    }
}

// Kirim notifikasi (pakai browser notification, lebih simple)
async function sendPushNotification(title, message) {
    // Cek izin
    if (Notification.permission !== 'granted') {
        console.log("Notifikasi tidak diizinkan");
        return false;
    }
    
    // Cek apakah tab sedang aktif (jika aktif, skip notifikasi)
    if (!document.hidden) {
        console.log("Tab aktif, skip notifikasi");
        return false;
    }
    
    try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
            body: message,
            icon: "/assets/images/icon-192x192.png",
            badge: "/assets/images/badge-icon.png",
            tag: "couple-message",
            vibrate: [200, 100, 200],
            requireInteraction: true,
            data: {
                url: "/index.html?action=chat"
            },
            actions: [
                { action: "open", title: "💬 Buka Chat" }
            ]
        });
        console.log("✅ Notifikasi terkirim ke HP");
        return true;
    } catch (error) {
        console.log("Error kirim notifikasi:", error);
        return false;
    }
}

// Test notifikasi
async function testNotification() {
    if (Notification.permission !== 'granted') {
        const result = await requestNotificationPermission();
        if (!result) return;
    }
    
    await sendPushNotification("💕 Test Notifikasi", "Kalau muncul, notifikasi berhasil! 🎉");
}

// ========================================
// TYPING INDICATOR
// ========================================

async function sendTypingStatus(isTyping) {
    if (!window.appState.currentCouple || !window.appState.currentPartner) return;
    
    try {
        const { error } = await _supabaseClient
            .from('typing_status')
            .upsert({
                user_id: window.appState.currentUser.id,
                couple_id: window.appState.currentCouple.id,
                is_typing: isTyping,
                updated_at: new Date()
            }, { onConflict: 'user_id,couple_id' });
        
        if (error) console.log('Typing status error:', error);
    } catch (err) {}
}

function setupTypingListener() {
    if (!window.appState.currentCouple) return;
    
    _supabaseClient
        .channel('typing-status')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'typing_status' }, (payload) => {
            if (payload.new?.user_id === window.appState.currentPartner && payload.new?.is_typing) {
                showTypingIndicator(true);
                setTimeout(() => showTypingIndicator(false), 3000);
            }
        })
        .subscribe();
}

function showTypingIndicator(show) {
    const statusEl = document.getElementById('typingStatus');
    if (statusEl) {
        if (show) {
            statusEl.innerHTML = '✍️ Sedang mengetik...';
            statusEl.style.color = '#FF6B9D';
        } else {
            const isOnline = window.appState.partnerProfile?.is_online;
            statusEl.innerHTML = isOnline ? '🟢 Online' : '⚫ Offline';
            statusEl.style.color = isOnline ? '#22C55E' : '#9CA3AF';
        }
    }
}

function handleTypingStart() {
    if (!window.appState.isTyping) {
        window.appState.isTyping = true;
        sendTypingStatus(true);
    }
    
    if (window.appState.typingTimeout) clearTimeout(window.appState.typingTimeout);
    window.appState.typingTimeout = setTimeout(() => {
        window.appState.isTyping = false;
        sendTypingStatus(false);
    }, 2000);
}

// ========================================
// AUTHENTICATION
// ========================================

async function checkAuth() {
    try {
        const { data: { session } } = await _supabaseClient.auth.getSession();
        
        if (session) {
            console.log("✅ User session ditemukan:", session.user.email);
            window.appState.currentUser = session.user;
            
            const dashboard = document.getElementById('dashboardContainer');
            const loading = document.getElementById('loadingScreen');
            
            if (dashboard) dashboard.style.display = 'block';
            if (loading) loading.classList.add('hidden');
            
            await initializeDashboard();
            setupRealtimeListeners();
            setupTypingListener();
            startHeartbeat();
            
            // Update status online setelah login
            if (window.appState.userProfile) {
                await _supabaseClient
                    .from('profiles')
                    .update({ is_online: true, last_seen: new Date() })
                    .eq('id', window.appState.userProfile.id);
                console.log("✅ Status online setelah login");
            }
        } else {
            console.log("❌ Tidak ada session, redirect ke login");
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Auth error:', error);
        window.location.href = 'login.html';
    }
}

async function logoutUser() {
    console.log("🚪 Logout user...");
    
    // Update status offline SEKARANG
    if (window.appState.userProfile) {
        try {
            await _supabaseClient
                .from('profiles')
                .update({ is_online: false, last_seen: new Date() })
                .eq('id', window.appState.userProfile.id);
            console.log("✅ Status offline diupdate saat logout");
        } catch(e) {
            console.log("Logout offline update error:", e);
        }
    }
    
    // Hentikan semua interval
    if (window.appState.heartbeatInterval) {
        clearInterval(window.appState.heartbeatInterval);
        window.appState.heartbeatInterval = null;
    }
    
    if (window.appState.countdownInterval) {
        clearInterval(window.appState.countdownInterval);
        window.appState.countdownInterval = null;
    }
    
    // Logout dari Supabase
    await _supabaseClient.auth.signOut();
    
    // Reset state
    window.appState.currentUser = null;
    window.appState.userProfile = null;
    window.appState.currentCouple = null;
    window.appState.currentPartner = null;
    
    // Redirect ke login
    window.location.href = 'login.html';
}

function startHeartbeat() {
    // Hentikan heartbeat lama
    if (window.appState.heartbeatInterval) {
        clearInterval(window.appState.heartbeatInterval);
        window.appState.heartbeatInterval = null;
    }
    
    // Cek apakah user login
    if (!window.appState.currentUser || !window.appState.userProfile) {
        console.log("Heartbeat: User tidak login, skip");
        return;
    }
    
    console.log("❤️ Heartbeat started - akan update online status setiap 30 detik");
    
    // Update online status pertama kali
    _supabaseClient
        .from('profiles')
        .update({ is_online: true, last_seen: new Date() })
        .eq('id', window.appState.userProfile.id)
        .then(() => console.log("✅ Initial online status updated"))
        .catch(e => console.log("Initial online update error:", e));
    
    // Set interval heartbeat
    window.appState.heartbeatInterval = setInterval(async () => {
        // Cek apakah user masih login
        if (!window.appState.currentUser || !window.appState.userProfile) {
            console.log("Heartbeat: User sudah logout, stop heartbeat");
            if (window.appState.heartbeatInterval) {
                clearInterval(window.appState.heartbeatInterval);
                window.appState.heartbeatInterval = null;
            }
            return;
        }
        
        try {
            // Cek apakah tab sedang aktif
            if (!document.hidden) {
                await _supabaseClient
                    .from('profiles')
                    .update({ is_online: true, last_seen: new Date() })
                    .eq('id', window.appState.userProfile.id);
                console.log("❤️ Heartbeat: status online updated");
            }
        } catch(e) {
            console.log("Heartbeat error:", e);
        }
    }, 30000);
}

// ========================================
// DASHBOARD INITIALIZATION
// ========================================

async function initializeDashboard() {
    try {
        await loadUserProfile();
        await loadCoupleData();
        await loadPartnerInfo();
        await loadChatMessages();
        await loadLetters();
        await loadMemories();
        await loadCountdown();
        await loadUnreadMessagesCount();
        
        updateWelcomeMessage();
        updateRelationshipInfo();
        updateLoveMeter();
        
        const dateEl = document.getElementById('currentDate');
        if (dateEl) dateEl.textContent = getCurrentDateString();
        
        const quoteEl = document.getElementById('coupleQuote');
        if (quoteEl) quoteEl.textContent = `"${getRandomLoveQuote()}"`;
        
        setInterval(() => createFloatingHearts(3), 8000);
        
        // Tawarkan notifikasi setelah dashboard siap
        setTimeout(() => {
            if (window.OneSignal && !window.appState.notificationPermission) {
                const enableNotif = confirm("🔔 Aktifkan notifikasi ke HP?\n\nKamu akan mendapat notifikasi saat ada pesan dari pasangan! 💕");
                if (enableNotif) {
                    requestNotificationPermission();
                }
            }
        }, 2000);
        
    } catch (error) {
        console.error('Init error:', error);
    }
}

async function loadUserProfile() {
    try {
        const { data, error } = await _supabaseClient
            .from('profiles')
            .select('*')
            .eq('user_id', window.appState.currentUser.id)
            .maybeSingle();
        
        if (!data) {
            const { data: newProfile } = await _supabaseClient
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
            window.appState.userProfile = newProfile;
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
        
        if (data) {
            window.appState.currentCouple = data;
            window.appState.currentPartner = data.partner1_id === window.appState.currentUser.id ? data.partner2_id : data.partner1_id;
        }
    } catch (err) {
        console.error('loadCoupleData error:', err);
    }
}

async function loadPartnerInfo() {
    if (!window.appState.currentPartner) return;
    try {
        const { data } = await _supabaseClient
            .from('profiles')
            .select('*')
            .eq('user_id', window.appState.currentPartner)
            .maybeSingle();
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
    const typingStatusEl = document.getElementById('typingStatus');
    
    if (moodEl) moodEl.textContent = profile?.mood_emoji || '😊';
    if (statusEl) statusEl.textContent = profile?.status_text || 'Happy';
    
    const isOnline = profile?.is_online || false;
    if (locationEl) locationEl.innerHTML = isOnline ? '🟢 Online' : '⚫ Offline';
    if (indicatorEl) indicatorEl.style.background = isOnline ? '#22C55E' : '#9CA3AF';
    
    if (typingStatusEl && !window.appState.isTyping) {
        typingStatusEl.innerHTML = isOnline ? '🟢 Online' : '⚫ Offline';
        typingStatusEl.style.color = isOnline ? '#22C55E' : '#9CA3AF';
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
            .limit(200);
        
        if (error) throw error;
        
        const container = document.getElementById('chatMessages');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (data && data.length > 0) {
            data.forEach(msg => displayChatMessage(msg));
            
            const unreadMessages = data.filter(msg => 
                msg.receiver_id === window.appState.currentUser?.id && !msg.is_read
            );
            
            if (unreadMessages.length > 0) {
                for (const msg of unreadMessages) {
                    await markMessageAsRead(msg.id);
                }
                updateUnreadCount(0);
                refreshChatMessages();
            }
        } else {
            container.innerHTML = `<div style="text-align:center; padding:40px; color:#6B7280;">
                <i class="fas fa-comment-dots" style="font-size:2rem; margin-bottom:10px; display:block;"></i>
                <p>💬 Mulai chat dengan pasanganmu</p>
                <p style="font-size:0.8rem; margin-top:8px;">Kirim pesan pertama! 💕</p>
            </div>`;
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
    
    const isMe = message.sender_id === window.appState.currentUser?.id;
    const div = document.createElement('div');
    div.className = `chat-message ${isMe ? 'me' : ''}`;
    div.setAttribute('data-message-id', message.id);
    
    const time = formatTime(message.created_at);
    const senderName = isMe ? 'You' : (window.appState.partnerProfile?.full_name || 'Partner');
    
    let statusIcon = '';
    if (isMe) {
        if (message.is_read) {
            statusIcon = '<span class="read-status read" title="Sudah dibaca">✅✅</span>';
        } else {
            statusIcon = '<span class="read-status sent" title="Terkirim">✅</span>';
        }
    }
    
    div.innerHTML = `
        <div class="message-bubble">
            <strong style="font-size:0.7rem; opacity:0.8;">${senderName}</strong><br>
            ${escapeHtml(message.message)}
            ${statusIcon}
            <span class="message-time" style="font-size:0.65rem; margin-left:8px;">${time}</span>
        </div>
    `;
    
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

async function refreshChatMessages() {
    if (!window.appState.currentCouple) return;
    
    try {
        const { data, error } = await _supabaseClient
            .from('messages')
            .select('*')
            .eq('couple_id', window.appState.currentCouple.id)
            .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        data.forEach(msg => {
            if (msg.sender_id === window.appState.currentUser?.id) {
                const msgElement = document.querySelector(`.chat-message[data-message-id="${msg.id}"]`);
                if (msgElement) {
                    const statusSpan = msgElement.querySelector('.read-status');
                    if (statusSpan) {
                        if (msg.is_read) {
                            statusSpan.innerHTML = '✅✅';
                            statusSpan.className = 'read-status read';
                            statusSpan.title = 'Sudah dibaca';
                        } else {
                            statusSpan.innerHTML = '✅';
                            statusSpan.className = 'read-status sent';
                            statusSpan.title = 'Terkirim';
                        }
                    }
                }
            }
        });
    } catch (err) {
        console.error('refreshChatMessages error:', err);
    }
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input?.value.trim();
    
    if (!message || !window.appState.currentCouple || !window.appState.currentPartner) return;
    
    input.value = '';
    sendTypingStatus(false);
    
    try {
        const { data, error } = await _supabaseClient
            .from('messages')
            .insert({
                couple_id: window.appState.currentCouple.id,
                sender_id: window.appState.currentUser.id,
                receiver_id: window.appState.currentPartner,
                message: message,
                is_read: false
            })
            .select()
            .single();
        
        if (error) throw error;
        
        displayChatMessage(data);
        playNotificationSound();
        showToast('💬 Pesan terkirim!', 'success');
        
    } catch (err) {
        console.error('sendMessage error:', err);
        showToast('❌ Gagal mengirim pesan', 'error');
        input.value = message;
    }
}

async function markMessageAsRead(messageId) {
    try {
        const { error } = await _supabaseClient
            .from('messages')
            .update({ is_read: true, read_at: new Date() })
            .eq('id', messageId)
            .eq('receiver_id', window.appState.currentUser.id);
        
        if (error) console.error('Mark read error:', error);
    } catch (err) {
        console.error('markMessageAsRead error:', err);
    }
}

async function markAllMessagesAsRead() {
    if (!window.appState.currentCouple) return;
    
    try {
        const { error } = await _supabaseClient
            .from('messages')
            .update({ is_read: true, read_at: new Date() })
            .eq('couple_id', window.appState.currentCouple.id)
            .eq('receiver_id', window.appState.currentUser.id)
            .eq('is_read', false);
        
        if (error) console.error('Mark all read error:', error);
        
        refreshChatMessages();
        updateUnreadCount(0);
        
    } catch (err) {
        console.error('markAllMessagesAsRead error:', err);
    }
}

function updateUnreadCount(count) {
    window.appState.unreadCount = count;
    const badge = document.getElementById('unreadBadge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count > 9 ? '9+' : count;
            badge.style.display = 'flex';
            document.title = `(${count}) 💬 Couple Love`;
        } else {
            badge.style.display = 'none';
            document.title = 'Couple Love 💕';
        }
    }
}

async function loadUnreadMessagesCount() {
    if (!window.appState.currentCouple) return;
    
    try {
        const { count, error } = await _supabaseClient
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('couple_id', window.appState.currentCouple.id)
            .eq('receiver_id', window.appState.currentUser.id)
            .eq('is_read', false);
        
        if (!error && count !== null) {
            updateUnreadCount(count);
        }
    } catch (err) {
        console.error('loadUnreadMessagesCount error:', err);
    }
}

// ========================================
// POKE FUNCTIONALITY
// ========================================

async function sendPoke(type) {
    if (!window.appState.currentCouple || !window.appState.currentPartner) return;
    
    const messages = { poke: '💗 Poke!', kangen: '🥺 Kangen!', miss_you: '💌 Miss You!' };
    
    try {
        const { error } = await _supabaseClient
            .from('pokes')
            .insert({
                couple_id: window.appState.currentCouple.id,
                from_user_id: window.appState.currentUser.id,
                to_user_id: window.appState.currentPartner,
                type: type
            });
        
        if (error) throw error;
        
        showToast(messages[type], 'poke');
        createFloatingHearts(15);
        playNotificationSound();
        
    } catch (err) {
        console.error('sendPoke error:', err);
        showToast('Gagal mengirim', 'error');
    }
}

// ========================================
// LETTERS & MEMORIES
// ========================================

async function loadLetters() {
    const container = document.getElementById('lettersGrid');
    if (!container) return;
    
    try {
        const { data } = await _supabaseClient.from('letters').select('*').order('created_at');
        let letters = DEFAULT_LETTERS;
        if (data && data.length > 0) letters = data;
        
        container.innerHTML = letters.map(letter => `
            <div class="letter-card" onclick="window.openLetterModal('${escapeHtml(letter.title)}', '${escapeHtml(letter.content)}')">
                <i class="fas fa-envelope-open-heart"></i>
                <h4>${escapeHtml(letter.title)}</h4>
                <p>Klik untuk buka 💕</p>
            </div>
        `).join('');
    } catch (err) {}
}

async function loadMemories() {
    const container = document.getElementById('galleryGrid');
    if (!container) return;
    
    try {
        const { data } = await _supabaseClient
            .from('memories')
            .select('*')
            .eq('couple_id', window.appState.currentCouple?.id)
            .order('date', { ascending: false });
        
        let memories = DEFAULT_MEMORIES;
        if (data && data.length > 0) memories = data;
        
        if (memories.length === 0) {
            container.innerHTML = `<div class="gallery-item"><div class="gallery-placeholder"><i class="fas fa-heart"></i><p>Belum ada kenangan</p></div></div>`;
            return;
        }
        
        container.innerHTML = memories.map(memory => `
            <div class="gallery-item" onclick="window.viewMemory('${escapeHtml(memory.title)}', '${escapeHtml(memory.description)}', '${memory.date}')">
                <div class="gallery-placeholder"><i class="fas fa-camera-retro"></i><p>📸 ${escapeHtml(memory.title)}</p></div>
                <div style="padding:12px;"><h4>${escapeHtml(memory.title)}</h4><p>${formatDate(memory.date, 'short')}</p></div>
            </div>
        `).join('');
    } catch (err) {}
}

async function loadCountdown() {
    if (!window.appState.currentCouple?.next_meeting_date) {
        const infoEl = document.getElementById('nextMeetingInfo');
        if (infoEl) infoEl.innerHTML = '<i class="fas fa-calendar-alt"></i><span>Atur tanggal pertemuan</span>';
        return;
    }
    
    const targetDate = new Date(window.appState.currentCouple.next_meeting_date);
    const infoEl = document.getElementById('nextMeetingInfo');
    if (infoEl) infoEl.innerHTML = `<i class="fas fa-map-marker-alt"></i><span>Bertemu: ${formatDate(targetDate)}</span>`;
    
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

function updateWelcomeMessage() {
    const userNameEl = document.getElementById('userName');
    if (userNameEl && window.appState.userProfile) {
        userNameEl.textContent = window.appState.userProfile.full_name?.split(' ')[0] || 'Love';
    }
}

function updateRelationshipInfo() {
    if (!window.appState.currentCouple?.started_date) return;
    const durationEl = document.getElementById('relationshipDuration');
    if (durationEl) {
        const start = new Date(window.appState.currentCouple.started_date);
        const now = new Date();
        const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
        durationEl.textContent = `${days} hari bersama ❤️`;
    }
}

function updateLoveMeter() {
    const value = Math.floor(Math.random() * 11) + 90;
    const valueEl = document.getElementById('loveMeterValue');
    const fillEl = document.getElementById('loveMeterFill');
    if (valueEl) valueEl.textContent = value + '%';
    if (fillEl) fillEl.style.width = value + '%';
}

function getRandomLoveQuote() {
    const quotes = ["In every heartbeat, there's your name.", "You are my today and all of my tomorrows.", "Every love story is beautiful, but ours is my favorite."];
    return quotes[Math.floor(Math.random() * quotes.length)];
}

function getCurrentDateString() {
    return new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// ========================================
// REALTIME LISTENERS
// ========================================

function setupRealtimeListeners() {
    if (!window.appState.currentCouple) return;
    
    try {
        _supabaseClient.removeChannel('chat-messages');
        _supabaseClient.removeChannel('read-receipts');
        _supabaseClient.removeChannel('pokes');
        _supabaseClient.removeChannel('profiles-online');
    } catch(e) {}
    
   // LISTENER PESAN BARU
_supabaseClient
    .channel('chat-messages')
    .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `couple_id=eq.${window.appState.currentCouple.id}`
    }, async (payload) => {
        const newMsg = payload.new;
        
        if (newMsg.sender_id !== window.appState.currentUser.id) {
            console.log('📩 Pesan masuk dari pasangan');
            
            displayChatMessage(newMsg);
            playNotificationSound();
            
            const senderName = window.appState.partnerProfile?.full_name || 'Pasangan';
            showToast(`💬 Pesan dari ${senderName}`, 'chat');
            
            // KIRIM NOTIFIKASI PAKAI FUNGSI BARU
            await sendPushNotification(
                `💬 Pesan dari ${senderName}`,
                newMsg.message
            );
            
            await markMessageAsRead(newMsg.id);
            await loadUnreadMessagesCount();
            refreshChatMessages();
        }
    })
    .subscribe();
    
    // LISTENER READ RECEIPT
    _supabaseClient
        .channel('read-receipts')
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages'
        }, (payload) => {
            const updatedMsg = payload.new;
            
            if (updatedMsg.sender_id === window.appState.currentUser.id && updatedMsg.is_read) {
                const msgElement = document.querySelector(`.chat-message[data-message-id="${updatedMsg.id}"]`);
                if (msgElement) {
                    const statusSpan = msgElement.querySelector('.read-status');
                    if (statusSpan) {
                        statusSpan.innerHTML = '✅✅';
                        statusSpan.className = 'read-status read';
                        statusSpan.title = 'Sudah dibaca';
                    }
                }
            }
        })
        .subscribe();
    
    // LISTENER POKE
    _supabaseClient
        .channel('pokes')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'pokes',
            filter: `to_user_id=eq.${window.appState.currentUser.id}`
        }, async (payload) => {
            const poke = payload.new;
            let message = '';
            if (poke.type === 'poke') message = '💗 Ada yang POKE kamu!';
            else if (poke.type === 'kangen') message = '🥺 Ada yang KANGEN kamu!';
            else message = '💌 Ada yang MISS YOU!';
            
            showToast(message, 'poke');
            createFloatingHearts(20);
            playNotificationSound();
            
            if (document.hidden) {
                await sendOneSignalNotification('💗 Love Notification', message);
            }
        })
        .subscribe();
    
    // LISTENER ONLINE/OFFLINE
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
    
    console.log('✅ Realtime listeners aktif!');
}

// ========================================
// NAVIGATION & MODALS
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
        markAllMessagesAsRead();
        const container = document.getElementById('chatMessages');
        if (container) container.scrollTop = container.scrollHeight;
    }
}

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
    if (contentEl) contentEl.innerHTML = `<p>${escapeHtml(description)}</p><p style="margin-top:12px; color:#FF6B9D;">${formatDate(date)}</p>`;
    if (modal) modal.classList.add('active');
};

window.addMemory = async function(event) {
    event.preventDefault();
    const title = document.getElementById('memoryTitleInput')?.value;
    const description = document.getElementById('memoryDescInput')?.value;
    const date = document.getElementById('memoryDateInput')?.value;
    
    if (!title || !description || !date) {
        showToast('Isi semua field ya sayang', 'error');
        return;
    }
    
    const { error } = await _supabaseClient
        .from('memories')
        .insert({
            couple_id: window.appState.currentCouple.id,
            title: title,
            description: description,
            date: date
        });
    
    if (error) {
        showToast('Gagal menambah kenangan', 'error');
    } else {
        showToast('Kenangan tersimpan! ❤️', 'success');
        window.closeMemoryModal();
        await loadMemories();
        ['memoryTitleInput', 'memoryDescInput', 'memoryDateInput', 'memoryImageInput'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
    }
};

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    const logoutBtns = document.querySelectorAll('#logoutBtn, #logoutBtnNav');
    logoutBtns.forEach(btn => btn?.addEventListener('click', logoutUser));
    
    const sendBtn = document.getElementById('sendChatBtn');
    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
        chatInput.addEventListener('input', handleTypingStart);
    }
    
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
    
    // VISIBILITY CHANGE - Update status saat tab di minimize/aktif
    document.addEventListener('visibilitychange', async () => {
        if (window.appState.currentUser && window.appState.userProfile) {
            if (document.hidden) {
                console.log("📱 Tab di-minimize, update status offline...");
                await _supabaseClient
                    .from('profiles')
                    .update({ is_online: false, last_seen: new Date() })
                    .eq('id', window.appState.userProfile.id);
            } else {
                console.log("📱 Tab aktif kembali, update status online...");
                await _supabaseClient
                    .from('profiles')
                    .update({ is_online: true, last_seen: new Date() })
                    .eq('id', window.appState.userProfile.id);
                
                if (window.appState.unreadCount > 0) {
                    markAllMessagesAsRead();
                }
            }
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
