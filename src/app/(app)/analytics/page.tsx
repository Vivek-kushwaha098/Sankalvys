'use client';

import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isFuture, getDay } from 'date-fns';
import { TrendingUp, Flame, Lightbulb, Filter } from 'lucide-react';
import { useApp } from '@/lib/context';
import { Card, Badge, ProgressBar, Tabs, EmptyState } from '@/components/ui';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

export default function AnalyticsPage() {
  const { settings, getAnalytics, habits, refreshKey } = useApp();
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  const analytics = useMemo(
    () => getAnalytics(period),
    [period, refreshKey, getAnalytics]
  );

  if (habits.length === 0) {
    return (
      <div className="animate-fade-in">
        <EmptyState
          icon={<TrendingUp size={40} strokeWidth={1} />}
          title="No analytics yet"
          description="Complete a few habits to reveal your momentum."
        />
      </div>
    );
  }

  // Monthly heatmap grid
  const heatmapGrid = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const days = eachDayOfInterval({ start, end });
    const firstDay = getDay(start);
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    const grid: ({ date: string; percentage: number } | null)[] = [];
    for (let i = 0; i < startOffset; i++) grid.push(null);
    days.forEach(day => {
      const dayData = analytics.monthlyHeatmap.find(d => d.date === format(day, 'yyyy-MM-dd'));
      grid.push({
        date: format(day, 'yyyy-MM-dd'),
        percentage: dayData?.percentage || 0,
      });
    });
    while (grid.length % 7 !== 0) grid.push(null);
    return grid;
  }, [analytics.monthlyHeatmap]);

  const getHeatmapColor = (percentage: number | undefined) => {
    if (!percentage || percentage === 0) return 'bg-bg-muted';
    if (percentage >= 80) return 'bg-sage';
    if (percentage >= 60) return 'bg-sage/70';
    if (percentage >= 40) return 'bg-sage/40';
    return 'bg-sage/20';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-text-primary">
            Performance & Flow
          </h1>
          <p className="text-[14px] text-text-tertiary mt-1 leading-relaxed">
            Your momentum is steady. Here is how your habits are shaping up.
          </p>
        </div>
        {!settings.zenMode && (
          <Badge variant="sage" size="md">
            +{Math.max(0, analytics.consistency - 80)}% this month
          </Badge>
        )}
      </div>

      {/* Top Metrics */}
      {!settings.zenMode && (
        <div className="grid grid-cols-2 gap-3">
          <Card variant="bordered" className="p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp size={14} className="text-sage" />
              <span className="text-[12px] font-medium text-text-tertiary uppercase tracking-wide">
                Consistency
              </span>
            </div>
            <p className="text-[28px] font-semibold text-text-primary">
              {analytics.consistency}%
            </p>
            <p className="text-[12px] text-text-muted mt-1">
              {analytics.daysOnTrack} of {analytics.totalDays} days on track
            </p>
          </Card>

          <Card variant="bordered" className="p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Flame size={14} className="text-streak" />
              <span className="text-[12px] font-medium text-text-tertiary uppercase tracking-wide">
                Best Streak
              </span>
            </div>
            <p className="text-[28px] font-semibold text-text-primary">
              {analytics.bestStreak} <span className="text-[14px] font-normal text-text-muted">Days</span>
            </p>
            <p className="text-[12px] text-text-muted mt-1 truncate">
              {analytics.bestStreakHabit || 'No streak yet'}
            </p>
          </Card>
        </div>
      )}

      {/* Weekly Completion Rate */}
      <Card variant="bordered" className="p-5">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="text-[15px] font-medium text-text-primary">
              Weekly Completion Rate
            </h3>
            <p className="text-[12px] text-text-tertiary">
              Last 7 days performance
            </p>
          </div>
          <div className="flex bg-bg-muted rounded-lg p-0.5">
            <button
              onClick={() => setPeriod('week')}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${
                period === 'week'
                  ? 'bg-bg-surface text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${
                period === 'month'
                  ? 'bg-bg-surface text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Month
            </button>
          </div>
        </div>

        <div className="h-48 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.weeklyData} barCategoryGap="20%">
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                cursor={false}
                contentStyle={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  padding: '8px 12px',
                }}
                formatter={(value: unknown) => [`${value}%`, 'Completion']}
              />
              <Bar dataKey="percentage" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {analytics.weeklyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.percentage >= 80 ? 'var(--accent-sage)' : entry.percentage > 0 ? 'var(--accent-sage)' : 'var(--border-default)'}
                    opacity={entry.percentage >= 80 ? 1 : entry.percentage > 0 ? 0.5 : 0.3}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Monthly Heatmap */}
      <Card variant="bordered" className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-medium text-text-primary">
            Monthly Heatmap
          </h3>
          <span className="text-[13px] text-text-muted">
            {format(new Date(), 'MMMM yyyy')}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div key={i} className="text-[10px] font-medium text-text-muted text-center">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {heatmapGrid.map((cell, i) => (
            <div
              key={i}
              className={`aspect-square rounded-md ${
                cell ? getHeatmapColor(cell.percentage) : 'invisible'
              }`}
              title={cell ? `${cell.date}: ${cell.percentage}%` : undefined}
            />
          ))}
        </div>

        <div className="flex items-center gap-1.5 mt-3 text-[10px] text-text-muted">
          <span>Less active</span>
          <div className="w-3 h-3 rounded bg-bg-muted" />
          <div className="w-3 h-3 rounded bg-sage/20" />
          <div className="w-3 h-3 rounded bg-sage/40" />
          <div className="w-3 h-3 rounded bg-sage/70" />
          <div className="w-3 h-3 rounded bg-sage" />
          <span>Highly active</span>
        </div>
      </Card>

      {/* Habit Performance Breakdown */}
      <Card variant="bordered" className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-medium text-text-primary">
            Habit Performance Breakdown
          </h3>
          <Filter size={16} className="text-text-muted" />
        </div>

        <div className="space-y-4">
          {analytics.habitPerformance.map(habit => (
            <div key={habit.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sage-muted flex items-center justify-center text-sm flex-shrink-0">
                {habit.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[14px] font-medium text-text-primary truncate">
                    {habit.name}
                  </p>
                  <span className={`text-[14px] font-semibold ${
                    habit.percentage >= 90 ? 'text-sage' : habit.percentage >= 70 ? 'text-streak' : 'text-text-secondary'
                  }`}>
                    {habit.percentage}%
                  </span>
                </div>
                <ProgressBar
                  value={habit.percentage}
                  variant={habit.percentage >= 90 ? 'sage' : 'dark'}
                  size="sm"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Insight of the Week */}
      <Card variant="bordered" className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-streak-light flex items-center justify-center flex-shrink-0">
            <Lightbulb size={16} className="text-streak" />
          </div>
          <div>
            <p className="text-[14px] font-medium text-sage">
              Insight of the Week
            </p>
            <p className="text-[13px] text-text-secondary mt-1 leading-relaxed">
              {analytics.insight}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
