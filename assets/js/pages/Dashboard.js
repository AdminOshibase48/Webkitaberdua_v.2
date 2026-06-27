import { AuthService } from '../assets/js/services/auth.js';
import { CoupleService } from '../assets/js/services/couple.js';
import { ChatService } from '../assets/js/services/chat.js';
import { NotificationsService } from '../assets/js/services/notifications.js';

export function renderDashboard(context) {
    const { user, profile, couple } = context;
    
    // Calculate days together
    let daysTogether = 0;
    if (couple) {
        const created = new Date(couple.created_at);
        daysTogether = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
    }
    
    return `
        <div class="font-body-md text-on-surface bg-background min-h-screen pb-32">
            <!-- TopNavBar -->
            <header class="fixed top-0 w-full z-50 flex justify-between items-center px-container-padding-mobile md:px-container-padding-desktop h-16 bg-surface/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(135,78,88,0.08)]">
                <div class="flex items-center gap-3">
                    <div class="relative w-10 h-10">
                        <img class="w-10 h-10 rounded-full border-2 border-primary-container object-cover" alt="Profile" src="${profile?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile?.display_name || 'User')}" />
                        <div class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                        <h1 class="font-headline-sm text-headline-sm-mobile md:text-headline-sm text-primary">Good ${getTimeOfDay()} ❤️</h1>
                        <p class="text-[10px] font-label-sm text-on-surface-variant flex items-center gap-1 uppercase tracking-wider">
                            Partner Online
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        </p>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <button class="p-2 text-primary hover:bg-primary-container/20 transition-colors rounded-full active:scale-95 duration-200" data-page="missions">
                        <span class="material-symbols-outlined">favorite</span>
                    </button>
                    <button class="p-2 text-primary hover:bg-primary-container/20 transition-colors rounded-full active:scale-95 duration-200 relative" data-page="notifications" id="notif-bell">
                        <span class="material-symbols-outlined">notifications</span>
                        <span class="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full hidden" id="notif-dot"></span>
                    </button>
                </div>
            </header>
            
            <main class="pt-24 px-container-padding-mobile max-w-lg mx-auto">
                <!-- Relationship Hero Section -->
                <section class="mb-card-gap">
                    <div class="glass-card rounded-xl p-6 flex flex-col items-center text-center shadow-[0_20px_50px_rgba(135,78,88,0.1)]">
                        <p class="font-label-md text-on-surface-variant mb-1 uppercase tracking-widest">Days Together</p>
                        <h2 class="font-display-lg text-display-lg-mobile text-primary mb-4">${daysTogether}</h2>
                        <div class="w-full space-y-2">
                            <div class="flex justify-between items-end mb-1">
                                <span class="font-label-sm text-on-surface-variant flex items-center gap-1">
                                    <span class="material-symbols-outlined text-[16px] filled">favorite</span>
                                    Love Level ${profile?.level || 1}
                                </span>
                                <span class="font-label-sm text-primary">${profile?.xp || 0} / ${getNextLevelXP(profile?.level || 1)} XP</span>
                            </div>
                            <div class="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                                <div class="h-full love-gradient rounded-full" style="width: ${getXPPercentage(profile?.xp || 0, profile?.level || 1)}%;"></div>
                            </div>
                        </div>
                    </div>
                </section>
                
                <!-- Daily Mission & Mood -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-card-gap">
                    <!-- Mission Card -->
                    <section class="glass-card rounded-xl p-5 border-l-4 border-primary shadow-sm hover:shadow-md transition-all group" id="daily-mission">
                        <div class="flex justify-between items-start mb-4">
                            <div class="bg-primary-container/30 p-2 rounded-lg text-primary">
                                <span class="material-symbols-outlined">task_alt</span>
                            </div>
                            <span class="text-[10px] font-label-sm px-2 py-1 bg-primary text-on-primary rounded-full uppercase">Daily Mission</span>
                        </div>
                        <h3 class="font-headline-sm text-on-surface mb-1" id="mission-title">Send a sweet voice note</h3>
                        <p class="text-label-md text-on-surface-variant mb-4" id="mission-desc">Record a message telling them why you appreciate them today.</p>
                        <button class="w-full py-2 bg-primary text-on-primary rounded-full font-label-md pulse-shadow hover:scale-105 transition-transform active:scale-95" id="complete-mission">Complete +50 XP</button>
                    </section>
                    
                    <!-- Mood Selector -->
                    <section class="glass-card rounded-xl p-5 shadow-sm">
                        <h3 class="font-label-md text-on-surface-variant mb-4 uppercase tracking-widest text-center">Your Today's Mood</h3>
                        <div class="flex justify-around items-center">
                            ${['😊', '🥰', '😴', '🤗'].map((emoji, i) => `
                                <button class="flex flex-col items-center gap-2 group mood-btn" data-mood="${['happy', 'loving', 'tired', 'grateful'][i]}">
                                    <div class="w-12 h-12 flex items-center justify-center ${i === 1 ? 'bg-primary-container/20 border-2 border-primary' : 'bg-tertiary-container/20'} rounded-full group-hover:bg-primary-container/30 transition-colors">
                                        <span class="text-2xl">${emoji}</span>
                                    </div>
                                    <span class="text-[10px] font-label-sm ${i === 1 ? 'text-primary font-bold' : 'text-on-surface-variant'}">${['Happy', 'Loving', 'Tired', 'Grateful'][i]}</span>
                                </button>
                            `).join('')}
                        </div>
                    </section>
                </div>
                
                <!-- Quick Actions Bento -->
                <section class="grid grid-cols-2 gap-gutter mb-card-gap">
                    <div class="bg-surface-container-low p-4 rounded-xl flex flex-col gap-3 group hover:bg-surface-container-high transition-colors cursor-pointer" data-page="dateplanner">
                        <span class="material-symbols-outlined text-secondary">restaurant</span>
                        <div>
                            <p class="font-headline-sm text-on-surface">Dinner Idea</p>
                            <p class="text-label-sm text-on-surface-variant">Suggest a place</p>
                        </div>
                    </div>
                    <div class="bg-surface-container-low p-4 rounded-xl flex flex-col gap-3 group hover:bg-surface-container-high transition-colors cursor-pointer" data-page="gallery">
                        <span class="material-symbols-outlined text-tertiary">photo_album</span>
                        <div>
                            <p class="font-headline-sm text-on-surface">Add Photo</p>
                            <p class="text-label-sm text-on-surface-variant">Capture a moment</p>
                        </div>
                    </div>
                </section>
                
                <!-- Anniversary Countdown -->
                <section class="glass-card rounded-xl overflow-hidden shadow-lg mb-card-gap">
                    <div class="h-32 bg-cover bg-center flex items-end" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuALXPFN0Oe55vqF2CrBcug80ogbeHKVs-3-3rcXWuknX15Z4GWlJK1olPWMKxAllfMdqoAgMdY4mP-iDagWXnNXwhHt2DpSQG4jGZf0E82QpFtBce4BWznlwZ6b--RAVg1NG50wYVlmRLe_f2Zc_LYnbJGHIpykzj1Rh6Mq29-njtw3BK0QJw-foGa_dkTjuuy99zZr_SxXQbD3Q5kvW-EoEGpyKrhDA3oZotbUmlFY7fFVMy-HY_0jQ4Js6OKVo8T64omiL8tA7oo')">
                        <div class="bg-black/20 backdrop-blur-md w-full p-3 flex justify-between items-center">
                            <span class="text-white font-label-md">Next Anniversary</span>
                            <span class="bg-white/90 text-primary px-3 py-1 rounded-full text-label-sm font-bold" id="anniversary-days">14 Days Left</span>
                        </div>
                    </div>
                    <div class="p-4">
                        <div class="flex justify-between items-center">
                            <div>
                                <h4 class="font-headline-sm text-on-surface" id="anniversary-title">Our 1.5 Year Mark</h4>
                                <p class="text-label-sm text-on-surface-variant" id="anniversary-date">June 24th, 2024</p>
                            </div>
                            <button class="bg-primary-container text-on-primary-container px-4 py-2 rounded-full text-label-sm font-bold" id="set-reminder">Set Reminder</button>
                        </div>
                    </div>
                </section>
                
                <!-- Activity Feed Preview -->
                <section class="space-y-4">
                    <h3 class="font-label-md text-on-surface-variant uppercase tracking-widest px-2">Recent Memories</h3>
                    <div class="flex gap-4 overflow-x-auto pb-4 px-2 snap-x no-scrollbar" id="memory-feed">
                        <!-- Will be populated dynamically -->
                        <div class="flex-shrink-0 w-32 h-44 rounded-xl overflow-hidden snap-start shadow-md relative group bg-surface-container animate-pulse">
                            <div class="w-full h-full bg-surface-container-highest"></div>
                        </div>
                        <div class="flex-shrink-0 w-32 h-44 rounded-xl overflow-hidden snap-start shadow-md relative group bg-surface-container animate-pulse">
                            <div class="w-full h-full bg-surface-container-highest"></div>
                        </div>
                        <div class="flex-shrink-0 w-32 h-44 rounded-xl overflow-hidden snap-start shadow-md relative group bg-surface-container animate-pulse">
                            <div class="w-full h-full bg-surface-container-highest"></div>
                        </div>
                    </div>
                </section>
            </main>
            
            <!-- FAB for Quick Message -->
            <button class="fixed bottom-24 right-6 w-14 h-14 love-gradient rounded-full text-white shadow-xl z-40 active:scale-90 duration-300 ease-out flex items-center justify-center pulse-shadow" data-page="chat">
                <span class="material-symbols-outlined text-[28px] filled">edit</span>
            </button>
            
            <!-- BottomNavBar -->
            <nav class="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-lg z-50 flex justify-around items-center p-2 bg-surface/60 backdrop-blur-2xl rounded-full bg-white/40 border border-white/50 shadow-[0_20px_50px_rgba(100,84,149,0.15)]">
                ${['home', 'favorite', 'photo_library', 'payments', 'person'].map((icon, i) => `
                    <a class="flex flex-col items-center justify-center ${i === 0 ? 'bg-primary-container text-on-primary-container rounded-full px-5 py-2' : 'text-on-surface-variant p-2 hover:bg-secondary-container/30 rounded-full'} transition-all active:scale-90 duration-300 cursor-pointer" data-page="${['dashboard', 'chat', 'gallery', 'finance', 'profile'][i]}">
                        <span class="material-symbols-outlined ${i === 0 ? 'filled' : ''}">${icon}</span>
                        <span class="font-label-sm text-label-sm">${['Home', 'Chat', 'Gallery', 'Finance', 'Profile'][i]}</span>
                    </a>
                `).join('')}
            </nav>
        </div>
    `;
}

export function initDashboard() {
    // Navigation
    document.querySelectorAll('[data-page]').forEach(el => {
        el.addEventListener('click', function() {
            const page = this.dataset.page;
            if (page) window.navigate(page);
        });
    });

    // Complete mission
    const missionBtn = document.getElementById('complete-mission');
    if (missionBtn) {
        missionBtn.addEventListener('click', function() {
            const originalText = this.textContent;
            this.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span>';
            this.disabled = true;
            
            setTimeout(() => {
                this.innerHTML = '✅ Completed! +50 XP';
                this.classList.remove('bg-primary');
                this.classList.add('bg-green-500');
                
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.classList.remove('bg-green-500');
                    this.classList.add('bg-primary');
                    this.disabled = false;
                    showToast('Mission completed! 🎉 +50 XP earned!', 'success');
                }, 2000);
            }, 1500);
        });
    }

    // Mood buttons
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.mood-btn').forEach(b => {
                b.querySelector('div').classList.remove('bg-primary-container/20', 'border-2', 'border-primary');
                b.querySelector('span:last-child').classList.remove('text-primary', 'font-bold');
            });
            this.querySelector('div').classList.add('bg-primary-container/20', 'border-2', 'border-primary');
            this.querySelector('span:last-child').classList.add('text-primary', 'font-bold');
            showToast(`Mood set to ${this.dataset.mood} ❤️`, 'success');
        });
    });

    // Anniversary reminder
    const reminderBtn = document.getElementById('set-reminder');
    if (reminderBtn) {
        reminderBtn.addEventListener('click', function() {
            this.textContent = '✅ Reminder Set';
            this.classList.remove('bg-primary-container', 'text-on-primary-container');
            this.classList.add('bg-green-500', 'text-white');
            showToast('Anniversary reminder set! 📅', 'success');
        });
    }

    // Load recent memories
    loadRecentMemories();
    
    // Load unread notification count
    loadNotificationCount();
}

async function loadRecentMemories() {
    // This would be populated from the gallery service
    const feed = document.getElementById('memory-feed');
    if (!feed) return;
    
    // Placeholder - in production, this would load from Supabase
    const memories = [
        { id: 1, url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzXjNRJmJYU2Hgk-VdA8Op-P_21adkbIeuxyqI97IpAxR9Gu6zRDnsvB25tHDYhQYfFAxP0oH0LrGJbzW_h2ef3lGAx-PX0OLVvoeQ8gE4l26E2E3kw07qq612Weyg-UlgD3YE_Ibs0F9dRLHvjMjpLwIddQkA1nhpd9hgF8BNlgNONvnksPtvnwUtXLji7bcIEJng4sz0pmipUjuoJJK4Fv6Dk4-jXpQHl6hmoTqs5LBQY8I_5SAkgjsu8Bk8ZQmFo1iaD-d-uMc', caption: 'Cafe Date • 2d ago' },
        { id: 2, url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7uDZ3RYulpgm83bD6gFoVA3KZ9xujcoGN9GB0yh-azLlCU_rFoaj79IT-AgQXtUcRP_zF6gTlX41d_mKYFRKk88vX3zTGCv2t2TwpstXSfFF1XIWoca5AKI9z84k0-ChgVFTaA1TOWUURwLdGMH3_FK9hWUK13_smAdKRbu2o6C9ftG9yaPF1UuR4k0OZvw8xpmvv6OC_CxPWImbao3PaA9NOKoZO6c_lPo0G1Z9E_GsoxgeI6S2vnMQsN5s6y5SwF8bJ495e-IA', caption: 'Hiking • 1w ago' }
    ];
    
    feed.innerHTML = memories.map(m => `
        <div class="flex-shrink-0 w-32 h-44 rounded-xl overflow-hidden snap-start shadow-md relative group cursor-pointer" data-page="gallery">
            <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="${m.url}" alt="${m.caption}" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                <span class="text-white text-[10px] font-label-sm">${m.caption}</span>
            </div>
        </div>
    `).join('');
    
    // Add click handlers
    feed.querySelectorAll('[data-page]').forEach(el => {
        el.addEventListener('click', function() {
            window.navigate(this.dataset.page);
        });
    });
}

async function loadNotificationCount() {
    try {
        const user = await AuthService.getCurrentUser();
        if (user) {
            const count = await NotificationsService.getUnreadCount(user.id);
            const dot = document.getElementById('notif-dot');
            if (dot) {
                dot.classList.toggle('hidden', count === 0);
            }
        }
    } catch (error) {
        console.error('Error loading notification count:', error);
    }
}

function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
}

function getNextLevelXP(level) {
    return Math.floor(100 * Math.pow(1.5, level - 1));
}

function getXPPercentage(xp, level) {
    const next = getNextLevelXP(level);
    return Math.min((xp / next) * 100, 100);
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
