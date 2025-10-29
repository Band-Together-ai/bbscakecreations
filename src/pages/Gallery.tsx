import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import WaveBackground from '@/components/WaveBackground';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const Gallery = () => {
  const navigate = useNavigate();
  const { isAdmin, isCollaborator } = useUserRole();
  const canEdit = isAdmin || isCollaborator;
  const [selectedImage, setSelectedImage] = useState<{ src: string; name?: string; hasRecipe?: boolean } | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<{ name: string; url: string }[]>([]);
  const [recipePhotos, setRecipePhotos] = useState<{ photo_url: string; recipe_id: string; recipe_title: string }[]>([]);
  const [customNames, setCustomNames] = useState<{ photo_url: string; custom_name: string }[]>([]);
  const [editingPhoto, setEditingPhoto] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchUploadedPhotos();
    fetchRecipePhotos();
    fetchCustomNames();
  }, []);

  const fetchUploadedPhotos = async () => {
    const { data, error } = await supabase.storage
      .from('recipe-photos')
      .list('', { sortBy: { column: 'created_at', order: 'desc' } });

    if (error) {
      console.error("Error fetching photos:", error);
      return;
    }

    if (data) {
      const photosWithUrls = data.map(file => ({
        name: file.name,
        url: supabase.storage.from('recipe-photos').getPublicUrl(file.name).data.publicUrl
      }));
      setUploadedPhotos(photosWithUrls);
    }
  };

  const fetchRecipePhotos = async () => {
    const { data, error } = await supabase
      .from('recipe_photos')
      .select(`
        photo_url,
        recipe_id,
        recipes!inner(title)
      `);

    if (error) {
      console.error("Error fetching recipe photos:", error);
      return;
    }

    if (data) {
      setRecipePhotos(data.map(item => ({
        photo_url: item.photo_url,
        recipe_id: item.recipe_id,
        recipe_title: (item.recipes as any).title
      })));
    }
  };

  const fetchCustomNames = async () => {
    const { data, error } = await supabase
      .from('gallery_photo_names')
      .select('photo_url, custom_name');

    if (error) {
      console.error("Error fetching custom names:", error);
      return;
    }

    if (data) {
      setCustomNames(data);
    }
  };

  const savePhotoName = async (photoUrl: string, name: string) => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    const { error } = await supabase
      .from('gallery_photo_names')
      .upsert({ 
        photo_url: photoUrl, 
        custom_name: name.trim() 
      });

    if (error) {
      console.error("Error saving photo name:", error);
      toast.error("Failed to save name");
      return;
    }

    toast.success("Photo name saved!");
    setEditingPhoto(null);
    fetchCustomNames();
  };

  const allCakeImages = uploadedPhotos.map(photo => {
    const recipePhoto = recipePhotos.find(rp => rp.photo_url === photo.url);
    const customName = customNames.find(cn => cn.photo_url === photo.url);
    
    return {
      src: photo.url,
      name: recipePhoto?.recipe_title || customName?.custom_name || '',
      hasRecipe: !!recipePhoto,
      recipeId: recipePhoto?.recipe_id,
      hasCustomName: !!customName
    };
  });

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <Navigation />
      <WaveBackground />

      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="font-fredoka text-4xl md:text-5xl lg:text-6xl text-ocean-deep mb-4">
              Cake Gallery
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every cake tells a story. Hand-crafted with love, adorned with live flowers, 
              and baked from scratch—no box mixes, no fondant, just pure magic.
            </p>
          </div>

          {/* Grid Gallery */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            {allCakeImages.map((image, index) => (
              <Card
                key={index}
                className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-wave overflow-hidden group aspect-square"
                onClick={() => {
                  if (image.recipeId) {
                    navigate(`/recipe/${image.recipeId}`);
                  } else {
                    setSelectedImage(image);
                  }
                }}
              >
                <div className="relative w-full h-full">
                  <img
                    src={image.src}
                    alt={image.name || `Brandia's Cake ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ocean-deep/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end p-4 gap-2">
                    {image.name && (
                      <p className="text-white font-fredoka text-sm capitalize">
                        {image.name}
                      </p>
                    )}
                    {!image.hasRecipe && !image.hasCustomName && canEdit && (
                      <Badge 
                        variant="secondary" 
                        className="bg-white/20 text-white border-white/40 cursor-pointer hover:bg-white/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPhoto(image.src);
                          setEditValue('');
                        }}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Add Name
                      </Badge>
                    )}
                    {!image.hasRecipe && image.hasCustomName && canEdit && (
                      <Badge 
                        variant="secondary" 
                        className="bg-white/20 text-white border-white/40 cursor-pointer hover:bg-white/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPhoto(image.src);
                          setEditValue(image.name);
                        }}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Edit Name
                      </Badge>
                    )}
                    {!image.hasRecipe && !image.hasCustomName && !canEdit && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/40">
                        Recipe Coming Soon
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Coming Soon Notice */}
          <div className="text-center mt-24 mb-12">
            <Card className="p-8 bg-ocean-foam/30 border-ocean-wave">
              <h3 className="font-fredoka text-2xl text-ocean-deep mb-2">
                More Magic Coming Soon
              </h3>
              <p className="text-muted-foreground">
                Each cake will soon link to its recipe, so you can recreate the magic at home!
              </p>
            </Card>
          </div>
        </div>
      </main>

      {/* Lightbox for selected image */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] animate-scale-in">
            <img
              src={selectedImage.src}
              alt={selectedImage.name || "Selected cake"}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-wave"
            />
            {selectedImage.name && (
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3">
                <p className="text-white font-fredoka text-lg capitalize mb-1">
                  {selectedImage.name}
                </p>
              </div>
            )}
            <button
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 backdrop-blur-sm transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Edit Photo Name Modal */}
      {editingPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setEditingPhoto(null)}
        >
          <Card 
            className="p-6 max-w-md w-full animate-scale-in" 
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-fredoka text-xl text-ocean-deep mb-4">Name This Photo</h3>
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="Enter a name for this photo"
              className="mb-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  savePhotoName(editingPhoto, editValue);
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => savePhotoName(editingPhoto, editValue)}
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingPhoto(null)}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Gallery;
