// /js/services/notifications.js
import { supabase, Channels } from '../assets/js/services/supabase.js';

export const NotificationsService = {
    async createNotification(userId, data) {
        const { type, title, message, link, metadata } = data;
        
        const { data: notification, error } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                type: type,
                title: title,
                message: message,
                link: link,
                metadata: metadata,
                read: false,
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (error) throw error;
        return notification;
    },

    async getNotifications(userId, limit = 20, offset = 0) {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        
        if (error) throw error;
        return data;
    },

    async markAsRead(notificationIds) {
        const { data, error } = await supabase
            .from('notifications')
            .update({ 
                read: true,
                read_at: new Date().toISOString()
            })
            .in('id', notificationIds)
            .select();
        
        if (error) throw error;
        return data;
    },

    async markAllAsRead(userId) {
        const { error } = await supabase
            .from('notifications')
            .update({ 
                read: true,
                read_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('read', false);
        
        if (error) throw error;
    },

    async getUnreadCount(userId) {
        const { count, error } = await supabase
            .from('notifications')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('read', false);
        
        if (error) throw error;
        return count;
    },

    async deleteNotification(notificationId) {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notificationId);
        
        if (error) throw error;
    },

    async sendPartnerNotification(coupleId, userId, data) {
        const { data: members, error } = await supabase
            .from('couple_members')
            .select('user_id')
            .eq('couple_id', coupleId)
            .neq('user_id', userId);
        
        if (error) throw error;
        
        const notifications = members.map(m => ({
            user_id: m.user_id,
            type: data.type,
            title: data.title,
            message: data.message,
            link: data.link,
            metadata: data.metadata,
            created_at: new Date().toISOString()
        }));
        
        const { data: created, error: insertError } = await supabase
            .from('notifications')
            .insert(notifications)
            .select();
        
        if (insertError) throw insertError;
        return created;
    },

    async notifyPartnerActivity(coupleId, userId, activity) {
        const { data: partner, error } = await supabase
            .from('couple_members')
            .select('user_id')
            .eq('couple_id', coupleId)
            .neq('user_id', userId)
            .single();
        
        if (error || !partner) return;
        
        const messages = {
            'new_memory': {
                title: 'New Memory Added',
                message: 'Your partner added a new memory to your gallery.'
            },
            'new_message': {
                title: 'New Message',
                message: 'Your partner sent you a new message.'
            },
            'level_up': {
                title: 'Level Up!',
                message: 'Your partnership has reached a new level!'
            },
            'mission_complete': {
                title: 'Mission Complete',
                message: 'Your partner completed a daily mission!'
            },
            'anniversary_reminder': {
                title: 'Anniversary Reminder',
                message: 'Your anniversary is coming up soon!'
            }
        };
        
        const msg = messages[activity];
        if (!msg) return;
        
        await this.createNotification(partner.user_id, {
            type: activity,
            title: msg.title,
            message: msg.message,
            link: '/dashboard'
        });
    },

    subscribeToNotifications(userId, callback) {
        return supabase
            .channel(Channels.NOTIFICATIONS)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    callback(payload.new);
                }
            )
            .subscribe();
    },

    async notifyMissionComplete(coupleId, userId, missionName) {
        await this.sendPartnerNotification(coupleId, userId, {
            type: 'mission_complete',
            title: 'Mission Complete! 🎉',
            message: `"${missionName}" has been completed!`,
            link: '/missions'
        });
    },

    async notifyLevelUp(coupleId, userId, level) {
        await this.sendPartnerNotification(coupleId, userId, {
            type: 'level_up',
            title: 'Level Up! 🌟',
            message: `Your partnership has reached Level ${level}!`,
            link: '/profile'
        });
    },

    async notifyNewMemory(coupleId, userId, memoryCaption) {
        await this.sendPartnerNotification(coupleId, userId, {
            type: 'new_memory',
            title: 'New Memory Added 📸',
            message: `"${memoryCaption}" was added to your gallery`,
            link: '/gallery'
        });
    }
};
