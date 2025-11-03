import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, Loader2 } from "lucide-react";
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
}

export const VoicePlayback = ({ text, voice = "nova" }: VoicePlaybackProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
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
        
        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
      }
    } catch (error) {
      console.error('Playback error:', error);
      toast.error("Failed to play audio");
      setIsPlaying(false);
    }
  };

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      onClick={playAudio}
      className="ml-2"
    >
      {isPlaying ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
    </Button>
  );
};
