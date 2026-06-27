import { AuthService } from '../assets/js/services/auth.js';
import { CoupleService } from '../assets/js/services/couple.js';

export function renderRegister() {
    return `
        <div class="min-h-screen bg-gradient-to-b from-primary-fixed/20 to-secondary-fixed/20 flex flex-col items-center justify-center p-container-padding-mobile md:p-container-padding-desktop relative">
            <!-- Background Decorative -->
            <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div class="absolute -top-24 -left-24 w-96 h-96 bg-primary-container/30 rounded-full blur-3xl animate-pulse"></div>
                <div class="absolute top-1/2 -right-48 w-[500px] h-[500px] bg-secondary-container/20 rounded-full blur-[100px]"></div>
            </div>
            
            <main class="relative z-10 w-full max-w-xl">
                <!-- Brand Header -->
                <div class="mb-10 text-center">
                    <h1 class="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-2 tracking-tight">OurStory</h1>
                    <p class="font-body-md text-on-surface-variant max-w-xs mx-auto">Begin your shared digital sanctuary today.</p>
                </div>
                
                <!-- Registration Container -->
                <div class="w-full max-w-xl">
                    <div class="glass-card rounded-xl p-8 md:p-10 soft-shadow flex flex-col gap-8">
                        <form id="register-form" class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <!-- Name Field -->
                                <div class="space-y-2">
                                    <label class="font-label-md text-label-md text-on-surface-variant ml-2">Display Name</label>
                                    <div class="relative group input-focus-ring rounded-lg border border-outline-variant bg-surface-container-lowest/50 transition-all">
                                        <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
                                            <span class="material-symbols-outlined text-[20px]">person</span>
                                        </div>
                                        <input class="w-full pl-12 pr-4 py-4 bg-transparent border-none rounded-lg focus:ring-0 font-body-md text-on-surface placeholder:text-outline-variant" id="display-name" placeholder="Your name" type="text" required />
                                    </div>
                                </div>
                                
                                <!-- Email Field -->
                                <div class="space-y-2">
                                    <label class="font-label-md text-label-md text-on-surface-variant ml-2">Email Address</label>
                                    <div class="relative group input-focus-ring rounded-lg border border-outline-variant bg-surface-container-lowest/50 transition-all">
                                        <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
                                            <span class="material-symbols-outlined text-[20px]">mail</span>
                                        </div>
                                        <input class="w-full pl-12 pr-4 py-4 bg-transparent border-none rounded-lg focus:ring-0 font-body-md text-on-surface placeholder:text-outline-variant" id="email" placeholder="hello@ourstory.com" type="email" required />
                                    </div>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <!-- Password -->
                                <div class="space-y-2">
                                    <label class="font-label-md text-label-md text-on-surface-variant ml-2">Password</label>
                                    <div class="relative group input-focus-ring rounded-lg border border-outline-variant bg-surface-container-lowest/50 transition-all">
                                        <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
                                            <span class="material-symbols-outlined text-[20px]">lock</span>
                                        </div>
                                        <input class="w-full pl-12 pr-12 py-4 bg-transparent border-none rounded-lg focus:ring-0 font-body-md text-on-surface placeholder:text-outline-variant" id="password" placeholder="••••••••" type="password" required />
                                        <button class="absolute inset-y-0 right-4 flex items-center text-outline hover:text-primary transition-colors toggle-password" type="button">
                                            <span class="material-symbols-outlined text-[20px]">visibility</span>
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- Confirm Password -->
                                <div class="space-y-2">
                                    <label class="font-label-md text-label-md text-on-surface-variant ml-2">Confirm Password</label>
                                    <div class="relative group input-focus-ring rounded-lg border border-outline-variant bg-surface-container-lowest/50 transition-all">
                                        <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
                                            <span class="material-symbols-outlined text-[20px]">verified_user</span>
                                        </div>
                                        <input class="w-full pl-12 pr-4 py-4 bg-transparent border-none rounded-lg focus:ring-0 font-body-md text-on-surface placeholder:text-outline-variant" id="confirm-password" placeholder="••••••••" type="password" required />
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Special Couple Section -->
                            <div class="pt-4">
                                <div class="bg-secondary-container/20 rounded-lg p-6 border border-secondary-container/30">
                                    <div class="flex items-center gap-3 mb-4">
                                        <span class="material-symbols-outlined text-secondary filled">favorite</span>
                                        <h3 class="font-headline-sm text-headline-sm text-on-secondary-container">The Couple Link</h3>
                                    </div>
                                    <div class="flex flex-col md:flex-row gap-4" id="couple-toggle-group">
                                        <!-- Create Option -->
                                        <label class="flex-1 cursor-pointer group">
                                            <input checked class="sr-only peer" name="couple_type" type="radio" value="create" />
                                            <div class="h-full p-4 rounded-lg bg-surface-container-lowest border-2 border-transparent peer-checked:border-secondary transition-all flex flex-col items-center text-center gap-2 group-hover:bg-white">
                                                <span class="material-symbols-outlined text-[32px] text-secondary">add_circle</span>
                                                <span class="font-label-md text-label-md text-on-surface">Create New Code</span>
                                                <p class="text-[11px] text-on-surface-variant leading-tight">Start a fresh story and invite your partner later.</p>
                                            </div>
                                        </label>
                                        
                                        <!-- Join Option -->
                                        <label class="flex-1 cursor-pointer group">
                                            <input class="sr-only peer" name="couple_type" type="radio" value="join" />
                                            <div class="h-full p-4 rounded-lg bg-surface-container-lowest border-2 border-transparent peer-checked:border-secondary transition-all flex flex-col items-center text-center gap-2 group-hover:bg-white">
                                                <span class="material-symbols-outlined text-[32px] text-secondary">group_add</span>
                                                <span class="font-label-md text-label-md text-on-surface">Join Partner Code</span>
                                                <p class="text-[11px] text-on-surface-variant leading-tight">Enter the 6-digit code shared by your partner.</p>
                                            </div>
                                        </label>
                                    </div>
                                    
                                    <!-- Join Code Input (Conditional) -->
                                    <div class="mt-4 hidden" id="join-code-container">
                                        <input class="w-full text-center tracking-[0.5em] font-headline-md py-3 rounded-lg border-2 border-dashed border-secondary-container/50 bg-white/50 focus:ring-secondary focus:border-secondary transition-all" id="join-code" maxlength="6" placeholder="Enter 6-digit code" type="text" />
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Submit Action -->
                            <div class="pt-4 flex flex-col gap-4">
                                <button class="accent-gradient w-full py-5 rounded-lg text-white font-headline-sm text-headline-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg" type="submit" id="register-btn">
                                    Create Our Story
                                </button>
                                <p class="text-center font-label-md text-label-md text-on-surface-variant">
                                    Already have an account? 
                                    <a class="text-primary font-bold hover:underline cursor-pointer" id="go-to-login">Sign In</a>
                                </p>
                            </div>
                        </form>
                    </div>
                    
                    <!-- Social/Secondary Info -->
                    <div class="mt-8 text-center space-y-4">
                        <div class="flex items-center justify-center gap-4 text-on-surface-variant/40">
                            <div class="h-[1px] w-12 bg-current"></div>
                            <span class="font-label-sm text-label-sm uppercase tracking-widest">Secure &amp; Private</span>
                            <div class="h-[1px] w-12 bg-current"></div>
                        </div>
                        <div class="flex flex-wrap justify-center gap-x-6 gap-y-2">
                            <div class="flex items-center gap-1.5 text-on-surface-variant/60 font-label-sm text-label-sm">
                                <span class="material-symbols-outlined text-[16px]">lock_person</span>
                                End-to-end encrypted
                            </div>
                            <div class="flex items-center gap-1.5 text-on-surface-variant/60 font-label-sm text-label-sm">
                                <span class="material-symbols-outlined text-[16px]">cloud_done</span>
                                Instant cloud sync
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    `;
}

export function initRegister() {
    const form = document.getElementById('register-form');
    const registerBtn = document.getElementById('register-btn');
    const nameInput = document.getElementById('display-name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirm-password');
    const togglePassword = document.querySelector('.toggle-password');
    const goToLogin = document.getElementById('go-to-login');
    const joinCodeInput = document.getElementById('join-code');
    const joinCodeContainer = document.getElementById('join-code-container');
    const radioButtons = document.querySelectorAll('input[name="couple_type"]');

    // Toggle join code visibility
    radioButtons.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'join') {
                joinCodeContainer.classList.remove('hidden');
                joinCodeInput.required = true;
            } else {
                joinCodeContainer.classList.add('hidden');
                joinCodeInput.required = false;
            }
        });
    });

    // Auto-uppercase join code
    if (joinCodeInput) {
        joinCodeInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        });
    }

    // Toggle password visibility
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.querySelector('.material-symbols-outlined').textContent = type === 'password' ? 'visibility' : 'visibility_off';
        });
    }

    // Form submission
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const confirm = confirmInput.value;
            const coupleType = document.querySelector('input[name="couple_type"]:checked').value;
            const joinCode = joinCodeInput.value.trim().toUpperCase();
            
            // Validation
            if (!name || !email || !password || !confirm) {
                showToast('Please fill in all fields', 'error');
                return;
            }
            
            if (password.length < 6) {
                showToast('Password must be at least 6 characters', 'error');
                return;
            }
            
            if (password !== confirm) {
                showToast('Passwords do not match', 'error');
                return;
            }
            
            if (coupleType === 'join' && (!joinCode || joinCode.length !== 6)) {
                showToast('Please enter a valid 6-digit couple code', 'error');
                return;
            }
            
            registerBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Creating...';
            registerBtn.disabled = true;
            
            try {
                // Register user
                const { user } = await AuthService.register(email, password, name);
                
                if (user) {
                    // Create or join couple
                    if (coupleType === 'create') {
                        await CoupleService.createCouple(user.id, name);
                    } else {
                        await CoupleService.joinCouple(user.id, joinCode);
                    }
                    
                    showToast('Account created successfully! 🎉', 'success');
                    // Auth listener will handle navigation
                }
            } catch (error) {
                console.error('Registration error:', error);
                showToast(error.message || 'Registration failed. Please try again.', 'error');
                registerBtn.innerHTML = 'Create Our Story';
                registerBtn.disabled = false;
            }
        });
    }

    // Go to login
    if (goToLogin) {
        goToLogin.addEventListener('click', function() {
            window.navigate('login');
        });
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
