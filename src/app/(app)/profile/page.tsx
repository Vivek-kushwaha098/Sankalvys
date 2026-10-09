'use client';

import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { User, Flame, CheckCircle, Clock, Volume2, Smartphone, Save } from 'lucide-react';
import { useApp } from '@/lib/context';
import { Card, Input, Toggle, Button, Toast } from '@/components/ui';
import { updateUser as storeUpdateUser } from '@/lib/store';

export default function ProfilePage() {
  const { user, settings, updateSettings, habits, getOverallStreak, refreshKey } = useApp();
  const [sanctuaryName, setSanctuaryName] = useState(user?.name || '');
  const [nudgeTime, setNudgeTime] = useState(settings.motivationNudgeTime || '07:00');
  const [toast, setToast] = useState({ visible: false, message: '' });

  const overallStreak = getOverallStreak();
  const totalCompletions = habits.length; // Simplification
  const memberSince = user?.createdAt
    ? format(parseISO(user.createdAt), 'MMMM yyyy')
    : 'Unknown';

  const handleSaveProfile = () => {
    if (sanctuaryName.trim() && user) {
      storeUpdateUser({ name: sanctuaryName.trim() });
    }
    updateSettings({ motivationNudgeTime: nudgeTime });
    setToast({ visible: true, message: 'Settings saved 🌿' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Header */}
      <Card variant="bordered" className="p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-bg-dark flex items-center justify-center mx-auto mb-4">
          <User size={32} className="text-text-inverse" />
        </div>
        <h1 className="text-[22px] font-semibold text-text-primary">
          {user?.name}
        </h1>
        <p className="text-[13px] text-text-muted mt-1">
          Sanctuary keeper since {memberSince}
        </p>

        {!settings.zenMode && (
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center">
                <Flame size={14} className="text-streak" />
                <span className="text-[18px] font-semibold text-text-primary">
                  {overallStreak}
                </span>
              </div>
              <p className="text-[11px] text-text-muted mt-0.5">Current Streak</p>
            </div>
            <div className="w-px h-8 bg-border-default" />
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center">
                <CheckCircle size={14} className="text-sage" />
                <span className="text-[18px] font-semibold text-text-primary">
                  {habits.length}
                </span>
              </div>
              <p className="text-[11px] text-text-muted mt-0.5">Active Habits</p>
            </div>
          </div>
        )}
      </Card>

      {/* Sanctuary Identity */}
      <Card variant="bordered" className="p-5">
        <h2 className="text-[15px] font-medium text-text-primary mb-1">
          Personal Sanctuary Identity
        </h2>
        <p className="text-[12px] text-text-muted mb-4 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-sage" /> Synced
        </p>

        <div className="space-y-4">
          <Input
            label="Sanctuary Name"
            value={sanctuaryName}
            onChange={(e) => setSanctuaryName(e.target.value)}
          />
          <Input
            label="Sanctuary Email"
            value={user?.email || ''}
            disabled
          />
        </div>
      </Card>

      {/* Motivation Nudge */}
      <Card variant="bordered" className="p-5">
        <h2 className="text-[15px] font-medium text-text-primary mb-1">
          Daily Motivation Nudge
        </h2>
        <p className="text-[13px] text-text-tertiary mb-4 leading-relaxed">
          Receive gentle morning reflections and habit reminders tailored to your rhythm.
        </p>

        <div className="flex items-center gap-3">
          <Clock size={16} className="text-text-muted" />
          <input
            type="time"
            value={nudgeTime}
            onChange={(e) => setNudgeTime(e.target.value)}
            className="h-10 px-3 text-[14px] text-text-primary bg-bg-surface border border-border-default rounded-lg focus:outline-none focus:border-sage"
          />
        </div>
      </Card>

      {/* Sanctuary Environment */}
      <Card variant="bordered" className="p-5">
        <h2 className="text-[15px] font-medium text-text-primary mb-4">
          Sanctuary Environment
        </h2>

        <div className="space-y-5">
          <Toggle
            checked={settings.ambientSoundscapes}
            onChange={(checked) => updateSettings({ ambientSoundscapes: checked })}
            label="Ambient Soundscapes"
            description="Subtle background audio for focus."
          />
          <Toggle
            checked={settings.tactileHaptics}
            onChange={(checked) => updateSettings({ tactileHaptics: checked })}
            label="Tactile Haptics"
            description="Gentle vibration feedback on completions."
          />
        </div>
      </Card>

      {/* Save Button */}
      <Button
        variant="primary"
        className="w-full"
        size="lg"
        icon={<Save size={16} />}
        onClick={handleSaveProfile}
      >
        Save Sanctuary Settings
      </Button>

      <Toast
        message={toast.message}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </div>
  );
}
