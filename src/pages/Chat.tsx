import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import WaveBackground from "@/components/WaveBackground";
import Navigation from "@/components/Navigation";
import { Send, Upload, Link as LinkIcon, Mic } from "lucide-react";

const Chat = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: "assistant",
      content: "Hey sugar, let's bake something alive—what's the vibe today? 🌊✨",
    },
  ]);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      }
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");

    // Simulate AI response (in a real implementation, this would call your AI backend)
    setTimeout(() => {
      const aiResponse = {
        role: "assistant",
        content:
          "That sounds delicious! Let me help you craft that recipe from scratch—no box mixes, always gluten-free friendly. Tell me more about the flavors you're craving? 🍰",
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <Navigation />
      <WaveBackground />

      {/* Main chat area */}
      <div className="flex-1 container mx-auto px-4 py-8 flex flex-col relative z-10">
        <Card className="flex-1 flex flex-col shadow-float">
          <CardHeader>
            <CardTitle className="font-fredoka text-ocean-deep">
              Chat with Sasha
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload photos • Paste recipe links • Use voice • Get Brandia's magic
            </p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-ocean-wave text-white"
                          : "bg-ocean-foam text-ocean-deep"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="mt-4 space-y-4">
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Photo
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Recipe Link
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Mic className="w-4 h-4" />
                  Voice
                </Button>
              </div>
              
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask Sasha anything about baking..."
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="gradient-ocean text-primary-foreground shadow-wave transition-bounce hover:scale-105"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chat;
