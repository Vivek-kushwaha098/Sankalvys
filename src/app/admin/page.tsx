'use client';

import React, { useMemo } from 'react';
import { Users, CheckSquare, TrendingUp, BarChart3, Activity, Target } from 'lucide-react';
import { useApp } from '@/lib/context';
import { Card, Badge, ProgressBar } from '@/components/ui';
import { AppLayout } from '@/components/Navigation';

export default function AdminDashboard() {
  const { user, habits, getAnalytics, refreshKey } = useApp();

  // Check admin access
  if (user?.role !== 'admin') {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h1 className="text-xl font-semibold text-text-primary mb-2">Access Restricted</h1>
          <p className="text-[14px] text-text-tertiary">
            This area is reserved for Sankalvys administrators.
          </p>
        </div>
      </AppLayout>
    );
  }

  const analytics = useMemo(() => getAnalytics(), [refreshKey, getAnalytics]);

  const stats = [
    {
      label: 'Total Users',
      value: '1',
      icon: Users,
      change: '+1 this week',
      color: 'text-sage',
    },
    {
      label: 'Active Habits',
      value: habits.length.toString(),
      icon: CheckSquare,
      change: `${habits.filter(h => h.isActive).length} active`,
      color: 'text-sage',
    },
    {
      label: 'Completion Rate',
      value: `${analytics.consistency}%`,
      icon: TrendingUp,
      change: 'Last 30 days',
      color: 'text-streak',
    },
    {
      label: 'Best Streak',
      value: `${analytics.bestStreak}d`,
      icon: Activity,
      change: analytics.bestStreakHabit || 'N/A',
      color: 'text-streak',
    },
  ];

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    habits.forEach(h => {
      counts[h.category] = (counts[h.category] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }, [habits]);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] font-semibold text-text-primary">
              Admin Dashboard
            </h1>
            <Badge variant="sage">Admin</Badge>
          </div>
          <p className="text-[14px] text-text-tertiary mt-1">
            Overview of Sankalvys platform metrics.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} variant="bordered" className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon size={14} className={stat.color} />
                  <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wide">
                    {stat.label}
                  </span>
                </div>
                <p className="text-[24px] font-semibold text-text-primary">
                  {stat.value}
                </p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  {stat.change}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Category Breakdown */}
        <Card variant="bordered" className="p-5">
          <h3 className="text-[15px] font-medium text-text-primary mb-4">
            Category Breakdown
          </h3>
          <div className="space-y-3">
            {categoryBreakdown.map(item => (
              <div key={item.category} className="flex items-center justify-between">
                <span className="text-[14px] text-text-secondary">{item.category}</span>
                <div className="flex items-center gap-3 w-1/2">
                  <div className="flex-1">
                    <ProgressBar
                      value={item.count}
                      max={habits.length}
                      variant="sage"
                      size="sm"
                    />
                  </div>
                  <span className="text-[13px] font-medium text-text-primary w-6 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Habit Performance */}
        <Card variant="bordered" className="p-5">
          <h3 className="text-[15px] font-medium text-text-primary mb-4">
            Top Performing Habits
          </h3>
          <div className="space-y-3">
            {analytics.habitPerformance.slice(0, 5).map((habit, i) => (
              <div key={habit.id} className="flex items-center gap-3">
                <span className="text-[12px] font-medium text-text-muted w-4">
                  {i + 1}
                </span>
                <span className="text-[14px] text-text-primary flex-1 truncate">
                  {habit.name}
                </span>
                <Badge variant={habit.percentage >= 90 ? 'sage' : 'muted'}>
                  {habit.percentage}%
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
