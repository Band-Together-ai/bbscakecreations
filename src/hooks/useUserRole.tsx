import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'collaborator' | 'paid' | 'free' | null;

export const useUserRole = () => {
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setRole(null);
          setUserId(null);
          setLoading(false);
          return;
        }

        setUserId(session.user.id);

        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error('Error fetching role:', error);
          setRole('free'); // Default to free if error
        } else {
          setRole(data?.role || 'free');
        }
      } catch (err) {
        console.error('Error in useUserRole:', err);
        setRole('free');
      } finally {
        setLoading(false);
      }
    };

    fetchRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      setLoading(true);
      fetchRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    role,
    userId,
    loading,
    isAdmin: role === 'admin',
    isCollaborator: role === 'collaborator',
    isPaid: role === 'paid',
    isFree: role === 'free',
    isAuthenticated: userId !== null,
  };
};
