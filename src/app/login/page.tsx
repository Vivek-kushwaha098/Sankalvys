'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  Shield,
  Moon,
  Sun,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '@/lib/context';
import { getDailyQuote } from '@/lib/constants';
import Link from 'next/link';
import { auth } from '@/lib/firebaseConfig';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

type LoginMethod = 'email' | 'phone';
type Step = 'identify' | 'otp' | 'loading' | 'success';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function LoginPage() {
  const [detectedMethod, setDetectedMethod] = useState<LoginMethod | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [step, setStep] = useState<Step>('identify');
  const [error, setError] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { login, settings, updateSettings } = useApp();
  const router = useRouter();
  const quote = getDailyQuote();

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const validatePhone = (p: string) => /^[+]?[\d\s\-()]{7,15}$/.test(p);

  // OTP Timer
  useEffect(() => {
    if (step !== 'otp') return;
    if (otpTimer <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setOtpTimer(t => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, otpTimer]);

  const handleIdentifierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const val = identifier.trim();
    if (!val) {
      setError('Please enter your email address or phone number');
      return;
    }

    let method: LoginMethod = 'phone';
    if (val.includes('@') || /[a-zA-Z]/.test(val)) {
      method = 'email';
    }

    if (method === 'email' && !validateEmail(val)) {
      setError('Please enter a valid email address');
      return;
    }

    if (method === 'phone' && !validatePhone(val)) {
      setError('Please enter a valid phone number (e.g., +1234567890)');
      return;
    }

    setDetectedMethod(method);

    if (method === 'phone') {
      if (!auth) {
        setError('Firebase is not configured. Please add your API key to .env.local');
        return;
      }

      try {
        if (!(window as any).recaptchaVerifier) {
          (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
          });
        }
        const confirmation = await signInWithPhoneNumber(auth, val, (window as any).recaptchaVerifier);
        setConfirmationResult(confirmation);
        
        setOtpTimer(30);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        setStep('otp');
      } catch (err: any) {
        console.error("Error sending OTP:", err);
        setError(err.message || 'Failed to send OTP. Ensure the number includes the country code.');
      }
    } else {
      // Mock email verification
      const newOtp = generateOTP();
      setGeneratedOtp(newOtp);
      setOtpTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setStep('otp');
      console.log(`[Sankalvys] Mock Email OTP is: ${newOtp}`);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, 6);
      const newOtp = [...otp];
      digits.split('').forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      otpRefs.current[nextIndex]?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = useCallback(async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    if (detectedMethod === 'phone' && confirmationResult) {
      try {
        await confirmationResult.confirm(enteredOtp);
        setError('');
      } catch (err: any) {
        setError('Invalid verification code. Please try again.');
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
        return;
      }
    } else {
      // Mock email verification
      if (enteredOtp !== generatedOtp) {
        setError('Invalid verification code. Please try again.');
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
        return;
      }
    }

    setStep('loading');
    setTimeout(() => {
      // Login with the identifier (simulate finding existing user)
      const displayName = detectedMethod === 'email'
        ? identifier.split('@')[0].charAt(0).toUpperCase() + identifier.split('@')[0].slice(1)
        : 'User';
      login(displayName, detectedMethod === 'email' ? identifier : '', detectedMethod === 'phone' ? identifier : '');
      setStep('success');
      setTimeout(() => {
        router.push('/home');
      }, 1000);
    }, 1200);
  }, [otp, generatedOtp, detectedMethod, identifier, login, router]);

  // Auto-verify when all 6 digits are entered
  useEffect(() => {
    if (step === 'otp' && otp.every(d => d !== '')) {
      handleVerifyOtp();
    }
  }, [otp, step, handleVerifyOtp]);

  const handleResendOtp = () => {
    const newOtp = generateOTP();
    setGeneratedOtp(newOtp);
    setOtpTimer(30);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    setError('');
    otpRefs.current[0]?.focus();
    console.log(`[Sankalvys] New OTP is: ${newOtp}`);
  };

  const maskedIdentifier = detectedMethod === 'email'
    ? identifier.replace(/(.{2}).+(@.+)/, '$1***$2')
    : identifier.replace(/(.{3}).+(.{2})$/, '$1****$2');

  return (
    <div className="min-h-screen auth-gradient flex flex-col">
      {/* Floating decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-24 left-8 w-3 h-3 rounded-full bg-sage opacity-20" style={{ animation: 'float 6s ease-in-out infinite' }} />
        <div className="absolute top-32 right-16 w-2 h-2 rounded-full bg-streak opacity-20" style={{ animation: 'float 8s ease-in-out infinite 1s' }} />
        <div className="absolute bottom-32 left-1/3 w-4 h-4 rounded-full bg-sage opacity-10" style={{ animation: 'float 7s ease-in-out infinite 2s' }} />
      </div>

      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 h-16 relative z-10">
        <div className="flex items-center gap-3">
          {step === 'otp' ? (
            <button
              onClick={() => { setStep('identify'); setError(''); }}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm">Change {detectedMethod}</span>
            </button>
          ) : (
            <span className="text-[15px] text-text-primary">
              <span className="font-semibold">Sankalvys</span>
              <span className="text-text-muted"> · Sign In</span>
            </span>
          )}
        </div>
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
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-md mx-auto w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-sage-muted flex items-center justify-center mx-auto mb-5 animate-pulse-ring">
            <span className="text-3xl">🌿</span>
          </div>
          <h1 className="text-[28px] font-bold text-text-primary tracking-tight">
            {step === 'identify' && 'Welcome Back'}
            {step === 'otp' && 'Verify Your Identity'}
            {step === 'loading' && 'Signing In...'}
            {step === 'success' && 'Welcome Back!'}
          </h1>
          <p className="text-[15px] text-text-tertiary mt-2 max-w-xs mx-auto">
            {step === 'identify' && 'Sign in to your sanctuary with a secure one-time code'}
            {step === 'otp' && `We sent a 6-digit code to ${maskedIdentifier}`}
            {step === 'loading' && 'Restoring your sanctuary...'}
            {step === 'success' && 'Your sanctuary awaits'}
          </p>
        </div>

        {/* Step 1: Identifier */}
        {step === 'identify' && (
          <div className="w-full space-y-4 animate-slide-in-right">
            <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 shadow-card">
              <form onSubmit={handleIdentifierSubmit} className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-[13px] font-medium text-text-secondary mb-1.5">
                    <Shield size={14} />
                    Email or Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="you@example.com or +1234567890"
                    value={identifier}
                    onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                    className="w-full h-12 px-4 text-[15px] text-text-primary bg-bg-muted border border-border-subtle rounded-xl placeholder:text-text-muted focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-all"
                    autoFocus
                    autoComplete="username"
                  />
                  {error && <p className="text-[12px] text-error mt-1.5">{error}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full h-12 bg-bg-dark text-white font-medium rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 text-[15px] active:scale-[0.98] shadow-card"
                >
                  <Shield size={16} />
                  Send Verification Code
                </button>
                <div id="recaptcha-container"></div>
              </form>

              <div className="flex items-center gap-3 mt-4">
                <div className="flex-1 h-px bg-border-subtle" />
                <span className="text-[12px] text-text-muted">Secure & Passwordless</span>
                <div className="flex-1 h-px bg-border-subtle" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'otp' && (
          <div className="w-full space-y-4 animate-slide-in-right">
            <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 shadow-card">
              {/* OTP Input Grid */}
              <div className="flex justify-center gap-2.5 mb-5">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                      handleOtpChange(0, pasted);
                    }}
                    className={`w-12 h-14 text-center text-[20px] font-semibold text-text-primary bg-bg-muted border-2 rounded-xl otp-input focus:outline-none transition-all ${
                      digit
                        ? 'border-sage bg-sage-muted'
                        : error
                          ? 'border-error'
                          : 'border-border-subtle'
                    }`}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              {error && (
                <p className="text-[12px] text-error text-center mb-4 animate-fade-in">{error}</p>
              )}

              <button
                onClick={handleVerifyOtp}
                className="w-full h-12 bg-bg-dark text-white font-medium rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 text-[15px] active:scale-[0.98] shadow-card"
              >
                <CheckCircle2 size={16} />
                Verify & Sign In
              </button>

              {/* Resend */}
              <div className="text-center mt-4">
                {canResend ? (
                  <button
                    onClick={handleResendOtp}
                    className="text-[13px] text-sage font-medium hover:underline flex items-center justify-center gap-1.5 mx-auto"
                  >
                    <RefreshCw size={13} />
                    Resend Code
                  </button>
                ) : (
                  <p className="text-[13px] text-text-muted">
                    Resend code in <span className="font-medium text-text-secondary">{otpTimer}s</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {step === 'loading' && (
          <div className="flex flex-col items-center py-12 animate-fade-in">
            <div className="w-16 h-16 rounded-full border-3 border-sage-muted flex items-center justify-center mb-6">
              <Loader2 size={32} className="text-sage animate-spin" />
            </div>
            <p className="text-[15px] text-text-secondary">Restoring your sanctuary...</p>
          </div>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="flex flex-col items-center py-12 animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-sage-muted flex items-center justify-center mb-6 animate-pulse-ring">
              <CheckCircle2 size={40} className="text-sage" />
            </div>
            <h2 className="text-[22px] font-semibold text-text-primary mb-2">
              Welcome back! 🌱
            </h2>
            <p className="text-[15px] text-text-tertiary text-center">
              Your sanctuary missed you.
            </p>
            <div className="mt-6 flex items-center gap-2 text-[13px] text-text-muted">
              <Loader2 size={14} className="animate-spin" />
              Redirecting...
            </div>
          </div>
        )}

        {/* Daily Quote */}
        {step === 'identify' && (
          <div className="w-full mt-6 bg-bg-surface border border-border-subtle rounded-2xl p-5 animate-fade-in-up shadow-card">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-sage-muted flex items-center justify-center flex-shrink-0">
                <span className="text-sage text-xs">✦</span>
              </div>
              <div>
                <p className="text-[14px] text-text-secondary italic leading-relaxed">
                  &ldquo;{quote.length > 80 ? quote.substring(0, 80) + '...' : quote}&rdquo;
                </p>
                <p className="text-[12px] text-text-muted mt-1">Daily Reflection</p>
              </div>
            </div>
          </div>
        )}

        {/* Sign Up Link */}
        {(step === 'identify' || step === 'otp') && (
          <p className="text-[13px] text-text-muted text-center mt-6 animate-fade-in">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-sage font-medium hover:underline">
              Create one
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
