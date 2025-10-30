import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export const UiToggle = () => {
  const [uiVersion, setUiVersion] = useState<"v1" | "v2">("v1");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if UI_V2 is enabled
    const isV2 = document.body.classList.contains("ui-v2");
    setUiVersion(isV2 ? "v2" : "v1");
  }, []);

  const toggleVersion = () => {
    const newVersion = uiVersion === "v1" ? "v2" : "v1";
    
    if (newVersion === "v2") {
      document.body.classList.add("ui-v2");
    } else {
      document.body.classList.remove("ui-v2");
    }
    
    // Show toast notification
    const toast = document.createElement("div");
    toast.textContent = `Switched to UI ${newVersion.toUpperCase()}`;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #5B4A3A;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 9999;
      font-weight: 600;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  return (
    <div className="fixed bottom-24 left-4 z-40 md:top-4 md:bottom-auto md:left-auto md:right-4">
      {!isVisible ? (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsVisible(true)}
          className="shadow-lg bg-white"
          aria-label="Show UI version toggle"
        >
          <Eye className="w-4 h-4" />
        </Button>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-3 flex items-center gap-2 border">
          <span className="text-sm font-medium text-gray-700">UI:</span>
          <Button
            size="sm"
            variant={uiVersion === "v1" ? "default" : "outline"}
            onClick={toggleVersion}
            className="text-xs"
          >
            V1
          </Button>
          <Button
            size="sm"
            variant={uiVersion === "v2" ? "default" : "outline"}
            onClick={toggleVersion}
            className="text-xs"
          >
            V2
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsVisible(false)}
            aria-label="Hide UI version toggle"
          >
            <EyeOff className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
