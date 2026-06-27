export function renderWelcome() {
    return `
        <div class="bg-surface font-body-md text-on-surface overflow-hidden min-h-screen">
            <!-- Atmospheric Background Particles -->
            <div class="fixed inset-0 z-0 overflow-hidden pointer-events-none" id="particle-container"></div>
            
            <!-- Main Content -->
            <main class="relative z-10 min-h-screen flex flex-col items-center justify-center px-container-padding-mobile md:px-container-padding-desktop">
                <!-- Logo/Brand Top Anchor -->
                <div class="absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <div class="w-10 h-10 rounded-full accent-gradient flex items-center justify-center shadow-lg">
                        <span class="material-symbols-outlined text-white filled">favorite</span>
                    </div>
                    <span class="font-headline-md text-headline-md text-primary tracking-tight">OurStory</span>
                </div>
                
                <!-- Central Hero Layout -->
                <div class="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-card-gap items-center mt-16 md:mt-0">
                    <!-- Illustration Column -->
                    <div class="md:col-span-7 flex justify-center relative">
                        <div class="absolute inset-0 bg-primary-container/20 blur-[100px] rounded-full"></div>
                        <div class="relative w-full max-w-md floating">
                            <div class="aspect-square rounded-xl overflow-hidden shadow-[0_32px_64px_rgba(135,78,88,0.12)] border-[8px] border-white">
                                <img class="w-full h-full object-cover" alt="Couple illustration" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqqh8ay1b5zbNQ4x0RZRkfl1qXIyyBGrtqxwZycGZofQIjJR7hUYwOYgSp-zqjtwOCmKihn9OWp-DQOw0revU2LpIhzQTLoQCO3t05hKzD-0MlQcZ3emvnWbzIQRfyUn7t9XmB58KAkYHhckoyD04R_AGq-mJ_gryicqrKIcmmMzk6yiaND89drrKWzsBYMMvHZ47oHgWoffz-4hJSvCnSOeHIokcLsW9TjvyfRvv0EXUnRnJuIxoIvQEIUNylVsET_BBXA23ohF4" />
                            </div>
                            <!-- Floating Stat Cards -->
                            <div class="absolute -top-6 -right-6 glass-card p-4 rounded-lg shadow-xl animate-bounce" style="animation-duration: 3s;">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
                                        <span class="material-symbols-outlined text-on-secondary-container text-sm filled">auto_awesome</span>
                                    </div>
                                    <div>
                                        <p class="text-label-sm font-label-sm text-on-surface-variant">New Memory</p>
                                        <p class="text-label-md font-bold text-secondary">Paris Trip '24</p>
                                    </div>
                                </div>
                            </div>
                            <div class="absolute -bottom-4 -left-8 glass-card p-4 rounded-lg shadow-xl animate-pulse">
                                <div class="flex items-center gap-3">
                                    <div class="flex -space-x-2">
                                        <div class="w-6 h-6 rounded-full border-2 border-white bg-primary-fixed"></div>
                                        <div class="w-6 h-6 rounded-full border-2 border-white bg-secondary-fixed"></div>
                                    </div>
                                    <p class="text-label-sm font-label-sm text-on-surface-variant">2 users active</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Content Column -->
                    <div class="md:col-span-5 space-y-8 text-center md:text-left">
                        <div class="space-y-4">
                            <h1 class="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface leading-tight">
                                A Sanctuary for <span class="text-primary italic">Us.</span>
                            </h1>
                            <p class="font-body-lg text-body-lg text-on-surface-variant max-w-sm mx-auto md:mx-0">
                                The intimate space to store memories, chat privately, and build your future together.
                            </p>
                        </div>
                        
                        <!-- Action Cluster -->
                        <div class="flex flex-col gap-4">
                            <button class="accent-gradient w-full py-5 rounded-full font-headline-sm text-white shadow-[0_20px_40px_rgba(252,179,190,0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group" id="welcome-register">
                                Register
                                <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                            <button class="w-full py-5 rounded-full border-2 border-secondary/20 font-headline-sm text-secondary glass-card hover:bg-white/60 active:scale-95 transition-all duration-300" id="welcome-login">
                                Login
                            </button>
                        </div>
                        
                        <!-- Social Proof -->
                        <div class="pt-4 flex items-center justify-center md:justify-start gap-4">
                            <div class="flex -space-x-3">
                                <div class="w-8 h-8 rounded-full border-2 border-white bg-surface-container-high"></div>
                                <div class="w-8 h-8 rounded-full border-2 border-white bg-surface-container-highest"></div>
                                <div class="w-8 h-8 rounded-full border-2 border-white bg-surface-variant"></div>
                            </div>
                            <span class="text-label-sm font-label-sm text-on-surface-variant/70 uppercase tracking-widest">Join 50k+ Couples</span>
                        </div>
                    </div>
                </div>
                
                <!-- Footer -->
                <footer class="absolute bottom-10 left-0 right-0 px-container-padding-mobile flex justify-between text-label-sm text-on-surface-variant/50">
                    <span>© 2024 OurStory Inc.</span>
                    <div class="flex gap-6">
                        <a class="hover:text-primary transition-colors" href="#">Privacy</a>
                        <a class="hover:text-primary transition-colors" href="#">Terms</a>
                    </div>
                </footer>
            </main>
        </div>
    `;
}

export function initWelcome() {
    // Register button
    const registerBtn = document.getElementById('welcome-register');
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            window.navigate('register');
        });
    }
    
    // Login button
    const loginBtn = document.getElementById('welcome-login');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            window.navigate('login');
        });
    }
    
    // Create heart particles
    createHeartParticles();
}

function createHeartParticles() {
    const container = document.getElementById('particle-container');
    if (!container) return;
    
    const particleCount = 15;
    const colors = ['#fcb3be', '#cebdff', '#cae6ff'];
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        const isHeart = Math.random() > 0.4;
        
        particle.className = 'heart-particle material-symbols-outlined';
        particle.textContent = isHeart ? 'favorite' : 'sparkle';
        
        const size = Math.random() * 20 + 10;
        const left = Math.random() * 100;
        const delay = Math.random() * 10;
        const duration = Math.random() * 5 + 7;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.cssText = `
            position: absolute;
            pointer-events: none;
            opacity: 0;
            font-size: ${size}px;
            left: ${left}%;
            animation: rise ${duration}s linear ${delay}s infinite;
            color: ${color};
            font-variation-settings: 'FILL' ${isHeart ? 1 : 0};
        `;
        
        container.appendChild(particle);
    }
}
