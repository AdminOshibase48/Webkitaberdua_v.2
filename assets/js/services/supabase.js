import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm';

// These should come from environment variables in production
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://cyrptzbwxohzhqkjquen.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-6OEboAj0o1pZYG4si-o0Q_3xGfV5xr';

// Import Supabase dari CDN
const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database Types
export const Tables = {
    PROFILES: 'profiles',
    COUPLES: 'couples',
    COUPLE_MEMBERS: 'couple_members',
    MESSAGES: 'messages',
    MEMORIES: 'memories',
    TRANSACTIONS: 'transactions',
    BUDGETS: 'budgets',
    SAVINGS_GOALS: 'savings_goals',
    DATE_PLANS: 'date_plans',
    WISHLIST: 'wishlist',
    NOTIFICATIONS: 'notifications',
    MISSIONS: 'missions',
    USER_MISSIONS: 'user_missions',
    LEVELS: 'levels',
    USER_LEVELS: 'user_levels'
};

// Realtime Channels
export const Channels = {
    MESSAGES: 'messages-channel',
    NOTIFICATIONS: 'notifications-channel',
    COUPLE_UPDATES: 'couple-updates-channel'
};
