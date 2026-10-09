import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--accent-sage-muted)] flex items-center justify-center mb-6">
        <span className="text-3xl">🌿</span>
      </div>
      <h1 className="text-[28px] font-semibold text-[var(--text-primary)] mb-2">
        Page Not Found
      </h1>
      <p className="text-[15px] text-[var(--text-tertiary)] mb-8 max-w-xs">
        This path doesn&apos;t exist in your sanctuary. Let&apos;s get you back on track.
      </p>
      <Link
        href="/home"
        className="inline-flex items-center justify-center h-12 px-6 bg-[var(--bg-dark)] text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
      >
        Return to Sanctuary
      </Link>
    </div>
  );
}
