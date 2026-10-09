'use client';

import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Flame, Plus, Lightbulb, ArrowRight } from 'lucide-react';
import { useApp } from '@/lib/context';
import { Card, Checkbox, Badge, ProgressBar, Button, Toast } from '@/components/ui';
import { getGreeting, getDailyQuote, getDailyTip, categoryColors } from '@/lib/constants';
import { HabitCategory } from '@/lib/types';

export default function HomePage() {
  const {
    user,
    settings,
    toggleHabitCompletion,
    getDayCompletion,
    getOverallStreak,
    getRoutinesWithHabits,
    createHabit,
    refreshKey,
  } = useApp();

  const [quickHabit, setQuickHabit] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as const });

  const today = format(new Date(), 'yyyy-MM-dd');
  const greeting = getGreeting();
  const quote = getDailyQuote();
  const tip = getDailyTip();

  const dayCompletion = useMemo(() => getDayCompletion(today), [today, refreshKey, getDayCompletion]);
  const overallStreak = useMemo(() => getOverallStreak(), [refreshKey, getOverallStreak]);
  const routinesWithHabits = useMemo(() => getRoutinesWithHabits(today), [today, refreshKey, getRoutinesWithHabits]);

  // Flatten all habits for "Today's Focus"
  const todaysHabits = useMemo(() => {
    return routinesWithHabits.flatMap(r => r.habits);
  }, [routinesWithHabits]);

  const handleToggle = (habitId: string) => {
    const completed = toggleHabitCompletion(habitId, today);
    setToast({
      visible: true,
      message: completed ? 'Habit completed! 🌿' : 'Marked as incomplete',
      type: 'success',
    });
  };

  const handleQuickAdd = () => {
    if (!quickHabit.trim()) return;
    createHabit({
      name: quickHabit.trim(),
      description: '',
      category: 'Personal' as HabitCategory,
      icon: '✨',
      color: '#4B7C59',
      frequency: 'daily',
      customDays: [],
      time: '09:00',
      timeOfDay: 'Morning',
      reminder: false,
      reminderTime: '',
      startDate: today,
      goal: '',
      notes: '',
      routineId: null,
    });
    setQuickHabit('');
    setToast({ visible: true, message: 'New habit created! 🌱', type: 'success' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting Section */}
      <div>
        <p className="text-[12px] font-medium text-text-muted tracking-widest uppercase">
          {greeting}
        </p>
        <h1 className="text-[28px] font-semibold text-text-primary tracking-tight mt-1">
          {user?.name || 'Friend'}
        </h1>
        {!settings.zenMode && (
          <div className="flex items-center gap-2 mt-2">
            <Flame size={16} className="text-streak" />
            <span className="text-[14px] font-medium text-streak">
              {overallStreak} {overallStreak === 1 ? 'Day' : 'Days'}
            </span>
            <span className="text-[14px] text-text-muted">Streak</span>
          </div>
        )}
      </div>

      {/* Daily Progress Card */}
      {!settings.zenMode && (
        <Card variant="dark" className="p-5">
          <p className="text-[11px] font-medium tracking-widest text-white/60 uppercase">
            Daily Progress
          </p>
          <div className="flex items-end gap-3 mt-2">
            <span className="text-[36px] font-semibold text-white leading-none">
              {dayCompletion.percentage}%
            </span>
            <span className="text-[14px] text-white/60 mb-1">
              Completed
            </span>
          </div>
          <div className="mt-3">
            <ProgressBar value={dayCompletion.percentage} variant="sage" size="md" />
          </div>
          <p className="text-[13px] text-white/50 mt-4 italic leading-relaxed">
            &ldquo;{quote}&rdquo;
          </p>
        </Card>
      )}

      {/* Quick Habit Add */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add a new habit for today..."
          value={quickHabit}
          onChange={(e) => setQuickHabit(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleQuickAdd(); }}
          className="flex-1 h-11 px-4 text-[14px] text-text-primary bg-bg-surface border border-border-default rounded-xl placeholder:text-text-muted focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-colors"
          aria-label="Quick add habit"
        />
        <Button
          variant="primary"
          onClick={handleQuickAdd}
          icon={<Plus size={16} />}
          className="rounded-xl"
        >
          Add
        </Button>
      </div>

      {/* Today's Focus */}
      <div>
        <h2 className="text-[18px] font-medium text-text-primary mb-4">
          Today&apos;s Focus
        </h2>

        {todaysHabits.length === 0 ? (
          <Card variant="bordered" className="p-8 text-center">
            <p className="text-[15px] text-text-tertiary mb-1">
              No habits yet.
            </p>
            <p className="text-[13px] text-text-muted">
              Start with one small intention.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {todaysHabits.map((habit) => (
              <Card key={habit.id} variant="bordered" className="p-4">
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    <Checkbox
                      checked={habit.isCompleted}
                      onChange={() => handleToggle(habit.id)}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[15px] font-medium ${
                      habit.isCompleted
                        ? 'text-text-muted line-through'
                        : 'text-text-primary'
                    }`}>
                      {habit.name}
                    </p>
                    {habit.description && (
                      <p className="text-[13px] text-text-tertiary mt-0.5 truncate">
                        {habit.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="muted">{habit.category}</Badge>
                      {!settings.zenMode && habit.streak.currentStreak > 0 && (
                        <Badge variant="streak">
                          <Flame size={10} className="mr-0.5" />
                          {habit.streak.currentStreak}d
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Momentum Tip */}
      <Card variant="bordered" className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-streak-light flex items-center justify-center flex-shrink-0">
            <Lightbulb size={16} className="text-streak" />
          </div>
          <div>
            <p className="text-[14px] font-medium text-text-primary">
              {tip.title}
            </p>
            <p className="text-[13px] text-text-tertiary mt-1 leading-relaxed">
              {tip.body}
            </p>
          </div>
        </div>
      </Card>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </div>
  );
}
