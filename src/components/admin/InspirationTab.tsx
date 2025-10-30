import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { Loader2, ExternalLink, Check, X, ChevronDown, Sparkles } from "lucide-react";

interface InspirationSource {
  id: string;
  title: string;
  url: string;
  content_type: string;
  admin_notes: string;
  approved: boolean;
  created_at: string;
}

interface Bullet {
  id: string;
  source_id: string;
  tier: 'top' | 'supporting' | 'deep';
  text: string;
  tags: string[];
  is_approved: boolean;
}

export const InspirationTab = () => {
  const [sources, setSources] = useState<InspirationSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<InspirationSource | null>(null);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [contentType, setContentType] = useState("blog");
  const [pastedText, setPastedText] = useState("");

  useEffect(() => {
    fetchSources();
  }, []);

  useEffect(() => {
    if (selectedSource) {
      fetchBullets(selectedSource.id);
    }
  }, [selectedSource]);

  const fetchSources = async () => {
    const { data, error } = await supabase
      .from('inspiration_sources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load sources');
      return;
    }
    setSources(data || []);
  };

  const fetchBullets = async (sourceId: string) => {
    const { data, error } = await supabase
      .from('inspiration_bullets')
      .select('*')
      .eq('source_id', sourceId)
      .order('tier', { ascending: true });

    if (error) {
      toast.error('Failed to load takeaways');
      return;
    }
    setBullets((data || []) as Bullet[]);
  };

  const analyzeSource = async () => {
    if (!url && !pastedText) {
      toast.error('Please provide a URL or paste text');
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-inspiration', {
        body: {
          url: url || null,
          title: title || null,
          content_type: contentType,
          pasted_text: pastedText || null
        }
      });

      if (error) throw error;

      toast.success(`Analysis complete! Found ${data.bullets_count} takeaways`);
      fetchSources();
      
      // Clear form
      setTitle("");
      setUrl("");
      setPastedText("");
      
      // Select the newly created source
      if (data.source) {
        setSelectedSource(data.source);
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error(error.message || 'Failed to analyze content');
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleBulletApproval = async (bullet: Bullet) => {
    const { error } = await supabase
      .from('inspiration_bullets')
      .update({ is_approved: !bullet.is_approved })
      .eq('id', bullet.id);

    if (error) {
      toast.error('Failed to update approval');
      return;
    }

    setBullets(bullets.map(b => 
      b.id === bullet.id ? { ...b, is_approved: !b.is_approved } : b
    ));
  };

  const approveAllInTier = async (tier: string) => {
    const tierBullets = bullets.filter(b => b.tier === tier);
    const { error } = await supabase
      .from('inspiration_bullets')
      .update({ is_approved: true })
      .in('id', tierBullets.map(b => b.id));

    if (error) {
      toast.error('Failed to approve all');
      return;
    }

    toast.success(`Approved all ${tier} takeaways`);
    fetchBullets(selectedSource!.id);
  };

  const publishSource = async () => {
    if (!selectedSource) return;

    const { error } = await supabase
      .from('inspiration_sources')
      .update({ approved: true })
      .eq('id', selectedSource.id);

    if (error) {
      toast.error('Failed to publish');
      return;
    }

    toast.success('Source published to Sasha!');
    fetchSources();
    setSelectedSource({ ...selectedSource, approved: true });
  };

  const updateBulletText = async (bulletId: string, newText: string) => {
    const { error } = await supabase
      .from('inspiration_bullets')
      .update({ text: newText })
      .eq('id', bulletId);

    if (error) {
      toast.error('Failed to update');
      return;
    }

    setBullets(bullets.map(b => 
      b.id === bulletId ? { ...b, text: newText } : b
    ));
  };

  const renderBulletsByTier = (tier: 'top' | 'supporting' | 'deep') => {
    const tierBullets = bullets.filter(b => b.tier === tier);
    const approvedCount = tierBullets.filter(b => b.is_approved).length;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium">
            {tier.charAt(0).toUpperCase() + tier.slice(1)} ({approvedCount}/{tierBullets.length})
          </h4>
          {tierBullets.length > 0 && approvedCount < tierBullets.length && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => approveAllInTier(tier)}
            >
              Approve All
            </Button>
          )}
        </div>

        {tierBullets.map(bullet => (
          <Card key={bullet.id} className={bullet.is_approved ? 'border-green-500' : ''}>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={bullet.is_approved ? "default" : "outline"}
                  onClick={() => toggleBulletApproval(bullet)}
                  className="shrink-0"
                >
                  {bullet.is_approved ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </Button>
                
                <div className="flex-1">
                  <Textarea
                    value={bullet.text}
                    onChange={(e) => updateBulletText(bullet.id, e.target.value)}
                    className="min-h-[60px] mb-2"
                  />
                  <div className="flex gap-1 flex-wrap">
                    {bullet.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Add Source Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Content I Love
          </CardTitle>
          <CardDescription>
            Paste a link to a blog, book landing page, or video you love. I'll summarize the teachable principles for your review.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Title (optional)</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Sally's Baking Tips"
              />
            </div>
            
            <div>
              <Label>Content Type</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="book">Book</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="podcast">Podcast</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>URL</Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label>Or Paste Text (if URL doesn't work)</Label>
            <Textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste article or transcript here..."
              className="min-h-[100px]"
            />
          </div>

          <Button 
            onClick={analyzeSource} 
            disabled={analyzing}
            className="w-full"
          >
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze & Extract Principles'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Sources List */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sources ({sources.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sources.map(source => (
              <Card
                key={source.id}
                className={`cursor-pointer transition-colors ${
                  selectedSource?.id === source.id ? 'border-primary' : ''
                }`}
                onClick={() => setSelectedSource(source)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium">{source.title}</h4>
                      <p className="text-xs text-muted-foreground">{source.content_type}</p>
                    </div>
                    {source.approved && (
                      <Badge variant="default" className="shrink-0">Published</Badge>
                    )}
                  </div>
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary flex items-center gap-1 mt-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open original
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}

            {sources.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No sources yet. Add one above!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Review Panel */}
        {selectedSource && (
          <Card>
            <CardHeader>
              <CardTitle>{selectedSource.title}</CardTitle>
              <CardDescription>Review and approve takeaways</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="multiple" defaultValue={["top"]} className="w-full">
                <AccordionItem value="top">
                  <AccordionTrigger>Top Takeaways</AccordionTrigger>
                  <AccordionContent>
                    {renderBulletsByTier('top')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="supporting">
                  <AccordionTrigger>Supporting Tips</AccordionTrigger>
                  <AccordionContent>
                    {renderBulletsByTier('supporting')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="deep">
                  <AccordionTrigger>Deep Techniques</AccordionTrigger>
                  <AccordionContent>
                    {renderBulletsByTier('deep')}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {!selectedSource.approved && (
                <Button 
                  onClick={publishSource}
                  className="w-full"
                  size="lg"
                >
                  Publish to Sasha
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};