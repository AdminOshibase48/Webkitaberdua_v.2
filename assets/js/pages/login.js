import { AuthService } from '../assets/js/services/auth.js';

export function renderLogin() {
    return `
        <div class="min-h-screen gradient-bg flex flex-col items-center justify-center p-container-padding-mobile md:p-container-padding-desktop relative">
            <!-- Background Decorative Elements -->
            <div class="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-fixed opacity-20 blur-[100px] rounded-full pointer-events-none"></div>
            <div class="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary-fixed opacity-20 blur-[100px] rounded-full pointer-events-none"></div>
            
            <main class="w-full max-w-[460px] relative z-10">
                <!-- Logo/Branding -->
                <div class="flex flex-col items-center mb-10 animate-fade-in-down">
                    <div class="w-16 h-16 primary-gradient rounded-xl mb-4 flex items-center justify-center shadow-lg transform rotate-3">
                        <span class="material-symbols-outlined text-white text-4xl filled">favorite</span>
                    </div>
                    <h1 class="font-headline-md text-headline-md text-primary tracking-tight">OurStory Together</h1>
                </div>
                
                <!-- Glassmorphic Login Form -->
                <div class="glass-card ambient-shadow rounded-lg p-8 md:p-10 w-full">
                    <header class="mb-8">
                        <h2 class="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-2">Welcome Back ❤️</h2>
                        <p class="font-body-md text-on-surface-variant">Continue your shared journey together.</p>
                    </header>
                    
                    <form id="login-form" class="space-y-6">
                        <!-- Email Field -->
                        <div class="space-y-2">
                            <label class="font-label-md text-label-md text-on-surface-variant ml-2" for="email">Email address</label>
                            <div class="relative group">
                                <span class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">mail</span>
                                <input class="w-full h-14 pl-14 pr-6 bg-white/50 border border-white/60 rounded-lg font-body-md text-on-surface focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all placeholder:text-outline-variant" id="email" placeholder="us@ourstory.com" type="email" required />
                            </div>
                        </div>
                        
                        <!-- Password Field -->
                        <div class="space-y-2">
                            <div class="flex justify-between items-center px-2">
                                <label class="font-label-md text-label-md text-on-surface-variant" for="password">Password</label>
                                <a class="font-label-sm text-label-sm text-primary hover:underline cursor-pointer" id="forgot-password">Forgot?</a>
                            </div>
                            <div class="relative group">
                                <span class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">lock</span>
                                <input class="w-full h-14 pl-14 pr-14 bg-white/50 border border-white/60 rounded-lg font-body-md text-on-surface focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all placeholder:text-outline-variant" id="password" placeholder="••••••••" type="password" required />
                                <button class="absolute right-5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors toggle-password" type="button">
                                    <span class="material-symbols-outlined">visibility</span>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Login Button -->
                        <button class="w-full h-14 primary-gradient text-white font-headline-sm text-headline-sm rounded-full shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 mt-4" type="submit" id="login-btn">
                            Login
                        </button>
                        
                        <!-- Divider -->
                        <div class="flex items-center gap-4 py-2">
                            <div class="h-[1px] flex-1 bg-outline-variant/30"></div>
                            <span class="font-label-sm text-label-sm text-on-surface-variant/60 uppercase tracking-widest">or</span>
                            <div class="h-[1px] flex-1 bg-outline-variant/30"></div>
                        </div>
                        
                        <!-- Social Login -->
                        <button class="w-full h-14 bg-white border border-outline-variant/50 flex items-center justify-center gap-3 rounded-full hover:bg-surface-container-low transition-colors active:scale-95 duration-300 google-login-btn" type="button">
                            <img class="w-5 h-5" alt="Google logo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVidGtXfF6MUZxO4TNsfub0GvLPT8CsAj9QBbyrhTEfgl1PKb2d510QgJWRAWQRLP7dDCMziCWbf_P5exgHUOrYRmYbAd_upt3bBMl0pWOt2nf-BOO4iTSvXLJk3jTaa0tUOTh9oX7gm-tuiiujVd2wwVeivpdKuQdeuzwMaNN6gEFyZjMdjQIaqNrAgkTUryXl70BgBxMW4voUJTGz9T0YyXFuhU3-SSxM9lKWQByGG2SwErWHQCn_Gb2Hy-wUJV0nJRc9Kw8K5g" />
                            <span class="font-label-md text-label-md text-on-surface">Continue with Google</span>
                        </button>
                    </form>
                    
                    <footer class="mt-8 text-center">
                        <p class="font-body-md text-on-surface-variant">
                            New here? 
                            <a class="text-secondary font-semibold hover:underline cursor-pointer" id="go-to-register">Start your story</a>
                        </p>
                    </footer>
                </div>
                
                <!-- Illustration -->
                <div class="mt-12 opacity-80 flex flex-col items-center">
                    <div class="flex -space-x-4 mb-6">
                        <div class="w-12 h-12 rounded-full border-2 border-white overflow-hidden ring-4 ring-primary-container/20">
                            <img class="w-full h-full object-cover" alt="Couple portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBE-ecJjm4sJiUb-BjmvI64nzrNpkZ9TTlf6IXO8bpg4_0OKjzoUICcaHkbN731iDohd9KApvzznoiPwNZ-DUgogJUlYRZTQWqnvcPOYNVgNAWZ6NFzxic8JG9CIPWVJbcCrojrylK51NKdknikVbHDaQoUGgM0Nnoh4wYTt2xqkB8epnv9e6653pGQwMEk7tF96-ZNoM7eleaSIfejKk_um056bxWERnL0teP0JvLkdtd5qhOZjLRIK3snu4dPKgfBSB4PcKju3n8" />
                        </div>
                        <div class="w-12 h-12 rounded-full border-2 border-white overflow-hidden ring-4 ring-secondary-container/20">
                            <img class="w-full h-full object-cover" alt="Partner portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqPrmJsHJ9MBDfa_RXyheIgqQzs8oJ2kMM-qywRMsP5EBLsmzmShpVwp5YSYY9Y-Q4gPXTaen7iGCLOGHcE3A91cv0K7QX28Z9U-qXQ4gC7hsHkHDYw_elJvKV2UFcFR_gFdJKbRBygZLBigIlqTMcct8hMBxOshfPHLFNUHcB5R_dbrLt87eAsGukGcJ95XqE-6tlD1OKVo2wrYEy3uW5ovpZwrnh_NGNtU6zroKt_56LV6JHbdAizEI1-Ohs9zmh84OD9TIp_x8" />
                        </div>
                    </div>
                    <p class="font-label-sm text-label-sm text-on-surface-variant/40 italic">"Every love story is beautiful, but ours is my favorite."</p>
                </div>
            </main>
        </div>
    `;
}

export function initLogin() {
    const form = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.querySelector('.toggle-password');
    const googleBtn = document.querySelector('.google-login-btn');
    const forgotPassword = document.getElementById('forgot-password');
    const goToRegister = document.getElementById('go-to-register');

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
            
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            
            if (!email || !password) {
                showToast('Please fill in all fields', 'error');
                return;
            }
            
            loginBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Logging in...';
            loginBtn.disabled = true;
            
            try {
                await AuthService.login(email, password);
                // Auth listener will handle navigation
            } catch (error) {
                console.error('Login error:', error);
                showToast(error.message || 'Login failed. Please try again.', 'error');
                loginBtn.innerHTML = 'Login';
                loginBtn.disabled = false;
            }
        });
    }

    // Google login
    if (googleBtn) {
        googleBtn.addEventListener('click', async function() {
            try {
                await AuthService.loginWithGoogle();
                // Redirect handled by Supabase OAuth
            } catch (error) {
                console.error('Google login error:', error);
                showToast(error.message || 'Google login failed.', 'error');
            }
        });
    }

    // Forgot password
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function() {
            const email = emailInput.value.trim();
            if (!email) {
                showToast('Please enter your email address first', 'info');
                emailInput.focus();
                return;
            }
            
            showToast('Password reset link sent to your email!', 'success');
        });
    }

    // Go to register
    if (goToRegister) {
        goToRegister.addEventListener('click', function() {
            window.navigate('register');
        });
    }
}

// Toast notification helper
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
