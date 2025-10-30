import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2, Edit } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface WellnessItem {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  brandia_pick: boolean;
  why_she_loves_it: string;
  affiliate_link: string;
  display_order: number;
}

export const WellnessTab = () => {
  const [items, setItems] = useState<WellnessItem[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [affiliateLink, setAffiliateLink] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [brandiaPick, setBrandiaPick] = useState(false);
  const [whySheLovesIt, setWhySheLovesIt] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [editingItem, setEditingItem] = useState<WellnessItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("wellness")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching wellness items:", error);
      return;
    }

    if (data) setItems(data);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async (): Promise<string | null> => {
    if (!imageFile) return null;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `wellness-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, imageFile);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      toast.error("Failed to upload image");
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    let imageUrl = editingItem?.image_url || null;
    if (imageFile) {
      imageUrl = await handleImageUpload();
      if (!imageUrl) return;
    }

    const itemData = {
      name,
      description,
      category,
      image_url: imageUrl,
      brandia_pick: brandiaPick,
      why_she_loves_it: whySheLovesIt || null,
      affiliate_link: affiliateLink || null,
      display_order: displayOrder,
    };

    let error;
    if (editingItem) {
      const result = await supabase
        .from("wellness")
        .update(itemData)
        .eq("id", editingItem.id);
      error = result.error;
    } else {
      const result = await supabase
        .from("wellness")
        .insert(itemData);
      error = result.error;
    }

    if (error) {
      console.error("Save error:", error);
      toast.error("Failed to save wellness item");
      return;
    }

    toast.success(editingItem ? "Wellness item updated!" : "Wellness item added!");
    clearForm();
    fetchItems();
  };

  const handleEdit = (item: WellnessItem) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description || "");
    setCategory(item.category || "");
    setAffiliateLink(item.affiliate_link || "");
    setBrandiaPick(item.brandia_pick || false);
    setWhySheLovesIt(item.why_she_loves_it || "");
    setDisplayOrder(item.display_order || 0);
    setImagePreview(item.image_url || null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this wellness item?")) return;

    const { error } = await supabase
      .from("wellness")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete wellness item");
      return;
    }

    toast.success("Wellness item deleted");
    fetchItems();
  };

  const clearForm = () => {
    setEditingItem(null);
    setName("");
    setDescription("");
    setCategory("");
    setAffiliateLink("");
    setBrandiaPick(false);
    setWhySheLovesIt("");
    setDisplayOrder(0);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingItem ? "Edit Wellness Item" : "Add Wellness Item"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Vitamin D3 Gummies"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the product"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., vitamin, skincare, supplement"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="affiliateLink">Affiliate Link</Label>
            <Input
              id="affiliateLink"
              value={affiliateLink}
              onChange={(e) => setAffiliateLink(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Product Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-2 h-40 object-cover rounded" />
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="brandiaPick"
              checked={brandiaPick}
              onCheckedChange={setBrandiaPick}
            />
            <Label htmlFor="brandiaPick">Brandia's Go-To</Label>
          </div>

          {brandiaPick && (
            <div className="space-y-2">
              <Label htmlFor="whySheLovesIt">Why She Loves It</Label>
              <Textarea
                id="whySheLovesIt"
                value={whySheLovesIt}
                onChange={(e) => setWhySheLovesIt(e.target.value)}
                placeholder="e.g., Keeps my energy up during long baking days!"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="displayOrder">Display Order</Label>
            <Input
              id="displayOrder"
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave}>
              {editingItem ? "Update Item" : "Add Item"}
            </Button>
            {editingItem && (
              <Button variant="outline" onClick={clearForm}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wellness Items ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{item.category}</p>
                  {item.brandia_pick && (
                    <p className="text-sm text-coral">⭐ Brandia's Go-To</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
