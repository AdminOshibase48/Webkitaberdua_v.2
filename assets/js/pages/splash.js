export function renderSplash() {
    return `
        <main class="gradient-bg flex flex-col items-center justify-center relative px-container-padding-mobile min-h-screen">
            <!-- Decorative Ambient Orbs -->
            <div class="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/20 blur-[120px] animate-pulse-soft"></div>
            <div class="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-secondary/20 blur-[120px] animate-pulse-soft"></div>
            
            <!-- Central Content Canvas -->
            <div class="z-10 flex flex-col items-center gap-12 max-w-lg w-full text-center">
                <!-- Glassmorphic Logo Container -->
                <div class="glass-morphism p-8 rounded-xl animate-float relative overflow-hidden group">
                    <div class="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div class="relative flex flex-col items-center gap-4">
                        <!-- Logo Icon Area -->
                        <div class="w-24 h-24 bg-gradient-to-tr from-primary to-secondary rounded-full flex items-center justify-center shadow-lg shadow-primary/20 transition-transform duration-500 group-hover:scale-110">
                            <span class="material-symbols-outlined text-white text-[48px] animate-heart filled">favorite</span>
                        </div>
                        <!-- Brand Identity -->
                        <div class="space-y-1">
                            <h1 class="font-headline-md text-headline-md md:text-headline-md text-primary tracking-tight leading-tight">
                                OurStory Together
                            </h1>
                            <p class="font-label-md text-label-md text-on-surface-variant/80 uppercase tracking-widest">
                                Shared Sanctuary
                            </p>
                        </div>
                    </div>
                </div>
                
                <!-- Couple Illustration -->
                <div class="relative w-full aspect-square max-w-[320px] md:max-w-[400px] animate-pulse-soft">
                    <div class="absolute inset-0 bg-white/30 rounded-full blur-3xl opacity-50"></div>
                    <img class="w-full h-full object-contain relative z-20 drop-shadow-2xl" alt="Couple illustration" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDB8JsjK-iaTEsVfn8IjxWjoVCVw1zgr4bdkQ-YFfV62eEr2ec9W63WVYJI8x-bGG3dNfeKcuZpuPYChNqKMavqw3zK3tX9uLRandKV8ri_S9KM1lMf_FnQvudI0DKPN91HgjzNMxlLUyrarNM9qnoEzEMFbNeuPT0_VdIpVfl_99K_uNu5YOTJ7Mv10IHrnJrXHHuZLpBQRRZO3_QOIWETLUmLIcHUhqQX4aE2HxjprBgmVKTzEPyE49DnCOyBCN6znLfzeRqi9Yw" />
                </div>
                
                <!-- Messaging -->
                <div class="space-y-4 max-w-xs mx-auto">
                    <h2 class="font-display-lg-mobile md:text-display-lg text-primary-fixed-dim drop-shadow-sm leading-tight">
                        Every memory deserves a beautiful place.
                    </h2>
                    <div class="h-1 w-12 bg-primary/30 mx-auto rounded-full"></div>
                </div>
                
                <!-- Progress Bar -->
                <div class="w-48 h-1.5 bg-white/30 rounded-full overflow-hidden relative mt-4">
                    <div class="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-secondary to-tertiary w-0 transition-all duration-[3000ms] ease-out" id="progress-bar"></div>
                </div>
                
                <!-- Get Started Button -->
                <button class="mt-8 px-8 py-4 rounded-full bg-white/20 border border-white/40 text-primary font-headline-sm hover:bg-white/40 hover:scale-105 active:scale-95 transition-all duration-300 glass-morphism" id="splash-start">
                    Begin Our Journey
                </button>
            </div>
            
            <!-- Canvas for particles -->
            <canvas class="absolute inset-0 pointer-events-none opacity-40" id="particleCanvas"></canvas>
        </main>
    `;
}

export function initSplash() {
    // Progress bar animation
    const bar = document.getElementById('progress-bar');
    if (bar) {
        setTimeout(() => {
            bar.style.width = '100%';
        }, 500);
    }
    
    // Start button
    const startBtn = document.getElementById('splash-start');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            window.navigate('login');
        });
    }
    
    // Floating particles
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        
        function init() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            for (let i = 0; i < 25; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 4 + 1,
                    speedX: Math.random() * 0.5 - 0.25,
                    speedY: Math.random() * 0.5 - 0.25,
                    opacity: Math.random() * 0.5 + 0.1
                });
            }
        }
        
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
                if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.fill();
            });
            requestAnimationFrame(animate);
        }
        
        init();
        animate();
        window.addEventListener('resize', init);
    }
}
