import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import WaveBackground from "@/components/WaveBackground";
import Navigation from "@/components/Navigation";
import { Send, ArrowLeft } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

const TrainSasha = () => {
  const navigate = useNavigate();
  const { isAdmin } = useUserRole();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: "assistant",
      content: "Hey Brandia! 💕\n\nI'm so excited to learn more about you and your baking philosophy. This is our special training space where I can get to know your voice, your stories, and what makes your cakes magical.\n\nTell me - what's been on your mind lately? Any new recipes brewing, baking adventures, or just life stuff you want to chat about?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAdmin) {
      toast.error("Admin access required");
      navigate("/");
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = { role: "user", content: message };
    const updatedMessages = [...messages, userMessage];
    setMessages([...updatedMessages, { role: "assistant", content: "..." }]);
    setMessage("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("train-sasha", {
        body: { messages: updatedMessages },
      });

      if (error) {
        console.error("Error calling train-sasha:", error);
        toast.error("Failed to get response. Please try again.");
        setMessages(updatedMessages);
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        setMessages(updatedMessages);
        return;
      }

      const aiResponse = {
        role: "assistant",
        content: data.message || "I'm sorry, I couldn't process that. Please try again.",
      };

      setMessages([...updatedMessages, aiResponse]);

      // Show toast if insights were saved
      if (data.insightsSaved > 0) {
        toast.success(`💡 ${data.insightsSaved} training insight${data.insightsSaved > 1 ? 's' : ''} saved!`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Something went wrong. Please try again.");
      setMessages(updatedMessages);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <Navigation />
      <WaveBackground />

      <div className="flex-1 container mx-auto px-4 py-8 flex flex-col relative z-10">
        <Card className="flex-1 flex flex-col shadow-float">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/admin")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <CardTitle className="font-fredoka text-ocean-deep">
                  Train Sasha
                  <span className="block text-base text-ocean-wave font-quicksand font-normal mt-1">
                    Teaching your AI assistant about your baking world
                  </span>
                </CardTitle>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Chat naturally - Sasha will automatically extract and save training insights
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
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <form onSubmit={handleSendMessage} className="flex gap-2 mt-4">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share what's on your mind..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="gradient-ocean text-primary-foreground shadow-wave transition-bounce hover:scale-105"
                disabled={!message.trim() || isLoading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainSasha;
