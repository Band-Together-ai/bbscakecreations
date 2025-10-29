import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useViewAs } from '@/contexts/ViewAsContext';

type AppRole = 'admin' | 'collaborator' | 'paid' | 'free' | null;

export const useUserRole = () => {
  const { viewAsRole, isViewingAs } = useViewAs();
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

        // Check temporary access (tip jar 30-day passes)
        const { data: tempAccessData } = await supabase
          .from('temporary_access')
          .select('*')
          .eq('user_id', session.user.id)
          .gte('expires_at', new Date().toISOString())
          .maybeSingle();

        const hasTempAccess = !!tempAccessData;

        // Determine full access: admin, collaborator, paid role, promo user, OR temp access
        const fullAccess = userRole === 'admin' || 
                          userRole === 'collaborator' || 
                          userRole === 'paid' || 
                          hasPromo ||
                          hasTempAccess;
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

  // Override with viewAs if active (but don't allow viewing as unauthenticated with a real userId)
  const effectiveRole = isViewingAs && viewAsRole !== 'unauthenticated' ? viewAsRole : role;
  const effectiveUserId = isViewingAs && viewAsRole === 'unauthenticated' ? null : userId;
  const effectiveIsAuthenticated = isViewingAs && viewAsRole === 'unauthenticated' ? false : userId !== null;
  
  // Recalculate hasFullAccess based on effective role
  const effectiveHasFullAccess = effectiveRole === 'admin' || 
                                  effectiveRole === 'collaborator' || 
                                  effectiveRole === 'paid' || 
                                  isPromo ||
                                  hasFullAccess;

  return {
    role: effectiveRole,
    userId: effectiveUserId,
    loading,
    isAdmin: effectiveRole === 'admin',
    isCollaborator: effectiveRole === 'collaborator',
    isPaid: effectiveRole === 'paid',
    isFree: effectiveRole === 'free',
    isAuthenticated: effectiveIsAuthenticated,
    isPromo,
    hasFullAccess: effectiveHasFullAccess,
    bakeBookLimit: effectiveHasFullAccess ? Infinity : (effectiveIsAuthenticated ? 10 : 0),
    canUseWishlists: effectiveHasFullAccess,
    realtimeScanEnabled: effectiveRole === 'paid' || effectiveRole === 'admin' || effectiveRole === 'collaborator',
  };
};
