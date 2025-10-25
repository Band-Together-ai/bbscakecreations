import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  published_at: string | null;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    setPosts(data || []);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-fredoka gradient-ocean bg-clip-text text-transparent mb-4">
            Brandia's Baking Stories
          </h1>
          <p className="text-xl text-dolphin max-w-2xl mx-auto">
            Behind every cake is a story—the moments, the magic, the mishaps, and the love.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              No blog posts yet. Stay tuned for Brandia's baking adventures!
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            {posts.map((post) => (
              <Card key={post.id} className="shadow-wave hover:shadow-float transition-all">
                <CardHeader>
                  <CardTitle className="font-fredoka text-3xl text-ocean-deep">
                    {post.title}
                  </CardTitle>
                  <CardDescription>
                    {post.published_at && new Date(post.published_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-ocean max-w-none">
                    <p className="text-lg whitespace-pre-wrap">{post.content}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
