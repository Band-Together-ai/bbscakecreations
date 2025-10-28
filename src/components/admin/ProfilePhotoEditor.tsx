import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import profilePlaceholder from "@/assets/brandia-profile.jpg";

export function ProfilePhotoEditor() {
  const [scale, setScale] = useState<number>(100);
  const [positionX, setPositionX] = useState<number>(50);
  const [positionY, setPositionY] = useState<number>(50);
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  const [profileSettingsId, setProfileSettingsId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const draggingRef = useRef(false);
  const startRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);

  useEffect(() => {
    fetchProfileSettings();
  }, []);

  const fetchProfileSettings = async () => {
    const { data } = await supabase
      .from("profile_settings")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setProfileSettingsId(data.id);
      setProfileImageUrl(data.profile_image_url || "");
      if (data.profile_photo_scale !== null && data.profile_photo_scale !== undefined) {
        setScale(data.profile_photo_scale);
      }
      if (data.profile_photo_x !== null && data.profile_photo_x !== undefined) {
        setPositionX(data.profile_photo_x);
      }
      if (data.profile_photo_y !== null && data.profile_photo_y !== undefined) {
        setPositionY(data.profile_photo_y);
      }
    }
    setLoading(false);
  };

  const saveProfilePhotoSettings = async () => {
    const payload = {
      profile_photo_scale: Math.round(scale),
      profile_photo_x: Math.round(positionX),
      profile_photo_y: Math.round(positionY),
    };

    if (profileSettingsId) {
      await supabase.from("profile_settings").update(payload).eq("id", profileSettingsId);
    } else {
      const { data } = await supabase
        .from("profile_settings")
        .insert(payload)
        .select("id")
        .maybeSingle();
      if (data?.id) setProfileSettingsId(data.id);
    }

    toast.success("Profile photo position saved successfully!");
  };

  const resetToDefaults = () => {
    setScale(100);
    setPositionX(50);
    setPositionY(50);
    toast.info("Reset to default values");
  };

  const nudgePosition = (direction: 'left' | 'right' | 'up' | 'down') => {
    const step = 2; // 2% movement per nudge
    switch (direction) {
      case 'left':
        setPositionX(Math.max(0, positionX - step));
        break;
      case 'right':
        setPositionX(Math.min(100, positionX + step));
        break;
      case 'up':
        setPositionY(Math.max(0, positionY - step));
        break;
      case 'down':
        setPositionY(Math.min(100, positionY + step));
        break;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const displayImage = profileImageUrl || profilePlaceholder;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left: Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="font-fredoka">Profile Photo Position</CardTitle>
          <CardDescription>
            Adjust the position and scale of your profile photo in the 16:9 container. Drag the photo or use controls.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Nudge Controls */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Reposition Photo</label>
            <div className="grid grid-cols-3 gap-1">
              <div></div>
              <Button
                size="icon"
                variant="outline"
                onClick={() => nudgePosition('up')}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
              <div></div>
              <Button
                size="icon"
                variant="outline"
                onClick={() => nudgePosition('left')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-muted"></div>
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={() => nudgePosition('right')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <div></div>
              <Button
                size="icon"
                variant="outline"
                onClick={() => nudgePosition('down')}
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Scale Slider */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Scale: {scale}%</label>
            <Slider
              value={[scale]}
              onValueChange={(v) => setScale(v[0])}
              min={50}
              max={200}
              step={5}
            />
            <p className="text-xs text-muted-foreground">
              Zoom in/out to fit the subject in frame
            </p>
          </div>

          {/* Position Info */}
          <div className="space-y-1 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground font-medium">Current Values:</p>
            <p className="text-xs">Horizontal: {positionX}%</p>
            <p className="text-xs">Vertical: {positionY}%</p>
            <p className="text-xs">Scale: {scale}%</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={saveProfilePhotoSettings} className="flex-1">
              Save Position
            </Button>
            <Button variant="outline" onClick={resetToDefaults}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Right: Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="font-fredoka">Live Preview (16:9)</CardTitle>
          <CardDescription>
            Drag the photo to reposition it. This shows how it will appear on your homepage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-dashed bg-muted/20">
            <div
              className="absolute inset-0 cursor-move select-none"
              style={{
                backgroundImage: `url(${displayImage})`,
                backgroundSize: `${scale}%`,
                backgroundPosition: `${positionX}% ${positionY}%`,
                backgroundRepeat: 'no-repeat',
              }}
              onPointerDown={(e) => {
                e.preventDefault();
                draggingRef.current = true;
                startRef.current = {
                  x: e.clientX,
                  y: e.clientY,
                  startX: positionX,
                  startY: positionY
                };
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              }}
              onPointerMove={(e) => {
                if (!draggingRef.current || !startRef.current) return;
                const container = e.currentTarget.getBoundingClientRect();
                const dx = ((e.clientX - startRef.current.x) / container.width) * 100;
                const dy = ((e.clientY - startRef.current.y) / container.height) * 100;
                setPositionX(Math.max(0, Math.min(100, startRef.current.startX + dx)));
                setPositionY(Math.max(0, Math.min(100, startRef.current.startY + dy)));
              }}
              onPointerUp={() => {
                draggingRef.current = false;
                startRef.current = null;
              }}
              onPointerCancel={() => {
                draggingRef.current = false;
                startRef.current = null;
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Drag to reposition • Use slider to zoom • Click Save when done
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
