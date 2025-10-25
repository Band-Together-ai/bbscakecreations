import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MessageSquare, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
}

const Community = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [showNewPost, setShowNewPost] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("forum_posts")
      .select("*")
      .order("created_at", { ascending: false });

    setPosts(data || []);
  };

  const handleCreatePost = async () => {
    if (!user) {
      toast.error("Please sign in to post");
      navigate("/auth");
      return;
    }

    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast.error("Please fill in both title and content");
      return;
    }

    const { error } = await supabase.from("forum_posts").insert({
      user_id: user.id,
      title: newPostTitle,
      content: newPostContent,
    });

    if (error) {
      toast.error("Failed to create post");
      return;
    }

    toast.success("Post created!");
    setNewPostTitle("");
    setNewPostContent("");
    setShowNewPost(false);
    fetchPosts();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-12 h-12 text-ocean-wave" />
            <h1 className="text-5xl font-fredoka gradient-ocean bg-clip-text text-transparent">
              Cake Builder Community
            </h1>
          </div>
          <p className="text-xl text-dolphin max-w-2xl mx-auto mb-6">
            A chatty space for swapping stories, tips, and celebrating each other's baking triumphs
          </p>
          
          {user && !showNewPost && (
            <Button
              onClick={() => setShowNewPost(true)}
              className="gradient-ocean text-primary-foreground"
              size="lg"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Start a Discussion
            </Button>
          )}
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {showNewPost && (
            <Card className="shadow-float border-ocean-wave/30">
              <CardHeader>
                <CardTitle className="font-fredoka text-2xl">New Discussion</CardTitle>
                <CardDescription>Share your question, triumph, or baking story</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Discussion Title"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
                <Textarea
                  placeholder="How'd you nail that gluten-free ombre? Share your story..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={6}
                />
                <div className="flex gap-2">
                  <Button onClick={handleCreatePost} className="gradient-ocean text-primary-foreground">
                    Post to Community
                  </Button>
                  <Button onClick={() => setShowNewPost(false)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <MessageSquare className="w-16 h-16 text-ocean-wave mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg mb-4">
                No discussions yet. Be the first to start the conversation!
              </p>
              {!user && (
                <Button onClick={() => navigate("/auth")} className="gradient-ocean text-primary-foreground">
                  Sign In to Post
                </Button>
              )}
            </div>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="shadow-wave hover:shadow-float transition-all">
                <CardHeader>
                  <CardTitle className="font-fredoka text-2xl text-ocean-deep">
                    {post.title}
                  </CardTitle>
                  <CardDescription>
                    {new Date(post.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-lg">{post.content}</p>
                  <div className="mt-4 pt-4 border-t border-border">
                    <Button variant="outline" size="sm" className="gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Reply (Coming Soon)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;
