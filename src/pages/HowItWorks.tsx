import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  MessageSquare, 
  Star, 
  Sparkles, 
  Camera, 
  ShoppingBag, 
  Settings, 
  Eye,
  TestTube
} from "lucide-react";

const HowItWorks = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, role, isPaid, hasFullAccess, bakeBookLimit } = useUserRole();

  // Calculate bakebook progress for registered users
  const isCollaborator = role === 'collaborator';

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Unauthenticated Users */}
        {!isAuthenticated && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-fredoka gradient-ocean bg-clip-text text-transparent mb-4">
                🌊 Welcome to Brandia's Baking App!
              </h1>
              <p className="text-lg text-muted-foreground">
                Right now you're browsing as a guest. Here's what you can do:
              </p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-semibold mb-4">What You Can Do Now:</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-ocean-wave mt-1" />
                    <p>✓ Browse all recipes and see photos</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-ocean-wave mt-1" />
                    <p>✓ Chat with Sasha (my AI assistant) up to 15 messages</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-ocean-wave mt-1" />
                    <p>✓ View 3 free featured recipes in full detail</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-xl font-semibold mb-4">Want More? Sign Up (It's Free!):</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-5 h-5 text-coral mt-1" />
                      <p>✓ Save up to 10 recipes to your BakeBook</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-coral mt-1" />
                      <p>✓ Unlimited chat with Sasha</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-coral mt-1" />
                      <p>✓ Track your baking attempts and notes</p>
                    </div>
                  </div>

                  <Button 
                    onClick={() => navigate("/auth")} 
                    className="w-full gradient-ocean text-white shadow-wave"
                    size="lg"
                  >
                    Sign Up Free
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-ocean-wave/10 rounded-lg">
                  <p className="text-sm text-center">
                    <strong>Ask Sasha:</strong> "What's the difference between signing up for free vs. subscribing?"
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Registered Free Users */}
        {isAuthenticated && !hasFullAccess && !isCollaborator && !isAdmin && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-fredoka gradient-ocean bg-clip-text text-transparent mb-4">
                🌊 Your Free Account
              </h1>
              <p className="text-lg text-muted-foreground">
                You're signed in! Here's everything you have access to:
              </p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-semibold mb-4">What You Have Access To:</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-ocean-wave mt-1" />
                    <p>✓ Save up to 10 recipes to your BakeBook</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-ocean-wave mt-1" />
                    <p>✓ Unlimited chat with Sasha</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-ocean-wave mt-1" />
                    <p>✓ Track baking attempts, pan sizes, and notes</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-ocean-wave mt-1" />
                    <p>✓ Rate and review recipes</p>
                  </div>
                </div>

                <div className="my-6 p-4 bg-ocean-wave/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Your BakeBook:</span>
                    <Badge variant="outline">
                      {bakeBookLimit === Infinity ? "Unlimited" : `0/${bakeBookLimit} slots used`}
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-xl font-semibold mb-4">
                    Ready for More? Join the Home Bakers Club ($9.99/month):
                  </h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-5 h-5 text-coral mt-1" />
                      <p>✓ Unlimited BakeBook saves</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Camera className="w-5 h-5 text-coral mt-1" />
                      <p>✓ Real-time recipe scanning from photos</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <ShoppingBag className="w-5 h-5 text-coral mt-1" />
                      <p>✓ Tool wishlists with affiliate recommendations</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-coral mt-1" />
                      <p>✓ Priority support</p>
                    </div>
                  </div>

                  <Button 
                    onClick={() => navigate("/chat")} 
                    className="w-full gradient-ocean text-white shadow-wave"
                    size="lg"
                  >
                    Upgrade to Home Bakers Club
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-ocean-wave/10 rounded-lg">
                  <p className="text-sm text-center">
                    <strong>Ask Sasha:</strong> "Tell me more about the Home Bakers Club benefits"
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Paid Users (Home Bakers Club) */}
        {hasFullAccess && !isCollaborator && !isAdmin && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-fredoka gradient-ocean bg-clip-text text-transparent mb-4">
                💕 Welcome to the Home Bakers Club!
              </h1>
              <p className="text-lg text-muted-foreground">
                You're a full member! Here's everything you can do:
              </p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-semibold mb-4">Your Full Access:</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-ocean-wave mt-1" />
                    <p>✓ Unlimited BakeBook saves</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Camera className="w-5 h-5 text-ocean-wave mt-1" />
                    <p>✓ Real-time recipe scanning from photos (I extract ingredients + tools automatically!)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShoppingBag className="w-5 h-5 text-ocean-wave mt-1" />
                    <p>✓ Create wishlists for baking tools</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-ocean-wave mt-1" />
                    <p>✓ Track unlimited recipe attempts with detailed notes</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-ocean-wave mt-1" />
                    <p>✓ Priority chat support</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-xl font-semibold mb-4">Pro Tips:</h3>
                  <div className="space-y-3">
                    <p className="text-muted-foreground">
                      • Upload a recipe photo in Chat and I'll scan it instantly
                    </p>
                    <p className="text-muted-foreground">
                      • Build wishlists from tools I suggest during scans
                    </p>
                    <p className="text-muted-foreground">
                      • Use BakeBook folders to organize: Favorites, To Try, Made It
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-ocean-wave/10 rounded-lg">
                  <p className="text-sm text-center">
                    <strong>Ask Sasha:</strong> "How do I scan a recipe from a photo?"
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Collaborators */}
        {isCollaborator && !isAdmin && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-fredoka gradient-ocean bg-clip-text text-transparent mb-4 flex items-center justify-center gap-3">
                <TestTube className="w-10 h-10 text-ocean-wave" />
                Collaborator Access
              </h1>
              <p className="text-lg text-muted-foreground">
                You're helping Brandia test and refine features!
              </p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-semibold mb-4">What You Have:</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-ocean-wave mt-1" />
                    <p>✓ Everything from Home Bakers Club</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <TestTube className="w-5 h-5 text-ocean-wave mt-1" />
                    <p>✓ Early access to new features</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-ocean-wave mt-1" />
                    <p>✓ Admin-level recipe viewing (you can see draft recipes)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-ocean-wave mt-1" />
                    <p>✓ Direct feedback channel to Brandia</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-xl font-semibold mb-4">Your Role:</h3>
                  <p className="text-muted-foreground">
                    Help test new baking tools, features, and recipes before they go live.
                  </p>
                </div>

                <div className="mt-6 p-4 bg-ocean-wave/10 rounded-lg">
                  <p className="text-sm text-center">
                    <strong>Ask Sasha:</strong> "What new features are being tested right now?"
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Admins */}
        {isAdmin && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-fredoka gradient-ocean bg-clip-text text-transparent mb-4 flex items-center justify-center gap-3">
                <Settings className="w-10 h-10 text-coral" />
                Admin Control Panel
              </h1>
              <p className="text-lg text-muted-foreground">
                You have full system access.
              </p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-semibold mb-4">Quick Links:</h3>
                <div className="space-y-3">
                  <Button 
                    onClick={() => navigate("/admin")} 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Admin Dashboard - Manage users, recipes, photos
                  </Button>
                  <Button 
                    onClick={() => navigate("/admin")} 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View As Tool - Test the app as different user roles
                  </Button>
                  <Button 
                    onClick={() => navigate("/admin")} 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Analytics - See coffee clicks, page views, user activity
                  </Button>
                  <Button 
                    onClick={() => navigate("/bakebook")} 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Master BakeBook - Your private recipe refinement lab
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-xl font-semibold mb-4">Common Tasks:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Create recipes from photos (Admin → Recipes tab)</li>
                    <li>• Promote users to Collaborator</li>
                    <li>• Train Sasha (Admin → Sasha Training tab)</li>
                    <li>• Grant promo access to Early Bird users</li>
                  </ul>
                </div>

                <div className="mt-6 p-4 bg-coral/10 rounded-lg">
                  <p className="text-sm text-center">
                    <strong>Ask Sasha:</strong> "Walk me through creating a recipe from a photo"
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Call to Action for Non-Admins */}
        {!isAdmin && (
          <div className="mt-8 text-center">
            <Button 
              onClick={() => navigate("/chat")} 
              variant="outline"
              size="lg"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat with Sasha for More Help
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HowItWorks;
