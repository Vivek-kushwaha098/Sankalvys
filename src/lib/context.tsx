'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  UserSettings,
  Habit,
  Routine,
  HabitCompletion,
  DailyReflection,
  RoutineWithHabits,
  DayCompletion,
  AnalyticsData,
  HabitCategory,
  HabitFrequency,
  TimeOfDay,
} from '@/lib/types';
import * as store from '@/lib/store';
import { format } from 'date-fns';

interface AppContextType {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (name: string, email: string) => void;
  logout: () => void;

  // Settings
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;

  // Habits
  habits: Habit[];
  createHabit: (data: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'order' | 'isActive'>) => Habit;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (habitId: string, date?: string) => boolean;

  // Routines
  routines: Routine[];
  createRoutine: (data: Omit<Routine, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'order' | 'isActive'>) => Routine;
  updateRoutine: (id: string, updates: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  getRoutinesWithHabits: (date: string, filter?: string) => RoutineWithHabits[];

  // Completions
  getDayCompletion: (date: string) => DayCompletion;
  getOverallStreak: () => number;

  // Reflections
  reflections: DailyReflection[];
  saveReflection: (date: string, content: string, moodTags: string[]) => void;
  getReflection: (date: string) => DailyReflection | undefined;

  // Analytics
  getAnalytics: (period?: 'week' | 'month') => AnalyticsData;

  // Data
  exportData: () => string;
  importData: (json: string) => boolean;

  // UI State
  refreshKey: number;
  refresh: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(store.getSettings());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [reflections, setReflections] = useState<DailyReflection[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mounted, setMounted] = useState(false);

  const refresh = useCallback(() => {
    setRefreshKey(k => k + 1);
    setHabits(store.getHabits());
    setRoutines(store.getRoutines());
    setReflections(store.getReflections());
    setSettings(store.getSettings());
  }, []);

  // Initialize from localStorage
  useEffect(() => {
    const u = store.getUser();
    const auth = store.isAuthenticated();
    setUser(u);
    setIsAuth(auth);
    setSettings(store.getSettings());
    setHabits(store.getHabits());
    setRoutines(store.getRoutines());
    setReflections(store.getReflections());
    setMounted(true);
  }, []);

  // Apply theme
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('data-theme', settings.darkMode ? 'dark' : 'light');
  }, [settings.darkMode, mounted]);

  const login = useCallback((name: string, email: string) => {
    let u = store.getUser();
    if (!u || u.email !== email) {
      u = store.createUser(name, email);
      // Seed demo data for new users
      store.seedDemoData();
    }
    store.setAuthenticated(true);
    setUser(u);
    setIsAuth(true);
    refresh();
  }, [refresh]);

  const logout = useCallback(() => {
    store.setAuthenticated(false);
    setIsAuth(false);
  }, []);

  const handleUpdateSettings = useCallback((updates: Partial<UserSettings>) => {
    const updated = store.updateSettings(updates);
    setSettings(updated);
  }, []);

  const handleCreateHabit = useCallback((data: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'order' | 'isActive'>) => {
    const habit = store.createHabit(data);
    setHabits(store.getHabits());
    return habit;
  }, []);

  const handleUpdateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    store.updateHabit(id, updates);
    setHabits(store.getHabits());
  }, []);

  const handleDeleteHabit = useCallback((id: string) => {
    store.deleteHabit(id);
    setHabits(store.getHabits());
  }, []);

  const handleToggleCompletion = useCallback((habitId: string, date?: string) => {
    const d = date || format(new Date(), 'yyyy-MM-dd');
    const result = store.toggleCompletion(habitId, d);
    setRefreshKey(k => k + 1);
    return result;
  }, []);

  const handleCreateRoutine = useCallback((data: Omit<Routine, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'order' | 'isActive'>) => {
    const routine = store.createRoutine(data);
    setRoutines(store.getRoutines());
    return routine;
  }, []);

  const handleUpdateRoutine = useCallback((id: string, updates: Partial<Routine>) => {
    store.updateRoutine(id, updates);
    setRoutines(store.getRoutines());
  }, []);

  const handleDeleteRoutine = useCallback((id: string) => {
    store.deleteRoutine(id);
    setRoutines(store.getRoutines());
    setHabits(store.getHabits());
  }, []);

  const handleSaveReflection = useCallback((date: string, content: string, moodTags: string[]) => {
    store.saveReflection(date, content, moodTags);
    setReflections(store.getReflections());
  }, []);

  const value: AppContextType = {
    user,
    isAuthenticated: isAuth,
    login,
    logout,
    settings,
    updateSettings: handleUpdateSettings,
    habits,
    createHabit: handleCreateHabit,
    updateHabit: handleUpdateHabit,
    deleteHabit: handleDeleteHabit,
    toggleHabitCompletion: handleToggleCompletion,
    routines,
    createRoutine: handleCreateRoutine,
    updateRoutine: handleUpdateRoutine,
    deleteRoutine: handleDeleteRoutine,
    getRoutinesWithHabits: store.getRoutinesWithHabits,
    getDayCompletion: store.getDayCompletion,
    getOverallStreak: store.getOverallStreak,
    reflections,
    saveReflection: handleSaveReflection,
    getReflection: store.getReflection,
    getAnalytics: store.getAnalytics,
    exportData: store.exportData,
    importData: (json: string) => {
      const result = store.importData(json);
      if (result) refresh();
      return result;
    },
    refreshKey,
    refresh,
  };

  if (!mounted) {
    return null;
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
