import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSessionTracking = (userId: string | null) => {
  const sessionIdRef = useRef<string | null>(null);
  const activityIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!userId) return;

    const startSession = async () => {
      try {
        const { data, error } = await supabase
          .from('user_sessions')
          .insert({
            user_id: userId,
            user_agent: navigator.userAgent,
          })
          .select('id')
          .single();

        if (!error && data) {
          sessionIdRef.current = data.id;

          // Update last_activity every 30 seconds
          activityIntervalRef.current = setInterval(async () => {
            if (sessionIdRef.current) {
              await supabase
                .from('user_sessions')
                .update({ last_activity: new Date().toISOString() })
                .eq('id', sessionIdRef.current);
            }
          }, 30000);
        }
      } catch (error) {
        console.error('Session tracking error:', error);
      }
    };

    const endSession = async () => {
      if (sessionIdRef.current) {
        try {
          await supabase
            .from('user_sessions')
            .update({ 
              session_end: new Date().toISOString(),
              last_activity: new Date().toISOString()
            })
            .eq('id', sessionIdRef.current);
        } catch (error) {
          console.error('End session error:', error);
        }
      }
    };

    startSession();

    // End session on page unload
    window.addEventListener('beforeunload', endSession);

    return () => {
      endSession();
      window.removeEventListener('beforeunload', endSession);
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current);
      }
    };
  }, [userId]);

  return sessionIdRef.current;
};
