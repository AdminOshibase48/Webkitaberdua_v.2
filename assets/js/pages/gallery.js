import { GalleryService } from '../assets/js/services/gallery.js';
import { AuthService } from '../assets/js/services/auth.js';
import { NotificationsService } from '../assets/js/services/notifications.js';

export function renderGallery(context) {
    const { user, couple } = context;
    
    return `
        <div class="bg-surface text-on-surface min-h-screen pb-32">
            <!-- TopNavBar -->
            <header class="fixed top-0 w-full z-50 flex justify-between items-center px-container-padding-mobile md:px-container-padding-desktop h-16 bg-surface/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(135,78,88,0.08)]">
                <div class="flex items-center gap-4">
                    <span class="text-headline-md font-headline-md text-primary">OurStory</span>
                </div>
                <div class="hidden md:flex items-center gap-8">
                    <nav class="flex gap-6">
                        <a class="text-on-surface-variant hover:bg-primary-container/20 px-3 py-1 rounded-full transition-colors font-label-md text-label-md cursor-pointer" data-page="dashboard">Home</a>
                        <a class="text-primary font-bold px-3 py-1 rounded-full bg-primary-container/20 transition-colors font-label-md text-label-md cursor-pointer" data-page="gallery">Gallery</a>
                        <a class="text-on-surface-variant hover:bg-primary-container/20 px-3 py-1 rounded-full transition-colors font-label-md text-label-md cursor-pointer" data-page="finance">Finance</a>
                    </nav>
                </div>
                <div class="flex items-center gap-4">
                    <button class="p-2 rounded-full hover:bg-primary-container/20 transition-colors" data-page="missions">
                        <span class="material-symbols-outlined text-primary">favorite</span>
                    </button>
                    <button class="p-2 rounded-full hover:bg-primary-container/20 transition-colors relative" data-page="notifications">
                        <span class="material-symbols-outlined text-primary">notifications</span>
                        <span class="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
                    </button>
                    <div class="w-8 h-8 rounded-full overflow-hidden border border-primary/20">
                        <img class="w-full h-full object-cover" alt="Profile" src="${context.profile?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(context.profile?.display_name || 'User')}" />
                    </div>
                </div>
            </header>
            
            <main class="pt-24 pb-32 px-container-padding-mobile md:px-container-padding-desktop max-w-[1400px] mx-auto">
                <!-- Header & Search -->
                <section class="mb-10 space-y-6">
                    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 class="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight">Memories</h1>
                            <p class="text-on-surface-variant font-body-md text-body-md mt-2">A digital scrapbooked sanctuary of our journey together.</p>
                        </div>
                        <div class="relative w-full md:w-96 group">
                            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">search</span>
                            <input class="w-full pl-12 pr-4 py-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-secondary/30 font-body-md text-body-md shadow-sm transition-all" id="gallery-search" placeholder="Search a moment..." type="text" />
                        </div>
                    </div>
                    
                    <!-- Filters -->
                    <div class="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                        <button class="flex items-center gap-2 px-6 py-2.5 rounded-full bg-secondary text-on-secondary font-label-md text-label-md shadow-lg shadow-secondary/20 transition-all hover:scale-105 active:scale-95 filter-btn active" data-filter="all">
                            <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
                            <span>All Memories</span>
                        </button>
                        <button class="flex items-center gap-2 px-6 py-2.5 rounded-full glass-card text-on-surface-variant font-label-md text-label-md hover:bg-white transition-all filter-btn" data-filter="image">
                            <span class="material-symbols-outlined text-[18px]">image</span>
                            <span>Photos</span>
                        </button>
                        <button class="flex items-center gap-2 px-6 py-2.5 rounded-full glass-card text-on-surface-variant font-label-md text-label-md hover:bg-white transition-all filter-btn" data-filter="video">
                            <span class="material-symbols-outlined text-[18px]">videocam</span>
                            <span>Videos</span>
                        </button>
                        <button class="flex items-center gap-2 px-6 py-2.5 rounded-full glass-card text-on-surface-variant font-label-md text-label-md hover:bg-white transition-all filter-btn" data-filter="album">
                            <span class="material-symbols-outlined text-[18px]">photo_library</span>
                            <span>Albums</span>
                        </button>
                    </div>
                </section>
                
                <!-- Gallery Grid -->
                <div class="masonry-grid" id="gallery-grid">
                    <!-- Will be populated dynamically -->
                    <div class="masonry-item animate-pulse">
                        <div class="bg-surface-container-highest rounded-lg h-64"></div>
                    </div>
                    <div class="masonry-item animate-pulse">
                        <div class="bg-surface-container-highest rounded-lg h-48"></div>
                    </div>
                    <div class="masonry-item animate-pulse">
                        <div class="bg-surface-container-highest rounded-lg h-72"></div>
                    </div>
                </div>
            </main>
            
            <!-- Upload FAB -->
            <button class="fixed bottom-24 right-6 md:right-12 w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-primary-container text-white shadow-[0_20px_50px_rgba(135,78,88,0.3)] flex items-center justify-center group hover:scale-110 active:scale-90 transition-all z-40" id="upload-memory">
                <span class="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform">add</span>
            </button>
            
            <!-- BottomNavBar -->
            <nav class="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-lg z-50 flex justify-around items-center p-2 bg-surface/60 backdrop-blur-2xl rounded-full bg-white/40 border border-white/50 shadow-[0_20px_50px_rgba(100,84,149,0.15)]">
                ${['home', 'favorite', 'photo_library', 'payments', 'person'].map((icon, i) => `
                    <a class="flex flex-col items-center justify-center ${i === 2 ? 'bg-primary-container text-on-primary-container rounded-full px-5 py-2' : 'text-on-surface-variant p-2 hover:bg-secondary-container/30 rounded-full'} transition-all active:scale-90 duration-300 cursor-pointer" data-page="${['dashboard', 'chat', 'gallery', 'finance', 'profile'][i]}">
                        <span class="material-symbols-outlined ${i === 2 ? 'filled' : ''}">${icon}</span>
                        <span class="font-label-sm text-label-sm">${['Home', 'Chat', 'Gallery', 'Finance', 'Profile'][i]}</span>
                    </a>
                `).join('')}
            </nav>
        </div>
    `;
}

export function initGallery() {
    // Navigation
    document.querySelectorAll('[data-page]').forEach(el => {
        el.addEventListener('click', function() {
            const page = this.dataset.page;
            if (page) window.navigate(page);
        });
    });
    
    // Load gallery
    loadGallery();
    
    // Upload button
    const uploadBtn = document.getElementById('upload-memory');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*,video/*';
            input.multiple = true;
            
            input.onchange = async (e) => {
                const files = e.target.files;
                if (!files || files.length === 0) return;
                
                try {
                    const user = await AuthService.getCurrentUser();
                    if (!user) return;
                    
                    const profile = await AuthService.getProfile(user.id);
                    if (!profile?.couple_id) return;
                    
                    showToast('Uploading memories...', 'info');
                    
                    for (const file of files) {
                        await GalleryService.uploadMemory(
                            profile.couple_id,
                            user.id,
                            file,
                            '',
                            null
                        );
                    }
                    
                    showToast(`${files.length} memories uploaded successfully! 🎉`, 'success');
                    loadGallery();
                    
                    // Notify partner
                    await NotificationsService.notifyPartnerActivity(
                        profile.couple_id,
                        user.id,
                        'new_memory'
                    );
                } catch (error) {
                    console.error('Upload error:', error);
                    showToast('Failed to upload. Please try again.', 'error');
                }
            };
            
            input.click();
        });
    }
    
    // Search
    const searchInput = document.getElementById('gallery-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const query = e.target.value.trim();
            if (query.length >= 2) {
                filterGallery(query);
            } else if (query.length === 0) {
                loadGallery();
            }
        }, 500));
    }
    
    // Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('bg-secondary', 'text-on-secondary', 'shadow-lg', 'shadow-secondary/20');
                b.classList.add('glass-card', 'text-on-surface-variant');
            });
            this.classList.remove('glass-card', 'text-on-surface-variant');
            this.classList.add('bg-secondary', 'text-on-secondary', 'shadow-lg', 'shadow-secondary/20');
            
            const filter = this.dataset.filter;
            filterGallery(filter);
        });
    });
}

async function loadGallery() {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) return;
        
        const profile = await AuthService.getProfile(user.id);
        if (!profile?.couple_id) return;
        
        const memories = await GalleryService.getMemories(profile.couple_id, 20);
        const grid = document.getElementById('gallery-grid');
        if (!grid) return;
        
        if (memories.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-16">
                    <span class="material-symbols-outlined text-6xl text-outline-variant">photo_library</span>
                    <h3 class="font-headline-sm text-on-surface mt-4">No memories yet</h3>
                    <p class="text-on-surface-variant">Start capturing your journey together.</p>
                    <button class="mt-4 px-6 py-2 bg-primary text-white rounded-full" id="empty-upload">Upload your first memory</button>
                </div>
            `;
            
            const emptyBtn = document.getElementById('empty-upload');
            if (emptyBtn) {
                emptyBtn.addEventListener('click', () => {
                    document.getElementById('upload-memory')?.click();
                });
            }
            return;
        }
        
        grid.innerHTML = memories.map((memory, index) => {
            const isVideo = memory.file_type === 'video';
            const height = ['h-64', 'h-48', 'h-72', 'h-56', 'h-80'][index % 5];
            
            return `
                <div class="masonry-item group cursor-pointer" data-memory="${memory.id}">
                    <div class="bg-white rounded-lg overflow-hidden shadow-[0_12px_40px_rgba(100,84,149,0.06)] hover:shadow-[0_20px_50px_rgba(100,84,149,0.12)] transition-all duration-500 hover:-translate-y-2">
                        <div class="relative overflow-hidden ${isVideo ? 'aspect-video' : 'aspect-[3/4]'}">
                            ${isVideo ? `
                                <video class="w-full h-full object-cover" muted>
                                    <source src="${memory.file_url}" />
                                </video>
                                <div class="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <span class="material-symbols-outlined text-white text-4xl">play_arrow</span>
                                </div>
                            ` : `
                                <img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="${memory.file_url}" alt="${memory.caption || 'Memory'}" />
                            `}
                            <div class="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button class="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-primary hover:bg-white transition-colors favorite-btn" data-memory="${memory.id}">
                                    <span class="material-symbols-outlined">favorite</span>
                                </button>
                            </div>
                            ${memory.caption ? `
                                <div class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                                    <span class="text-white/80 font-label-sm text-label-sm">${new Date(memory.created_at).toLocaleDateString()}</span>
                                    <h3 class="text-white font-headline-sm text-headline-sm mt-1">${memory.caption}</h3>
                                </div>
                            ` : ''}
                        </div>
                        <div class="p-4 flex items-center justify-between bg-white">
                            <div class="flex -space-x-2">
                                <div class="w-6 h-6 rounded-full border-2 border-white overflow-hidden">
                                    <img class="w-full h-full object-cover" alt="${memory.profiles?.display_name || 'User'}" src="${memory.profiles?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(memory.profiles?.display_name || 'User')}" />
                                </div>
                            </div>
                            <div class="flex items-center gap-3 text-on-surface-variant">
                                <span class="text-label-sm font-label-sm">${new Date(memory.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add favorite handlers
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', async function(e) {
                e.stopPropagation();
                const memoryId = this.dataset.memory;
                try {
                    const user = await AuthService.getCurrentUser();
                    if (!user) return;
                    
                    const isFavorited = await GalleryService.toggleFavorite(memoryId, user.id);
                    const icon = this.querySelector('.material-symbols-outlined');
                    if (isFavorited) {
                        icon.classList.add('filled');
                        icon.style.color = '#874e58';
                    } else {
                        icon.classList.remove('filled');
                        icon.style.color = '';
                    }
                    showToast(isFavorited ? 'Added to favorites ❤️' : 'Removed from favorites', 'success');
                } catch (error) {
                    console.error('Favorite error:', error);
                }
            });
        });
        
        // Click to view full memory
        grid.querySelectorAll('.masonry-item').forEach(item => {
            item.addEventListener('click', function() {
                const memoryId = this.dataset.memory;
                showMemoryDetail(memoryId);
            });
        });
        
    } catch (error) {
        console.error('Error loading gallery:', error);
    }
}

async function filterGallery(filter) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) return;
        
        const profile = await AuthService.getProfile(user.id);
        if (!profile?.couple_id) return;
        
        let memories = await GalleryService.getMemories(profile.couple_id, 50);
        
        if (filter === 'image') {
            memories = memories.filter(m => m.file_type === 'image');
        } else if (filter === 'video') {
            memories = memories.filter(m => m.file_type === 'video');
        } else if (filter === 'album') {
            // Show albums view
            const albums = await GalleryService.getAlbums(profile.couple_id);
            const grid = document.getElementById('gallery-grid');
            if (grid) {
                grid.innerHTML = albums.map(album => `
                    <div class="masonry-item group cursor-pointer">
                        <div class="bg-white rounded-lg overflow-hidden shadow-[0_12px_40px_rgba(100,84,149,0.06)] hover:shadow-[0_20px_50px_rgba(100,84,149,0.12)] transition-all duration-500 hover:-translate-y-2">
                            <div class="aspect-square relative overflow-hidden bg-primary-container/20">
                                ${album.cover_url ? `<img class="w-full h-full object-cover" src="${album.cover_url}" alt="${album.name}" />` : `
                                    <div class="flex items-center justify-center h-full">
                                        <span class="material-symbols-outlined text-4xl text-primary">photo_library</span>
                                    </div>
                                `}
                                <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                                    <h3 class="text-white font-headline-sm">${album.name}</h3>
                                    <p class="text-white/80 text-label-sm">${album.memories?.[0]?.count || 0} memories</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
            return;
        }
        
        // Re-render with filtered memories
        const grid = document.getElementById('gallery-grid');
        if (grid) {
            grid.innerHTML = memories.map((memory, index) => {
                const height = ['h-64', 'h-48', 'h-72', 'h-56', 'h-80'][index % 5];
                
                return `
                    <div class="masonry-item group" data-memory="${memory.id}">
                        <div class="bg-white rounded-lg overflow-hidden shadow-[0_12px_40px_rgba(100,84,149,0.06)] hover:shadow-[0_20px_50px_rgba(100,84,149,0.12)] transition-all duration-500 hover:-translate-y-2">
                            <div class="relative overflow-hidden ${memory.file_type === 'video' ? 'aspect-video' : 'aspect-[3/4]'}">
                                <img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="${memory.file_url}" alt="${memory.caption || 'Memory'}" />
                                ${memory.caption ? `
                                    <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                                        <span class="text-white/80 text-label-sm">${new Date(memory.created_at).toLocaleDateString()}</span>
                                        <h3 class="text-white font-label-md">${memory.caption}</h3>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error filtering gallery:', error);
    }
}

async function showMemoryDetail(memoryId) {
    try {
        const memory = await GalleryService.getMemory(memoryId);
        if (!memory) return;
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4';
        modal.innerHTML = `
            <div class="glass-card max-w-2xl w-full rounded-xl overflow-hidden max-h-[90vh]">
                <div class="relative">
                    <button class="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors" id="close-modal">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                    ${memory.file_type === 'video' ? `
                        <video class="w-full" controls autoplay>
                            <source src="${memory.file_url}" />
                        </video>
                    ` : `
                        <img class="w-full max-h-[70vh] object-contain" src="${memory.file_url}" alt="${memory.caption || 'Memory'}" />
                    `}
                </div>
                <div class="p-6">
                    <h3 class="font-headline-sm text-on-surface">${memory.caption || 'Untitled Memory'}</h3>
                    <p class="text-label-sm text-on-surface-variant mt-1">${new Date(memory.created_at).toLocaleString()} • ${memory.profiles?.display_name || 'User'}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('#close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    } catch (error) {
        console.error('Error showing memory detail:', error);
    }
}

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
