/* ========================================
   SANKALVYS — LOCAL DATA STORE
   Full CRUD operations with localStorage persistence
   ======================================== */

import { v4 as uuidv4 } from 'uuid';
import {
  User,
  UserSettings,
  Habit,
  HabitCompletion,
  Routine,
  DailyReflection,
  NotificationPreference,
  StreakInfo,
  HabitWithCompletion,
  RoutineWithHabits,
  DayCompletion,
  AnalyticsData,
  HabitCategory,
} from './types';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isToday, parseISO, differenceInDays, isSameDay, startOfWeek, endOfWeek, addDays } from 'date-fns';

// ========================================
// STORAGE HELPERS
// ========================================

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(`sankalvys_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`sankalvys_${key}`, JSON.stringify(value));
  } catch {
    console.warn('Failed to save to localStorage');
  }
}

// ========================================
// USER
// ========================================

export function getUser(): User | null {
  return getItem<User | null>('user', null);
}

export function setUser(user: User): void {
  setItem('user', user);
}

export function createUser(name: string, email: string): User {
  const user: User = {
    id: uuidv4(),
    name,
    email,
    createdAt: new Date().toISOString(),
    role: 'user',
  };
  setUser(user);
  createDefaultSettings(user.id);
  return user;
}

export function updateUser(updates: Partial<User>): User | null {
  const user = getUser();
  if (!user) return null;
  const updated = { ...user, ...updates };
  setUser(updated);
  return updated;
}

export function signOut(): void {
  if (typeof window === 'undefined') return;
  // Keep data but clear auth state
  localStorage.removeItem('sankalvys_auth');
}

export function isAuthenticated(): boolean {
  return getItem<boolean>('auth', false);
}

export function setAuthenticated(value: boolean): void {
  setItem('auth', value);
}

// ========================================
// SETTINGS
// ========================================

export function getSettings(): UserSettings {
  return getItem<UserSettings>('settings', getDefaultSettings(''));
}

export function updateSettings(updates: Partial<UserSettings>): UserSettings {
  const settings = getSettings();
  const updated = { ...settings, ...updates };
  setItem('settings', updated);
  return updated;
}

function getDefaultSettings(userId: string): UserSettings {
  return {
    userId,
    darkMode: false,
    zenMode: false,
    dailyMorningBrief: true,
    morningBriefTime: '08:00',
    eveningReflection: false,
    eveningReflectionTime: '21:00',
    motivationNudge: true,
    motivationNudgeTime: '07:00',
    ambientSoundscapes: false,
    tactileHaptics: true,
  };
}

function createDefaultSettings(userId: string): void {
  setItem('settings', getDefaultSettings(userId));
}

// ========================================
// HABITS
// ========================================

export function getHabits(): Habit[] {
  return getItem<Habit[]>('habits', []);
}

export function getHabit(id: string): Habit | undefined {
  return getHabits().find(h => h.id === id);
}

export function createHabit(data: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'order' | 'isActive'>): Habit {
  const habits = getHabits();
  const user = getUser();
  const habit: Habit = {
    ...data,
    id: uuidv4(),
    userId: user?.id || '',
    order: habits.length,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  habits.push(habit);
  setItem('habits', habits);
  return habit;
}

export function updateHabit(id: string, updates: Partial<Habit>): Habit | null {
  const habits = getHabits();
  const index = habits.findIndex(h => h.id === id);
  if (index === -1) return null;
  habits[index] = { ...habits[index], ...updates, updatedAt: new Date().toISOString() };
  setItem('habits', habits);
  return habits[index];
}

export function deleteHabit(id: string): boolean {
  const habits = getHabits();
  const filtered = habits.filter(h => h.id !== id);
  if (filtered.length === habits.length) return false;
  setItem('habits', filtered);
  // Also delete completions for this habit
  const completions = getCompletions().filter(c => c.habitId !== id);
  setItem('completions', completions);
  return true;
}

export function getHabitsForDate(date: string): Habit[] {
  const habits = getHabits();
  const dayOfWeek = new Date(date).getDay();
  return habits.filter(h => {
    if (!h.isActive) return false;
    switch (h.frequency) {
      case 'daily': return true;
      case 'weekdays': return dayOfWeek >= 1 && dayOfWeek <= 5;
      case 'weekends': return dayOfWeek === 0 || dayOfWeek === 6;
      case 'custom': return h.customDays.includes(dayOfWeek);
      default: return true;
    }
  });
}

// ========================================
// COMPLETIONS
// ========================================

export function getCompletions(): HabitCompletion[] {
  return getItem<HabitCompletion[]>('completions', []);
}

export function toggleCompletion(habitId: string, date: string): boolean {
  const completions = getCompletions();
  const existingIndex = completions.findIndex(
    c => c.habitId === habitId && c.date === date
  );
  const user = getUser();

  if (existingIndex >= 0) {
    // Uncomplete
    completions.splice(existingIndex, 1);
    setItem('completions', completions);
    return false;
  } else {
    // Complete
    completions.push({
      id: uuidv4(),
      habitId,
      userId: user?.id || '',
      date,
      completedAt: new Date().toISOString(),
    });
    setItem('completions', completions);
    return true;
  }
}

export function isHabitCompleted(habitId: string, date: string): boolean {
  return getCompletions().some(c => c.habitId === habitId && c.date === date);
}

export function getCompletionsForDate(date: string): HabitCompletion[] {
  return getCompletions().filter(c => c.date === date);
}

// ========================================
// ROUTINES
// ========================================

export function getRoutines(): Routine[] {
  return getItem<Routine[]>('routines', []);
}

export function getRoutine(id: string): Routine | undefined {
  return getRoutines().find(r => r.id === id);
}

export function createRoutine(data: Omit<Routine, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'order' | 'isActive'>): Routine {
  const routines = getRoutines();
  const user = getUser();
  const routine: Routine = {
    ...data,
    id: uuidv4(),
    userId: user?.id || '',
    order: routines.length,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  routines.push(routine);
  setItem('routines', routines);
  return routine;
}

export function updateRoutine(id: string, updates: Partial<Routine>): Routine | null {
  const routines = getRoutines();
  const index = routines.findIndex(r => r.id === id);
  if (index === -1) return null;
  routines[index] = { ...routines[index], ...updates, updatedAt: new Date().toISOString() };
  setItem('routines', routines);
  return routines[index];
}

export function deleteRoutine(id: string): boolean {
  const routines = getRoutines();
  const filtered = routines.filter(r => r.id !== id);
  if (filtered.length === routines.length) return false;
  setItem('routines', filtered);
  // Unassign habits from this routine
  const habits = getHabits().map(h =>
    h.routineId === id ? { ...h, routineId: null } : h
  );
  setItem('habits', habits);
  return true;
}

// ========================================
// ROUTINES WITH HABITS
// ========================================

export function getRoutinesWithHabits(date: string, filterTimeOfDay?: string): RoutineWithHabits[] {
  const routines = getRoutines();
  const habits = getHabitsForDate(date);
  const completions = getCompletionsForDate(date);

  const routineMap = new Map<string, RoutineWithHabits>();

  // Create routine entries
  routines.forEach(r => {
    if (filterTimeOfDay && filterTimeOfDay !== 'All Routines' && r.timeOfDay !== filterTimeOfDay) return;
    routineMap.set(r.id, {
      ...r,
      habits: [],
      completedCount: 0,
      totalCount: 0,
      percentage: 0,
    });
  });

  // Create "Uncategorized" routine for habits without a routine
  const uncategorizedId = '__uncategorized__';

  // Assign habits to routines
  habits.forEach(habit => {
    const isCompleted = completions.some(c => c.habitId === habit.id);
    const streak = calculateStreak(habit.id);
    const habitWithCompletion: HabitWithCompletion = {
      ...habit,
      isCompleted,
      streak,
    };

    const routineId = habit.routineId || uncategorizedId;
    if (!routineMap.has(routineId) && routineId === uncategorizedId) {
      if (filterTimeOfDay && filterTimeOfDay !== 'All Routines') {
        if (habit.timeOfDay !== filterTimeOfDay) return;
      }
      routineMap.set(uncategorizedId, {
        id: uncategorizedId,
        userId: '',
        name: 'Uncategorized',
        description: 'Habits without a routine',
        icon: '📋',
        color: '#787672',
        timeOfDay: 'Morning',
        order: 999,
        isActive: true,
        createdAt: '',
        updatedAt: '',
        habits: [],
        completedCount: 0,
        totalCount: 0,
        percentage: 0,
      });
    }

    const routine = routineMap.get(routineId);
    if (routine) {
      routine.habits.push(habitWithCompletion);
      routine.totalCount++;
      if (isCompleted) routine.completedCount++;
      routine.percentage = routine.totalCount > 0
        ? Math.round((routine.completedCount / routine.totalCount) * 100)
        : 0;
    }
  });

  return Array.from(routineMap.values())
    .filter(r => r.totalCount > 0)
    .sort((a, b) => a.order - b.order);
}

// ========================================
// STREAKS
// ========================================

export function calculateStreak(habitId: string): StreakInfo {
  const completions = getCompletions()
    .filter(c => c.habitId === habitId)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (completions.length === 0) {
    return { habitId, currentStreak: 0, longestStreak: 0, lastCompletedDate: null };
  }

  const habit = getHabit(habitId);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  // Calculate current streak
  let currentStreak = 0;
  const latestDate = completions[0].date;

  // Only count streak if last completion was today or yesterday
  if (latestDate === todayStr || latestDate === yesterdayStr) {
    let checkDate = latestDate === todayStr ? new Date() : subDays(new Date(), 1);

    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      const wasCompleted = completions.some(c => c.date === dateStr);

      // Check if this day was scheduled
      if (habit) {
        const dayOfWeek = checkDate.getDay();
        let isScheduled = true;
        switch (habit.frequency) {
          case 'weekdays': isScheduled = dayOfWeek >= 1 && dayOfWeek <= 5; break;
          case 'weekends': isScheduled = dayOfWeek === 0 || dayOfWeek === 6; break;
          case 'custom': isScheduled = habit.customDays.includes(dayOfWeek); break;
        }
        if (!isScheduled) {
          checkDate = subDays(checkDate, 1);
          continue;
        }
      }

      if (wasCompleted) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak (simplified)
  let longestStreak = currentStreak;
  let tempStreak = 0;
  const uniqueDates = [...new Set(completions.map(c => c.date))].sort();

  for (let i = 0; i < uniqueDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = parseISO(uniqueDates[i - 1]);
      const curr = parseISO(uniqueDates[i]);
      const diff = differenceInDays(curr, prev);
      if (diff === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  return {
    habitId,
    currentStreak,
    longestStreak,
    lastCompletedDate: completions[0]?.date || null,
  };
}

export function getOverallStreak(): number {
  const habits = getHabits();
  if (habits.length === 0) return 0;

  let streak = 0;
  let checkDate = new Date();

  while (true) {
    const dateStr = format(checkDate, 'yyyy-MM-dd');
    const dayHabits = getHabitsForDate(dateStr);
    if (dayHabits.length === 0) {
      checkDate = subDays(checkDate, 1);
      continue;
    }

    const completions = getCompletionsForDate(dateStr);
    const completedCount = dayHabits.filter(h =>
      completions.some(c => c.habitId === h.id)
    ).length;

    // Consider day "on track" if >= 50% completed
    if (completedCount >= Math.ceil(dayHabits.length * 0.5)) {
      streak++;
      checkDate = subDays(checkDate, 1);
      if (streak > 365) break; // Safety limit
    } else {
      break;
    }
  }

  return streak;
}

// ========================================
// DAILY REFLECTIONS
// ========================================

export function getReflections(): DailyReflection[] {
  return getItem<DailyReflection[]>('reflections', []);
}

export function getReflection(date: string): DailyReflection | undefined {
  return getReflections().find(r => r.date === date);
}

export function saveReflection(date: string, content: string, moodTags: string[]): DailyReflection {
  const reflections = getReflections();
  const user = getUser();
  const existingIndex = reflections.findIndex(r => r.date === date);

  if (existingIndex >= 0) {
    reflections[existingIndex] = {
      ...reflections[existingIndex],
      content,
      moodTags: moodTags as DailyReflection['moodTags'],
      updatedAt: new Date().toISOString(),
    };
    setItem('reflections', reflections);
    return reflections[existingIndex];
  } else {
    const reflection: DailyReflection = {
      id: uuidv4(),
      userId: user?.id || '',
      date,
      content,
      moodTags: moodTags as DailyReflection['moodTags'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    reflections.push(reflection);
    setItem('reflections', reflections);
    return reflection;
  }
}

// ========================================
// NOTIFICATIONS
// ========================================

export function getNotificationPreferences(): NotificationPreference[] {
  return getItem<NotificationPreference[]>('notifications', getDefaultNotifications());
}

export function updateNotificationPreference(id: string, updates: Partial<NotificationPreference>): void {
  const prefs = getNotificationPreferences();
  const index = prefs.findIndex(p => p.id === id);
  if (index >= 0) {
    prefs[index] = { ...prefs[index], ...updates };
    setItem('notifications', prefs);
  }
}

function getDefaultNotifications(): NotificationPreference[] {
  return [
    {
      id: 'morning-brief',
      userId: '',
      type: 'morning',
      enabled: true,
      time: '08:00',
      days: [1, 2, 3, 4, 5, 6, 0],
      label: 'Daily Morning Brief',
      description: "A quick overview of today's intentions at 8:00 AM.",
    },
    {
      id: 'evening-reflection',
      userId: '',
      type: 'evening',
      enabled: false,
      time: '21:00',
      days: [1, 2, 3, 4, 5, 6, 0],
      label: 'Evening Reflection',
      description: 'A peaceful reminder to close open loops at 9:00 PM.',
    },
  ];
}

// ========================================
// ANALYTICS
// ========================================

export function getAnalytics(period: 'week' | 'month' = 'week'): AnalyticsData {
  const habits = getHabits();
  const completions = getCompletions();
  const today = new Date();

  // Calculate consistency (last 30 days)
  let daysOnTrack = 0;
  const totalDays = 30;

  for (let i = 0; i < totalDays; i++) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayHabits = getHabitsForDate(dateStr);
    if (dayHabits.length === 0) continue;

    const dayCompletions = completions.filter(c => c.date === dateStr);
    const completedCount = dayHabits.filter(h =>
      dayCompletions.some(c => c.habitId === h.id)
    ).length;

    if (completedCount >= Math.ceil(dayHabits.length * 0.5)) {
      daysOnTrack++;
    }
  }

  const consistency = totalDays > 0 ? Math.round((daysOnTrack / totalDays) * 100) : 0;

  // Best streak
  let bestStreak = 0;
  let bestStreakHabit = '';
  habits.forEach(h => {
    const streak = calculateStreak(h.id);
    if (streak.longestStreak > bestStreak) {
      bestStreak = streak.longestStreak;
      bestStreakHabit = h.name;
    }
  });

  // Weekly data
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyData = dayNames.map((day, i) => {
    const date = addDays(weekStart, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayHabits = getHabitsForDate(dateStr);
    if (dayHabits.length === 0) return { day, percentage: 0 };

    const dayCompletions = completions.filter(c => c.date === dateStr);
    const completedCount = dayHabits.filter(h =>
      dayCompletions.some(c => c.habitId === h.id)
    ).length;

    return {
      day,
      percentage: Math.round((completedCount / dayHabits.length) * 100),
    };
  });

  // Monthly heatmap
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const monthlyHeatmap: DayCompletion[] = monthDays.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayHabits = getHabitsForDate(dateStr);
    const dayCompletions = completions.filter(c => c.date === dateStr);
    const completedCount = dayHabits.filter(h =>
      dayCompletions.some(c => c.habitId === h.id)
    ).length;

    return {
      date: dateStr,
      completed: completedCount,
      total: dayHabits.length,
      percentage: dayHabits.length > 0
        ? Math.round((completedCount / dayHabits.length) * 100)
        : 0,
    };
  });

  // Habit performance
  const habitPerformance = habits.map(h => {
    const habitCompletions = completions.filter(c => c.habitId === h.id);
    let scheduledDays = 0;

    for (let i = 0; i < 30; i++) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayHabits = getHabitsForDate(dateStr);
      if (dayHabits.some(dh => dh.id === h.id)) {
        scheduledDays++;
      }
    }

    const completedInPeriod = habitCompletions.filter(c => {
      const cDate = parseISO(c.date);
      return differenceInDays(today, cDate) <= 30;
    }).length;

    return {
      id: h.id,
      name: h.name,
      category: h.category,
      icon: h.icon,
      percentage: scheduledDays > 0 ? Math.round((completedInPeriod / scheduledDays) * 100) : 0,
    };
  }).sort((a, b) => b.percentage - a.percentage);

  // Generate insight
  const insight = generateInsight(habits, completions, habitPerformance);

  return {
    consistency,
    daysOnTrack,
    totalDays,
    bestStreak,
    bestStreakHabit,
    weeklyData,
    monthlyHeatmap,
    habitPerformance,
    insight,
  };
}

function generateInsight(
  habits: Habit[],
  completions: HabitCompletion[],
  performance: { name: string; percentage: number }[]
): string {
  const insights = [
    'Consistency is the bridge between goals and accomplishment. Keep showing up.',
    'Your morning habits tend to have higher completion rates. Build on that rhythm.',
    'Small steps each day compound into remarkable progress over time.',
    'Consider pairing a challenging habit with one you enjoy to boost completion.',
    'Your dedication to daily habits is building lasting change. Stay the course.',
  ];

  if (performance.length > 0) {
    const best = performance[0];
    if (best.percentage >= 90) {
      return `"${best.name}" is your strongest habit at ${best.percentage}% completion. Use this momentum to strengthen others.`;
    }
  }

  if (completions.length > 20) {
    return `You've logged ${completions.length} habit completions. Your consistency is building real momentum.`;
  }

  // Rotate based on day of year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return insights[dayOfYear % insights.length];
}

// ========================================
// DAY COMPLETION DATA
// ========================================

export function getDayCompletion(date: string): DayCompletion {
  const habits = getHabitsForDate(date);
  const completions = getCompletionsForDate(date);
  const completed = habits.filter(h => completions.some(c => c.habitId === h.id)).length;

  return {
    date,
    completed,
    total: habits.length,
    percentage: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0,
  };
}

// ========================================
// EXPORT / IMPORT
// ========================================

export function exportData(): string {
  const data = {
    user: getUser(),
    settings: getSettings(),
    habits: getHabits(),
    routines: getRoutines(),
    completions: getCompletions(),
    reflections: getReflections(),
    notifications: getNotificationPreferences(),
    exportedAt: new Date().toISOString(),
    version: '2.4.0',
  };
  return JSON.stringify(data, null, 2);
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.user) setItem('user', data.user);
    if (data.settings) setItem('settings', data.settings);
    if (data.habits) setItem('habits', data.habits);
    if (data.routines) setItem('routines', data.routines);
    if (data.completions) setItem('completions', data.completions);
    if (data.reflections) setItem('reflections', data.reflections);
    if (data.notifications) setItem('notifications', data.notifications);
    return true;
  } catch {
    return false;
  }
}

// ========================================
// SEED DATA
// ========================================

export function seedDemoData(): void {
  const user = getUser();
  if (!user) return;

  // Create routines
  const healthRoutine = createRoutine({
    name: 'Health & Vitality',
    description: 'Physical wellness habits',
    icon: '💚',
    color: '#4B7C59',
    timeOfDay: 'Morning',
  });

  const mindRoutine = createRoutine({
    name: 'Mind & Growth',
    description: 'Mental and personal growth',
    icon: '🧠',
    color: '#6366F1',
    timeOfDay: 'Morning',
  });

  const workRoutine = createRoutine({
    name: 'Work & Productivity',
    description: 'Career and productivity habits',
    icon: '💼',
    color: '#D97706',
    timeOfDay: 'Afternoon',
  });

  // Create habits
  const habits = [
    {
      name: 'Morning Hydration',
      description: '500ml water before coffee',
      category: 'Health' as HabitCategory,
      icon: '💧',
      color: '#4B7C59',
      frequency: 'daily' as const,
      customDays: [],
      time: '07:00',
      timeOfDay: 'Morning' as const,
      reminder: true,
      reminderTime: '07:00',
      startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      goal: 'Stay hydrated every morning',
      notes: '',
      routineId: healthRoutine.id,
    },
    {
      name: '30-Min Cardio Workout',
      description: 'Running, cycling, or HIIT session',
      category: 'Fitness' as HabitCategory,
      icon: '🏃',
      color: '#4B7C59',
      frequency: 'weekdays' as const,
      customDays: [],
      time: '17:30',
      timeOfDay: 'Evening' as const,
      reminder: true,
      reminderTime: '17:00',
      startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      goal: 'Build cardiovascular fitness',
      notes: '',
      routineId: healthRoutine.id,
    },
    {
      name: 'Take Vitamin Supplements',
      description: 'Vitamin D, Omega-3, Multivitamin',
      category: 'Health' as HabitCategory,
      icon: '💊',
      color: '#4B7C59',
      frequency: 'daily' as const,
      customDays: [],
      time: '21:00',
      timeOfDay: 'Evening' as const,
      reminder: false,
      reminderTime: '',
      startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      goal: 'Daily nutrition support',
      notes: '',
      routineId: healthRoutine.id,
    },
    {
      name: '10-Min Mindfulness Meditation',
      description: 'Guided or silent meditation',
      category: 'Mind' as HabitCategory,
      icon: '🧘',
      color: '#6366F1',
      frequency: 'daily' as const,
      customDays: [],
      time: '07:30',
      timeOfDay: 'Morning' as const,
      reminder: true,
      reminderTime: '07:30',
      startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      goal: 'Mental clarity and calm',
      notes: '',
      routineId: mindRoutine.id,
    },
    {
      name: 'Read 15 Pages of Non-Fiction',
      description: 'Currently reading Atomic Habits',
      category: 'Learning' as HabitCategory,
      icon: '📖',
      color: '#6366F1',
      frequency: 'daily' as const,
      customDays: [],
      time: '21:30',
      timeOfDay: 'Evening' as const,
      reminder: false,
      reminderTime: '',
      startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      goal: 'Read 20 books this year',
      notes: '',
      routineId: mindRoutine.id,
    },
    {
      name: 'Deep Work Focus Block',
      description: '90-min uninterrupted focus session',
      category: 'Career' as HabitCategory,
      icon: '🎯',
      color: '#D97706',
      frequency: 'weekdays' as const,
      customDays: [],
      time: '09:00',
      timeOfDay: 'Morning' as const,
      reminder: true,
      reminderTime: '08:50',
      startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      goal: 'Maximize productive output',
      notes: '',
      routineId: workRoutine.id,
    },
    {
      name: 'Clear Inbox & Plan Tomorrow',
      description: 'Process emails and set next-day priorities',
      category: 'Career' as HabitCategory,
      icon: '📧',
      color: '#D97706',
      frequency: 'weekdays' as const,
      customDays: [],
      time: '16:30',
      timeOfDay: 'Afternoon' as const,
      reminder: false,
      reminderTime: '',
      startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      goal: 'End each day with clarity',
      notes: '',
      routineId: workRoutine.id,
    },
  ];

  const createdHabits = habits.map(h => createHabit(h));

  // Generate realistic completion data for the past 30 days
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');

    createdHabits.forEach((habit, hIndex) => {
      const dayHabits = getHabitsForDate(dateStr);
      if (!dayHabits.some(dh => dh.id === habit.id)) return;

      // Different completion probabilities per habit
      const probabilities = [0.90, 0.75, 0.80, 0.95, 0.85, 0.70, 0.65];
      const prob = probabilities[hIndex] || 0.75;

      // More recent days have higher completion
      const recencyBoost = i < 7 ? 0.1 : 0;

      if (Math.random() < prob + recencyBoost) {
        toggleCompletion(habit.id, dateStr);
      }
    });
  }

  // Add some reflections
  for (let i = 0; i < 7; i++) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const reflectionTexts = [
      'Feeling energized after a strong morning routine. Struggled slightly with focus post-lunch, but pulled through.',
      'Great day overall. Meditation helped me stay centered during a stressful meeting.',
      'Missed my evening workout but completed everything else. Will adjust tomorrow.',
      'Productive day! The deep work block was particularly effective today.',
      'A bit tired but still showed up for most habits. Rest is also important.',
      'Amazing flow state during focus block. Reading before bed was deeply satisfying.',
      'Kept it simple today. Some days consistency matters more than perfection.',
    ];
    const moodOptions: string[][] = [
      ['Energized', 'Focused'],
      ['Calm', 'Grateful'],
      ['Tired', 'Motivated'],
      ['Focused', 'Energized'],
      ['Tired', 'Calm'],
      ['Energized', 'Motivated'],
      ['Calm', 'Grateful'],
    ];
    saveReflection(dateStr, reflectionTexts[i], moodOptions[i]);
  }
}
