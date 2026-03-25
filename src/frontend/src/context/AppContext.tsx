import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Category,
  type FocusSession,
  Priority,
  type Task,
  type UserProfile,
} from "../backend.d";
import { useActor } from "../hooks/useActor";

export type { Task, UserProfile, FocusSession };
export { Category, Priority };

interface AppContextValue {
  profile: UserProfile | null;
  tasks: Task[];
  focusSessions: FocusSession[];
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  refreshSessions: () => Promise<void>;
  setProfile: (p: UserProfile) => void;
  setTasks: (t: Task[]) => void;
  setFocusSessions: (s: FocusSession[]) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { actor, isFetching } = useActor();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!actor) return;
    const p = await actor.getCallerUserProfile();
    setProfile(p);
  }, [actor]);

  const refreshTasks = useCallback(async () => {
    if (!actor) return;
    const t = await actor.getTasks();
    setTasks(t);
  }, [actor]);

  const refreshSessions = useCallback(async () => {
    if (!actor) return;
    const s = await actor.getFocusSessions();
    setFocusSessions(s);
  }, [actor]);

  useEffect(() => {
    if (!actor || isFetching) return;
    setIsLoading(true);
    Promise.all([refreshProfile(), refreshTasks(), refreshSessions()]).finally(
      () => setIsLoading(false),
    );
  }, [actor, isFetching, refreshProfile, refreshTasks, refreshSessions]);

  return (
    <AppContext.Provider
      value={{
        profile,
        tasks,
        focusSessions,
        isLoading,
        refreshProfile,
        refreshTasks,
        refreshSessions,
        setProfile,
        setTasks,
        setFocusSessions,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
