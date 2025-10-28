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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Chat = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string | Array<any>; image?: string }>>([
    {
      role: "assistant",
      content: "Hey, it's so good to see you! Thanks for coming by!! 💕\n\nI'm Sasha, Brandia's AI baking assistant, and I'm here to help you bake anything you can dream of! Right now, I'm completely FREE to use while we're in beta.\n\nIn the future, we'll be introducing a flexible tip-based model or subscription options to keep me running and learning more baking magic. But for now, let's just have fun baking together!\n\nWhat are we going to create today? 🎂✨",
    },
  ]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceReply, setVoiceReply] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

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
      console.log("Stopping recording...");
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      setRecordingTime(0);
    } else {
      // Start recording
      try {
        console.log("Requesting microphone access...");
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("Microphone access granted");
        
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          console.log("Audio data received:", event.data.size, "bytes");
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          console.log("Recording stopped, starting transcription...");
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          console.log("Audio blob size:", audioBlob.size, "bytes");
          await transcribeAudio(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);
        
        // Start timer
        recordingTimerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        
        // Auto-stop after 30 seconds
        setTimeout(() => {
          if (mediaRecorderRef.current?.state === 'recording') {
            console.log("Auto-stopping recording after 30 seconds");
            handleVoiceRecording();
          }
        }, 30000);
        
        toast.success("🎤 Recording started! Click Stop when done.", { duration: 3000 });
        console.log("Recording started successfully");
      } catch (error) {
        console.error("Error accessing microphone:", error);
        toast.error("Could not access microphone. Please check permissions.");
      }
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    toast.info("✨ Transcribing your voice...");
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        console.log("Base64 audio length:", base64Audio.length);
        
        console.log("Calling transcribe-audio function...");
        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
          body: { audio: base64Audio },
        });

        console.log("Transcription response:", data, error);

        if (error) {
          console.error("Transcription error from Supabase:", error);
          throw error;
        }

        if (data?.text) {
          console.log("Transcribed text:", data.text);
          setMessage(data.text);
          toast.success("✅ Voice transcribed: " + data.text.substring(0, 50) + "...");
          await sendMessageWithContent(data.text);
        } else {
          toast.error("No text was transcribed. Please try speaking again.");
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

  const speak = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text }
      });
      if (error) {
        console.error('TTS error:', error);
        toast.error('Failed to play voice');
        return;
      }
      if (data?.audioContent) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        await audio.play();
      }
    } catch (err) {
      console.error('TTS exception:', err);
    }
  };

  const sendMessageWithContent = async (content: string) => {
    if (!content.trim() && !uploadedImage) return;

    const userMessage: { role: string; content: string | Array<any>; image?: string } = {
      role: 'user',
      content: content,
    };

    let apiMessages = [...messages];

    if (uploadedImage) {
      userMessage.image = uploadedImage;
      const contentArray: Array<any> = [];
      if (content.trim()) {
        contentArray.push({ type: 'text', text: content });
      }
      contentArray.push({ type: 'image_url', image_url: { url: uploadedImage } });
      apiMessages.push({ role: 'user', content: contentArray });
    } else {
      apiMessages.push({ role: 'user', content: content });
    }

    setMessages((prev) => [...prev, userMessage, { role: 'assistant', content: '...' }]);
    setMessage('');
    setUploadedImage(null);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-sasha', {
        body: { messages: apiMessages },
      });
      if (error) {
        console.error('Error calling Sasha:', error);
        toast.error('Failed to get response from Sasha. Please try again.');
        setMessages((prev) => prev.slice(0, -1));
        return;
      }
      if (data?.error) {
        toast.error(data.error);
        setMessages((prev) => prev.slice(0, -1));
        return;
      }
      const aiResponse = {
        role: 'assistant',
        content: data.message || "I'm sorry, I couldn't process that. Please try again.",
      };
      setMessages((prev) => [...prev.slice(0, -1), aiResponse]);

      if (voiceReply && typeof aiResponse.content === 'string') {
        speak(aiResponse.content);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Something went wrong. Please try again.');
      setMessages((prev) => prev.slice(0, -1));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessageWithContent(message);
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
              
              <div className="flex flex-col items-center gap-2">
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
                    className={`gap-2 ${isRecording ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse' : ''}`}
                    onClick={handleVoiceRecording}
                    disabled={isTranscribing}
                  >
                    <Mic className="w-4 h-4" />
                    {isRecording ? `🔴 Stop (${recordingTime}s)` : isTranscribing ? '⏳ Processing...' : '🎤 Voice'}
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Switch id="voice-reply" checked={voiceReply} onCheckedChange={setVoiceReply} />
                  <Label htmlFor="voice-reply">Voice reply</Label>
                </div>
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
