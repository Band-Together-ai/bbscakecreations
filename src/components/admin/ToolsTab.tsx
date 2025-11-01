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

export const ToolsTab = () => {
  const [tools, setTools] = useState<any[]>([]);
  const [editingTool, setEditingTool] = useState<any | null>(null);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [affiliateLink, setAffiliateLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [brandiaTake, setBrandiaTake] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState<number>(0);

  const imageFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    const { data, error } = await supabase
      .from("baking_tools")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching tools:", error);
      return;
    }

    setTools(data || []);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `tool_${Date.now()}.${fileExt}`;

    toast.info("Uploading image...");

    const { error: uploadError } = await supabase.storage
      .from('product-photos')
      .upload(fileName, file);

    if (uploadError) {
      toast.error("Failed to upload image");
      console.error(uploadError);
      return;
    }

    const { data } = supabase.storage.from('product-photos').getPublicUrl(fileName);
    setImageUrl(data.publicUrl);
    toast.success("Image uploaded!");
  };

  const handleSave = async () => {
    if (!name.trim() || !category.trim()) {
      toast.error("Please fill in name and category");
      return;
    }

    const toolData = {
      name,
      description,
      category,
      affiliate_link: affiliateLink,
      image_url: imageUrl,
      price_range: priceRange,
      brandia_take: brandiaTake,
      is_featured: isFeatured,
      display_order: displayOrder,
    };

    if (editingTool) {
      const { error } = await supabase
        .from("baking_tools")
        .update(toolData)
        .eq("id", editingTool.id);

      if (error) {
        toast.error("Failed to update tool");
        console.error(error);
        return;
      }

      toast.success("Tool updated!");
    } else {
      const { error } = await supabase
        .from("baking_tools")
        .insert(toolData);

      if (error) {
        toast.error("Failed to add tool");
        console.error(error);
        return;
      }

      toast.success("Tool added!");
    }

    clearForm();
    fetchTools();
  };

  const handleEdit = (tool: any) => {
    setEditingTool(tool);
    setName(tool.name);
    setDescription(tool.description || "");
    setCategory(tool.category);
    setAffiliateLink(tool.affiliate_link || "");
    setImageUrl(tool.image_url || "");
    setPriceRange(tool.price_range || "");
    setBrandiaTake(tool.brandia_take || "");
    setIsFeatured(tool.is_featured);
    setDisplayOrder(tool.display_order || 0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this tool?")) return;

    const { error } = await supabase
      .from("baking_tools")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete tool");
      console.error(error);
      return;
    }

    toast.success("Tool deleted!");
    fetchTools();
  };

  const clearForm = () => {
    setEditingTool(null);
    setName("");
    setDescription("");
    setCategory("");
    setAffiliateLink("");
    setImageUrl("");
    setPriceRange("");
    setBrandiaTake("");
    setIsFeatured(false);
    setDisplayOrder(0);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Form */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {editingTool ? "Edit Tool" : "Add New Tool"}
        </h3>

        <div>
          <Label>Product Name *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., KitchenAid Stand Mixer"
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief product description"
            rows={3}
          />
        </div>

        <div>
          <Label>Category *</Label>
          <Input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Mixers, Pans, Decorating Tools"
          />
        </div>

        <div>
          <Label>Affiliate Link</Label>
          <Input
            value={affiliateLink}
            onChange={(e) => setAffiliateLink(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div>
          <Label>Price Range</Label>
          <Input
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            placeholder="e.g., $49-$99"
          />
        </div>

        <div>
          <Label>BB's Take</Label>
          <Textarea
            value={brandiaTake}
            onChange={(e) => setBrandiaTake(e.target.value)}
            placeholder="Why you love this product"
            rows={2}
          />
        </div>

        <div>
          <Label>Product Image</Label>
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
          {imageUrl && (
            <img src={imageUrl} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
          )}
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
          <Label>Featured Product</Label>
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
            {editingTool ? "Update" : "Add"} Tool
          </Button>
          {editingTool && (
            <Button variant="outline" onClick={clearForm}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Tools List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Existing Tools ({tools.length})</h3>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {tools.map((tool) => (
            <Card key={tool.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{tool.name}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{tool.category}</Badge>
                      {tool.is_featured && <Badge>Featured</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(tool)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(tool.id)}
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