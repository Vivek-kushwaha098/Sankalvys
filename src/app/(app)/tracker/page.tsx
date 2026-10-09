'use client';

import React, { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  getDay,
  isSameDay,
  isToday as isDateToday,
  isFuture,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  TrendingUp,
  Check,
  PenLine,
} from 'lucide-react';
import { useApp } from '@/lib/context';
import { Card, Badge, Button, Textarea, Toast } from '@/components/ui';
import { MoodTag } from '@/lib/types';

const moodTags: MoodTag[] = ['Energized', 'Focused', 'Calm', 'Tired', 'Stressed', 'Grateful', 'Motivated'];

export default function TrackerPage() {
  const {
    settings,
    getDayCompletion,
    getOverallStreak,
    getRoutinesWithHabits,
    saveReflection,
    getReflection,
    refreshKey,
  } = useApp();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reflectionText, setReflectionText] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [toast, setToast] = useState({ visible: false, message: '' });

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

  // Load reflection for selected date
  const existingReflection = useMemo(() => {
    const r = getReflection(selectedDateStr);
    return r;
  }, [selectedDateStr, refreshKey, getReflection]);

  React.useEffect(() => {
    if (existingReflection) {
      setReflectionText(existingReflection.content);
      setSelectedMoods(existingReflection.moodTags);
    } else {
      setReflectionText('');
      setSelectedMoods([]);
    }
  }, [existingReflection]);

  const overallStreak = useMemo(() => getOverallStreak(), [refreshKey, getOverallStreak]);

  // Monthly completion data
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Monthly rate
  const monthlyRate = useMemo(() => {
    let totalDays = 0;
    let onTrackDays = 0;
    monthDays.forEach(day => {
      if (isFuture(day)) return;
      const dc = getDayCompletion(format(day, 'yyyy-MM-dd'));
      if (dc.total > 0) {
        totalDays++;
        if (dc.percentage >= 50) onTrackDays++;
      }
    });
    return totalDays > 0 ? Math.round((onTrackDays / totalDays) * 100) : 0;
  }, [monthDays, refreshKey, getDayCompletion]);

  // Day completion data for selected date
  const dayCompletion = useMemo(
    () => getDayCompletion(selectedDateStr),
    [selectedDateStr, refreshKey, getDayCompletion]
  );

  // Habits for selected date
  const dateRoutines = useMemo(
    () => getRoutinesWithHabits(selectedDateStr),
    [selectedDateStr, refreshKey, getRoutinesWithHabits]
  );

  const allHabits = useMemo(
    () => dateRoutines.flatMap(r => r.habits),
    [dateRoutines]
  );

  // Calendar grid
  const calendarGrid = useMemo(() => {
    const firstDay = getDay(startOfMonth(currentMonth));
    // Adjust to start on Monday (1=Mon)
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    const grid: (Date | null)[] = [];

    for (let i = 0; i < startOffset; i++) {
      grid.push(null);
    }
    monthDays.forEach(day => grid.push(day));

    // Fill remaining cells
    while (grid.length % 7 !== 0) {
      grid.push(null);
    }

    return grid;
  }, [currentMonth, monthDays]);

  const getIntensityClass = (date: Date | null): string => {
    if (!date || isFuture(date)) return 'bg-bg-muted';
    const dc = getDayCompletion(format(date, 'yyyy-MM-dd'));
    if (dc.total === 0) return 'bg-bg-muted';
    if (dc.percentage >= 80) return 'bg-sage';
    if (dc.percentage >= 60) return 'bg-sage/70';
    if (dc.percentage >= 40) return 'bg-sage/40';
    if (dc.percentage > 0) return 'bg-sage/20';
    return 'bg-bg-muted';
  };

  const handleSaveReflection = () => {
    if (!reflectionText.trim() && selectedMoods.length === 0) return;
    saveReflection(selectedDateStr, reflectionText.trim(), selectedMoods);
    setToast({ visible: true, message: 'Reflection saved 🌿' });
  };

  const toggleMood = (mood: string) => {
    setSelectedMoods(prev =>
      prev.includes(mood)
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Header */}
      {!settings.zenMode && (
        <Card variant="dark" className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium tracking-widest text-white/50 uppercase">
                Current Streak
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[28px] font-semibold text-white">
                  {overallStreak}
                </span>
                <span className="text-[14px] text-white/60">Days</span>
                <span className="text-[12px] text-sage-light font-medium">
                  +{dayCompletion.completed} today
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-medium tracking-widest text-white/50 uppercase">
                Monthly Rate
              </p>
              <span className="text-[28px] font-semibold text-white">
                {monthlyRate}%
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-[18px] font-semibold text-text-primary">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <Badge variant="sage" size="sm">Active</Badge>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg-hover transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} className="text-text-secondary" />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg-hover transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={18} className="text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Consistency Matrix */}
      <Card variant="bordered" className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-[15px] font-medium text-text-primary">
              Consistency Matrix
            </h3>
            <p className="text-[12px] text-text-tertiary mt-0.5">
              Overview of daily habit completion intensity
            </p>
          </div>
          {!settings.zenMode && (
            <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
              <span>Less</span>
              <div className="w-3 h-3 rounded bg-bg-muted" />
              <div className="w-3 h-3 rounded bg-sage/20" />
              <div className="w-3 h-3 rounded bg-sage/40" />
              <div className="w-3 h-3 rounded bg-sage/70" />
              <div className="w-3 h-3 rounded bg-sage" />
              <span>More</span>
            </div>
          )}
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div key={i} className="text-[11px] font-medium text-text-muted text-center py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarGrid.map((date, i) => {
            const isSelected = date && isSameDay(date, selectedDate);
            const isCurrentDay = date && isDateToday(date);

            return (
              <button
                key={i}
                disabled={!date}
                onClick={() => date && setSelectedDate(date)}
                className={`aspect-square rounded-lg flex items-center justify-center text-[12px] font-medium transition-all ${
                  !date
                    ? 'invisible'
                    : isSelected
                    ? 'ring-2 ring-sage ring-offset-1 ring-offset-bg-surface ' + getIntensityClass(date) + ' text-white'
                    : isCurrentDay
                    ? getIntensityClass(date) + ' ring-2 ring-bg-dark text-white'
                    : getIntensityClass(date) + (
                        getIntensityClass(date).includes('sage')
                          ? ' text-white'
                          : ' text-text-secondary hover:opacity-80'
                      )
                }`}
                aria-label={date ? format(date, 'MMMM d, yyyy') : undefined}
              >
                {date ? format(date, 'd') : ''}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Habit Breakdown */}
      <Card variant="bordered" className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[15px] font-medium text-text-primary">
              Habit Breakdown
            </h3>
            <p className="text-[12px] text-text-tertiary mt-0.5">
              Completion status for {format(selectedDate, 'MMMM d, yyyy')}
            </p>
          </div>
          {!settings.zenMode && (
            <Badge variant={dayCompletion.percentage >= 80 ? 'sage' : 'muted'}>
              {dayCompletion.completed}/{dayCompletion.total} completed
            </Badge>
          )}
        </div>

        {allHabits.length === 0 ? (
          <p className="text-[14px] text-text-tertiary text-center py-6">
            No habits scheduled for this day.
          </p>
        ) : (
          <div className="space-y-3">
            {allHabits.map(habit => (
              <div key={habit.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-bg-muted flex items-center justify-center text-sm flex-shrink-0">
                  {habit.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-text-primary truncate">
                    {habit.name}
                  </p>
                  <p className="text-[12px] text-text-tertiary">
                    {habit.category}
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  habit.isCompleted
                    ? 'bg-sage text-white'
                    : 'border-2 border-border-default'
                }`}>
                  {habit.isCompleted && <Check size={12} strokeWidth={3} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Daily Reflection */}
      <Card variant="bordered" className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PenLine size={16} className="text-text-secondary" />
            <h3 className="text-[15px] font-medium text-text-primary">
              Daily Reflection
            </h3>
          </div>
          <span className="text-[12px] text-text-muted">
            {format(selectedDate, 'MMM d, yyyy')}
          </span>
        </div>

        <p className="text-[13px] text-text-tertiary mb-3 leading-relaxed">
          How did today feel? Note any friction points or wins to preserve momentum.
        </p>

        <Textarea
          value={reflectionText}
          onChange={(e) => setReflectionText(e.target.value)}
          placeholder="Write your thoughts..."
          rows={3}
        />

        <div className="flex flex-wrap gap-2 mt-3">
          {moodTags.map(mood => (
            <button
              key={mood}
              onClick={() => toggleMood(mood)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                selectedMoods.includes(mood)
                  ? 'bg-sage-muted text-sage'
                  : 'bg-bg-muted text-text-secondary hover:bg-bg-hover'
              }`}
            >
              {mood}
            </button>
          ))}
        </div>

        <div className="flex justify-end mt-4">
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveReflection}
          >
            Save Log
          </Button>
        </div>
      </Card>

      <Toast
        message={toast.message}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </div>
  );
}
