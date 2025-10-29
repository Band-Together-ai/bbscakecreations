import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useViewAs } from "@/contexts/ViewAsContext";
import { Eye, EyeOff, User, UserCog, UserCheck, UserX, Lock } from "lucide-react";

export const ViewAsTab = () => {
  const { viewAsRole, setViewAsRole, isViewingAs, clearViewAs } = useViewAs();

  const roleOptions = [
    { 
      value: 'admin' as const, 
      label: 'Admin', 
      icon: UserCog,
      description: 'Full access to all features and admin dashboard',
      color: 'bg-purple-500'
    },
    { 
      value: 'collaborator' as const, 
      label: 'Collaborator', 
      icon: UserCheck,
      description: 'Can manage recipes, blog posts, and content',
      color: 'bg-blue-500'
    },
    { 
      value: 'paid' as const, 
      label: 'Paid User', 
      icon: User,
      description: 'Access to all recipes and community features',
      color: 'bg-green-500'
    },
    { 
      value: 'free' as const, 
      label: 'Free User', 
      icon: User,
      description: 'Limited access to public recipes only',
      color: 'bg-gray-500'
    },
    { 
      value: 'unauthenticated' as const, 
      label: 'Not Logged In', 
      icon: UserX,
      description: 'Public view - no authentication',
      color: 'bg-red-500'
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-fredoka flex items-center gap-2">
                <Eye className="h-5 w-5" />
                View As Different User Roles
              </CardTitle>
              <CardDescription>
                Test what different user roles see across the site
              </CardDescription>
            </div>
            {isViewingAs && (
              <Button
                variant="outline"
                onClick={clearViewAs}
                className="gap-2"
              >
                <EyeOff className="h-4 w-4" />
                Stop Viewing As
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isViewingAs && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
                <Eye className="h-5 w-5" />
                <span className="font-medium">
                  Currently viewing as: <Badge variant="secondary">{
                    roleOptions.find(r => r.value === viewAsRole)?.label || 'Unknown'
                  }</Badge>
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Navigate around the site to see what this role can access. Click "Stop Viewing As" to return to your admin view.
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {roleOptions.map((role) => {
              const Icon = role.icon;
              const isActive = viewAsRole === role.value;
              
              return (
                <Card
                  key={role.value}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isActive ? 'ring-2 ring-ocean-wave' : ''
                  }`}
                  onClick={() => setViewAsRole(role.value)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${role.color} bg-opacity-10`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{role.label}</h3>
                          {isActive && (
                            <Badge variant="default" className="text-xs">
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Lock className="h-4 w-4" />
              How to Use
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
              <li>Click on any role card above to start viewing as that user type</li>
              <li>Navigate to different pages (Home, Recipes, Community, etc.)</li>
              <li>Check what features are visible/hidden for that role</li>
              <li>Test recipe access, navigation visibility, and permissions</li>
              <li>Click "Stop Viewing As" when done to return to admin view</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
