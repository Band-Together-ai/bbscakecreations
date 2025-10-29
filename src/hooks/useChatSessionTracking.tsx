import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useChatSessionTracking = (userId: string | null, messageCount: number) => {
  const sessionIdRef = useRef<string | null>(null);
  const sessionStartRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!userId) return;

    const startChatSession = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_sessions')
          .insert({
            user_id: userId,
          })
          .select('id')
          .single();

        if (!error && data) {
          sessionIdRef.current = data.id;
          sessionStartRef.current = Date.now();
        }
      } catch (error) {
        console.error('Chat session tracking error:', error);
      }
    };

    startChatSession();

    return () => {
      if (sessionIdRef.current) {
        const timeSpent = Math.floor((Date.now() - sessionStartRef.current) / 1000);
        supabase
          .from('chat_sessions')
          .update({
            session_end: new Date().toISOString(),
            time_spent_seconds: timeSpent,
            message_count: messageCount,
          })
          .eq('id', sessionIdRef.current)
          .then(() => {
            console.log('Chat session ended');
          });
      }
    };
  }, [userId]);

  // Update message count
  useEffect(() => {
    if (sessionIdRef.current && messageCount > 0) {
      supabase
        .from('chat_sessions')
        .update({ message_count: messageCount })
        .eq('id', sessionIdRef.current)
        .then(() => {
          // Silent update
        });
    }
  }, [messageCount]);

  return sessionIdRef.current;
};
