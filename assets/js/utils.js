// ========================================
// UTILITY FUNCTIONS
// ========================================

// Format date to Indonesian format
function formatDate(date, format = 'long') {
    const d = new Date(date);
    const options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };
    
    if (format === 'short') {
        return d.toLocaleDateString('id-ID');
    }
    
    return d.toLocaleDateString('id-ID', options);
}

// Format time
function formatTime(date) {
    const d = new Date(date);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// Escape HTML to prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Show toast notification
function showToast(message, type = 'love') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    
    let icon = '❤️';
    if (type === 'love') icon = '❤️';
    else if (type === 'chat') icon = '💬';
    else if (type === 'poke') icon = '💗';
    else if (type === 'success') icon = '✅';
    else if (type === 'error') icon = '❌';
    
    toast.innerHTML = `<i class="fas fa-heart" style="color: #FF6B9D;"></i><span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, APP_CONFIG.toastDuration);
}

// Create floating hearts animation
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
        heart.style.opacity = 0.4 + Math.random() * 0.5;
        
        container.appendChild(heart);
        setTimeout(() => heart.remove(), 5000);
    }
}

// Play sound effect
function playSound(soundName) {
    try {
        const audio = new Audio(`assets/sounds/${soundName}.mp3`);
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (e) {
        console.log('Sound not available');
    }
}

// Calculate relationship duration
function calculateRelationshipDuration(startDate) {
    const start = new Date(startDate);
    const now = new Date();
    
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();
    
    if (days < 0) {
        months--;
        const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += lastMonth.getDate();
    }
    
    if (months < 0) {
        years--;
        months += 12;
    }
    
    let totalDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    
    return { years, months, days, totalDays };
}

// Format relationship duration text
function formatRelationshipDuration(startDate) {
    const { years, months, days, totalDays } = calculateRelationshipDuration(startDate);
    
    if (years > 0) {
        return `${years} year${years > 1 ? 's' : ''} ${months > 0 ? `& ${months} month${months > 1 ? 's' : ''}` : ''} of love`;
    } else if (months > 0) {
        return `${months} month${months > 1 ? 's' : ''} ${days > 0 ? `& ${days} day${days > 1 ? 's' : ''}` : ''} of love`;
    } else {
        return `${totalDays} day${totalDays > 1 ? 's' : ''} of love`;
    }
}

// Update countdown
function updateCountdown(targetDate, elements) {
    const now = new Date();
    const diff = targetDate - now;
    
    if (diff <= 0) {
        if (elements.days) elements.days.textContent = '00';
        if (elements.hours) elements.hours.textContent = '00';
        if (elements.minutes) elements.minutes.textContent = '00';
        if (elements.seconds) elements.seconds.textContent = '00';
        return false;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (86400000)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (3600000)) / (1000 * 60));
    const seconds = Math.floor((diff % (60000)) / 1000);
    
    if (elements.days) elements.days.textContent = String(days).padStart(2, '0');
    if (elements.hours) elements.hours.textContent = String(hours).padStart(2, '0');
    if (elements.minutes) elements.minutes.textContent = String(minutes).padStart(2, '0');
    if (elements.seconds) elements.seconds.textContent = String(seconds).padStart(2, '0');
    
    return true;
}

// Generate random love meter value (between 90-100)
function getRandomLoveMeter() {
    return Math.floor(Math.random() * 11) + 90;
}

// Get love meter message based on value
function getLoveMeterMessage(value) {
    if (value >= 98) return "You two are inseparable! ❤️";
    if (value >= 95) return "Perfect match! 💕";
    if (value >= 90) return "Soulmates forever! 💗";
    return "Love is growing everyday! 💖";
}

// Create a unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Scroll to element smoothly
function scrollToElement(elementId, offset = 80) {
    const element = document.getElementById(elementId);
    if (element) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Get current date string
function getCurrentDateString() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return now.toLocaleDateString('id-ID', options);
}

// Set current date in welcome banner
function setCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = getCurrentDateString();
    }
}

// Copy text to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!', 'success');
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
}

// Get random love quote
function getRandomLoveQuote() {
    const quotes = [
        "In every heartbeat, there's your name.",
        "You are my today and all of my tomorrows.",
        "I love you more than all the stars in the sky.",
        "Every love story is beautiful, but ours is my favorite.",
        "You make my world brighter just by being in it.",
        "Distance means so little when someone means so much.",
        "I carry your heart with me wherever I go.",
        "You are the best thing that's ever been mine."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
}

// Export for global use
window.utils = {
    formatDate,
    formatTime,
    escapeHtml,
    showToast,
    createFloatingHearts,
    playSound,
    formatRelationshipDuration,
    updateCountdown,
    getRandomLoveMeter,
    getLoveMeterMessage,
    getRandomLoveQuote,
    setCurrentDate,
    scrollToElement,
    copyToClipboard
};
