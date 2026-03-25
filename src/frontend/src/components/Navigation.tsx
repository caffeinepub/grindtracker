import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut, Zap } from "lucide-react";
import type { Page } from "../App";
import { useApp } from "../context/AppContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const navLinks: { label: string; page: Page }[] = [
  { label: "Dashboard", page: "dashboard" },
  { label: "Tasks", page: "tasks" },
  { label: "Focus", page: "focus" },
  { label: "Leaderboard", page: "leaderboard" },
  { label: "Insights", page: "insights" },
];

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Navigation({
  currentPage,
  onNavigate,
}: NavigationProps) {
  const { clear } = useInternetIdentity();
  const { profile } = useApp();

  const username = profile?.username ?? "Grinder";
  const xp = profile ? Number(profile.xp) : 0;
  const level = profile ? Number(profile.level) : 1;
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <header
      className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-xl"
      style={{ background: "oklch(0.12 0.018 240 / 0.85)" }}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center gap-8">
        {/* Logo */}
        <button
          type="button"
          onClick={() => onNavigate("dashboard")}
          className="flex items-center gap-2 font-display font-bold text-xl tracking-tight"
          data-ocid="nav.link"
        >
          <div className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center">
            <Zap className="w-4 h-4 text-background" />
          </div>
          <span className="gradient-text">GRIND</span>
          <span className="text-foreground">TRACKER</span>
        </button>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {navLinks.map((link) => (
            <button
              type="button"
              key={link.page}
              onClick={() => onNavigate(link.page)}
              data-ocid="nav.link"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === link.page
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right: user info + logout */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full card-surface">
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-xs gradient-btn text-background font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden sm:block">
              {username}
            </span>
            <Badge className="bg-primary/20 text-primary border-0 text-xs px-1.5">
              <Zap className="w-2.5 h-2.5 mr-0.5" />
              Lv.{level}
            </Badge>
            <span className="text-xs text-muted-foreground hidden sm:block">
              {xp.toLocaleString()} XP
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            data-ocid="nav.button"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-2"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
