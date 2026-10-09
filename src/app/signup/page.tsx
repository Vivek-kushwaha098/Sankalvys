'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  User,
  Calendar,
  Briefcase,
  CheckCircle2,
  Sparkles,
  Shield,
  RefreshCw,
  Check
} from 'lucide-react';
import { useApp } from '@/lib/context';
import { Occupation, Gender } from '@/lib/types';
import Link from 'next/link';
import { auth } from '@/lib/firebaseConfig';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

const occupations: { value: Occupation; label: string; icon: string }[] = [
  { value: 'Student', label: 'Student', icon: '🎓' },
  { value: 'Employee', label: 'Employee', icon: '💼' },
  { value: 'Worker', label: 'Worker', icon: '🔧' },
  { value: 'Freelancer', label: 'Freelancer', icon: '🎨' },
  { value: 'Business Owner', label: 'Business Owner', icon: '🚀' },
  { value: 'Other', label: 'Other', icon: '✨' },
];

type Step = 'info' | 'occupation' | 'loading' | 'success';
type OtpStatus = 'idle' | 'sent' | 'verified';

export default function SignupPage() {
  const [step, setStep] = useState<Step>('info');
  const [otpStatus, setOtpStatus] = useState<OtpStatus>('idle');
  
  // Form State
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [detectedMethod, setDetectedMethod] = useState<'email' | 'phone' | null>(null);
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [occupation, setOccupation] = useState<Occupation | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { login } = useApp();
  const router = useRouter();

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const validatePhone = (p: string) => /^[+]?[\d\s\-()]{7,15}$/.test(p);

  const calculateAge = (dobString: string) => {
    if (!dobString) return 0;
    const birthDate = new Date(dobString);
    const today = new Date();
    let computedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      computedAge--;
    }
    return computedAge;
  };

  // OTP Timer
  useEffect(() => {
    if (otpStatus !== 'sent') return;
    if (otpTimer <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setOtpTimer(t => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpStatus, otpTimer]);

  const handleSendOtp = async () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Please enter your full name';
    
    const val = identifier.trim();
    let method: 'email' | 'phone' = 'phone';

    if (!val) {
      newErrors.identifier = 'Please enter your email or phone number';
    } else {
      if (val.includes('@') || /[a-zA-Z]/.test(val)) {
        method = 'email';
      }
      
      if (method === 'email' && !validateEmail(val)) {
        newErrors.identifier = 'Please enter a valid email address';
      } else if (method === 'phone' && !validatePhone(val)) {
        newErrors.identifier = 'Please enter a valid phone number (e.g., +1234567890)';
      } else {
        setDetectedMethod(method);
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (method === 'phone') {
      if (!auth) {
        setErrors({ identifier: 'Firebase is not configured. Please add your API key to .env.local' });
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
        setOtpStatus('sent');
      } catch (error: any) {
        setErrors({ identifier: error.message || 'Failed to send OTP. Ensure the number includes the country code.' });
      }
    } else {
      // Mock email verification
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);
      setOtpTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setOtpStatus('sent');
      console.log(`[Sankalvys] Mock Email OTP is: ${newOtp}`);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
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
    setErrors(prev => {
      const next = { ...prev };
      delete next.otp;
      return next;
    });

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
      setErrors(prev => ({ ...prev, otp: 'Please enter the complete 6-digit code' }));
      return;
    }

    if (detectedMethod === 'phone' && confirmationResult) {
      try {
        await confirmationResult.confirm(enteredOtp);
        setErrors(prev => {
          const next = { ...prev };
          delete next.otp;
          return next;
        });
        setOtpStatus('verified');
      } catch (error: any) {
        setErrors(prev => ({ ...prev, otp: 'Invalid verification code. Please try again.' }));
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      }
    } else {
      // Mock email verification
      if (enteredOtp !== generatedOtp) {
        setErrors(prev => ({ ...prev, otp: 'Invalid verification code. Please try again.' }));
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
        return;
      }
      setErrors(prev => {
        const next = { ...prev };
        delete next.otp;
        return next;
      });
      setOtpStatus('verified');
    }
  }, [otp, generatedOtp, detectedMethod, confirmationResult]);

  // Auto-verify when all 6 digits are entered
  useEffect(() => {
    if (otpStatus === 'sent' && otp.every(d => d !== '')) {
      handleVerifyOtp();
    }
  }, [otp, otpStatus, handleVerifyOtp]);

  const handleResendOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtpTimer(30);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    setErrors({});
    otpRefs.current[0]?.focus();
    console.log(`[Sankalvys] New OTP is: ${newOtp}`);
  };

  const handleInfoContinue = () => {
    const newErrors: Record<string, string> = {};
    if (!dob) newErrors.dob = 'Please enter your date of birth';
    else {
      const computedAge = calculateAge(dob);
      if (computedAge < 13 || computedAge > 120) {
        newErrors.dob = 'You must be between 13 and 120 years old';
      }
    }
    if (!gender) newErrors.gender = 'Please select your gender';

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setStep('occupation');
    }
  };

  const handleOccupationSubmit = () => {
    if (!occupation) {
      setErrors({ occupation: 'Please select your occupation' });
      return;
    }
    
    setStep('loading');
    setTimeout(() => {
      login(
        name.trim(), 
        detectedMethod === 'email' ? identifier.trim() : '', 
        detectedMethod === 'phone' ? identifier.trim() : '', 
        calculateAge(dob), 
        occupation as Occupation,
        dob,
        gender as Gender
      );
      setStep('success');
      setTimeout(() => {
        router.push('/home');
      }, 1200);
    }, 1500);
  };

  const clearError = (field: string) => {
    setErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const maskedIdentifier = detectedMethod === 'email'
    ? identifier.replace(/(.{2}).+(@.+)/, '$1***$2')
    : identifier.replace(/(.{3}).+(.{2})$/, '$1****$2');

  const getProgressWidth = () => {
    if (step === 'info') return otpStatus === 'verified' ? '50%' : '25%';
    if (step === 'occupation') return '75%';
    return '100%';
  };

  return (
    <div className="min-h-screen auth-gradient flex flex-col">
      {/* Floating decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-3 h-3 rounded-full bg-sage opacity-20" style={{ animation: 'float 6s ease-in-out infinite' }} />
        <div className="absolute top-40 right-20 w-2 h-2 rounded-full bg-streak opacity-20" style={{ animation: 'float 8s ease-in-out infinite 1s' }} />
        <div className="absolute bottom-40 left-1/4 w-4 h-4 rounded-full bg-sage opacity-10" style={{ animation: 'float 7s ease-in-out infinite 2s' }} />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 h-16 relative z-10">
        <Link href="/login" className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm">Back to Login</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[15px] text-text-muted">
            Step {step === 'info' ? '1' : step === 'occupation' ? '2' : '✓'} of 2
          </span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="px-6 relative z-10">
        <div className="h-1 bg-bg-muted rounded-full overflow-hidden max-w-md mx-auto">
          <div
            className="h-full bg-sage rounded-full transition-all duration-500 ease-out"
            style={{ width: getProgressWidth() }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-md mx-auto w-full relative z-10">
        {/* Logo & Heading */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-sage-muted flex items-center justify-center mx-auto mb-5 animate-pulse-ring">
            <span className="text-3xl">🌿</span>
          </div>
          <h1 className="text-[28px] font-bold text-text-primary tracking-tight">
            {step === 'info' && 'Create Your Sanctuary'}
            {step === 'occupation' && 'Almost There!'}
            {step === 'loading' && 'Setting Up...'}
            {step === 'success' && 'Welcome Aboard!'}
          </h1>
          <p className="text-[15px] text-text-tertiary mt-2">
            {step === 'info' && 'Tell us about yourself to personalize your experience'}
            {step === 'occupation' && 'What best describes your daily life?'}
            {step === 'loading' && 'Crafting your personalized sanctuary...'}
            {step === 'success' && `${name}, your journey begins now`}
          </p>
        </div>

        {/* Step 1: Personal Info & Verification */}
        {step === 'info' && (
          <div className="w-full space-y-4 animate-slide-in-right">
            <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 shadow-card transition-all duration-500">
              
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="flex items-center gap-2 text-[13px] font-medium text-text-secondary mb-1.5">
                    <User size={14} />
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Vivek Kushwaha"
                    value={name}
                    onChange={(e) => { setName(e.target.value); clearError('name'); }}
                    disabled={otpStatus !== 'idle'}
                    className="w-full h-12 px-4 text-[15px] text-text-primary bg-bg-muted border border-border-subtle rounded-xl placeholder:text-text-muted focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-all disabled:opacity-60"
                  />
                  {errors.name && <p className="text-[12px] text-error mt-1">{errors.name}</p>}
                </div>

                {/* Unified Identifier */}
                <div>
                  <label className="flex items-center gap-2 text-[13px] font-medium text-text-secondary mb-1.5">
                    <Shield size={14} />
                    Email or Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="you@example.com or +1234567890"
                      value={identifier}
                      onChange={(e) => { setIdentifier(e.target.value); clearError('identifier'); setOtpStatus('idle'); }}
                      disabled={otpStatus === 'verified'}
                      className="w-full h-12 px-4 text-[15px] text-text-primary bg-bg-muted border border-border-subtle rounded-xl placeholder:text-text-muted focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-all disabled:opacity-60"
                    />
                    {otpStatus === 'verified' && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sage bg-sage-muted p-1 rounded-full animate-scale-in">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  {errors.identifier && <p className="text-[12px] text-error mt-1">{errors.identifier}</p>}
                </div>

                {/* OTP Dispatch & Verification Reveal */}
                <div id="recaptcha-container"></div>
                {otpStatus === 'idle' && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="w-full h-12 bg-bg-dark text-white font-medium rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 text-[15px] active:scale-[0.98] shadow-sm"
                    >
                      Send Verification Code
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {/* OTP Verification Grid */}
                {otpStatus === 'sent' && (
                  <div className="pt-4 pb-2 animate-fade-in-up border-t border-border-subtle mt-4">
                    {detectedMethod === 'email' && (
                      <div className="bg-sage-muted border border-sage rounded-xl p-3 mb-4 flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                          <Shield size={14} className="text-sage" />
                          <span className="text-[12px] font-medium text-sage">Demo Mode Code:</span>
                        </div>
                        <span className="font-mono font-bold tracking-wider text-sage text-[13px]">{generatedOtp}</span>
                      </div>
                    )}

                    <label className="flex items-center gap-2 text-[13px] font-medium text-text-secondary mb-3 text-center justify-center">
                      Enter the 6-digit code sent to you
                    </label>
                    <div className="flex justify-center gap-2.5 mb-4">
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
                          className={`w-11 h-12 text-center text-[18px] font-semibold text-text-primary bg-bg-muted border-2 rounded-xl otp-input focus:outline-none transition-all ${
                            digit ? 'border-sage bg-sage-muted' : errors.otp ? 'border-error' : 'border-border-subtle'
                          }`}
                          autoFocus={i === 0}
                        />
                      ))}
                    </div>

                    {errors.otp && <p className="text-[12px] text-error text-center mb-3 animate-fade-in">{errors.otp}</p>}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setOtpStatus('idle'); setOtp(['', '', '', '', '', '']); }}
                        className="flex-1 h-11 bg-bg-surface border border-border-subtle text-text-secondary font-medium rounded-xl hover:bg-bg-hover transition-all text-[14px]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="flex-[2] h-11 bg-sage text-white font-medium rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 text-[14px] shadow-sm"
                      >
                        <CheckCircle2 size={16} />
                        Verify Code
                      </button>
                    </div>

                    <div className="text-center mt-4">
                      {canResend ? (
                        <button
                          onClick={handleResendOtp}
                          className="text-[12px] text-sage font-medium hover:underline flex items-center justify-center gap-1 mx-auto"
                        >
                          <RefreshCw size={12} /> Resend Code
                        </button>
                      ) : (
                        <p className="text-[12px] text-text-muted">
                          Resend code in <span className="font-medium text-text-secondary">{otpTimer}s</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* DOB & Gender - Dynamically Revealed after OTP Verified */}
                {otpStatus === 'verified' && (
                  <div className="pt-4 border-t border-border-subtle animate-fade-in-up space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* DOB */}
                      <div>
                        <label className="flex items-center gap-2 text-[13px] font-medium text-text-secondary mb-1.5">
                          <Calendar size={14} />
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => { setDob(e.target.value); clearError('dob'); }}
                          className="w-full h-12 px-3 text-[14px] text-text-primary bg-bg-muted border border-border-subtle rounded-xl focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-all"
                        />
                        {errors.dob && <p className="text-[12px] text-error mt-1">{errors.dob}</p>}
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="flex items-center gap-2 text-[13px] font-medium text-text-secondary mb-1.5">
                          <User size={14} />
                          Gender
                        </label>
                        <div className="relative">
                          <select
                            value={gender}
                            onChange={(e) => { setGender(e.target.value as Gender); clearError('gender'); }}
                            className="w-full h-12 px-3 text-[14px] text-text-primary bg-bg-muted border border-border-subtle rounded-xl focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-all appearance-none"
                          >
                            <option value="" disabled>Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Non-binary">Non-binary</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                            <option value="Other">Other</option>
                          </select>
                          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-text-muted">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        {errors.gender && <p className="text-[12px] text-error mt-1">{errors.gender}</p>}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleInfoContinue}
                      className="w-full h-12 bg-bg-dark text-white font-medium rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 text-[15px] active:scale-[0.98] shadow-card mt-2"
                    >
                      Continue
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Occupation */}
        {step === 'occupation' && (
          <div className="w-full space-y-4 animate-slide-in-right">
            <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase size={16} className="text-sage" />
                <span className="text-[13px] font-medium text-text-secondary">Select your occupation</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {occupations.map((occ) => (
                  <button
                    key={occ.value}
                    onClick={() => { setOccupation(occ.value); clearError('occupation'); }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                      occupation === occ.value
                        ? 'border-sage bg-sage-muted shadow-sm scale-[1.02]'
                        : 'border-border-subtle bg-bg-muted hover:border-border-strong hover:bg-bg-hover'
                    }`}
                  >
                    <span className="text-2xl">{occ.icon}</span>
                    <span className={`text-[13px] font-medium ${
                      occupation === occ.value ? 'text-sage' : 'text-text-secondary'
                    }`}>
                      {occ.label}
                    </span>
                    {occupation === occ.value && (
                      <CheckCircle2 size={16} className="text-sage animate-scale-in" />
                    )}
                  </button>
                ))}
              </div>
              {errors.occupation && <p className="text-[12px] text-error mt-3 text-center">{errors.occupation}</p>}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('info')}
                className="flex-1 h-12 bg-bg-surface border border-border-subtle text-text-secondary font-medium rounded-xl hover:bg-bg-hover transition-all flex items-center justify-center gap-2 text-[15px] active:scale-[0.98]"
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <button
                onClick={handleOccupationSubmit}
                className="flex-[2] h-12 bg-bg-dark text-white font-medium rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 text-[15px] active:scale-[0.98] shadow-card"
              >
                Create Account
                <Sparkles size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {step === 'loading' && (
          <div className="flex flex-col items-center py-12 animate-fade-in">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full border-3 border-sage-muted flex items-center justify-center">
                <Loader2 size={32} className="text-sage animate-spin" />
              </div>
            </div>
            <p className="text-[15px] text-text-secondary">Preparing your sanctuary...</p>
            <div className="flex gap-1 mt-4">
              {['Habits', 'Routines', 'Analytics'].map((item, i) => (
                <span
                  key={item}
                  className="text-[12px] text-text-muted px-3 py-1 bg-bg-surface rounded-full border border-border-subtle animate-fade-in"
                  style={{ animationDelay: `${i * 300}ms` }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="flex flex-col items-center py-12 animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-sage-muted flex items-center justify-center mb-6 animate-pulse-ring">
              <CheckCircle2 size={40} className="text-sage" />
            </div>
            <h2 className="text-[22px] font-semibold text-text-primary mb-2">
              Welcome, {name}! 🌱
            </h2>
            <p className="text-[15px] text-text-tertiary text-center max-w-xs">
              Your personalized habit sanctuary is ready. Let&apos;s build something beautiful together.
            </p>
            <div className="mt-6 flex items-center gap-2 text-[13px] text-text-muted">
              <Loader2 size={14} className="animate-spin" />
              Redirecting...
            </div>
          </div>
        )}

        {/* Footer */}
        {(step === 'info' || step === 'occupation') && (
          <p className="text-[13px] text-text-muted text-center mt-6 animate-fade-in">
            Already have an account?{' '}
            <Link href="/login" className="text-sage font-medium hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
