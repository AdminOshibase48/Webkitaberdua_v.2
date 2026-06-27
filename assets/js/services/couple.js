import { supabase } from './assets/js/services/supabase.js';

export class CoupleService {
    static async createCouple(userId, displayName) {
        // Generate a unique couple code
        const code = this.generateCoupleCode();
        
        // Create the couple
        const { data: couple, error: coupleError } = await supabase
            .from('couples')
            .insert({
                code: code,
                created_by: userId,
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (coupleError) throw coupleError;
        
        // Add user as member
        const { error: memberError } = await supabase
            .from('couple_members')
            .insert({
                couple_id: couple.id,
                user_id: userId,
                joined_at: new Date().toISOString(),
                is_creator: true
            });
        
        if (memberError) throw memberError;
        
        // Update user's profile with couple_id
        await supabase
            .from('profiles')
            .update({ couple_id: couple.id })
            .eq('id', userId);
        
        return couple;
    }

    static async joinCouple(userId, code) {
        // Find couple by code
        const { data: couple, error: coupleError } = await supabase
            .from('couples')
            .select('*')
            .eq('code', code.toUpperCase())
            .single();
        
        if (coupleError) throw new Error('Invalid couple code');
        
        // Check if user is already a member
        const { data: existing, error: checkError } = await supabase
            .from('couple_members')
            .select('*')
            .eq('couple_id', couple.id)
            .eq('user_id', userId)
            .single();
        
        if (existing) throw new Error('Already a member of this couple');
        
        // Add user as member
        const { error: memberError } = await supabase
            .from('couple_members')
            .insert({
                couple_id: couple.id,
                user_id: userId,
                joined_at: new Date().toISOString(),
                is_creator: false
            });
        
        if (memberError) throw memberError;
        
        // Update user's profile with couple_id
        await supabase
            .from('profiles')
            .update({ couple_id: couple.id })
            .eq('id', userId);
        
        return couple;
    }

    static async getCouple(coupleId) {
        const { data, error } = await supabase
            .from('couples')
            .select('*')
            .eq('id', coupleId)
            .single();
        
        if (error) throw error;
        return data;
    }

    static async getCoupleMembers(coupleId) {
        const { data, error } = await supabase
            .from('couple_members')
            .select(`
                user_id,
                joined_at,
                is_creator,
                profiles:user_id (
                    id,
                    display_name,
                    avatar_url,
                    email
                )
            `)
            .eq('couple_id', coupleId);
        
        if (error) throw error;
        return data;
    }

    static async getPartner(userId, coupleId) {
        const members = await this.getCoupleMembers(coupleId);
        return members.find(m => m.user_id !== userId);
    }

    static async updateCouple(coupleId, updates) {
        const { data, error } = await supabase
            .from('couples')
            .update(updates)
            .eq('id', coupleId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    static generateCoupleCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    static async getCoupleStats(coupleId) {
        // Get days together
        const members = await this.getCoupleMembers(coupleId);
        const oldestJoin = members.reduce((min, m) => 
            new Date(m.joined_at) < new Date(min.joined_at) ? m : min
        );
        
        const daysTogether = Math.floor(
            (Date.now() - new Date(oldestJoin.joined_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // Get XP (aggregate from user_levels)
        const { data: levels, error } = await supabase
            .from('user_levels')
            .select('total_xp')
            .in('user_id', members.map(m => m.user_id));
        
        if (error) throw error;
        
        const totalXP = levels.reduce((sum, l) => sum + (l.total_xp || 0), 0);
        
        return {
            daysTogether,
            totalXP,
            memberCount: members.length
        };
    }

    static subscribeToCouple(coupleId, callback) {
        return supabase
            .channel('couple-updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'couple_members',
                    filter: `couple_id=eq.${coupleId}`
                },
                callback
            )
            .subscribe();
    }
}
