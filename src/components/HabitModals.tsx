'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { Modal, Input, Textarea, Select, Button, Toggle } from '@/components/ui';
import { HabitCategory, HabitFrequency, TimeOfDay } from '@/lib/types';
import { categoryIcons } from '@/lib/constants';

// ========================================
// NEW HABIT MODAL
// ========================================

interface NewHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingId?: string | null;
  defaultRoutineId?: string | null;
}

const categoryOptions = [
  'Health', 'Mind', 'Growth', 'Fitness', 'Learning', 'Career', 'Finance', 'Personal',
].map(c => ({ value: c, label: `${categoryIcons[c] || '✨'} ${c}` }));

const frequencyOptions = [
  { value: 'daily', label: 'Every day' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'custom', label: 'Custom days' },
];

const timeOfDayOptions = [
  { value: 'Morning', label: '🌅 Morning' },
  { value: 'Afternoon', label: '☀️ Afternoon' },
  { value: 'Evening', label: '🌙 Evening' },
  { value: 'Custom', label: '⚙️ Custom' },
];

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function NewHabitModal({ isOpen, onClose, editingId, defaultRoutineId }: NewHabitModalProps) {
  const { createHabit, updateHabit, habits, routines } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('Personal');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [customDays, setCustomDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [time, setTime] = useState('09:00');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('Morning');
  const [reminder, setReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [goal, setGoal] = useState('');
  const [notes, setNotes] = useState('');
  const [routineId, setRoutineId] = useState<string>(defaultRoutineId || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing habit for editing
  useEffect(() => {
    if (editingId) {
      const habit = habits.find(h => h.id === editingId);
      if (habit) {
        setName(habit.name);
        setDescription(habit.description);
        setCategory(habit.category);
        setFrequency(habit.frequency);
        setCustomDays(habit.customDays);
        setTime(habit.time);
        setTimeOfDay(habit.timeOfDay);
        setReminder(habit.reminder);
        setReminderTime(habit.reminderTime);
        setGoal(habit.goal);
        setNotes(habit.notes);
        setRoutineId(habit.routineId || '');
      }
    } else {
      resetForm();
    }
  }, [editingId, habits, isOpen]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory('Personal');
    setFrequency('daily');
    setCustomDays([1, 2, 3, 4, 5]);
    setTime('09:00');
    setTimeOfDay('Morning');
    setReminder(false);
    setReminderTime('09:00');
    setGoal('');
    setNotes('');
    setRoutineId(defaultRoutineId || '');
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Habit name is required';
    if (name.trim().length > 100) newErrors.name = 'Name must be 100 characters or less';
    if (frequency === 'custom' && customDays.length === 0) {
      newErrors.customDays = 'Select at least one day';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const icon = categoryIcons[category] || '✨';

    if (editingId) {
      updateHabit(editingId, {
        name: name.trim(),
        description: description.trim(),
        category,
        icon,
        frequency,
        customDays,
        time,
        timeOfDay,
        reminder,
        reminderTime: reminder ? reminderTime : '',
        goal: goal.trim(),
        notes: notes.trim(),
        routineId: routineId || null,
      });
    } else {
      createHabit({
        name: name.trim(),
        description: description.trim(),
        category,
        icon,
        color: '#4B7C59',
        frequency,
        customDays,
        time,
        timeOfDay,
        reminder,
        reminderTime: reminder ? reminderTime : '',
        startDate: new Date().toISOString().split('T')[0],
        goal: goal.trim(),
        notes: notes.trim(),
        routineId: routineId || null,
      });
    }

    resetForm();
    onClose();
  };

  const toggleDay = (day: number) => {
    setCustomDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const routineOptions = [
    { value: '', label: 'No routine' },
    ...routines.map(r => ({ value: r.id, label: `${r.icon} ${r.name}` })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingId ? 'Edit Habit' : 'New Habit'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Habit Name"
          placeholder="e.g., Morning Meditation"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          autoFocus
        />

        <Textarea
          label="Description"
          placeholder="Brief description of your habit..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Category"
            options={categoryOptions}
            value={category}
            onChange={(e) => setCategory(e.target.value as HabitCategory)}
          />
          <Select
            label="Time of Day"
            options={timeOfDayOptions}
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Frequency"
            options={frequencyOptions}
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
          />
          <Input
            label="Time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        {frequency === 'custom' && (
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-2">
              Days
            </label>
            <div className="flex gap-1.5">
              {dayNames.map((day, i) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`w-10 h-10 rounded-lg text-[12px] font-medium transition-colors ${
                    customDays.includes(i)
                      ? 'bg-sage text-white'
                      : 'bg-bg-muted text-text-secondary hover:bg-bg-hover'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            {errors.customDays && (
              <p className="text-[12px] text-error mt-1">{errors.customDays}</p>
            )}
          </div>
        )}

        <Select
          label="Routine"
          options={routineOptions}
          value={routineId}
          onChange={(e) => setRoutineId(e.target.value)}
        />

        <Input
          label="Goal"
          placeholder="What do you want to achieve?"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />

        <div className="border-t border-border-subtle pt-4">
          <Toggle
            checked={reminder}
            onChange={setReminder}
            label="Reminder"
            description="Get notified when it's time for this habit"
          />
          {reminder && (
            <div className="mt-3">
              <Input
                label="Reminder Time"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
              />
            </div>
          )}
        </div>

        <Textarea
          label="Notes"
          placeholder="Any additional notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="sage" className="flex-1" type="submit">
            {editingId ? 'Save Changes' : 'Create Habit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ========================================
// NEW ROUTINE MODAL
// ========================================

interface NewRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingId?: string | null;
}

export function NewRoutineModal({ isOpen, onClose, editingId }: NewRoutineModalProps) {
  const { createRoutine, updateRoutine, routines } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📋');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('Morning');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const icons = ['💚', '🧠', '💼', '🏃', '📖', '🎯', '🌱', '✨', '🎨', '💪', '🧘', '📋'];

  useEffect(() => {
    if (editingId) {
      const routine = routines.find(r => r.id === editingId);
      if (routine) {
        setName(routine.name);
        setDescription(routine.description);
        setIcon(routine.icon);
        setTimeOfDay(routine.timeOfDay);
      }
    } else {
      setName('');
      setDescription('');
      setIcon('📋');
      setTimeOfDay('Morning');
      setErrors({});
    }
  }, [editingId, routines, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Routine name is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (editingId) {
      updateRoutine(editingId, {
        name: name.trim(),
        description: description.trim(),
        icon,
        timeOfDay,
      });
    } else {
      createRoutine({
        name: name.trim(),
        description: description.trim(),
        icon,
        color: '#4B7C59',
        timeOfDay,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingId ? 'Edit Routine' : 'New Routine'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Routine Name"
          placeholder="e.g., Health & Vitality"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          autoFocus
        />

        <Textarea
          label="Description"
          placeholder="What is this routine about?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />

        <div>
          <label className="block text-[13px] font-medium text-text-secondary mb-2">
            Icon
          </label>
          <div className="flex flex-wrap gap-2">
            {icons.map(ic => (
              <button
                key={ic}
                type="button"
                onClick={() => setIcon(ic)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-colors ${
                  icon === ic
                    ? 'bg-sage-muted ring-2 ring-sage'
                    : 'bg-bg-muted hover:bg-bg-hover'
                }`}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        <Select
          label="Time of Day"
          options={timeOfDayOptions}
          value={timeOfDay}
          onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
        />

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="sage" className="flex-1" type="submit">
            {editingId ? 'Save Changes' : 'Create Routine'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
