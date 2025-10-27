import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TipJarSession {
  id: string;
  expires_at: string;
  is_active: boolean;
  session_duration_minutes: number;
}

export const useTipJarSession = (userId: string | null) => {
  const [session, setSession] = useState<TipJarSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [remainingMinutes, setRemainingMinutes] = useState(0);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchSession = async () => {
      const { data, error } = await supabase
        .from('tip_jar_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setSession(data);
        const remaining = Math.max(0, Math.floor((new Date(data.expires_at).getTime() - Date.now()) / 60000));
        setRemainingMinutes(remaining);
      }
      setLoading(false);
    };

    fetchSession();

    // Update remaining time every minute
    const interval = setInterval(() => {
      if (session) {
        const remaining = Math.max(0, Math.floor((new Date(session.expires_at).getTime() - Date.now()) / 60000));
        setRemainingMinutes(remaining);
        
        if (remaining <= 0) {
          setSession(null);
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [userId, session]);

  return {
    session,
    loading,
    isActive: !!session && remainingMinutes > 0,
    remainingMinutes,
    sessionId: session?.id || null,
  };
};
