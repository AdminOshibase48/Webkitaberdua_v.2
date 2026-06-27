import { supabase } from './assets/js/services/supabase.js';

export class GalleryService {
    static async uploadMemory(coupleId, userId, file, caption, albumId = null) {
        const filePath = `memories/${coupleId}/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
            .from('memories')
            .upload(filePath, file);
        
        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
            .from('memories')
            .getPublicUrl(filePath);
        
        // Determine file type
        const type = file.type.startsWith('video/') ? 'video' : 'image';
        
        const { data: memory, error: memoryError } = await supabase
            .from('memories')
            .insert({
                couple_id: coupleId,
                user_id: userId,
                file_url: publicUrl,
                file_path: filePath,
                file_type: type,
                caption: caption,
                album_id: albumId,
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (memoryError) {
            // Clean up storage if DB insert fails
            await supabase.storage.from('memories').remove([filePath]);
            throw memoryError;
        }
        
        return memory;
    }

    static async getMemories(coupleId, limit = 50, offset = 0) {
        const { data, error } = await supabase
            .from('memories')
            .select(`
                *,
                profiles:user_id (
                    id,
                    display_name,
                    avatar_url
                ),
                albums:album_id (
                    id,
                    name,
                    cover_url
                )
            `)
            .eq('couple_id', coupleId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        
        if (error) throw error;
        return data;
    }

    static async getMemory(memoryId) {
        const { data, error } = await supabase
            .from('memories')
            .select(`
                *,
                profiles:user_id (
                    id,
                    display_name,
                    avatar_url
                ),
                albums:album_id (
                    id,
                    name
                )
            `)
            .eq('id', memoryId)
            .single();
        
        if (error) throw error;
        return data;
    }

    static async deleteMemory(memoryId, userId) {
        // Get the memory first to delete the file
        const { data: memory, error: getError } = await supabase
            .from('memories')
            .select('file_path')
            .eq('id', memoryId)
            .single();
        
        if (getError) throw getError;
        
        // Delete from storage
        if (memory.file_path) {
            await supabase.storage.from('memories').remove([memory.file_path]);
        }
        
        // Delete from database
        const { error } = await supabase
            .from('memories')
            .delete()
            .eq('id', memoryId);
        
        if (error) throw error;
    }

    static async toggleFavorite(memoryId, userId) {
        // Check if already favorited
        const { data: existing, error: checkError } = await supabase
            .from('memory_favorites')
            .select('*')
            .eq('memory_id', memoryId)
            .eq('user_id', userId)
            .single();
        
        if (checkError && checkError.code !== 'PGRST116') throw checkError;
        
        if (existing) {
            // Remove favorite
            const { error } = await supabase
                .from('memory_favorites')
                .delete()
                .eq('id', existing.id);
            
            if (error) throw error;
            return false;
        } else {
            // Add favorite
            const { error } = await supabase
                .from('memory_favorites')
                .insert({
                    memory_id: memoryId,
                    user_id: userId,
                    created_at: new Date().toISOString()
                });
            
            if (error) throw error;
            return true;
        }
    }

    static async getFavoriteMemories(coupleId, userId) {
        const { data, error } = await supabase
            .from('memory_favorites')
            .select(`
                memory_id,
                memories:* (
                    *,
                    profiles:user_id (
                        id,
                        display_name,
                        avatar_url
                    )
                )
            `)
            .eq('user_id', userId)
            .eq('memories.couple_id', coupleId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data.map(f => f.memories).filter(m => m !== null);
    }

    static async createAlbum(coupleId, userId, name, description = '') {
        const { data, error } = await supabase
            .from('albums')
            .insert({
                couple_id: coupleId,
                user_id: userId,
                name: name,
                description: description,
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    static async getAlbums(coupleId) {
        const { data, error } = await supabase
            .from('albums')
            .select(`
                *,
                memories:memories(count)
            `)
            .eq('couple_id', coupleId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    }

    static async updateAlbum(albumId, updates) {
        const { data, error } = await supabase
            .from('albums')
            .update(updates)
            .eq('id', albumId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    static async deleteAlbum(albumId) {
        // Get all memories in album
        const { data: memories, error: getError } = await supabase
            .from('memories')
            .select('file_path')
            .eq('album_id', albumId);
        
        if (getError) throw getError;
        
        // Delete files from storage
        for (const memory of memories) {
            if (memory.file_path) {
                await supabase.storage.from('memories').remove([memory.file_path]);
            }
        }
        
        // Delete memories
        await supabase
            .from('memories')
            .delete()
            .eq('album_id', albumId);
        
        // Delete album
        const { error } = await supabase
            .from('albums')
            .delete()
            .eq('id', albumId);
        
        if (error) throw error;
    }

    static subscribeToMemories(coupleId, callback) {
        return supabase
            .channel('gallery-updates')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'memories',
                    filter: `couple_id=eq.${coupleId}`
                },
                callback
            )
            .subscribe();
    }
}
