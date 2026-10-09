/* ========================================
   SANKALVYS — TYPE DEFINITIONS
   ======================================== */

export type HabitCategory =
  | 'Health'
  | 'Mind'
  | 'Growth'
  | 'Fitness'
  | 'Learning'
  | 'Career'
  | 'Finance'
  | 'Personal';

export type HabitFrequency =
  | 'daily'
  | 'weekdays'
  | 'weekends'
  | 'custom';

export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Custom';

export type MoodTag =
  | 'Energized'
  | 'Focused'
  | 'Calm'
  | 'Tired'
  | 'Stressed'
  | 'Grateful'
  | 'Motivated';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  role: 'user' | 'admin';
}

export interface UserSettings {
  userId: string;
  darkMode: boolean;
  zenMode: boolean;
  dailyMorningBrief: boolean;
  morningBriefTime: string;
  eveningReflection: boolean;
  eveningReflectionTime: string;
  motivationNudge: boolean;
  motivationNudgeTime: string;
  ambientSoundscapes: boolean;
  tactileHaptics: boolean;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: HabitCategory;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  customDays: number[]; // 0=Sun, 1=Mon, etc.
  time: string; // HH:MM format
  timeOfDay: TimeOfDay;
  reminder: boolean;
  reminderTime: string;
  startDate: string;
  goal: string;
  notes: string;
  routineId: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  completedAt: string;
}

export interface Routine {
  id: string;
  userId: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  timeOfDay: TimeOfDay;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailyReflection {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  content: string;
  moodTags: MoodTag[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  type: 'morning' | 'evening' | 'habit' | 'custom';
  enabled: boolean;
  time: string;
  days: number[];
  label: string;
  description: string;
}

export interface StreakInfo {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
}

export interface DayCompletion {
  date: string;
  completed: number;
  total: number;
  percentage: number;
}

export interface HabitWithCompletion extends Habit {
  isCompleted: boolean;
  streak: StreakInfo;
}

export interface RoutineWithHabits extends Routine {
  habits: HabitWithCompletion[];
  completedCount: number;
  totalCount: number;
  percentage: number;
}

export interface AnalyticsData {
  consistency: number;
  daysOnTrack: number;
  totalDays: number;
  bestStreak: number;
  bestStreakHabit: string;
  weeklyData: { day: string; percentage: number }[];
  monthlyHeatmap: DayCompletion[];
  habitPerformance: {
    id: string;
    name: string;
    category: HabitCategory;
    icon: string;
    percentage: number;
  }[];
  insight: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisWeek: number;
  totalHabits: number;
  habitsCompleted: number;
  completionRate: number;
  topCategories: { category: string; count: number }[];
  dailyActiveUsers: number[];
}
