import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export const VoiceRecorder = ({ onTranscription, disabled }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error("Failed to access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
          body: { audio: base64Audio }
        });

        if (error) throw error;
        
        if (data?.text) {
          onTranscription(data.text);
        } else {
          toast.error("No transcription received");
        }
      };
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error("Failed to transcribe audio");
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <Button
      type="button"
      size="icon"
      variant={isRecording ? "destructive" : "outline"}
      onClick={isRecording ? stopRecording : startRecording}
      disabled={disabled || isTranscribing}
      className="transition-all"
    >
      {isTranscribing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isRecording ? (
        <MicOff className="w-4 h-4" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </Button>
  );
};

interface VoicePlaybackProps {
  text: string;
  voice?: string;
  speed?: number;
  onSpeedChange?: (speed: number) => void;
}

export const VoicePlayback = ({ 
  text, 
  voice = "nova", 
  speed = 1.0,
  onSpeedChange 
}: VoicePlaybackProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speedOptions = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  // Cleanup audio on unmount or when navigating away
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  const playAudio = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    setIsPlaying(true);
    toast.info("🔊 Generating audio...");
    
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice }
      });

      if (error) throw error;

      if (data?.audioContent) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        // Apply playback speed
        audio.playbackRate = speed;
        
        audio.onloadeddata = () => {
          // Start playing immediately when audio is ready
          audio.play().catch(err => {
            console.error('Playback error:', err);
            toast.error("Error playing audio");
            setIsPlaying(false);
          });
        };
        
        audio.onended = () => {
          setIsPlaying(false);
          audioRef.current = null;
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = () => {
          setIsPlaying(false);
          audioRef.current = null;
          URL.revokeObjectURL(audioUrl);
          toast.error("Error playing audio");
        };
      }
    } catch (error) {
      console.error('TTS error:', error);
      toast.error("Failed to generate speech");
      setIsPlaying(false);
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    // Update current audio if playing
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
    // Notify parent to save preference
    onSpeedChange?.(newSpeed);
    setShowSpeedMenu(false);
    toast.success(`Speed set to ${newSpeed}x`);
  };

  return (
    <div className="flex items-center gap-1 relative">
      <Button
        variant={isPlaying ? "destructive" : "ghost"}
        size="icon"
        onClick={playAudio}
        disabled={!text}
        className="h-8 w-8"
        title={isPlaying ? "Stop speaking" : "Listen to response"}
      >
        {isPlaying ? (
          <X className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </Button>
      
      {onSpeedChange && (
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="h-8 px-2 text-xs"
            title="Playback speed"
          >
            {speed}x
          </Button>
          
          {showSpeedMenu && (
            <div className="absolute top-full left-0 mt-1 bg-popover border rounded-md shadow-lg z-50 min-w-[80px]">
              {speedOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`w-full px-3 py-2 text-sm text-left hover:bg-accent ${
                    s === speed ? 'bg-accent font-semibold' : ''
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
