import { Home, BookOpen, MessageCircle, Wrench, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/bakebook", icon: BookOpen, label: "BakeBook" },
  { path: "/chat", icon: MessageCircle, label: "Sasha" },
  { path: "/tools", icon: Wrench, label: "Tools" },
  { path: "/admin", icon: User, label: "Profile" },
];

export const BottomNavV2 = () => {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-inset-bottom"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex justify-around items-center h-16 max-w-screen-xl mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full min-w-[44px]",
                "transition-colors duration-200",
                isActive ? "text-[#F7A48C]" : "text-[#5E6A6E]"
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
