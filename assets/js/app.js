// /js/app.js
import { supabase, getCurrentUser, getSession } from './assets/js/services/supabase.js';
import { AuthService } from './assets/js/services/auth.js';
import { CoupleService } from './assets/js/services/couple.js';
import { NotificationsService } from './assets/js/services/notifications.js';

// Import page components
import { renderLogin, initLogin } from './assets/js/pages/Login.js';
import { renderRegister, initRegister } from './assets/js/pages/Register.js';
import { renderDashboard, initDashboard } from './assets/js/pages/Dashboard.js';
import { renderChat, initChat } from './assets/js/pages/Chat.js';
import { renderGallery, initGallery } from './assets/js/pages/Gallery.js';
import { renderFinance, initFinance } from './assets/js/pages/Finance.js';
import { renderDatePlanner, initDatePlanner } from './assets/js/pages/DatePlanner.js';
import { renderProfile, initProfile } from './assets/js/pages/Profile.js';
import { renderNotifications, initNotifications } from './assets/js/pages/Notifications.js';
import { renderMissions, initMissions } from './assets/js/pages/Missions.js';
import { renderSplash, initSplash } from './assets/js/pages/Splash.js';
import { renderWelcome, initWelcome } from './assets/js/pages/Welcome.js';

const app = document.getElementById('app');

// Router state
let currentPage = 'splash';
let currentUser = null;
let currentProfile = null;
let coupleData = null;

// Page mappings with init functions
const pages = {
    splash: { render: renderSplash, init: initSplash },
    welcome: { render: renderWelcome, init: initWelcome },
    login: { render: renderLogin, init: initLogin },
    register: { render: renderRegister, init: initRegister },
    dashboard: { render: renderDashboard, init: initDashboard },
    chat: { render: renderChat, init: initChat },
    gallery: { render: renderGallery, init: initGallery },
    finance: { render: renderFinance, init: initFinance },
    dateplanner: { render: renderDatePlanner, init: initDatePlanner },
    profile: { render: renderProfile, init: initProfile },
    notifications: { render: renderNotifications, init: initNotifications },
    missions: { render: renderMissions, init: initMissions }
};

export async function navigate(page, params = {}) {
    if (!pages[page]) {
        console.error(`Page "${page}" not found`);
        return;
    }

    currentPage = page;
    const pageModule = pages[page];
    
    // Check if page requires authentication
    const requiresAuth = ['dashboard', 'chat', 'gallery', 'finance', 'dateplanner', 'profile', 'notifications', 'missions'];
    
    if (requiresAuth.includes(page)) {
        try {
            const session = await getSession();
            if (!session) {
                navigate('login');
                return;
            }
            currentUser = session.user;
            await loadUserData();
            
            if (!coupleData && page !== 'profile') {
                const profile = await AuthService.getProfile(currentUser.id);
                if (profile?.couple_id) {
                    coupleData = await CoupleService.getCouple(profile.couple_id);
                } else {
                    navigate('welcome');
                    return;
                }
            }
        } catch (error) {
            console.error('Auth check error:', error);
            navigate('login');
            return;
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
        app.innerHTML = pageModule.render(context);
        app.style.opacity = '1';
        app.classList.remove('page-transition');
        
        // Initialize page-specific functionality
        if (pageModule.init) {
            setTimeout(() => pageModule.init(), 100);
        }
        
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
        if (coupleData) {
            navigate('dashboard');
        } else {
            navigate('welcome');
        }
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
        const session = await getSession();
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
