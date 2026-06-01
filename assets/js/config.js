// ========================================
// SUPABASE CONFIGURATION
// ========================================
// GANTI DENGAN URL DAN ANON KEY DARI PROJECT SUPABASE ANDA
// Cara mendapatkan:
// 1. Buka https://supabase.com
// 2. Buat project baru atau pilih project yang sudah ada
// 3. Pergi ke Project Settings > API
// 4. Copy Project URL dan anon/public key

const SUPABASE_URL = "https://lywxysvvblmaipcoqgoa.supabase.co";  // <-- GANTI INI
const SUPABASE_ANON_KEY = "sb_publishable_x4DgVk7DLG_gjWK2iS3q2Q_ShRK3kAE";                // <-- GANTI INI

// ========================================
// COUPLE CONFIGURATION
// ========================================
const COUPLE_CONFIG = {
    // Data Partner 1 (Anda)
    partner1: {
        id: "",
        name: "Nursyam",
        avatar: "assets/images/avatar-him.jpg",
        color: "#FF6B9D",
        defaultMood: "😊",
        defaultStatus: "Happy"
    },
    // Data Partner 2 (Pasangan)
    partner2: {
        id: "",
        name: "Lulu",
        avatar: "assets/images/avatar-her.jpg",
        color: "#C4B5FD",
        defaultMood: "🥰",
        defaultStatus: "In Love"
    }
};

// ========================================
// APP CONFIGURATION
// ========================================
const APP_CONFIG = {
    name: "Couple Love Dashboard",
    version: "1.0.0",
    debug: true,
    defaultLoveMeter: 98,
    floatingHeartsInterval: 3000,
    toastDuration: 3000,
    maxChatMessages: 100,
    maxRecentPokes: 5
};

// ========================================
// DEFAULT LETTERS
// ========================================
const DEFAULT_LETTERS = [
    {
        title: "💌 Buka Saat Kangen",
        content: "Sayang... Aku sangat merindukanmu saat membaca surat ini. Setiap detik tanpa dirimu terasa lama, tapi aku tahu kita akan segera bertemu. Jaga kesehatan ya, love you more than words can say! 💕",
        category: "kangen",
        emoji: "💌"
    },
    {
        title: "🥺 Buka Saat Sedih",
        content: "Halo cintaku... Aku tahu kamu sedang merasa sedih. Tapi ingatlah bahwa aku selalu ada untukmu, walau jarak memisahkan kita. Kamu kuat, kamu hebat, dan kamu sangat berarti bagiku. Jangan pernah ragu untuk cerita padaku ya. Aku selalu mendengarkan. 🤗",
        category: "sedih",
        emoji: "🥺"
    },
    {
        title: "😤 Buka Saat Marah",
        content: "Deep breath sayang... Aku tahu kamu lagi kesal. Tapi ingat ya, marah itu wajar, tapi jangan biarkan amarah menguasaimu. Aku di sini, siap mendengarkan keluh kesahmu. Setelah tenang, kita hadapi masalahnya bersama-sama ya. Aku sayang kamu! ❤️",
        category: "marah",
        emoji: "😤"
    },
    {
        title: "🎉 Buka Saat Bahagia",
        content: "Yay! Aku senang melihatmu bahagia! Senyummu adalah sinar matahari dalam hariku. Teruslah tersenyum dan berbagi kebahagiaan. Semoga hari-harimu selalu dipenuhi dengan hal-hal indah. I love you more than anything! 🎉💕",
        category: "bahagia",
        emoji: "🎉"
    },
    {
        title: "💭 Buka Saat Ingin Curhat",
        content: "Aku mendengarkanmu, sayang. Ceritakan apapun yang ada di pikiranmu. Aku di sini untukmu, selalu. Tidak ada cerita yang terlalu kecil atau terlalu besar untuk kita bagikan bersama. Kamu adalah rumah bagiku. 💭",
        category: "curhat",
        emoji: "💭"
    },
    {
        title: "🌙 Buka Sebelum Tidur",
        content: "Selamat malam, bintangku! Semoga mimpi indah menyambut tidurmu. Besok adalah hari baru yang penuh kesempatan. Aku akan selalu menunggumu dengan penuh cinta. Sweet dreams, my love! 🌙✨",
        category: "tidur",
        emoji: "🌙"
    }
];

// ========================================
// DEFAULT MEMORIES
// ========================================
const DEFAULT_MEMORIES = [
    {
        title: "First Meeting",
        description: "Mata kita bertemu untuk pertama kalinya di sebuah kafe kecil. Hujan yang deras mempertemukan dua jiwa yang mencari tempat berteduh.",
        date: "2025-12-17",
        imageUrl: null
    },
    {
        title: "First Date",
        description: "Makan malam pertama yang penuh dengan tawa dan cerita. Spaghetti carbonara yang tak terlupakan.",
        date: "2025-12-24",
        imageUrl: null
    },
    {
        title: "Confession Day",
        description: "Di bawah kembang api pergantian tahun, kita saling mengungkapkan perasaan. Tahun baru dimulai dengan cinta.",
        date: "2025-12-31",
        imageUrl: null
    }
];
