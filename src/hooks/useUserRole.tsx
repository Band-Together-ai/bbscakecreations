import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'collaborator' | 'paid' | 'free' | null;

export const useUserRole = () => {
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isPromo, setIsPromo] = useState(false);
  const [hasFullAccess, setHasFullAccess] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setRole(null);
          setUserId(null);
          setIsPromo(false);
          setHasFullAccess(false);
          setLoading(false);
          return;
        }

        setUserId(session.user.id);

        // Check user role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const userRole = roleError ? 'free' : (roleData?.role || 'free');
        setRole(userRole);

        // Check promo status
        const { data: promoData } = await supabase
          .from('promo_users')
          .select('*')
          .eq('user_id', session.user.id)
          .or('expires_at.is.null,expires_at.gte.' + new Date().toISOString())
          .maybeSingle();

        const hasPromo = !!promoData;
        setIsPromo(hasPromo);

        // Determine full access: admin, collaborator, paid role, OR promo user
        const fullAccess = userRole === 'admin' || 
                          userRole === 'collaborator' || 
                          userRole === 'paid' || 
                          hasPromo;
        setHasFullAccess(fullAccess);

      } catch (err) {
        console.error('Error in useUserRole:', err);
        setRole('free');
        setIsPromo(false);
        setHasFullAccess(false);
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
    isPromo,
    hasFullAccess,
  };
};
