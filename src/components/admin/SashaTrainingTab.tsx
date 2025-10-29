import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Sparkles, Plus, Edit2, Trash2, MessageSquare, Book } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TrainingNote {
  id: string;
  category: string;
  content: string;
  source_url: string | null;
  created_at: string;
  updated_at: string;
}

const categoryColors: Record<string, string> = {
  style: 'bg-purple-100 text-purple-800',
  fact: 'bg-blue-100 text-blue-800',
  do: 'bg-green-100 text-green-800',
  dont: 'bg-red-100 text-red-800',
  story: 'bg-amber-100 text-amber-800',
};

const categoryLabels: Record<string, string> = {
  style: 'Voice & Style',
  fact: 'Baking Fact',
  do: 'Do This',
  dont: "Don't Do This",
  story: 'Story / Anecdote',
};

export const SashaTrainingTab = () => {
  const [notes, setNotes] = useState<TrainingNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingNote, setEditingNote] = useState<TrainingNote | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [category, setCategory] = useState<string>("style");
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from("sasha_training_notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching training notes:", error);
      toast.error("Failed to load training notes");
      return;
    }

    setNotes(data || []);
  };

  const handleSaveNote = async () => {
    if (!content.trim()) {
      toast.error("Please enter content for the training note");
      return;
    }

    setLoading(true);

    const noteData = {
      category,
      content: content.trim(),
      source_url: sourceUrl.trim() || null,
    };

    if (editingNote) {
      const { error } = await supabase
        .from("sasha_training_notes")
        .update(noteData)
        .eq("id", editingNote.id);

      if (error) {
        toast.error("Failed to update note");
        console.error(error);
      } else {
        toast.success("Training note updated!");
        clearForm();
        fetchNotes();
      }
    } else {
      const { error } = await supabase
        .from("sasha_training_notes")
        .insert(noteData);

      if (error) {
        toast.error("Failed to save note");
        console.error(error);
      } else {
        toast.success("Training note added!");
        clearForm();
        fetchNotes();
      }
    }

    setLoading(false);
    setIsDialogOpen(false);
  };

  const handleEditNote = (note: TrainingNote) => {
    setEditingNote(note);
    setCategory(note.category);
    setContent(note.content);
    setSourceUrl(note.source_url || "");
    setIsDialogOpen(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Delete this training note?")) return;

    const { error } = await supabase
      .from("sasha_training_notes")
      .delete()
      .eq("id", noteId);

    if (error) {
      toast.error("Failed to delete note");
      console.error(error);
      return;
    }

    toast.success("Training note deleted!");
    fetchNotes();
  };

  const clearForm = () => {
    setEditingNote(null);
    setCategory("style");
    setContent("");
    setSourceUrl("");
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      clearForm();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <CardTitle>Sasha Training Mode</CardTitle>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button className="bg-purple-500 hover:bg-purple-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Training Note
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingNote ? "Edit Training Note" : "Add Training Note"}
                  </DialogTitle>
                  <DialogDescription>
                    Train Sasha with your voice, facts, and stories. These notes shape how Sasha responds to users.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="style">Voice & Style</SelectItem>
                        <SelectItem value="fact">Baking Fact</SelectItem>
                        <SelectItem value="do">Do This</SelectItem>
                        <SelectItem value="dont">Don't Do This</SelectItem>
                        <SelectItem value="story">Story / Anecdote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Content *</Label>
                    <Textarea
                      placeholder="E.g., 'Always mention that Brandia never uses box mixes or fondant' or 'When someone asks about substitutions, remind them most recipes can be made gluten-free'"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Source URL (Optional)</Label>
                    <Input
                      placeholder="https://example.com/reference"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => handleDialogClose(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveNote}
                      disabled={loading}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      {loading ? "Saving..." : editingNote ? "Update Note" : "Add Note"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>
            Teach Sasha your baking philosophy, voice, and key facts. Admin-only mode to refine how Sasha interacts with users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/chat', '_blank')}
              className="border-purple-500 text-purple-700 hover:bg-purple-50"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Preview in Chat
            </Button>
            <div className="flex-1" />
            <Badge variant="outline" className="border-purple-500 text-purple-700">
              <Book className="mr-1 h-3 w-3" />
              {notes.length} training notes
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Training Notes ({notes.length})</CardTitle>
          <CardDescription>
            These notes are injected into Sasha's system prompt to guide responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Book className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No training notes yet</p>
              <p className="text-sm">Add your first note to start shaping Sasha's personality</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <Badge className={categoryColors[note.category]}>
                        {categoryLabels[note.category]}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditNote(note)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm mb-2">{note.content}</p>
                    {note.source_url && (
                      <a
                        href={note.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        🔗 Source
                      </a>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(note.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card className="border-dashed border-purple-200 bg-purple-50/50">
        <CardHeader>
          <CardTitle className="text-base">💡 Training Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>
            <strong>Voice & Style:</strong> Define Brandia's personality, tone, and how Sasha should respond
          </p>
          <p>
            <strong>Baking Facts:</strong> Add specific techniques, ingredient knowledge, or baking science
          </p>
          <p>
            <strong>Do / Don't:</strong> Guide Sasha on what to recommend or avoid
          </p>
          <p>
            <strong>Stories:</strong> Share Brandia's personal anecdotes or baking philosophy
          </p>
          <p className="pt-2 text-xs">
            ✨ All notes are active immediately and shape Sasha's responses globally
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
