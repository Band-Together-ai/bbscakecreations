import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";

export const FavoriteBakersTab = () => {
  const [bakers, setBakers] = useState<any[]>([]);
  const [editingBaker, setEditingBaker] = useState<any | null>(null);
  
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState<number>(0);

  const imageFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBakers();
  }, []);

  const fetchBakers = async () => {
    const { data, error } = await supabase
      .from("favorite_bakers")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching bakers:", error);
      return;
    }

    setBakers(data || []);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `baker_${Date.now()}.${fileExt}`;

    toast.info("Uploading image...");

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, file);

    if (uploadError) {
      toast.error("Failed to upload image");
      console.error(uploadError);
      return;
    }

    const { data } = supabase.storage.from('profile-photos').getPublicUrl(fileName);
    setProfileImageUrl(data.publicUrl);
    toast.success("Image uploaded!");
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please fill in baker name");
      return;
    }

    const bakerData = {
      name,
      website_url: websiteUrl,
      instagram_handle: instagramHandle,
      category,
      description,
      profile_image_url: profileImageUrl,
      is_featured: isFeatured,
      display_order: displayOrder,
    };

    if (editingBaker) {
      const { error } = await supabase
        .from("favorite_bakers")
        .update(bakerData)
        .eq("id", editingBaker.id);

      if (error) {
        toast.error("Failed to update baker");
        console.error(error);
        return;
      }

      toast.success("Baker updated!");
    } else {
      const { error } = await supabase
        .from("favorite_bakers")
        .insert(bakerData);

      if (error) {
        toast.error("Failed to add baker");
        console.error(error);
        return;
      }

      toast.success("Baker added!");
    }

    clearForm();
    fetchBakers();
  };

  const handleEdit = (baker: any) => {
    setEditingBaker(baker);
    setName(baker.name);
    setWebsiteUrl(baker.website_url || "");
    setInstagramHandle(baker.instagram_handle || "");
    setCategory(baker.category || "");
    setDescription(baker.description || "");
    setProfileImageUrl(baker.profile_image_url || "");
    setIsFeatured(baker.is_featured);
    setDisplayOrder(baker.display_order || 0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this baker?")) return;

    const { error } = await supabase
      .from("favorite_bakers")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete baker");
      console.error(error);
      return;
    }

    toast.success("Baker deleted!");
    fetchBakers();
  };

  const clearForm = () => {
    setEditingBaker(null);
    setName("");
    setWebsiteUrl("");
    setInstagramHandle("");
    setCategory("");
    setDescription("");
    setProfileImageUrl("");
    setIsFeatured(false);
    setDisplayOrder(0);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Form */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {editingBaker ? "Edit Baker" : "Add New Baker"}
        </h3>

        <div>
          <Label>Baker Name *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Sally's Baking Addiction"
          />
        </div>

        <div>
          <Label>Website URL</Label>
          <Input
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div>
          <Label>Instagram Handle</Label>
          <Input
            value={instagramHandle}
            onChange={(e) => setInstagramHandle(e.target.value)}
            placeholder="@username"
          />
        </div>

        <div>
          <Label>Category</Label>
          <Input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Gluten-Free Gurus, Cake Artists"
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why we love them..."
            rows={3}
          />
        </div>

        <div>
          <Label>Profile Image</Label>
          <div className="flex gap-2 items-center">
            <Input
              type="file"
              ref={imageFileRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => imageFileRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
            </Button>
          </div>
          {profileImageUrl && (
            <img src={profileImageUrl} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
          )}
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
          <Label>Featured Baker</Label>
        </div>

        <div>
          <Label>Display Order</Label>
          <Input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            {editingBaker ? "Update" : "Add"} Baker
          </Button>
          {editingBaker && (
            <Button variant="outline" onClick={clearForm}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Bakers List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Existing Bakers ({bakers.length})</h3>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {bakers.map((baker) => (
            <Card key={baker.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{baker.name}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      {baker.category && <Badge variant="outline">{baker.category}</Badge>}
                      {baker.is_featured && <Badge>Featured</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(baker)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(baker.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};