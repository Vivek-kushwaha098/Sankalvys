'use client';

import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Plus, Flame, Clock, MoreVertical, Edit2, Trash2, CheckSquare } from 'lucide-react';
import { useApp } from '@/lib/context';
import { Card, Checkbox, Badge, Tabs, Button, Toast, ConfirmDialog, EmptyState } from '@/components/ui';
import { NewHabitModal, NewRoutineModal } from '@/components/HabitModals';

export default function HabitsPage() {
  const {
    settings,
    toggleHabitCompletion,
    getRoutinesWithHabits,
    deleteHabit,
    refreshKey,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState('All Routines');
  const [showNewHabit, setShowNewHabit] = useState(false);
  const [showNewRoutine, setShowNewRoutine] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'info' });

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayFormatted = format(new Date(), 'EEEE, MMMM d');

  const filters = ['All Routines', 'Morning', 'Afternoon', 'Evening', 'Custom'];

  const routinesWithHabits = useMemo(
    () => getRoutinesWithHabits(today, activeFilter),
    [today, activeFilter, refreshKey, getRoutinesWithHabits]
  );

  const handleToggle = (habitId: string) => {
    const completed = toggleHabitCompletion(habitId, today);
    setToast({
      visible: true,
      message: completed ? 'Habit completed! 🌿' : 'Marked as incomplete',
      type: 'success',
    });
  };

  const handleDelete = (habitId: string) => {
    deleteHabit(habitId);
    setDeleteConfirm(null);
    setToast({ visible: true, message: 'Habit removed', type: 'info' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] text-text-tertiary">{todayFormatted}</p>
          <h1 className="text-[22px] font-semibold text-text-primary mt-0.5">
            Daily Momentum
          </h1>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={14} />}
          onClick={() => setShowNewRoutine(true)}
          className="rounded-xl"
        >
          New Routine
        </Button>
      </div>

      {/* Filter Tabs */}
      <Tabs tabs={filters} activeTab={activeFilter} onChange={setActiveFilter} />

      {/* Routine Groups */}
      {routinesWithHabits.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={40} strokeWidth={1} />}
          title="No habits yet"
          description="Start with one small intention. Create a routine to organize your habits."
          action={
            <Button variant="sage" onClick={() => setShowNewHabit(true)} icon={<Plus size={16} />}>
              Create First Habit
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {routinesWithHabits.map((routine) => (
            <div key={routine.id} className="space-y-2">
              {/* Routine Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{routine.icon}</span>
                  <div>
                    <h3 className="text-[15px] font-medium text-text-primary">
                      {routine.name}
                    </h3>
                    <p className="text-[12px] text-text-tertiary">
                      {routine.completedCount} of {routine.totalCount} completed today
                    </p>
                  </div>
                </div>
                {!settings.zenMode && (
                  <Badge variant={routine.percentage === 100 ? 'sage' : 'muted'}>
                    {routine.percentage}%
                  </Badge>
                )}
              </div>

              {/* Habit Items */}
              <div className="space-y-1.5">
                {routine.habits.map((habit) => (
                  <Card key={habit.id} variant="bordered" className="p-3.5 relative">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={habit.isCompleted}
                        onChange={() => handleToggle(habit.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-[14px] font-medium truncate ${
                          habit.isCompleted
                            ? 'text-text-muted line-through'
                            : 'text-text-primary'
                        }`}>
                          {habit.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[12px] text-text-tertiary flex items-center gap-1">
                            <Clock size={10} />
                            {habit.time ? format(new Date(`2000-01-01T${habit.time}`), 'h:mm a') : '--'}
                          </span>
                          {!settings.zenMode && habit.streak.currentStreak > 0 && (
                            <span className="text-[12px] text-streak font-medium flex items-center gap-0.5">
                              <Flame size={10} />
                              {habit.streak.currentStreak} days
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Context Menu */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(menuOpen === habit.id ? null : habit.id);
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-hover transition-colors"
                          aria-label="More options"
                        >
                          <MoreVertical size={16} className="text-text-muted" />
                        </button>

                        {menuOpen === habit.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setMenuOpen(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 z-20 bg-bg-surface border border-border-default rounded-xl shadow-dropdown py-1 min-w-[140px] animate-scale-in">
                              <button
                                onClick={() => {
                                  setEditingHabitId(habit.id);
                                  setShowNewHabit(true);
                                  setMenuOpen(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-text-secondary hover:bg-bg-hover transition-colors"
                              >
                                <Edit2 size={14} /> Edit
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteConfirm(habit.id);
                                  setMenuOpen(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-error hover:bg-bg-hover transition-colors"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {/* Add Habit Button */}
          <button
            onClick={() => setShowNewHabit(true)}
            className="w-full py-3 border border-dashed border-border-default rounded-xl text-[14px] text-text-muted hover:text-text-secondary hover:border-border-strong transition-colors"
          >
            + Add new habit
          </button>
        </div>
      )}

      {/* Modals */}
      <NewHabitModal
        isOpen={showNewHabit}
        onClose={() => { setShowNewHabit(false); setEditingHabitId(null); }}
        editingId={editingHabitId}
      />

      <NewRoutineModal
        isOpen={showNewRoutine}
        onClose={() => setShowNewRoutine(false)}
      />

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Remove Habit"
        message="This will permanently remove this habit and all its completion history. This cannot be undone."
        confirmText="Remove"
        variant="danger"
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </div>
  );
}
