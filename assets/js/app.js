// ========================================
// CHAT FUNCTIONALITY - FIX VERSION
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
            
            // Tandai SEMUA pesan yang belum dibaca sebagai sudah dibaca
            const unreadMessages = data.filter(msg => 
                msg.receiver_id === window.appState.currentUser?.id && !msg.is_read
            );
            
            if (unreadMessages.length > 0) {
                for (const msg of unreadMessages) {
                    await markMessageAsRead(msg.id);
                }
                updateUnreadCount(0);
                // Refresh tampilan agar centang berubah jadi ✅✅
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
    
    // STATUS PESAN:
    // ✅ = sudah terkirim (sent)
    // ✅✅ = sudah dibaca (read)
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

// Fungsi untuk refresh chat (update centang)
async function refreshChatMessages() {
    if (!window.appState.currentCouple) return;
    
    try {
        const { data, error } = await _supabaseClient
            .from('messages')
            .select('*')
            .eq('couple_id', window.appState.currentCouple.id)
            .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        const container = document.getElementById('chatMessages');
        if (!container) return;
        
        // Update hanya status centang tanpa reload semua
        data.forEach(msg => {
            const msgElement = document.querySelector(`.chat-message[data-message-id="${msg.id}"]`);
            if (msgElement && msg.sender_id === window.appState.currentUser?.id) {
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
        
        // Tampilkan pesan yang baru dikirim
        displayChatMessage(data);
        playNotificationSound();
        
        // Tampilkan notifikasi "Chat terkirim"
        showToast('💬 Pesan terkirim!', 'success');
        
        // Kirim notifikasi ke pasangan
        await sendPushNotificationToPartner(
            `💬 Dari ${window.appState.userProfile?.full_name || 'Pasangan'}`,
            message,
            data.id
        );
        
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
        
        // Update tampilan
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
            // Ganti title browser
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
