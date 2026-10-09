'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Palette,
  Bell,
  Database,
  Info,
  Moon,
  Eye,
  Download,
  Upload,
  LogOut,
  ChevronRight,
  User,
} from 'lucide-react';
import { useApp } from '@/lib/context';
import { Card, Toggle, Button, Toast } from '@/components/ui';

export default function SettingsPage() {
  const { user, settings, updateSettings, exportData, importData, logout } = useApp();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'info' });

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sankalvys-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ visible: true, message: 'Data exported successfully', type: 'success' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      const success = importData(json);
      setToast({
        visible: true,
        message: success ? 'Data imported successfully' : 'Failed to import data',
        type: success ? 'success' : 'error',
      });
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSignOut = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-semibold text-text-primary">
          Preferences & Settings
        </h1>
        <p className="text-[14px] text-text-tertiary mt-1">
          Tailor your habit tracking experience to fit your daily flow.
        </p>
      </div>

      {/* Appearance & Theme */}
      <Card variant="bordered" className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Palette size={18} className="text-text-secondary" />
          <h2 className="text-[15px] font-medium text-text-primary">
            Appearance & Theme
          </h2>
        </div>
        <p className="text-[13px] text-text-tertiary mb-4">
          Customize how Sankalvys looks on your device.
        </p>

        <div className="space-y-5">
          <Toggle
            checked={settings.darkMode}
            onChange={(checked) => updateSettings({ darkMode: checked })}
            label="Dark Mode"
            description="Easier on the eyes during evening reviews."
          />
          <Toggle
            checked={settings.zenMode}
            onChange={(checked) => updateSettings({ zenMode: checked })}
            label="Zen Minimalist Mode"
            description="Hide streaks and stats for a completely pressure-free view."
          />
        </div>
      </Card>

      {/* Notifications */}
      <Card variant="bordered" className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={18} className="text-text-secondary" />
          <h2 className="text-[15px] font-medium text-text-primary">
            Notifications
          </h2>
        </div>
        <p className="text-[13px] text-text-tertiary mb-4">
          Gentle nudges to keep your momentum going.
        </p>

        <div className="space-y-5">
          <Toggle
            checked={settings.dailyMorningBrief}
            onChange={(checked) => updateSettings({ dailyMorningBrief: checked })}
            label="Daily Morning Brief"
            description={`A quick overview of today's intentions at ${settings.morningBriefTime === '08:00' ? '8:00 AM' : settings.morningBriefTime}.`}
          />
          <Toggle
            checked={settings.eveningReflection}
            onChange={(checked) => updateSettings({ eveningReflection: checked })}
            label="Evening Reflection"
            description={`A peaceful reminder to close open loops at ${settings.eveningReflectionTime === '21:00' ? '9:00 PM' : settings.eveningReflectionTime}.`}
          />
        </div>
      </Card>

      {/* Account & Data */}
      <Card variant="bordered" className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Database size={18} className="text-text-secondary" />
          <h2 className="text-[15px] font-medium text-text-primary">
            Account & Data
          </h2>
        </div>
        <p className="text-[13px] text-text-tertiary mb-4">
          Manage your profile information and local data.
        </p>

        {/* Profile Card */}
        <div className="flex items-center gap-3 p-3 bg-bg-muted rounded-xl mb-4">
          <div className="w-10 h-10 rounded-full bg-bg-dark flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-text-inverse" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium text-text-primary truncate">
              {user?.name}
            </p>
            <p className="text-[12px] text-text-muted truncate">
              {user?.email}
            </p>
          </div>
          <button
            onClick={() => router.push('/profile')}
            className="text-[13px] text-text-secondary hover:text-text-primary transition-colors"
          >
            Edit
          </button>
        </div>

        {/* Export/Import */}
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border-default rounded-xl text-[13px] font-medium text-text-secondary hover:bg-bg-hover transition-colors"
          >
            <Download size={14} /> Export Data
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border-default rounded-xl text-[13px] font-medium text-text-secondary hover:bg-bg-hover transition-colors"
          >
            <Upload size={14} /> Import Backup
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </Card>

      {/* About */}
      <Card variant="bordered" className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Info size={18} className="text-text-secondary" />
          <h2 className="text-[15px] font-medium text-text-primary">
            About Sankalvys
          </h2>
        </div>
        <p className="text-[13px] text-text-muted mb-4">
          Version 2.4.0 (Zen Edition)
        </p>

        <div className="space-y-1">
          <button className="w-full flex items-center justify-between py-3 text-[14px] text-text-secondary hover:text-text-primary transition-colors">
            Philosophy & Guide
            <ChevronRight size={16} className="text-text-muted" />
          </button>
          <button className="w-full flex items-center justify-between py-3 text-[14px] text-text-secondary hover:text-text-primary transition-colors">
            Privacy Policy
            <ChevronRight size={16} className="text-text-muted" />
          </button>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 mt-2 text-[14px] text-error font-medium hover:opacity-80 transition-opacity"
        >
          <LogOut size={14} />
          Sign Out
        </button>
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
