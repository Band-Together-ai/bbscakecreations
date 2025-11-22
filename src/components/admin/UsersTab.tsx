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
import { MoreVertical, Eye, Ban, Trash2, Star, KeyRound } from "lucide-react";

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

interface ActivitySummary {
  user_id: string;
  total_sessions: number;
  total_time_minutes: number;
  last_active: string | null;
  is_online: boolean;
  total_page_views: number;
  total_chat_sessions: number;
  total_chat_messages: number;
  total_chat_time_minutes: number;
  support_clicks: number;
  tool_clicks: number;
}

export const UsersTab = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const [promoUsers, setPromoUsers] = useState<Record<string, PromoUser>>({});
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [activitySummary, setActivitySummary] = useState<ActivitySummary | null>(null);
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
    // Fetch activity log
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

    // Fetch activity summary using database function
    const { data: summaryData, error: summaryError } = await supabase
      .rpc('get_user_activity_summary', { target_user_id: userId });

    if (summaryError) {
      console.error('Error fetching summary:', summaryError);
    } else if (summaryData) {
      setActivitySummary(summaryData as unknown as ActivitySummary);
    }
  };

  const handleViewActivity = async (user: User) => {
    setSelectedUser(user);
    setActivitySummary(null); // Reset summary
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

  const handleResetPassword = async (userId: string, email: string) => {
    if (!confirm(`Send password reset email to ${email}?`)) return;

    try {
      const { data, error } = await supabase.functions.invoke('reset-user-password', {
        body: { userId }
      });

      if (error) {
        console.error('Error resetting password:', error);
        toast.error('Failed to send password reset');
        return;
      }

      toast.success(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to send password reset');
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
                          <DropdownMenuItem onClick={() => handleResetPassword(user.id, user.email)}>
                            <KeyRound className="w-4 h-4 mr-2" />
                            Reset Password
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
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Activity: {selectedUser?.email}
              {activitySummary?.is_online && (
                <Badge variant="default" className="bg-green-500">
                  🟢 Online
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              User engagement and activity summary
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {/* Activity Summary Cards */}
              {activitySummary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-ocean-wave">
                        {activitySummary.total_sessions}
                      </div>
                      <div className="text-xs text-muted-foreground">Login Sessions</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-ocean-wave">
                        {Math.floor(activitySummary.total_time_minutes / 60)}h {activitySummary.total_time_minutes % 60}m
                      </div>
                      <div className="text-xs text-muted-foreground">Total Time</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-ocean-wave">
                        {activitySummary.total_page_views}
                      </div>
                      <div className="text-xs text-muted-foreground">Pages Viewed</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-ocean-wave">
                        {activitySummary.total_chat_sessions}
                      </div>
                      <div className="text-xs text-muted-foreground">Chat Sessions</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-ocean-wave">
                        {activitySummary.total_chat_messages}
                      </div>
                      <div className="text-xs text-muted-foreground">Chat Messages</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-ocean-wave">
                        {activitySummary.total_chat_time_minutes}m
                      </div>
                      <div className="text-xs text-muted-foreground">Chat Time</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-ocean-wave">
                        {activitySummary.support_clicks}
                      </div>
                      <div className="text-xs text-muted-foreground">Support Clicks</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-ocean-wave">
                        {activitySummary.tool_clicks}
                      </div>
                      <div className="text-xs text-muted-foreground">Tool Clicks</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activitySummary?.last_active && (
                <div className="text-sm text-muted-foreground mb-4">
                  Last active: {new Date(activitySummary.last_active).toLocaleString()}
                </div>
              )}

              {/* Activity Log */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Recent Activity Log</h3>
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
                        <pre className="text-xs text-muted-foreground mt-2 overflow-auto max-h-32">
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
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};
