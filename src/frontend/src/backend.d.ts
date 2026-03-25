import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Task {
    title: string;
    xpReward: bigint;
    completed: boolean;
    dueDate: bigint;
    category: Category;
    priority: Priority;
}
export interface RadarScores {
    focus: number;
    social: number;
    learning: number;
    work: number;
    personal: number;
    health: number;
}
export interface FocusSession {
    completedAt: bigint;
    durationMinutes: bigint;
    xpEarned: bigint;
}
export interface UserProfile {
    xp: bigint;
    streak: bigint;
    username: string;
    radarScores: RadarScores;
    level: bigint;
    lastActive: bigint;
}
export enum Category {
    social = "social",
    learning = "learning",
    work = "work",
    personal = "personal",
    health = "health"
}
export enum Priority {
    low = "low",
    high = "high",
    medium = "medium"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addFocusSession(durationMinutes: bigint, xpEarned: bigint): Promise<FocusSession>;
    addTask(title: string, category: Category, priority: Priority, dueDate: bigint, xpReward: bigint): Promise<Task>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteTask(id: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFocusSessions(): Promise<Array<FocusSession>>;
    getLeaderboard(): Promise<Array<[Principal, UserProfile]>>;
    getTasks(): Promise<Array<Task>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateTask(id: bigint, completed: boolean): Promise<Task>;
}
