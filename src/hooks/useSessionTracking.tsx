import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_CHECK_INTERVAL = 30000; // 30 seconds

export const useSessionTracking = (userId: string | null) => {
  const sessionIdRef = useRef<string | null>(null);
  const activityIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!userId) return;

    const updateLastActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Track user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      window.addEventListener(event, updateLastActivity);
    });

    const checkInactivity = async () => {
      const timeSinceActivity = Date.now() - lastActivityRef.current;
      
      if (timeSinceActivity >= INACTIVITY_TIMEOUT) {
        // Log out user due to inactivity
        await endSession();
        await supabase.auth.signOut();
      }
    };

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
          }, ACTIVITY_CHECK_INTERVAL);

          // Check for inactivity every 30 seconds
          inactivityTimeoutRef.current = setInterval(checkInactivity, ACTIVITY_CHECK_INTERVAL);
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
      activityEvents.forEach(event => {
        window.removeEventListener(event, updateLastActivity);
      });
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current);
      }
      if (inactivityTimeoutRef.current) {
        clearInterval(inactivityTimeoutRef.current);
      }
    };
  }, [userId]);

  return sessionIdRef.current;
};
