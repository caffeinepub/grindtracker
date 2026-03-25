import { Toaster } from "@/components/ui/sonner";
import { Loader2, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import Navigation from "./components/Navigation";
import { AppProvider, useApp } from "./context/AppContext";
import { useActor } from "./hooks/useActor";
import {
  InternetIdentityProvider,
  useInternetIdentity,
} from "./hooks/useInternetIdentity";
import DashboardPage from "./pages/DashboardPage";
import FocusPage from "./pages/FocusPage";
import InsightsPage from "./pages/InsightsPage";
import LandingPage from "./pages/LandingPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import TasksPage from "./pages/TasksPage";

export type Page =
  | "home"
  | "dashboard"
  | "tasks"
  | "focus"
  | "leaderboard"
  | "insights";

function AppInner() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor } = useActor();
  const { profile, isLoading, refreshProfile } = useApp();
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [bootstrapping, setBootstrapping] = useState(false);

  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  // On first login: create profile if none exists, then go to dashboard
  useEffect(() => {
    if (!isLoggedIn || !actor || isLoading || bootstrapping) return;
    if (profile !== null) {
      // Existing user — go to dashboard if on home
      if (currentPage === "home") setCurrentPage("dashboard");
      return;
    }
    // New user — create fresh profile
    setBootstrapping(true);
    const freshProfile = {
      username: "Grinder",
      level: 1n,
      xp: 0n,
      streak: 0n,
      lastActive: BigInt(Date.now()),
      radarScores: {
        work: 0,
        health: 0,
        learning: 0,
        social: 0,
        personal: 0,
        focus: 0,
      },
    };
    actor
      .saveCallerUserProfile(freshProfile)
      .then(() => refreshProfile())
      .finally(() => {
        setBootstrapping(false);
        setCurrentPage("dashboard");
      });
  }, [
    isLoggedIn,
    actor,
    isLoading,
    profile,
    bootstrapping,
    currentPage,
    refreshProfile,
  ]);

  if (isInitializing || (isLoggedIn && (isLoading || bootstrapping))) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div
          className="flex flex-col items-center gap-4"
          data-ocid="app.loading_state"
        >
          <div className="w-14 h-14 rounded-xl gradient-btn flex items-center justify-center glow-cyan">
            <Zap className="w-7 h-7 text-background animate-pulse" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm font-medium">
            Loading your grind...
          </p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <LandingPage onNavigate={setCurrentPage} />
        <Toaster />
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage onNavigate={setCurrentPage} />;
      case "tasks":
        return <TasksPage />;
      case "focus":
        return <FocusPage />;
      case "leaderboard":
        return <LeaderboardPage />;
      case "insights":
        return <InsightsPage />;
      default:
        return <DashboardPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      <main>{renderPage()}</main>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <InternetIdentityProvider>
      <AppProvider>
        <AppInner />
      </AppProvider>
    </InternetIdentityProvider>
  );
}
