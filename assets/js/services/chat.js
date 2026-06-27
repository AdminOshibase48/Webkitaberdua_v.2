import { supabase, Channels } from './assets/js/services/supabase.js';

export class ChatService {
    static async sendMessage(coupleId, userId, content, type = 'text', metadata = {}) {
        const { data, error } = await supabase
            .from('messages')
            .insert({
                couple_id: coupleId,
                user_id: userId,
                content: content,
                type: type,
                metadata: metadata,
                created_at: new Date().toISOString(),
                read_at: null
            })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    static async getMessages(coupleId, limit = 50, before = null) {
        let query = supabase
            .from('messages')
            .select(`
                *,
                profiles:user_id (
                    id,
                    display_name,
                    avatar_url
                )
            `)
            .eq('couple_id', coupleId)
            .order('created_at', { ascending: false })
            .limit(limit);
        
        if (before) {
            query = query.lt('created_at', before);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data.reverse();
    }

    static async markAsRead(messageIds, userId) {
        const { error } = await supabase
            .from('messages')
            .update({ 
                read_at: new Date().toISOString(),
                read_by: supabase.sql`array_append(read_by, ${userId})`
            })
            .in('id', messageIds);
        
        if (error) throw error;
    }

    static async deleteMessage(messageId, userId) {
        const { error } = await supabase
            .from('messages')
            .update({ 
                deleted_at: new Date().toISOString(),
                deleted_by: userId
            })
            .eq('id', messageId);
        
        if (error) throw error;
    }

    static async uploadVoiceMessage(coupleId, userId, file) {
        const filePath = `voice/${coupleId}/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
            .from('voice-messages')
            .upload(filePath, file);
        
        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
            .from('voice-messages')
            .getPublicUrl(filePath);
        
        return publicUrl;
    }

    static async uploadImageMessage(coupleId, userId, file) {
        const filePath = `chat-images/${coupleId}/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
            .from('chat-images')
            .upload(filePath, file);
        
        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
            .from('chat-images')
            .getPublicUrl(filePath);
        
        return publicUrl;
    }

    static async getUnreadCount(coupleId, userId) {
        const { count, error } = await supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('couple_id', coupleId)
            .neq('user_id', userId)
            .is('read_at', null);
        
        if (error) throw error;
        return count;
    }

    static async searchMessages(coupleId, query) {
        const { data, error } = await supabase
            .from('messages')
            .select(`
                *,
                profiles:user_id (
                    id,
                    display_name,
                    avatar_url
                )
            `)
            .eq('couple_id', coupleId)
            .textSearch('content', query)
            .order('created_at', { ascending: false })
            .limit(20);
        
        if (error) throw error;
        return data;
    }

    static subscribeToMessages(coupleId, callback) {
        return supabase
            .channel(Channels.MESSAGES)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `couple_id=eq.${coupleId}`
                },
                async (payload) => {
                    // Fetch the full message with profile
                    const { data, error } = await supabase
                        .from('messages')
                        .select(`
                            *,
                            profiles:user_id (
                                id,
                                display_name,
                                avatar_url
                            )
                        `)
                        .eq('id', payload.new.id)
                        .single();
                    
                    if (!error) {
                        callback(data);
                    }
                }
            )
            .subscribe();
    }

    static async setTypingStatus(coupleId, userId, isTyping) {
        // This would be handled through a presence channel or realtime
        // For now, we'll use a simpler approach with broadcasts
        const channel = supabase.channel('typing-indicators');
        
        await channel.subscribe();
        
        channel.send({
            type: 'broadcast',
            event: 'typing',
            payload: {
                couple_id: coupleId,
                user_id: userId,
                is_typing: isTyping,
                timestamp: new Date().toISOString()
            }
        });
        
        return channel;
    }

    static subscribeToTyping(coupleId, callback) {
        const channel = supabase.channel('typing-indicators');
        
        channel.on('broadcast', { event: 'typing' }, (payload) => {
            if (payload.payload.couple_id === coupleId) {
                callback(payload.payload);
            }
        });
        
        channel.subscribe();
        return channel;
    }
}
