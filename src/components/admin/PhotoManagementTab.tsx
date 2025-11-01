import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, MoveRight, Image as ImageIcon, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type StorageBucket = "recipe-photos" | "profile-photos" | "product-photos";

interface FileItem {
  name: string;
  bucket: StorageBucket;
  url: string;
  created_at: string;
  size?: number;
}

export const PhotoManagementTab = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<StorageBucket | "all">("all");
  const [movingFile, setMovingFile] = useState<string | null>(null);

  const buckets: StorageBucket[] = ["recipe-photos", "profile-photos", "product-photos"];

  useEffect(() => {
    fetchAllPhotos();
  }, []);

  const fetchAllPhotos = async () => {
    setLoading(true);
    const allFiles: FileItem[] = [];

    for (const bucket of buckets) {
      const { data, error } = await supabase.storage.from(bucket).list();

      if (error) {
        console.error(`Error fetching ${bucket}:`, error);
        continue;
      }

      if (data) {
        const filesWithUrls = data
          .filter(file => file.name !== '.emptyFolderPlaceholder')
          .map(file => {
            const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(file.name);
            return {
              name: file.name,
              bucket,
              url: urlData.publicUrl,
              created_at: file.created_at || "",
              size: file.metadata?.size,
            };
          });
        allFiles.push(...filesWithUrls);
      }
    }

    // Sort by creation date, newest first
    allFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setFiles(allFiles);
    setLoading(false);
  };

  const movePhoto = async (file: FileItem, targetBucket: StorageBucket) => {
    if (file.bucket === targetBucket) {
      toast.error("Photo is already in that bucket");
      return;
    }

    setMovingFile(file.name);
    toast.info("Moving photo...");

    try {
      // Download from source bucket
      const { data: downloadData, error: downloadError } = await supabase.storage
        .from(file.bucket)
        .download(file.name);

      if (downloadError) throw downloadError;

      // Upload to target bucket
      const { error: uploadError } = await supabase.storage
        .from(targetBucket)
        .upload(file.name, downloadData, {
          contentType: downloadData.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Delete from source bucket
      const { error: deleteError } = await supabase.storage
        .from(file.bucket)
        .remove([file.name]);

      if (deleteError) throw deleteError;

      toast.success(`Moved to ${targetBucket}!`);
      fetchAllPhotos();
    } catch (error) {
      console.error("Error moving photo:", error);
      toast.error("Failed to move photo");
    } finally {
      setMovingFile(null);
    }
  };

  const deletePhoto = async (file: FileItem) => {
    if (!confirm(`Delete ${file.name}?`)) return;

    const { error } = await supabase.storage.from(file.bucket).remove([file.name]);

    if (error) {
      toast.error("Failed to delete photo");
      console.error(error);
      return;
    }

    toast.success("Photo deleted!");
    fetchAllPhotos();
  };

  const filteredFiles = selectedBucket === "all" 
    ? files 
    : files.filter(f => f.bucket === selectedBucket);

  const getBucketColor = (bucket: StorageBucket) => {
    switch (bucket) {
      case "recipe-photos": return "default";
      case "profile-photos": return "secondary";
      case "product-photos": return "outline";
    }
  };

  const formatBucketName = (bucket: StorageBucket) => {
    return bucket.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Photo Management</h3>
          <p className="text-sm text-muted-foreground">
            Move photos between buckets or delete them
          </p>
        </div>
        <Button variant="outline" onClick={fetchAllPhotos} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Alert>
        <AlertDescription>
          <strong>Bucket Guide:</strong> Recipe Photos = recipe images | Profile Photos = user avatars | Product Photos = tool/product images
        </AlertDescription>
      </Alert>

      <div className="flex gap-2">
        <Select value={selectedBucket} onValueChange={(v) => setSelectedBucket(v as StorageBucket | "all")}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Buckets ({files.length})</SelectItem>
            {buckets.map(bucket => {
              const count = files.filter(f => f.bucket === bucket).length;
              return (
                <SelectItem key={bucket} value={bucket}>
                  {formatBucketName(bucket)} ({count})
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFiles.map((file) => (
          <Card key={`${file.bucket}-${file.name}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm truncate">{file.name}</CardTitle>
                  <Badge variant={getBucketColor(file.bucket)} className="mt-1">
                    {formatBucketName(file.bucket)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                {file.url ? (
                  <img 
                    src={file.url} 
                    alt={file.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<div class="text-muted-foreground"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>';
                    }}
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex gap-1">
                  <Select
                    disabled={movingFile === file.name}
                    onValueChange={(bucket) => movePhoto(file, bucket as StorageBucket)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Move to..." />
                    </SelectTrigger>
                    <SelectContent>
                      {buckets
                        .filter(b => b !== file.bucket)
                        .map(bucket => (
                          <SelectItem key={bucket} value={bucket}>
                            <div className="flex items-center gap-2">
                              <MoveRight className="w-4 h-4" />
                              {formatBucketName(bucket)}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deletePhoto(file)}
                    disabled={movingFile === file.name}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFiles.length === 0 && !loading && (
        <div className="text-center py-12 text-muted-foreground">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No photos found{selectedBucket !== "all" ? ` in ${formatBucketName(selectedBucket as StorageBucket)}` : ""}</p>
        </div>
      )}
    </div>
  );
};
