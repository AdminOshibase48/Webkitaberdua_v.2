// ========================================
// MAIN APPLICATION LOGIC
// ========================================

// Initialize Supabase client (hanya sekali)
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global variables
let currentUser = null;
let currentCouple = null;
let currentPartner = null;
let userProfile = null;
let partnerProfile = null;
let chatChannel = null;
let countdownInterval = null;

// DOM Elements
let dashboardContainer, loadingScreen, sections;

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    dashboardContainer = document.getElementById('dashboardContainer');
    loadingScreen = document.getElementById('loadingScreen');
    sections = {
        dashboard: document.getElementById('dashboardSection'),
        chat: document.getElementById('chatSection'),
        memories: document.getElementById('memoriesSection'),
        letters: document.getElementById('lettersSection')
    };
    
    // Setup event listeners
    setupEventListeners();
    setupNavigation();
    
    // Check authentication
    checkAuth();
    
    // Update online status on page unload
    window.addEventListener('beforeunload', async () => {
        if (currentUser && userProfile) {
            await _supabase
                .from('profiles')
                .update({ is_online: false, last_seen: new Date() })
                .eq('id', userProfile.id);
        }
    });
});

// ========================================
// AUTHENTICATION
// ========================================

async function checkAuth() {
    try {
        const { data: { session } } = await _supabase.auth.getSession();
        
        if (session) {
            currentUser = session.user;
            if (dashboardContainer) dashboardContainer.style.display = 'block';
            if (loadingScreen) loadingScreen.classList.add('hidden');
            await initializeDashboard();
            setupRealtimeListeners();
        } else {
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Auth check error:', error);
        if (loadingScreen) loadingScreen.classList.add('hidden');
        window.location.href = 'login.html';
    }
}

async function logout() {
    await _supabase.auth.signOut();
    window.location.href = 'login.html';
}

// ========================================
// DASHBOARD INITIALIZATION
// ========================================

async function initializeDashboard() {
    try {
        // Show loading
        if (loadingScreen) loadingScreen.classList.remove('hidden');
        
        // Load all data
        await loadUserProfile();
        await loadCoupleData();
        await loadPartnerInfo();
        await loadChatMessages();
        await loadLetters();
        await loadMemories();
        await loadCountdown();
        
        // Update UI
        updateWelcomeMessage();
        updateRelationshipInfo();
        updateLoveMeter();
        
        const dateElement = document.getElementById('currentDate');
        if (dateElement) dateElement.textContent = getCurrentDateString();
        
        const quoteElement = document.getElementById('coupleQuote');
        if (quoteElement) quoteElement.textContent = `"${getRandomLoveQuote()}"`;
        
        // Start floating hearts
        setInterval(() => {
            createFloatingHearts(3);
        }, 5000);
        
        // Hide loading
        if (loadingScreen) loadingScreen.classList.add('hidden');
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        if (loadingScreen) loadingScreen.classList.add('hidden');
        showToast('Error loading dashboard. Please refresh.', 'error');
    }
}

async function loadUserProfile() {
    const { data: profile, error } = await _supabase
        .from('profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();
    
    if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
    }
    
    if (!profile) {
        // Create profile if not exists
        const { data: newProfile, error: insertError } = await _supabase
            .from('profiles')
            .insert({
                user_id: currentUser.id,
                full_name: currentUser.email?.split('@')[0] || 'Love',
                mood_emoji: '😊',
                status_text: 'Happy',
                is_online: true,
                last_seen: new Date()
            })
            .select()
            .single();
        
        if (!insertError && newProfile) {
            userProfile = newProfile;
        }
    } else {
        userProfile = profile;
        // Update online status
        await _supabase
            .from('profiles')
            .update({ is_online: true, last_seen: new Date() })
            .eq('id', profile.id);
    }
}

async function loadCoupleData() {
    const { data: couple, error } = await _supabase
        .from('couples')
        .select('*')
        .or(`partner1_id.eq.${currentUser.id},partner2_id.eq.${currentUser.id}`)
        .single();
    
    if (error) {
        console.error('Error loading couple:', error);
        return;
    }
    
    currentCouple = couple;
    currentPartner = couple.partner1_id === currentUser.id ? couple.partner2_id : couple.partner1_id;
}

async function loadPartnerInfo() {
    if (!currentPartner) return;
    
    const { data: profile, error } = await _supabase
        .from('profiles')
        .select('*')
        .eq('user_id', currentPartner)
        .single();
    
    if (error) {
        console.error('Error loading partner:', error);
        return;
    }
    
    partnerProfile = profile;
    updatePartnerStatus(profile);
}

function updatePartnerStatus(profile) {
    const moodElement = document.getElementById('partnerMood');
    const statusElement = document.getElementById('partnerStatusText');
    const locationElement = document.getElementById('partnerLocation');
    const onlineIndicator = document.getElementById('onlineIndicator');
    
    if (moodElement) moodElement.textContent = profile?.mood_emoji || '😊';
    if (statusElement) statusElement.textContent = profile?.status_text || 'Happy';
    if (locationElement) {
        locationElement.innerHTML = profile?.is_online ? '🟢 Online' : '⚫ Offline';
    }
    if (onlineIndicator) {
        onlineIndicator.style.background = profile?.is_online ? '#22C55E' : '#9CA3AF';
    }
}

// ========================================
// CHAT FUNCTIONALITY
// ========================================

async function loadChatMessages() {
    if (!currentCouple) return;
    
    const { data: messages, error } = await _supabase
        .from('messages')
        .select('*')
        .eq('couple_id', currentCouple.id)
        .order('created_at', { ascending: true })
        .limit(50);
    
    if (error) {
        console.error('Error loading messages:', error);
        return;
    }
    
    const container = document.getElementById('chatMessages');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (messages && messages.length > 0) {
        messages.forEach(msg => displayChatMessage(msg));
    } else {
        container.innerHTML = `
            <div style="text-align:center; padding:40px; color:var(--gray-500);">
                <i class="fas fa-comment-dots" style="font-size:2rem; margin-bottom:10px; display:block;"></i>
                <p>Say something to your love 💕</p>
            </div>
        `;
    }
    
    container.scrollTop = container.scrollHeight;
}

function displayChatMessage(message) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    
    // Remove placeholder if exists
    const placeholder = container.querySelector('div[style*="text-align:center"]');
    if (placeholder) placeholder.remove();
    
    const div = document.createElement('div');
    div.className = `chat-message ${message.sender_id === currentUser?.id ? 'me' : ''}`;
    
    const time = formatTime(message.created_at);
    
    div.innerHTML = `
        <div class="message-bubble">${escapeHtml(message.message)}</div>
        <div class="message-time">${time}</div>
    `;
    
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input?.value.trim();
    
    if (!message || !currentCouple || !currentPartner) return;
    
    input.value = '';
    
    const { error } = await _supabase
        .from('messages')
        .insert({
            couple_id: currentCouple.id,
            sender_id: currentUser.id,
            receiver_id: currentPartner,
            message: message,
            is_read: false
        });
    
    if (error) {
        console.error('Error sending message:', error);
        showToast('Failed to send message', 'error');
        input.value = message;
    }
}

// ========================================
// POKE FUNCTIONALITY
// ========================================

async function sendPoke(type) {
    if (!currentCouple || !currentPartner) return;
    
    let message = '';
    switch(type) {
        case 'poke': message = '💗 Poke sent!'; break;
        case 'kangen': message = '🥺 Kangen sent!'; break;
        case 'miss_you': message = '💌 Miss You sent!'; break;
    }
    
    const { error } = await _supabase
        .from('pokes')
        .insert({
            couple_id: currentCouple.id,
            from_user_id: currentUser.id,
            to_user_id: currentPartner,
            type: type
        });
    
    if (error) {
        console.error('Error sending poke:', error);
        showToast('Failed to send', 'error');
    } else {
        showToast(message, 'poke');
        createFloatingHearts(15);
    }
}

// ========================================
// LETTERS FUNCTIONALITY
// ========================================

async function loadLetters() {
    const container = document.getElementById('lettersGrid');
    if (!container) return;
    
    // Try to load from Supabase first
    const { data: letters, error } = await _supabase
        .from('letters')
        .select('*')
        .eq('couple_id', currentCouple?.id);
    
    let lettersToShow = DEFAULT_LETTERS;
    
    if (!error && letters && letters.length > 0) {
        lettersToShow = letters;
    }
    
    container.innerHTML = lettersToShow.map(letter => `
        <div class="letter-card" onclick="openLetterModal('${escapeHtml(letter.title)}', '${escapeHtml(letter.content)}')">
            <i class="fas fa-envelope-open-heart"></i>
            <h4>${escapeHtml(letter.title)}</h4>
            <p>Open when you need this 💕</p>
        </div>
    `).join('');
}

function openLetterModal(title, content) {
    const modal = document.getElementById('letterModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    
    if (modalTitle) modalTitle.textContent = title;
    if (modalContent) modalContent.innerHTML = `<p>${escapeHtml(content)}</p>`;
    if (modal) modal.classList.add('active');
}

function closeLetterModal() {
    const modal = document.getElementById('letterModal');
    if (modal) modal.classList.remove('active');
}

// ========================================
// MEMORIES FUNCTIONALITY
// ========================================

async function loadMemories() {
    const container = document.getElementById('galleryGrid');
    if (!container) return;
    
    const { data: memories, error } = await _supabase
        .from('memories')
        .select('*')
        .eq('couple_id', currentCouple?.id)
        .order('date', { ascending: false });
    
    let memoriesToShow = DEFAULT_MEMORIES;
    
    if (!error && memories && memories.length > 0) {
        memoriesToShow = memories;
    }
    
    if (memoriesToShow.length === 0) {
        container.innerHTML = `
            <div class="gallery-item">
                <div class="gallery-placeholder">
                    <i class="fas fa-heart"></i>
                    <p>No memories yet. Add your first memory!</p>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = memoriesToShow.map(memory => `
        <div class="gallery-item" onclick="viewMemory('${escapeHtml(memory.title)}', '${escapeHtml(memory.description)}', '${memory.date}')">
            ${memory.imageUrl ? 
                `<img src="${memory.imageUrl}" alt="${escapeHtml(memory.title)}">` :
                `<div class="gallery-placeholder">
                    <i class="fas fa-camera-retro"></i>
                    <p>📸 ${escapeHtml(memory.title)}</p>
                </div>`
            }
            <div style="padding:12px;">
                <h4 style="font-size:0.9rem; margin-bottom:4px;">${escapeHtml(memory.title)}</h4>
                <p style="font-size:0.75rem; color:var(--gray-500);">${formatDate(memory.date, 'short')}</p>
            </div>
        </div>
    `).join('');
}

function viewMemory(title, description, date) {
    const modal = document.getElementById('letterModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    
    if (modalTitle) modalTitle.textContent = `📸 ${title}`;
    if (modalContent) {
        modalContent.innerHTML = `
            <p>${escapeHtml(description)}</p>
            <p style="margin-top:12px; font-size:0.8rem; color:var(--pink-primary);">${formatDate(date)}</p>
        `;
    }
    if (modal) modal.classList.add('active');
}

function openMemoryModal() {
    const modal = document.getElementById('memoryModal');
    if (modal) modal.classList.add('active');
}

function closeMemoryModal() {
    const modal = document.getElementById('memoryModal');
    if (modal) modal.classList.remove('active');
}

async function addMemory(event) {
    event.preventDefault();
    
    const title = document.getElementById('memoryTitleInput')?.value;
    const description = document.getElementById('memoryDescInput')?.value;
    const date = document.getElementById('memoryDateInput')?.value;
    const imageUrl = document.getElementById('memoryImageInput')?.value;
    
    if (!title || !description || !date) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    const { error } = await _supabase
        .from('memories')
        .insert({
            couple_id: currentCouple.id,
            title: title,
            description: description,
            date: date,
            image_url: imageUrl || null
        });
    
    if (error) {
        console.error('Error adding memory:', error);
        showToast('Failed to add memory', 'error');
    } else {
        showToast('Memory added! ❤️', 'success');
        closeMemoryModal();
        await loadMemories();
        
        // Clear form
        const titleInput = document.getElementById('memoryTitleInput');
        const descInput = document.getElementById('memoryDescInput');
        const dateInput = document.getElementById('memoryDateInput');
        const imageInput = document.getElementById('memoryImageInput');
        if (titleInput) titleInput.value = '';
        if (descInput) descInput.value = '';
        if (dateInput) dateInput.value = '';
        if (imageInput) imageInput.value = '';
    }
}

// ========================================
// COUNTDOWN FUNCTIONALITY
// ========================================

async function loadCountdown() {
    if (!currentCouple || !currentCouple.next_meeting_date) {
        const infoElement = document.getElementById('nextMeetingInfo');
        if (infoElement) {
            infoElement.innerHTML = '<i class="fas fa-calendar-alt"></i><span>Set your next meeting date in database</span>';
        }
        return;
    }
    
    const targetDate = new Date(currentCouple.next_meeting_date);
    const elements = {
        days: document.getElementById('countdownDays'),
        hours: document.getElementById('countdownHours'),
        minutes: document.getElementById('countdownMins'),
        seconds: document.getElementById('countdownSecs')
    };
    
    const infoElement = document.getElementById('nextMeetingInfo');
    if (infoElement) {
        infoElement.innerHTML = `<i class="fas fa-map-marker-alt"></i><span>Next meeting: ${formatDate(targetDate)}</span>`;
    }
    
    if (countdownInterval) clearInterval(countdownInterval);
    
    function update() {
        updateCountdown(targetDate, elements);
    }
    
    update();
    countdownInterval = setInterval(update, 1000);
}

// ========================================
// UI UPDATES
// ========================================

function updateWelcomeMessage() {
    const userNameElement = document.getElementById('userName');
    if (userNameElement && userProfile) {
        const name = userProfile.full_name?.split(' ')[0] || 'Love';
        userNameElement.textContent = name;
    }
}

function updateRelationshipInfo() {
    if (!currentCouple?.started_date) return;
    
    const durationElement = document.getElementById('relationshipDuration');
    if (durationElement) {
        durationElement.textContent = formatRelationshipDuration(currentCouple.started_date);
    }
}

function updateLoveMeter() {
    const valueElement = document.getElementById('loveMeterValue');
    const fillElement = document.getElementById('loveMeterFill');
    const messageElement = document.getElementById('loveMeterMessage');
    
    const value = getRandomLoveMeter();
    
    if (valueElement) valueElement.textContent = value + '%';
    if (fillElement) fillElement.style.width = value + '%';
    if (messageElement) messageElement.textContent = getLoveMeterMessage(value);
}

// ========================================
// REALTIME LISTENERS
// ========================================

function setupRealtimeListeners() {
    if (!currentCouple) return;
    
    // Listen for new messages
    _supabase
        .channel('chat-messages')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `couple_id=eq.${currentCouple.id}`
        }, (payload) => {
            const newMessage = payload.new;
            if (newMessage.sender_id !== currentUser.id) {
                displayChatMessage(newMessage);
                showToast('New message from your love! 💬', 'chat');
            }
        })
        .subscribe();
    
    // Listen for pokes
    _supabase
        .channel('pokes')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'pokes',
            filter: `to_user_id=eq.${currentUser.id}`
        }, (payload) => {
            const poke = payload.new;
            let message = '';
            if (poke.type === 'poke') message = '💗 Someone poked you!';
            else if (poke.type === 'kangen') message = '🥺 Someone misses you!';
            else message = '💌 Someone sent you love!';
            
            showToast(message, 'poke');
            createFloatingHearts(20);
        })
        .subscribe();
    
    // Listen for profile changes
    _supabase
        .channel('profiles')
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles'
        }, async (payload) => {
            if (payload.new.user_id === currentPartner) {
                updatePartnerStatus(payload.new);
            }
        })
        .subscribe();
}

// ========================================
// NAVIGATION
// ========================================

function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.querySelector('.nav-menu');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.getAttribute('data-section');
            if (section) {
                switchSection(section);
            }
            
            if (navMenu && window.innerWidth <= 768) {
                navMenu.classList.remove('active');
            }
        });
    });
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            if (navMenu) navMenu.classList.toggle('active');
        });
    }
}

function switchSection(section) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.getAttribute('data-section') === section) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update sections
    if (sections) {
        Object.keys(sections).forEach(key => {
            if (sections[key]) {
                if (key === section) {
                    sections[key].classList.add('active');
                } else {
                    sections[key].classList.remove('active');
                }
            }
        });
    }
    
    // Special actions for chat section
    if (section === 'chat') {
        const container = document.getElementById('chatMessages');
        if (container) container.scrollTop = container.scrollHeight;
    }
}

// ========================================
// EVENT LISTENERS SETUP
// ========================================

function setupEventListeners() {
    // Logout buttons
    const logoutBtns = document.querySelectorAll('#logoutBtn, #logoutBtnNav');
    logoutBtns.forEach(btn => {
        if (btn) btn.addEventListener('click', logout);
    });
    
    // Chat send button
    const sendBtn = document.getElementById('sendChatBtn');
    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    
    // Chat input enter key
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
    
    // Poke buttons
    document.querySelectorAll('.poke-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const pokeType = btn.getAttribute('data-poke');
            if (pokeType) sendPoke(pokeType);
        });
    });
    
    // Add memory button
    const addMemoryBtn = document.getElementById('addMemoryBtn');
    if (addMemoryBtn) addMemoryBtn.addEventListener('click', openMemoryModal);
    
    // Memory form
    const memoryForm = document.getElementById('memoryForm');
    if (memoryForm) memoryForm.addEventListener('submit', addMemory);
    
    // Modal close on outside click
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // ESC key close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
        }
    });
}

// Make functions global for HTML onclick
window.openLetterModal = openLetterModal;
window.closeLetterModal = closeLetterModal;
window.openMemoryModal = openMemoryModal;
window.closeMemoryModal = closeMemoryModal;
window.viewMemory = viewMemory;
window.addMemory = addMemory;
window.sendPoke = sendPoke;
