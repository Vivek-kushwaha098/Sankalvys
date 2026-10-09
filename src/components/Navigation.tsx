'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  CheckSquare,
  Calendar,
  BarChart3,
  Settings,
  Moon,
  Sun,
  User,
} from 'lucide-react';
import { useApp } from '@/lib/context';

const navItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/habits', label: 'Habits', icon: CheckSquare },
  { href: '/tracker', label: 'Tracker', icon: Calendar },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const pageNames: Record<string, string> = {
  '/home': 'Home',
  '/habits': 'Habits',
  '/tracker': 'Tracker',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
  '/profile': 'Profile',
  '/admin': 'Admin',
};

export function TopNav() {
  const pathname = usePathname();
  const { settings, updateSettings, user } = useApp();
  const pageName = pageNames[pathname] || 'Home';

  return (
    <header className="sticky top-0 z-40 bg-bg-surface/95 backdrop-blur-sm border-b border-border-default">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-text-primary text-[15px] tracking-tight">
            Sankalvys
          </span>
          <span className="text-text-muted text-[15px]">·</span>
          <span className="text-text-secondary text-[15px]">{pageName}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateSettings({ darkMode: !settings.darkMode })}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-bg-hover transition-colors"
            aria-label="Toggle theme"
          >
            {settings.darkMode ? (
              <Sun size={18} className="text-text-secondary" />
            ) : (
              <Moon size={18} className="text-text-secondary" />
            )}
          </button>
          <Link
            href="/profile"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-bg-dark text-text-inverse hover:opacity-90 transition-opacity"
            aria-label="Profile"
          >
            <User size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-bg-surface/95 backdrop-blur-sm border-t border-border-default lg:hidden">
      <div className="flex items-center justify-around h-[72px] max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all min-w-[60px] ${
                isActive
                  ? 'text-sage bg-sage-muted'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
              <span className={`text-[11px] ${isActive ? 'font-medium' : 'font-normal'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-60 border-r border-border-default bg-bg-surface h-screen sticky top-0">
      <div className="p-6 border-b border-border-default">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sage-muted flex items-center justify-center">
            <span className="text-sage text-lg">🌿</span>
          </div>
          <span className="font-semibold text-text-primary text-lg tracking-tight">
            Sankalvys
          </span>
        </div>
      </div>
      <nav className="flex-1 py-4 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all text-[15px] ${
                isActive
                  ? 'bg-sage-muted text-sage font-medium'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border-default">
        <Link
          href="/profile"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-bg-hover transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-bg-dark flex items-center justify-center">
            <User size={14} className="text-text-inverse" />
          </div>
          <span className="text-sm">Profile</span>
        </Link>
      </div>
    </aside>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg-base">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <div className="lg:hidden">
          <TopNav />
        </div>
        <main className="flex-1 pb-24 lg:pb-8">
          <div className="max-w-2xl lg:max-w-3xl mx-auto px-4 py-6">
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
