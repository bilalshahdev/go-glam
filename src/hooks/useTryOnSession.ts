
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface TryOnSession {
  id?: string;
  session_name?: string;
  makeup_look?: string;
  hair_style?: string;
  hair_color?: string;
  original_image_url?: string;
  processed_image_url?: string;
  session_data?: any;
}

export const useTryOnSession = () => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<TryOnSession>({});
  const [sessions, setSessions] = useState<TryOnSession[]>([]);
  const [loading, setLoading] = useState(false);

  const updateSession = useCallback((updates: Partial<TryOnSession>) => {
    setCurrentSession(prev => ({ ...prev, ...updates }));
  }, []);

  const saveSession = useCallback(async (sessionName?: string) => {
    if (!user) {
      toast.error('You must be logged in to save sessions');
      return;
    }

    setLoading(true);
    try {
      const sessionData = {
        user_id: user.id,
        session_name: sessionName || `Session ${new Date().toLocaleString()}`,
        makeup_look: currentSession.makeup_look,
        hair_style: currentSession.hair_style,
        hair_color: currentSession.hair_color,
        session_data: currentSession.session_data,
      };

      const { data, error } = await supabase
        .from('tryon_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;

      toast.success('Session saved successfully!');
      setCurrentSession(prev => ({ ...prev, id: data.id }));
      await loadSessions();
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error('Failed to save session');
    } finally {
      setLoading(false);
    }
  }, [user, currentSession]);

  const loadSessions = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tryon_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  }, [user]);

  const loadSession = useCallback(async (sessionId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tryon_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      setCurrentSession({
        id: data.id,
        session_name: data.session_name,
        makeup_look: data.makeup_look,
        hair_style: data.hair_style,
        hair_color: data.hair_color,
        original_image_url: data.original_image_url,
        processed_image_url: data.processed_image_url,
        session_data: data.session_data,
      });

      toast.success('Session loaded!');
    } catch (error) {
      console.error('Error loading session:', error);
      toast.error('Failed to load session');
    }
  }, [user]);

  const uploadImage = useCallback(async (file: File, type: 'original' | 'processed') => {
    if (!user) {
      toast.error('You must be logged in to upload images');
      return null;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${type}.${fileExt}`;

      console.log('Uploading file:', fileName);

      const { error: uploadError } = await supabase.storage
        .from('tryon-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('tryon-images')
        .getPublicUrl(fileName);

      console.log('File uploaded successfully:', data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(`Failed to upload image: ${error.message}`);
      return null;
    }
  }, [user]);

  return {
    currentSession,
    sessions,
    loading,
    updateSession,
    saveSession,
    loadSessions,
    loadSession,
    uploadImage,
  };
};
