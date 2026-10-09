'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, AlertCircle, Check, ChevronDown } from 'lucide-react';

// ========================================
// BUTTON
// ========================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'sage';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all rounded-lg focus-visible:outline-2 focus-visible:outline-sage focus-visible:outline-offset-2 active:scale-[0.98]';

  const variants = {
    primary: 'bg-bg-dark text-text-inverse hover:opacity-90',
    secondary: 'bg-bg-surface text-text-primary border border-border-default hover:bg-bg-hover',
    ghost: 'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
    danger: 'bg-error text-white hover:opacity-90',
    sage: 'bg-sage text-white hover:bg-sage-hover',
  };

  const sizes = {
    sm: 'text-[13px] h-8 px-3 gap-1.5',
    md: 'text-[14px] h-10 px-4 gap-2',
    lg: 'text-[15px] h-12 px-6 gap-2',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
        (disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}

// ========================================
// INPUT
// ========================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  icon,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[13px] font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </span>
        )}
        <input
          className={`w-full h-11 px-3 ${icon ? 'pl-10' : ''} text-[15px] text-text-primary bg-bg-surface border border-border-default rounded-lg transition-colors placeholder:text-text-muted focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage ${
            error ? 'border-error focus:border-error focus:ring-error' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="flex items-center gap-1 text-[12px] text-error">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

// ========================================
// TEXTAREA
// ========================================

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className = '',
  ...props
}: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[13px] font-medium text-text-secondary">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-3 py-2.5 text-[15px] text-text-primary bg-bg-surface border border-border-default rounded-lg transition-colors placeholder:text-text-muted focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage resize-none ${
          error ? 'border-error' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="flex items-center gap-1 text-[12px] text-error">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

// ========================================
// SELECT
// ========================================

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[13px] font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`w-full h-11 px-3 pr-10 text-[15px] text-text-primary bg-bg-surface border border-border-default rounded-lg appearance-none transition-colors focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage ${className}`}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
      </div>
    </div>
  );
}

// ========================================
// TOGGLE
// ========================================

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full text-left group"
    >
      {(label || description) && (
        <div className="flex-1 pr-4">
          {label && <span className="text-[15px] font-medium text-text-primary block">{label}</span>}
          {description && <span className="text-[13px] text-text-tertiary block mt-0.5">{description}</span>}
        </div>
      )}
      <div
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
          checked ? 'bg-sage' : 'bg-border-strong'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
            checked ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </div>
    </button>
  );
}

// ========================================
// CHECKBOX
// ========================================

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export function Checkbox({ checked, onChange, disabled, size = 'md' }: CheckboxProps) {
  const sizeStyles = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';

  return (
    <button
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`${sizeStyles} rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
        checked
          ? 'bg-sage border-sage animate-check'
          : 'border-border-strong hover:border-sage'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {checked && <Check size={size === 'sm' ? 12 : 14} className="text-white" strokeWidth={3} />}
    </button>
  );
}

// ========================================
// BADGE
// ========================================

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'sage' | 'streak' | 'error' | 'muted';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const variants = {
    default: 'bg-bg-muted text-text-secondary',
    sage: 'bg-sage-muted text-sage',
    streak: 'bg-streak-light text-streak',
    error: 'bg-error-light text-error',
    muted: 'bg-bg-hover text-text-tertiary',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-[12px] px-2.5 py-1',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-md ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}

// ========================================
// CARD
// ========================================

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'dark' | 'bordered';
  onClick?: () => void;
}

export function Card({ children, className = '', variant = 'default', onClick }: CardProps) {
  const variants = {
    default: 'bg-bg-surface border border-border-subtle',
    dark: 'bg-bg-dark text-text-inverse',
    bordered: 'bg-bg-surface border border-border-default',
  };

  return (
    <div
      className={`rounded-xl ${variants[variant]} ${onClick ? 'cursor-pointer hover:shadow-card transition-shadow' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

// ========================================
// MODAL
// ========================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/40 animate-fade-in" />
      <div className={`relative w-full ${sizes[size]} bg-bg-surface rounded-t-2xl lg:rounded-2xl animate-slide-up max-h-[90vh] flex flex-col`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-hover transition-colors"
              aria-label="Close"
            >
              <X size={18} className="text-text-muted" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// ========================================
// PROGRESS BAR
// ========================================

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'sage' | 'streak' | 'dark';
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  variant = 'sage',
  size = 'md',
  showLabel = false,
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  const barVariants = {
    sage: 'bg-sage',
    streak: 'bg-streak',
    dark: 'bg-bg-dark',
  };

  const trackVariants = {
    sage: 'bg-sage-muted',
    streak: 'bg-streak-light',
    dark: 'bg-bg-muted',
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 ${trackVariants[variant]} rounded-full ${heights[size]} overflow-hidden`}>
        <div
          className={`${barVariants[variant]} ${heights[size]} rounded-full transition-all duration-500 ease-out animate-progress`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      {showLabel && (
        <span className="text-[12px] font-medium text-text-secondary min-w-[36px] text-right">
          {percentage}%
        </span>
      )}
    </div>
  );
}

// ========================================
// TOAST
// ========================================

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

export function Toast({ message, type = 'success', isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    success: 'bg-sage text-white',
    error: 'bg-error text-white',
    info: 'bg-bg-dark text-text-inverse',
  };

  return (
    <div className={`fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 ${typeStyles[type]} px-4 py-2.5 rounded-lg shadow-lg animate-slide-up text-[14px] font-medium`}>
      {message}
    </div>
  );
}

// ========================================
// EMPTY STATE
// ========================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      {icon && <div className="mb-4 text-text-muted">{icon}</div>}
      <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-[14px] text-text-tertiary mb-6 max-w-xs">{description}</p>
      {action}
    </div>
  );
}

// ========================================
// SKELETON
// ========================================

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

// ========================================
// TABS
// ========================================

interface TabsProps {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-2 rounded-lg text-[14px] font-medium whitespace-nowrap transition-all ${
            activeTab === tab
              ? 'bg-bg-dark text-text-inverse'
              : 'bg-bg-surface text-text-secondary border border-border-default hover:bg-bg-hover'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

// ========================================
// CONFIRM DIALOG
// ========================================

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  variant?: 'danger' | 'default';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  variant = 'default',
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
        <p className="text-[14px] text-text-tertiary mb-6">{message}</p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            className="flex-1"
            onClick={() => { onConfirm(); onClose(); }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
