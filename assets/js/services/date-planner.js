import { supabase } from './assets/js/services/supabase.js';

export class DatePlannerService {
    static async createDatePlan(coupleId, userId, data) {
        const { data: plan, error } = await supabase
            .from('date_plans')
            .insert({
                couple_id: coupleId,
                user_id: userId,
                title: data.title,
                description: data.description,
                date: data.date,
                time: data.time,
                location: data.location,
                budget: data.budget,
                category: data.category,
                status: 'planned',
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (error) throw error;
        return plan;
    }

    static async getDatePlans(coupleId, status = null) {
        let query = supabase
            .from('date_plans')
            .select(`
                *,
                profiles:user_id (
                    id,
                    display_name,
                    avatar_url
                )
            `)
            .eq('couple_id', coupleId)
            .order('date', { ascending: true });
        
        if (status) {
            query = query.eq('status', status);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    static async updateDatePlan(planId, updates) {
        const { data, error } = await supabase
            .from('date_plans')
            .update(updates)
            .eq('id', planId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    static async deleteDatePlan(planId) {
        const { error } = await supabase
            .from('date_plans')
            .delete()
            .eq('id', planId);
        
        if (error) throw error;
    }

    static async addWishlistItem(coupleId, userId, data) {
        const { data: item, error } = await supabase
            .from('wishlist')
            .insert({
                couple_id: coupleId,
                user_id: userId,
                category: data.category,
                name: data.name,
                description: data.description,
                priority: data.priority || 'medium',
                estimated_cost: data.estimated_cost,
                status: 'wish',
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (error) throw error;
        return item;
    }

    static async getWishlist(coupleId) {
        const { data, error } = await supabase
            .from('wishlist')
            .select(`
                *,
                profiles:user_id (
                    id,
                    display_name,
                    avatar_url
                )
            `)
            .eq('couple_id', coupleId)
            .order('priority', { ascending: false })
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    }

    static async updateWishlistItem(itemId, updates) {
        const { data, error } = await supabase
            .from('wishlist')
            .update(updates)
            .eq('id', itemId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    static async deleteWishlistItem(itemId) {
        const { error } = await supabase
            .from('wishlist')
            .delete()
            .eq('id', itemId);
        
        if (error) throw error;
    }

    static async getUpcomingAnniversary(coupleId) {
        const { data: couple, error } = await supabase
            .from('couples')
            .select('anniversary_date, created_at')
            .eq('id', coupleId)
            .single();
        
        if (error) throw error;
        
        const anniversaryDate = couple.anniversary_date || couple.created_at;
        const date = new Date(anniversaryDate);
        const now = new Date();
        
        // Calculate next anniversary
        let nextAnniversary = new Date(now.getFullYear(), date.getMonth(), date.getDate());
        if (nextAnniversary < now) {
            nextAnniversary.setFullYear(now.getFullYear() + 1);
        }
        
        const daysUntil = Math.ceil((nextAnniversary - now) / (1000 * 60 * 60 * 24));
        
        return {
            date: anniversaryDate,
            nextAnniversary: nextAnniversary,
            daysUntil: daysUntil,
            yearsTogether: now.getFullYear() - date.getFullYear()
        };
    }

    static async setAnniversaryDate(coupleId, date) {
        const { data, error } = await supabase
            .from('couples')
            .update({ anniversary_date: date })
            .eq('id', coupleId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    static subscribeToDatePlans(coupleId, callback) {
        return supabase
            .channel('date-plans-updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'date_plans',
                    filter: `couple_id=eq.${coupleId}`
                },
                callback
            )
            .subscribe();
    }

    static subscribeToWishlist(coupleId, callback) {
        return supabase
            .channel('wishlist-updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'wishlist',
                    filter: `couple_id=eq.${coupleId}`
                },
                callback
            )
            .subscribe();
    }
}
