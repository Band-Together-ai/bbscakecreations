import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { useTipJarSession } from "@/hooks/useTipJarSession";
import { TipJarExtension } from "@/components/TipJarExtension";
import { useChatSessionTracking } from "@/hooks/useChatSessionTracking";
import { VoiceSettings } from "@/components/VoiceSettings";
import { useUserRole } from "@/hooks/useUserRole";

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string | Array<any>; image?: string }>>([
    {
      role: "assistant",
      content: "Hey, it's so good to see you! Thanks for coming by!! 💕\n\nI'm Sasha, Brandia's AI baking assistant. I'm completely FREE while we're in beta—in the future, we'll introduce a tip-based model or subscription to keep learning more baking magic.\n\nBut first, let me ask:",
    },
  ]);
  const [showQuickStart, setShowQuickStart] = useState(true);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceReply, setVoiceReply] = useState(true); // Default to enabled
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get user role
  const { role: userRole, userId } = useUserRole();

  // Get tip jar session info
  const { sessionId, remainingMinutes, isActive, refetch } = useTipJarSession(userId || null);

  // Track chat session
  useChatSessionTracking(userId || null, messages.length);
  
  // Fetch user profile with voice preferences
  const fetchUserProfile = async () => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('voice_preference, is_lifetime_patron, continuous_voice_enabled')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }
    
    setUserProfile(data);
  };
  
  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  // Handle initial message from navigation state
  useEffect(() => {
    const state = location.state as { initialMessage?: string };
    if (state?.initialMessage) {
      setShowQuickStart(false);
      // Delay sending to ensure component is fully mounted
      setTimeout(() => {
        sendMessageWithContent(state.initialMessage);
      }, 500);
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

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
      const selectedVoice = userProfile?.voice_preference || 'nova';
      console.log('🔊 Calling text-to-speech with voice:', selectedVoice, 'for:', text.substring(0, 50) + '...');
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice: selectedVoice }
      });
      
      if (error) {
        console.error('❌ TTS error:', error);
        toast.error('Voice playback failed: ' + error.message);
        return;
      }
      
      if (data?.error) {
        console.error('❌ TTS returned error:', data.error);
        toast.error('Voice generation failed: ' + data.error);
        return;
      }
      
      if (data?.audioContent) {
        console.log('✅ Playing audio, length:', data.audioContent.length);
        const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        audio.onloadeddata = () => console.log('🎵 Audio loaded successfully');
        audio.onerror = (e) => {
          console.error('❌ Audio playback error:', e);
          toast.error('Could not play audio');
        };
        await audio.play();
        toast.success('🔊 Playing voice response');
      } else {
        console.error('❌ No audio content in response');
        toast.error('No audio received from server');
      }
    } catch (err) {
      console.error('❌ TTS exception:', err);
      toast.error('Voice failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
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

  const handleQuickChoice = async (choice: 'tour' | 'baking') => {
    setShowQuickStart(false);
    
    if (choice === 'tour') {
      await sendMessageWithContent("Yes, please show me what this app can do and share some best practices!");
    } else {
      await sendMessageWithContent("I'm ready! Let's talk baking, tools, or your favorite fails!");
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
              <span className="block text-base text-ocean-wave font-quicksand font-normal mt-1">
                BB's AI Baking Companion
              </span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload photos • Paste recipe links • Use voice • Get Brandia's magic
            </p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {sessionId && (
                  <TipJarExtension
                    sessionId={sessionId}
                    remainingMinutes={remainingMinutes}
                    onExtensionComplete={refetch}
                  />
                )}
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
                      
                      {/* Quick choice buttons - only show on first message */}
                      {idx === 0 && showQuickStart && msg.role === 'assistant' && (
                        <div className="flex flex-col gap-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-white hover:bg-ocean-wave hover:text-white border-ocean-wave text-ocean-deep"
                            onClick={() => handleQuickChoice('tour')}
                          >
                            ✨ Show me what this app can do
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-white hover:bg-ocean-wave hover:text-white border-ocean-wave text-ocean-deep"
                            onClick={() => handleQuickChoice('baking')}
                          >
                            🎂 Let's talk baking!
                          </Button>
                        </div>
                      )}
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
              
              {/* Voice Settings for Premium Users */}
              {userId && userProfile && (
                <VoiceSettings
                  userRole={userRole}
                  isLifetimePatron={userProfile.is_lifetime_patron || false}
                  voicePreference={userProfile.voice_preference || 'nova'}
                  continuousVoiceEnabled={userProfile.continuous_voice_enabled || false}
                  userId={userId}
                  onUpdate={fetchUserProfile}
                />
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
