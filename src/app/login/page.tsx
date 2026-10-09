'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Moon, Sun, User, ArrowRight, Loader2 } from 'lucide-react';
import { useApp } from '@/lib/context';
import { getDailyQuote } from '@/lib/constants';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'email' | 'name' | 'loading' | 'success'>('email');
  const [error, setError] = useState('');
  const { login, settings, updateSettings } = useApp();
  const router = useRouter();
  const quote = getDailyQuote();

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setStep('name');
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    setStep('loading');

    setTimeout(() => {
      login(name.trim(), email.trim());
      setStep('success');
      setTimeout(() => {
        router.push('/home');
      }, 800);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-bg-hover transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={18} className="text-text-secondary" />
          </button>
          <span className="text-[15px] text-text-primary">
            <span className="font-semibold">Sankalvys</span>
            <span className="text-text-muted"> · Login</span>
          </span>
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
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-bg-dark">
            <User size={16} className="text-text-inverse" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-6 pt-12 pb-8 max-w-md mx-auto w-full">
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl bg-sage-muted flex items-center justify-center mb-6 animate-fade-in">
          <span className="text-3xl">🌿</span>
        </div>

        {/* Brand */}
        <h1 className="text-[28px] font-semibold text-text-primary tracking-tight mb-2 animate-fade-in">
          Sankalvys
        </h1>
        <p className="text-[15px] text-text-tertiary text-center mb-10 max-w-xs animate-fade-in">
          Your daily sanctuary for intentional habits and calm momentum.
        </p>

        {/* Auth Card */}
        <div className="w-full bg-bg-surface border border-border-subtle rounded-2xl p-6 animate-fade-in-up">
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <p className="text-[15px] font-medium text-text-primary">
                Continue with Email
              </p>

              <div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full h-12 px-4 text-[15px] text-text-primary bg-bg-muted border border-border-subtle rounded-xl placeholder:text-text-muted focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-colors"
                  autoFocus
                  autoComplete="email"
                  aria-label="Email address"
                />
                {error && (
                  <p className="text-[12px] text-error mt-1.5">{error}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-bg-dark text-text-inverse font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-[15px] active:scale-[0.98]"
              >
                Enter Sanctuary
                <ArrowRight size={16} />
              </button>

              <p className="text-[13px] text-text-muted text-center">
                Secure, passwordless entry
              </p>
            </form>
          )}

          {step === 'name' && (
            <form onSubmit={handleNameSubmit} className="space-y-4 animate-fade-in">
              <p className="text-[15px] font-medium text-text-primary">
                What should we call you?
              </p>

              <div>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  className="w-full h-12 px-4 text-[15px] text-text-primary bg-bg-muted border border-border-subtle rounded-xl placeholder:text-text-muted focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-colors"
                  autoFocus
                  autoComplete="name"
                  aria-label="Your name"
                />
                {error && (
                  <p className="text-[12px] text-error mt-1.5">{error}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-bg-dark text-text-inverse font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-[15px] active:scale-[0.98]"
              >
                Begin Your Journey
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {step === 'loading' && (
            <div className="flex flex-col items-center py-8 animate-fade-in">
              <Loader2 size={32} className="text-sage animate-spin mb-4" />
              <p className="text-[15px] text-text-secondary">
                Preparing your sanctuary...
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center py-8 animate-scale-in">
              <div className="w-12 h-12 rounded-full bg-sage-muted flex items-center justify-center mb-4">
                <span className="text-sage text-xl">✓</span>
              </div>
              <p className="text-[15px] font-medium text-text-primary">
                Welcome, {name}
              </p>
              <p className="text-[13px] text-text-tertiary mt-1">
                Redirecting to your sanctuary...
              </p>
            </div>
          )}
        </div>

        {/* Daily Quote */}
        <div className="w-full mt-8 bg-bg-surface border border-border-subtle rounded-2xl p-5 animate-fade-in-up">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-sage-muted flex items-center justify-center flex-shrink-0">
              <span className="text-sage text-xs">·</span>
            </div>
            <div>
              <p className="text-[14px] text-text-secondary italic leading-relaxed">
                &ldquo;{quote.length > 60 ? quote.substring(0, 60) + '...' : quote}&rdquo;
              </p>
              <p className="text-[12px] text-text-muted mt-1">
                Daily Reflection
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
