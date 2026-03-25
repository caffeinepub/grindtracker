import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Navigation from "./components/Navigation";
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

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <LandingPage onNavigate={setCurrentPage} />;
      case "dashboard":
        return <DashboardPage />;
      case "tasks":
        return <TasksPage />;
      case "focus":
        return <FocusPage />;
      case "leaderboard":
        return <LeaderboardPage />;
      case "insights":
        return <InsightsPage />;
      default:
        return <LandingPage onNavigate={setCurrentPage} />;
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
