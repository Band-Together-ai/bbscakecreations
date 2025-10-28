import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import logoSquare from "@/assets/logo-square-transparent.png";

export function LogoEditor() {
  const [xMobile, setXMobile] = useState<number>(-40);
  const [xDesktop, setXDesktop] = useState<number>(60);
  const [logoSize, setLogoSize] = useState<number>(160);
  const [logoTop, setLogoTop] = useState<number>(-80);
  const [profileSettingsId, setProfileSettingsId] = useState<string | null>(null);
  const [editDevice, setEditDevice] = useState<'mobile' | 'desktop'>("desktop");
  const [loading, setLoading] = useState(true);

  const draggingRef = useRef(false);
  const startRef = useRef<{ x: number; y: number; startX: number; startTop: number } | null>(null);

  useEffect(() => {
    fetchLogoSettings();
  }, []);

  const fetchLogoSettings = async () => {
    const { data } = await supabase
      .from("profile_settings")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setProfileSettingsId(data.id);
      if (data.logo_size !== null && data.logo_size !== undefined) setLogoSize(data.logo_size);
      if (data.logo_top !== null && data.logo_top !== undefined) setLogoTop(data.logo_top);
      if (data.logo_x_mobile !== null && data.logo_x_mobile !== undefined) setXMobile(data.logo_x_mobile);
      if (data.logo_x_desktop !== null && data.logo_x_desktop !== undefined) setXDesktop(data.logo_x_desktop);
    }
    setLoading(false);
  };

  const saveLogoSettings = async () => {
    const payload = {
      logo_top: Math.round(logoTop),
      logo_size: Math.round(logoSize),
      logo_x_mobile: Math.round(xMobile),
      logo_x_desktop: Math.round(xDesktop),
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

    toast.success("Logo position saved successfully!");
  };

  const resetToDefaults = () => {
    setXMobile(-40);
    setXDesktop(60);
    setLogoSize(160);
    setLogoTop(-80);
    toast.info("Reset to default values");
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

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left: Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="font-fredoka">Logo Position Editor</CardTitle>
          <CardDescription>
            Adjust the logo position for mobile and desktop views. Drag the logo or use the controls below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Device Toggle */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Editing Device</label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={editDevice === 'mobile' ? 'default' : 'outline'}
                onClick={() => setEditDevice('mobile')}
                className="flex-1"
              >
                Mobile
              </Button>
              <Button
                size="sm"
                variant={editDevice === 'desktop' ? 'default' : 'outline'}
                onClick={() => setEditDevice('desktop')}
                className="flex-1"
              >
                Desktop
              </Button>
            </div>
          </div>

          {/* Nudge Controls */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nudge Position (16px)</label>
            <div className="grid grid-cols-3 gap-1">
              <div></div>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setLogoTop(logoTop - 16)}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
              <div></div>
              <Button
                size="icon"
                variant="outline"
                onClick={() => editDevice === 'mobile' ? setXMobile(xMobile - 16) : setXDesktop(xDesktop - 16)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-muted"></div>
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={() => editDevice === 'mobile' ? setXMobile(xMobile + 16) : setXDesktop(xDesktop + 16)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <div></div>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setLogoTop(logoTop + 16)}
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Size Slider */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Size: {logoSize}px</label>
            <Slider
              value={[logoSize]}
              onValueChange={(v) => setLogoSize(v[0])}
              min={80}
              max={240}
              step={8}
            />
          </div>

          {/* Position Info */}
          <div className="space-y-1 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground font-medium">Current Values:</p>
            <p className="text-xs">Mobile X: {xMobile}px</p>
            <p className="text-xs">Desktop X: {xDesktop}px</p>
            <p className="text-xs">Top: {logoTop}px</p>
            <p className="text-xs">Size: {logoSize}px</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={saveLogoSettings} className="flex-1">
              Save Changes
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
          <CardTitle className="font-fredoka">Live Preview</CardTitle>
          <CardDescription>
            Drag the logo to reposition it. This shows how it will look on the homepage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative backdrop-blur-sm bg-background/60 rounded-2xl p-4 pt-28 min-h-[300px] border-2 border-dashed">
            <img
              src={logoSquare}
              alt="BB's Cake Creations Logo"
              className="absolute left-1/2 opacity-80 z-10 select-none cursor-move"
              style={{
                top: logoTop,
                width: logoSize,
                height: logoSize,
                transform: `translate(-50%, 0) translateX(${editDevice === 'mobile' ? xMobile : xDesktop}px)`
              }}
              onPointerDown={(e) => {
                e.preventDefault();
                draggingRef.current = true;
                startRef.current = {
                  x: e.clientX,
                  y: e.clientY,
                  startX: (editDevice === 'mobile' ? xMobile : xDesktop),
                  startTop: logoTop
                };
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              }}
              onPointerMove={(e) => {
                if (!draggingRef.current || !startRef.current) return;
                const dx = e.clientX - startRef.current.x;
                const dy = e.clientY - startRef.current.y;
                if (editDevice === 'mobile') setXMobile(startRef.current.startX + dx);
                else setXDesktop(startRef.current.startX + dx);
                setLogoTop(startRef.current.startTop + dy);
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
            <p className="text-sm text-muted-foreground text-center">
              This is a preview box. The text below represents your homepage content.
            </p>
            <p className="text-xs text-muted-foreground/70 text-center mt-2">
              Where every cake is baked from scratch with love, adorned with live flowers...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
