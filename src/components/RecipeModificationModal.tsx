import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, StopCircle, Trash2, Edit2, Plus, Save, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface RecipeModificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: string;
  userId: string;
}

type Step = "input" | "recording" | "review";

export const RecipeModificationModal = ({ open, onOpenChange, userRole, userId }: RecipeModificationModalProps) => {
  const [step, setStep] = useState<Step>("input");
  const [baseRecipeLink, setBaseRecipeLink] = useState("");
  const [baseRecipeName, setBaseRecipeName] = useState("");
  const [modifications, setModifications] = useState<string[]>([]);
  const [currentTranscription, setCurrentTranscription] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setRecordingTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      toast.success("🎙️ Recording started");
    } catch (error) {
      console.error('Recording error:', error);
      toast.error("Microphone access denied");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info("Processing transcription...");
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
          setCurrentTranscription(data.text);
          toast.success("✅ Transcription complete! Review and add.");
        } else {
          throw new Error('No transcription text received');
        }
      };
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error("Transcription failed. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleAddModification = () => {
    if (currentTranscription.trim()) {
      setModifications([...modifications, currentTranscription.trim()]);
      setCurrentTranscription("");
      toast.success("✅ Modification added!");
    }
  };

  const handleEditModification = (index: number) => {
    setEditingIndex(index);
    setEditText(modifications[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editText.trim()) {
      const updated = [...modifications];
      updated[editingIndex] = editText.trim();
      setModifications(updated);
      setEditingIndex(null);
      setEditText("");
      toast.success("✅ Modification updated!");
    }
  };

  const handleDeleteModification = (index: number) => {
    setModifications(modifications.filter((_, i) => i !== index));
    toast.info("Modification removed");
  };

  const handleStartModifying = () => {
    if (!baseRecipeLink.trim()) {
      toast.error("Please enter a base recipe link");
      return;
    }
    setStep("recording");
  };

  const handleSave = async (destination: "training" | "bakebook") => {
    if (!baseRecipeLink || modifications.length === 0) {
      toast.error("Need base recipe link and at least one modification");
      return;
    }

    const formattedContent = `Base Recipe: ${baseRecipeLink}
Recipe Name: ${baseRecipeName || "Untitled Modified Recipe"}

Modifications:
${modifications.map((mod, i) => `${i + 1}. ${mod}`).join('\n\n')}`;

    try {
      if (destination === "training" && userRole === "admin") {
        const { error } = await supabase.from('sasha_training_notes').insert({
          author_id: userId,
          category: 'recipe_modification',
          content: formattedContent,
          source_url: baseRecipeLink
        });
        
        if (error) throw error;
        toast.success("💾 Saved to Sasha's training notes!");
      } else {
        // Find or create user's bakebook
        const { data: bakebook } = await supabase
          .from('user_bakebooks')
          .select('id')
          .eq('user_id', userId)
          .single();

        let bakebookId = bakebook?.id;
        
        if (!bakebookId) {
          const { data: newBakebook, error: createError } = await supabase
            .from('user_bakebooks')
            .insert({ user_id: userId })
            .select('id')
            .single();
          
          if (createError) throw createError;
          bakebookId = newBakebook.id;
        }

        // Create a temporary recipe entry in recipes table
        const { data: recipe, error: recipeError } = await supabase
          .from('recipes')
          .insert({
            title: baseRecipeName || "Modified Recipe",
            description: `Modified from: ${baseRecipeLink}`,
            instructions: formattedContent,
            is_public: false,
            user_id: userId
          })
          .select('id')
          .single();

        if (recipeError) throw recipeError;

        // Add to bakebook
        const { error: entryError } = await supabase
          .from('bakebook_entries')
          .insert({
            bakebook_id: bakebookId,
            recipe_id: recipe.id,
            notes: formattedContent,
            folder: 'Modified Recipes'
          });

        if (entryError) throw entryError;
        toast.success("💾 Saved to your BakeBook!");
      }

      // Reset and close
      handleReset();
      onOpenChange(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error("Failed to save. Please try again.");
    }
  };

  const handleReset = () => {
    setStep("input");
    setBaseRecipeLink("");
    setBaseRecipeName("");
    setModifications([]);
    setCurrentTranscription("");
    setEditingIndex(null);
    setEditText("");
  };

  const handleClose = () => {
    if (modifications.length > 0) {
      if (confirm("You have unsaved modifications. Are you sure you want to close?")) {
        handleReset();
        onOpenChange(false);
      }
    } else {
      handleReset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "input" ? "Start Recipe Modification" : "Modify Recipe"}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Input base recipe info */}
        {step === "input" && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipe-link">Base Recipe Link *</Label>
              <Input
                id="recipe-link"
                type="url"
                placeholder="https://example.com/recipe"
                value={baseRecipeLink}
                onChange={(e) => setBaseRecipeLink(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="recipe-name">Recipe Name (Optional)</Label>
              <Input
                id="recipe-name"
                type="text"
                placeholder="e.g., FunFetti with Applesauce"
                value={baseRecipeName}
                onChange={(e) => setBaseRecipeName(e.target.value)}
              />
            </div>
            <Button onClick={handleStartModifying} className="w-full">
              Start Modifying →
            </Button>
          </div>
        )}

        {/* Step 2 & 3: Recording and accumulating modifications */}
        {step === "recording" && (
          <div className="space-y-4">
            {/* Header with base recipe info */}
            <div className="p-3 bg-ocean-foam rounded-lg border border-ocean-wave">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ocean-deep">
                    {baseRecipeName || "Recipe Modification"}
                  </p>
                  <a 
                    href={baseRecipeLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-ocean-wave hover:underline flex items-center gap-1"
                  >
                    {baseRecipeLink.substring(0, 50)}... <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Recording interface */}
            <div className="flex flex-col items-center gap-3 p-4 border-2 border-dashed border-ocean-wave rounded-lg">
              {!isRecording && !currentTranscription && (
                <Button
                  size="lg"
                  onClick={handleStartRecording}
                  disabled={isTranscribing}
                  className="gap-2"
                >
                  <Mic className="w-5 h-5" />
                  Start Recording
                </Button>
              )}

              {isRecording && (
                <div className="flex flex-col items-center gap-3">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-red-500 animate-pulse">
                      🔴 Recording...
                    </p>
                    <p className="text-2xl font-mono">{formatTime(recordingTime)}</p>
                  </div>
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={handleStopRecording}
                    className="gap-2"
                  >
                    <StopCircle className="w-5 h-5" />
                    Stop & Transcribe
                  </Button>
                </div>
              )}

              {isTranscribing && (
                <p className="text-center text-muted-foreground">
                  Processing transcription...
                </p>
              )}

              {currentTranscription && !isRecording && (
                <div className="w-full space-y-3">
                  <Label>Transcription Complete:</Label>
                  <Textarea
                    value={currentTranscription}
                    onChange={(e) => setCurrentTranscription(e.target.value)}
                    rows={4}
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleAddModification} className="flex-1 gap-2">
                      <Plus className="w-4 h-4" />
                      Add This
                    </Button>
                    <Button variant="outline" onClick={() => setCurrentTranscription("")}>
                      Clear
                    </Button>
                    <Button variant="outline" onClick={handleStartRecording}>
                      Re-record
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* List of modifications */}
            {modifications.length > 0 && (
              <div className="space-y-2">
                <Label>Your Modifications ({modifications.length}):</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {modifications.map((mod, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg border">
                      {editingIndex === index ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveEdit}>
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingIndex(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm flex-1">
                            <span className="font-semibold">#{index + 1}:</span> {mod}
                          </p>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditModification(index)}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteModification(index)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-4 border-t">
              {!isRecording && !currentTranscription && modifications.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleStartRecording}
                  className="flex-1 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Record Another
                </Button>
              )}
              
              {modifications.length > 0 && (
                <>
                  {userRole === "admin" && (
                    <Button
                      onClick={() => handleSave("training")}
                      className="flex-1 gap-2 bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      <Save className="w-4 h-4" />
                      Save to Training
                    </Button>
                  )}
                  <Button
                    onClick={() => handleSave("bakebook")}
                    className="flex-1 gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save to BakeBook
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
