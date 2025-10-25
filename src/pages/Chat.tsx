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
import { Send, Upload, Link as LinkIcon, Mic, X } from "lucide-react";

const Chat = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string | Array<any>; image?: string }>>([
    {
      role: "assistant",
      content: "Hey sugar, let's bake something alive—what's the vibe today? 🌊✨",
    },
  ]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // TEMPORARILY DISABLED FOR TESTING
  // useEffect(() => {
  //   // Check authentication
  //   supabase.auth.getSession().then(({ data: { session } }) => {
  //     if (!session) {
  //       navigate("/auth");
  //     } else {
  //       setUser(session.user);
  //     }
  //   });

  //   const {
  //     data: { subscription },
  //   } = supabase.auth.onAuthStateChange((event, session) => {
  //     if (event === "SIGNED_OUT") {
  //       navigate("/auth");
  //     }
  //     setUser(session?.user ?? null);
  //   });

  //   return () => subscription.unsubscribe();
  // }, [navigate]);

  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        toast.success("Photo uploaded! Add your message and send.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceRecording = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await transcribeAudio(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        toast.info("Recording... Click again to stop.");
      } catch (error) {
        console.error("Error accessing microphone:", error);
        toast.error("Could not access microphone. Please check permissions.");
      }
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
          body: { audio: base64Audio },
        });

        if (error) throw error;

        if (data?.text) {
          setMessage((prev) => prev + (prev ? ' ' : '') + data.text);
          toast.success("Voice transcribed!");
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error("Transcription error:", error);
      toast.error("Failed to transcribe audio. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !uploadedImage) return;

    // Build the user message with text and/or image
    const userMessage: { role: string; content: string | Array<any>; image?: string } = {
      role: "user",
      content: message,
    };

    // If there's an image, format it for the AI (multimodal)
    let apiMessages = [...messages];
    
    if (uploadedImage) {
      userMessage.image = uploadedImage;
      // Format for AI: array with text and image_url
      const contentArray: Array<any> = [];
      if (message.trim()) {
        contentArray.push({ type: "text", text: message });
      }
      contentArray.push({
        type: "image_url",
        image_url: { url: uploadedImage }
      });
      
      apiMessages.push({
        role: "user",
        content: contentArray
      });
    } else {
      apiMessages.push({
        role: "user",
        content: message
      });
    }

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setUploadedImage(null);

    // Add a loading message
    const loadingMessage = { role: "assistant", content: "..." };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-sasha', {
        body: { messages: apiMessages },
      });

      if (error) {
        console.error("Error calling Sasha:", error);
        toast.error("Failed to get response from Sasha. Please try again.");
        // Remove loading message
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      // Replace loading message with actual response
      const aiResponse = {
        role: "assistant",
        content: data.message || "I'm sorry, I couldn't process that. Please try again.",
      };
      
      setMessages((prev) => [...prev.slice(0, -1), aiResponse]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Something went wrong. Please try again.");
      setMessages((prev) => prev.slice(0, -1));
    }
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
                      {msg.image && (
                        <img 
                          src={msg.image} 
                          alt="Uploaded" 
                          className="rounded-lg mb-2 max-w-full h-auto"
                        />
                      )}
                      <p className="text-sm whitespace-pre-wrap">
                        {typeof msg.content === 'string' ? msg.content : 
                         Array.isArray(msg.content) ? 
                           msg.content.find(c => c.type === 'text')?.text || '' : 
                           ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="mt-4 space-y-4">
              {uploadedImage && (
                <div className="relative inline-block">
                  <img 
                    src={uploadedImage} 
                    alt="Preview" 
                    className="rounded-lg max-h-32 border-2 border-ocean-wave"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => setUploadedImage(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              <div className="flex gap-2 justify-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={handlePhotoUpload}
                >
                  <Upload className="w-4 h-4" />
                  Photo
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Recipe Link
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`gap-2 ${isRecording ? 'bg-red-500 text-white hover:bg-red-600' : ''}`}
                  onClick={handleVoiceRecording}
                  disabled={isTranscribing}
                >
                  <Mic className="w-4 h-4" />
                  {isRecording ? 'Stop' : isTranscribing ? 'Processing...' : 'Voice'}
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
                  disabled={!message.trim() && !uploadedImage}
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
