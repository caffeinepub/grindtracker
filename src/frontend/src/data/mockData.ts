export interface Task {
  id: string;
  title: string;
  category: "Work" | "Health" | "Learning" | "Social" | "Personal";
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  completed: boolean;
  xp: number;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  streak: number;
  badges: string[];
  isCurrentUser?: boolean;
}

export interface FocusSession {
  id: string;
  duration: number; // minutes
  completedAt: string;
  xpEarned: number;
}

export interface CommunityPost {
  id: string;
  user: string;
  avatar: string;
  action: string;
  xpGained: number;
  time: string;
}

export const currentUser = {
  name: "Alex Chen",
  avatar: "AC",
  level: 12,
  xp: 4820,
  xpToNext: 5500,
  streak: 14,
  tasksToday: 5,
  radarScores: {
    Work: 85,
    Health: 70,
    Learning: 90,
    Social: 60,
    Personal: 75,
    Focus: 80,
  },
};

export const defaultTasks: Task[] = [
  {
    id: "1",
    title: "Review Q4 performance metrics",
    category: "Work",
    priority: "High",
    dueDate: "2026-03-25",
    completed: true,
    xp: 50,
  },
  {
    id: "2",
    title: "Morning run — 5km",
    category: "Health",
    priority: "High",
    dueDate: "2026-03-25",
    completed: true,
    xp: 40,
  },
  {
    id: "3",
    title: "Complete TypeScript advanced course module 7",
    category: "Learning",
    priority: "Medium",
    dueDate: "2026-03-26",
    completed: false,
    xp: 60,
  },
  {
    id: "4",
    title: "Prepare weekly team sync agenda",
    category: "Work",
    priority: "High",
    dueDate: "2026-03-25",
    completed: false,
    xp: 30,
  },
  {
    id: "5",
    title: "Read 30 pages of Atomic Habits",
    category: "Personal",
    priority: "Low",
    dueDate: "2026-03-26",
    completed: true,
    xp: 25,
  },
  {
    id: "6",
    title: "Call mom and catch up",
    category: "Social",
    priority: "Medium",
    dueDate: "2026-03-27",
    completed: false,
    xp: 20,
  },
  {
    id: "7",
    title: "Meditate 15 minutes",
    category: "Health",
    priority: "Medium",
    dueDate: "2026-03-25",
    completed: true,
    xp: 30,
  },
  {
    id: "8",
    title: "Write journal entry",
    category: "Personal",
    priority: "Low",
    dueDate: "2026-03-25",
    completed: false,
    xp: 20,
  },
  {
    id: "9",
    title: "Submit project proposal",
    category: "Work",
    priority: "High",
    dueDate: "2026-03-28",
    completed: false,
    xp: 80,
  },
  {
    id: "10",
    title: "Learn Spanish lesson 12",
    category: "Learning",
    priority: "Low",
    dueDate: "2026-03-27",
    completed: false,
    xp: 35,
  },
];

export const leaderboardData: LeaderboardUser[] = [
  {
    id: "1",
    name: "Jordan Park",
    avatar: "JP",
    level: 18,
    xp: 9240,
    streak: 32,
    badges: ["🔥", "⚡", "🏆"],
  },
  {
    id: "2",
    name: "Mia Torres",
    avatar: "MT",
    level: 15,
    xp: 7180,
    streak: 21,
    badges: ["🔥", "📚"],
  },
  {
    id: "3",
    name: "Sam Okafor",
    avatar: "SO",
    level: 14,
    xp: 6450,
    streak: 19,
    badges: ["💪", "⚡"],
  },
  {
    id: "4",
    name: "Riley Zhang",
    avatar: "RZ",
    level: 13,
    xp: 5920,
    streak: 15,
    badges: ["🎯"],
  },
  {
    id: "5",
    name: "Alex Chen",
    avatar: "AC",
    level: 12,
    xp: 4820,
    streak: 14,
    badges: ["🔥", "📚"],
    isCurrentUser: true,
  },
  {
    id: "6",
    name: "Devon Murphy",
    avatar: "DM",
    level: 11,
    xp: 4200,
    streak: 9,
    badges: ["💡"],
  },
  {
    id: "7",
    name: "Priya Nair",
    avatar: "PN",
    level: 10,
    xp: 3800,
    streak: 7,
    badges: ["🌱"],
  },
  {
    id: "8",
    name: "Chris Wade",
    avatar: "CW",
    level: 9,
    xp: 3100,
    streak: 5,
    badges: ["🎯"],
  },
];

export const defaultFocusSessions: FocusSession[] = [
  { id: "1", duration: 25, completedAt: "2026-03-25T08:30:00", xpEarned: 50 },
  { id: "2", duration: 25, completedAt: "2026-03-25T09:10:00", xpEarned: 50 },
  { id: "3", duration: 15, completedAt: "2026-03-25T10:45:00", xpEarned: 30 },
];

export const communityFeed: CommunityPost[] = [
  {
    id: "1",
    user: "Jordan Park",
    avatar: "JP",
    action: "completed a 5-task sprint streak",
    xpGained: 150,
    time: "2m ago",
  },
  {
    id: "2",
    user: "Mia Torres",
    avatar: "MT",
    action: "hit a 21-day streak milestone",
    xpGained: 500,
    time: "15m ago",
  },
  {
    id: "3",
    user: "Sam Okafor",
    avatar: "SO",
    action: "finished 4 focus sessions today",
    xpGained: 200,
    time: "1h ago",
  },
  {
    id: "4",
    user: "Riley Zhang",
    avatar: "RZ",
    action: "leveled up to Level 13!",
    xpGained: 1000,
    time: "2h ago",
  },
  {
    id: "5",
    user: "Devon Murphy",
    avatar: "DM",
    action: "completed the Learning category challenge",
    xpGained: 300,
    time: "3h ago",
  },
];

export const weeklyProductivity = [
  { day: "Mon", tasks: 6, focusTime: 75, xp: 320 },
  { day: "Tue", tasks: 8, focusTime: 100, xp: 450 },
  { day: "Wed", tasks: 4, focusTime: 50, xp: 210 },
  { day: "Thu", tasks: 9, focusTime: 125, xp: 520 },
  { day: "Fri", tasks: 7, focusTime: 90, xp: 380 },
  { day: "Sat", tasks: 5, focusTime: 60, xp: 280 },
  { day: "Sun", tasks: 5, focusTime: 65, xp: 300 },
];

export const achievements = [
  {
    id: "1",
    name: "First Blood",
    description: "Complete your first task",
    icon: "⚔️",
    unlocked: true,
  },
  {
    id: "2",
    name: "On Fire",
    description: "7-day streak",
    icon: "🔥",
    unlocked: true,
  },
  {
    id: "3",
    name: "Scholar",
    description: "Complete 10 Learning tasks",
    icon: "📚",
    unlocked: true,
  },
  {
    id: "4",
    name: "Iron Will",
    description: "14-day streak",
    icon: "💪",
    unlocked: true,
  },
  {
    id: "5",
    name: "Focus Master",
    description: "Complete 20 Pomodoro sessions",
    icon: "🎯",
    unlocked: false,
  },
  {
    id: "6",
    name: "Social Butterfly",
    description: "Complete 15 Social tasks",
    icon: "🦋",
    unlocked: false,
  },
  {
    id: "7",
    name: "Centurion",
    description: "Complete 100 tasks",
    icon: "🏛️",
    unlocked: false,
  },
  {
    id: "8",
    name: "Legend",
    description: "Reach Level 20",
    icon: "🏆",
    unlocked: false,
  },
];
