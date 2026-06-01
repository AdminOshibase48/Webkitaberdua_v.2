// ========================================
// COUPLE DASHBOARD - FINAL VERSION
// FITUR LENGKAP:
// ✅ Chat Realtime seperti WA
// ✅ Online/Offline Status
// ✅ Typing Indicator (Sedang mengetik...)
// ✅ Read Receipt (✅ dan ✅✅)
// ✅ OneSignal Push Notification di HP
// ✅ Unread Counter
// ========================================

const _supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================================
// ONESIGNAL CONFIGURATION
// GANTI DENGAN DATA DARI ONESIGNAL ANDA
// ========================================
const ONESIGNAL_APP_ID = "db3840ed-d597-4e66-9d22-f69e547d464f"; // Ganti dengan App ID dari OneSignal
const ONESIGNAL_API_KEY = "os_v2_app_3m4eb3ovs5hgnhjc62pfi7kgj5dlpsfgwi2ebhu7mqpypc3jndbzbec3hozl64fvfhb2l3lr2pgip5sqggcm43okyioqr4c6aurmdyy"; // Ganti dengan REST API Key dari OneSignal

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
    onesignalUserId: null
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
        audio.volume = 0.5;
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
// ONESIGNAL PUSH NOTIFICATION
// ========================================

// Kirim notifikasi ke HP via OneSignal
async function sendOneSignalNotification(title, message, userId = null) {
    console.log("📤 Mengirim notifikasi OneSignal...");
    
    // Cek apakah OneSignal sudah siap
    if (!window.OneSignal) {
        console.log("OneSignal belum siap, skip notifikasi");
        return false;
    }
    
    const body = {
        app_id: ONESIGNAL_APP_ID,
        headings: { en: title },
        contents: { en: message.length > 100 ? message.substring(0, 100) + '...' : message },
        included_segments: ["All"],
        android_channel_id: "fcm_channel",
        small_icon: "ic_stat_onesignal_default",
        large_icon: "https://couple-love.netlify.app/assets/images/icon-192x192.png",
        url: window.location.origin + "/index.html?action=chat",
        ttl: 3600 // Notifikasi expire setelah 1 jam
    };
    
    // Jika target user spesifik (kirim ke user tertentu)
    if (userId) {
        body.include_external_user_ids = [userId];
    }
    
    try {
        const response = await fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${ONESIGNAL_API_KEY}`
            },
            body: JSON.stringify(body)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log("✅ OneSignal notifikasi terkirim:", result);
            return true;
        } else {
            console.log("❌ OneSignal error:", result);
            return false;
        }
    } catch (error) {
        console.log("❌ OneSignal fetch error:", error);
        return false;
    }
}

// Inisialisasi OneSignal
async function initOneSignal() {
    if (!window.OneSignal) {
        console.log("OneSignal SDK belum load, tunggu...");
        // Tunggu OneSignal ready
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (window.OneSignal) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 500);
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve();
            }, 10000);
        });
    }
    
    console.log("✅ OneSignal SDK siap");
    
    // Dapatkan user ID OneSignal
    try {
        const userId = await window.OneSignal.getExternalUserId();
        if (userId) {
            window.appState.onesignalUserId = userId;
            console.log("OneSignal User ID:", userId);
            
            // Simpan ke Supabase
            if (window.appState.userProfile) {
                await _supabaseClient
                    .from('profiles')
                    .update({ onesignal_id: userId })
                    .eq('id', window.appState.userProfile.id);
            }
        }
    } catch(e) {
        console.log("Get OneSignal ID error:", e);
    }
    
    return true;
}

// Request notifikasi permission via OneSignal
async function requestOneSignalPermission() {
    if (!window.OneSignal) {
        console.log("OneSignal belum siap");
        return false;
    }
    
    try {
        const isSubscribed = await window.OneSignal.isPushNotificationsEnabled();
        if (!isSubscribed) {
            await window.OneSignal.registerForPushNotifications();
        }
        window.appState.notificationPermission = true;
        showToast("✅ Notifikasi HP diaktifkan! 💕", "success");
        return true;
    } catch(e) {
        console.log("Request permission error:", e);
        return false;
    }
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
            window.appState.currentUser = session.user;
            const dashboard = document.getElementById('dashboardContainer');
            const loading = document.getElementById('loadingScreen');
            if (dashboard) dashboard.style.display = 'block';
            if (loading) loading.classList.add('hidden');
            
            await initOneSignal();
            await initializeDashboard();
            setupRealtimeListeners();
            setupTypingListener();
            startHeartbeat();
        } else {
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Auth error:', error);
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
        
        // Minta izin notifikasi OneSignal (opsional, bisa juga dari tombol)
        setTimeout(() => {
            if (confirm("Aktifkan notifikasi ke HP? Kamu akan mendapat notifikasi saat ada pesan 💕")) {
                requestOneSignalPermission();
            }
        }, 3000);
        
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
                    last_seen: new Date(),
                    onesignal_id: window.appState.onesignalUserId
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
    
    // 1. LISTENER PESAN BARU (DENGAN ONESIGNAL NOTIFICATION)
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
                
                // Tampilkan pesan di chat
                displayChatMessage(newMsg);
                playNotificationSound();
                
                const senderName = window.appState.partnerProfile?.full_name || 'Pasangan';
                const messageText = newMsg.message;
                
                // Tampilkan toast
                showToast(`💬 Pesan dari ${senderName}`, 'chat');
                
                // KIRIM NOTIFIKASI KE HP VIA ONESIGNAL
                await sendOneSignalNotification(
                    `💬 Pesan dari ${senderName}`,
                    messageText,
                    window.appState.partnerProfile?.onesignal_id || null
                );
                
                // Tandai sebagai sudah dibaca
                await markMessageAsRead(newMsg.id);
                await loadUnreadMessagesCount();
                refreshChatMessages();
            }
        })
        .subscribe();
    
    // 2. LISTENER READ RECEIPT
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
    
    // 3. LISTENER POKE
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
            
            // Notifikasi OneSignal untuk poke
            await sendOneSignalNotification(
                '💗 Love Notification',
                message,
                window.appState.partnerProfile?.onesignal_id || null
            );
        })
        .subscribe();
    
    // 4. LISTENER ONLINE/OFFLINE
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
    
    document.addEventListener('visibilitychange', async () => {
        if (window.appState.currentUser && window.appState.userProfile) {
            await _supabaseClient
                .from('profiles')
                .update({ is_online: !document.hidden, last_seen: new Date() })
                .eq('id', window.appState.userProfile.id);
            
            if (!document.hidden && window.appState.unreadCount > 0) {
                markAllMessagesAsRead();
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
