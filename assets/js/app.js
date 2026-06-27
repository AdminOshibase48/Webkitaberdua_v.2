import { AuthService } from './asseets/services/auth.js';
import { CoupleService } from './assets/services/couple.js';
import { NotificationsService } from './assets/services/notifications.js';
import { supabase } from './assets/services/supabase.js';

// Import page components
import { renderLogin } from './asset/js/pages/Login.js';
import { renderRegister } from './asset/js/pages/Register.js';
import { renderDashboard } from './asset/js/pages/Dashboard.js';
import { renderChat } from './asset/js/pages/Chat.js';
import { renderGallery } from './asset/js/pages/Gallery.js';
import { renderFinance } from './asset/js/pages/Finance.js';
import { renderDatePlanner } from './asset/js/pages/DatePlanner.js';
import { renderProfile } from './asset/js/pages/Profile.js';
import { renderNotifications } from './asset/js/pages/Notifications.js';
import { renderMissions } from './asset/js/pages/Missions.js';
import { renderSplash } from './asset/js/pages/Splash.js';
import { renderWelcome } from './asset/js/pages/Welcome.js';

const app = document.getElementById('app');

// Router state
let currentPage = 'splash';
let currentUser = null;
let currentProfile = null;
let coupleData = null;
let subscription = null;

// Page mappings
const pages = {
    splash: renderSplash,
    welcome: renderWelcome,
    login: renderLogin,
    register: renderRegister,
    dashboard: renderDashboard,
    chat: renderChat,
    gallery: renderGallery,
    finance: renderFinance,
    dateplanner: renderDatePlanner,
    profile: renderProfile,
    notifications: renderNotifications,
    missions: renderMissions
};

export async function navigate(page, params = {}) {
    if (!pages[page]) {
        console.error(`Page "${page}" not found`);
        return;
    }

    currentPage = page;
    const renderFn = pages[page];
    
    // Check if page requires authentication
    const requiresAuth = ['dashboard', 'chat', 'gallery', 'finance', 'dateplanner', 'profile', 'notifications', 'missions'];
    
    if (requiresAuth.includes(page)) {
        if (!currentUser) {
            const session = await AuthService.getSession();
            if (!session) {
                navigate('login');
                return;
            }
            currentUser = session.user;
            await loadUserData();
        }
        
        if (!coupleData && page !== 'profile') {
            // Check if user has a couple
            const profile = await AuthService.getProfile(currentUser.id);
            if (profile.couple_id) {
                coupleData = await CoupleService.getCouple(profile.couple_id);
            } else {
                // User needs to create or join a couple
                navigate('welcome');
                return;
            }
        }
    }

    // Render the page
    const context = {
        user: currentUser,
        profile: currentProfile,
        couple: coupleData,
        params: params,
        navigate: navigate
    };

    // Apply page transition
    app.classList.add('page-transition');
    app.style.opacity = '0';
    
    setTimeout(() => {
        app.innerHTML = renderFn(context);
        app.style.opacity = '1';
        app.classList.remove('page-transition');
        
        // Update URL
        if (page !== 'splash' && page !== 'welcome') {
            window.history.pushState({ page, params }, '', `/${page}`);
        }
    }, 200);
}

async function loadUserData() {
    if (!currentUser) return;
    
    try {
        currentProfile = await AuthService.getProfile(currentUser.id);
        if (currentProfile?.couple_id) {
            coupleData = await CoupleService.getCouple(currentProfile.couple_id);
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Handle navigation from URL
export function handleRoute() {
    const path = window.location.pathname.replace('/', '') || 'splash';
    const pageMap = {
        '': 'splash',
        'splash': 'splash',
        'welcome': 'welcome',
        'login': 'login',
        'register': 'register',
        'dashboard': 'dashboard',
        'chat': 'chat',
        'gallery': 'gallery',
        'finance': 'finance',
        'dateplanner': 'dateplanner',
        'profile': 'profile',
        'notifications': 'notifications',
        'missions': 'missions'
    };
    
    const page = pageMap[path] || 'splash';
    navigate(page);
}

// Auth state listener
AuthService.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN') {
        currentUser = session.user;
        await loadUserData();
        navigate('dashboard');
    } else if (event === 'SIGNED_OUT') {
        currentUser = null;
        currentProfile = null;
        coupleData = null;
        navigate('splash');
    }
});

// Initialize app
async function initApp() {
    // Check for existing session
    try {
        const session = await AuthService.getSession();
        if (session) {
            currentUser = session.user;
            await loadUserData();
            if (coupleData) {
                navigate('dashboard');
            } else {
                navigate('welcome');
            }
        } else {
            navigate('splash');
        }
    } catch (error) {
        console.error('Init error:', error);
        navigate('splash');
    }

    // Handle browser back/forward
    window.addEventListener('popstate', (event) => {
        const state = event.state || {};
        navigate(state.page || 'splash', state.params || {});
    });
}

// Start the app
document.addEventListener('DOMContentLoaded', initApp);

// Expose navigate globally for use in components
window.navigate = navigate;

// Handle offline/online status
window.addEventListener('online', () => {
    document.body.classList.remove('offline');
});

window.addEventListener('offline', () => {
    document.body.classList.add('offline');
});
