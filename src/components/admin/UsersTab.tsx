import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreVertical, Eye, Ban, Trash2, Star } from "lucide-react";

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}

interface UserRole {
  user_id: string;
  role: string;
}

interface PromoUser {
  user_id: string;
  promo_type: string;
  granted_at: string;
  expires_at: string | null;
  notes: string | null;
}

interface UserActivity {
  action_type: string;
  details: any;
  created_at: string;
}

export const UsersTab = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const [promoUsers, setPromoUsers] = useState<Record<string, PromoUser>>({});
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  
  // Grant access form
  const [showGrantDialog, setShowGrantDialog] = useState(false);
  const [grantUserId, setGrantUserId] = useState<string>('');
  const [grantDays, setGrantDays] = useState<string>('');
  const [grantNotes, setGrantNotes] = useState<string>('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    
    try {
      // Fetch all users using edge function (requires admin role)
      const { data: usersData, error: usersError } = await supabase.functions.invoke('list-users');
      
      if (usersError) {
        console.error('Error fetching users:', usersError);
        
        // Better error handling
        if (usersError.message?.includes('401') || usersError.message?.includes('403')) {
          toast.error('Admin access required to view users');
        } else if (usersError.message?.includes('FunctionsRelayError')) {
          toast.error('Users service not available. Please try again.');
        } else {
          toast.error('Failed to load users');
        }
        
        setLoading(false);
        return;
      }

      const authUsers = usersData?.users || [];
      const rolesData = usersData?.roles || [];
      const promoData = usersData?.promo || [];
      
      if (!authUsers.length) {
        console.log('No users returned from edge function');
      }

      // Build roles map from function response
      const rolesMap: Record<string, string> = {};
      rolesData.forEach((r: any) => {
        rolesMap[r.user_id] = r.role;
      });
      setUserRoles(rolesMap);

      // Build promo map from function response
      const promoMap: Record<string, PromoUser> = {};
      promoData.forEach((p: any) => {
        promoMap[p.user_id] = p;
      });
      setPromoUsers(promoMap);

      // Map auth users to User interface
      const mappedUsers: User[] = authUsers
        .filter((u: any) => u.email)
        .map((u: any) => ({
          id: u.id,
          email: u.email!,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at || null
        }));
      
      setUsers(mappedUsers);
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      toast.error('Failed to load users');
      setLoading(false);
    }
  };

  const fetchUserActivity = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_activity_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching activity:', error);
      toast.error('Failed to load activity');
      return;
    }

    setUserActivity(data || []);
  };

  const handleViewActivity = async (user: User) => {
    setSelectedUser(user);
    await fetchUserActivity(user.id);
    setShowActivityDialog(true);
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role: newRole as 'admin' | 'collaborator' | 'paid' | 'free' });

    if (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
      return;
    }

    toast.success(`Role updated to ${newRole}`);
    fetchUsers();
  };

  const handleGrantAccess = async () => {
    if (!grantUserId) {
      toast.error('Please select a user');
      return;
    }

    const days = grantDays ? parseInt(grantDays) : 0;

    try {
      const { data, error } = await supabase.functions.invoke('grant-promo-access', {
        body: {
          targetUserId: grantUserId,
          promoType: days > 0 ? 'admin_grant' : 'early_bird_lifetime',
          days: days > 0 ? days : null,
          notes: grantNotes || null,
        },
      });

      if (error) throw error;

      toast.success('Access granted successfully!');
      setShowGrantDialog(false);
      setGrantUserId('');
      setGrantDays('');
      setGrantNotes('');
      fetchUsers();
    } catch (error: any) {
      console.error('Error granting access:', error);
      toast.error(error.message || 'Failed to grant access');
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user ${email}? This cannot be undone.`)) return;

    try {
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });

      if (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
        return;
      }

      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'collaborator': return 'default';
      case 'paid': return 'secondary';
      default: return 'outline';
    }
  };

  const filteredUsers = users.filter(user => {
    if (filterRole === 'all') return true;
    if (filterRole === 'promo') return promoUsers[user.id];
    return userRoles[user.id] === filterRole;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-wave mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header with filters and actions */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="font-fredoka">User Management</CardTitle>
                <CardDescription>
                  Manage user roles, grant access, and monitor activity
                </CardDescription>
              </div>
              <Button onClick={() => setShowGrantDialog(true)}>
                <Star className="w-4 h-4 mr-2" />
                Grant Access
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterRole === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterRole('all')}
              >
                All Users ({users.length})
              </Button>
              <Button
                variant={filterRole === 'admin' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterRole('admin')}
              >
                Admins
              </Button>
              <Button
                variant={filterRole === 'paid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterRole('paid')}
              >
                Paid
              </Button>
              <Button
                variant={filterRole === 'free' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterRole('free')}
              >
                Free
              </Button>
              <Button
                variant={filterRole === 'promo' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterRole('promo')}
              >
                Promo ({Object.keys(promoUsers).length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users list */}
        <Card>
          <ScrollArea className="h-[600px]">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {filteredUsers.map(user => {
                  const role = userRoles[user.id] || 'free';
                  const promo = promoUsers[user.id];
                  
                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{user.email}</p>
                          <Badge variant={getRoleBadgeVariant(role)}>
                            {role}
                          </Badge>
                          {promo && (
                            <Badge variant="default" className="bg-gradient-ocean">
                              ⭐ Promo
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Joined: {new Date(user.created_at).toLocaleDateString()}
                          {user.last_sign_in_at && (
                            <> • Last active: {new Date(user.last_sign_in_at).toLocaleDateString()}</>
                          )}
                        </div>
                        {promo && promo.notes && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Note: {promo.notes}
                          </div>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewActivity(user)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Activity
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleChangeRole(user.id, 'admin')}>
                            Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleChangeRole(user.id, 'paid')}>
                            Set to Paid
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleChangeRole(user.id, 'free')}>
                            Set to Free
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user.id, user.email || '')}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No users found with selected filter
                  </div>
                )}
              </div>
            </CardContent>
          </ScrollArea>
        </Card>
      </div>

      {/* Grant Access Dialog */}
      <Dialog open={showGrantDialog} onOpenChange={setShowGrantDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant Promo Access</DialogTitle>
            <DialogDescription>
              Give a user temporary or permanent premium access
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select User</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={grantUserId}
                onChange={(e) => setGrantUserId(e.target.value)}
              >
                <option value="">Choose a user...</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.email} ({userRoles[user.id] || 'free'})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Duration (days)</Label>
              <Input
                type="number"
                placeholder="Leave empty for lifetime access"
                value={grantDays}
                onChange={(e) => setGrantDays(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Empty = lifetime • 60 = 60 days • 90 = 90 days, etc.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Admin Notes (optional)</Label>
              <Textarea
                placeholder="E.g., 'Beta tester' or 'Granted for helping with launch'"
                value={grantNotes}
                onChange={(e) => setGrantNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleGrantAccess} className="flex-1">
                Grant Access
              </Button>
              <Button variant="outline" onClick={() => setShowGrantDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Activity Dialog */}
      <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Activity Log: {selectedUser?.email}</DialogTitle>
            <DialogDescription>
              Recent actions by this user
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {userActivity.map((activity, index) => (
                <div key={index} className="p-3 border rounded-lg text-sm">
                  <div className="flex justify-between items-start mb-1">
                    <Badge variant="outline">{activity.action_type}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleString()}
                    </span>
                  </div>
                  {activity.details && (
                    <pre className="text-xs text-muted-foreground mt-2 overflow-auto">
                      {JSON.stringify(activity.details, null, 2)}
                    </pre>
                  )}
                </div>
              ))}

              {userActivity.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No activity recorded yet
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};
