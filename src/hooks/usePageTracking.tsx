import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const usePageTracking = (userId: string | null) => {
  const location = useLocation();
  const pageStartTimeRef = useRef<number>(Date.now());
  const currentPageIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const logPageView = async () => {
      try {
        // End previous page view
        if (currentPageIdRef.current) {
          const timeSpent = Math.floor((Date.now() - pageStartTimeRef.current) / 1000);
          await supabase
            .from('page_views')
            .update({ time_spent_seconds: timeSpent })
            .eq('id', currentPageIdRef.current);
        }

        // Start new page view
        const { data, error } = await supabase
          .from('page_views')
          .insert({
            user_id: userId,
            page_path: location.pathname,
            page_title: document.title,
            referrer: document.referrer,
          })
          .select('id')
          .single();

        if (!error && data) {
          currentPageIdRef.current = data.id;
          pageStartTimeRef.current = Date.now();
        }
      } catch (error) {
        console.error('Page tracking error:', error);
      }
    };

    logPageView();

    // Update time spent on page unload
    const handleUnload = async () => {
      if (currentPageIdRef.current) {
        const timeSpent = Math.floor((Date.now() - pageStartTimeRef.current) / 1000);
        await supabase
          .from('page_views')
          .update({ time_spent_seconds: timeSpent })
          .eq('id', currentPageIdRef.current);
      }
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      handleUnload();
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [location.pathname, userId]);
};
