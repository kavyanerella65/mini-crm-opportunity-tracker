import { AlertTriangle, CheckCircle2, Inbox, Loader2 } from 'lucide-react';

export function Spinner({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-2 py-10 text-ink-400 ${className}`}>
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-line bg-white/60 px-6 py-14 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-50 text-ink-400">
        <Inbox className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="font-display text-base font-semibold text-ink-700">{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink-400">{description}</p>}
      {action}
    </div>
  );
}

export function AlertBanner({ variant = 'error', message, onDismiss }) {
  if (!message) return null;
  const isError = variant === 'error';
  const Icon = isError ? AlertTriangle : CheckCircle2;
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`flex items-start gap-2 rounded-card border px-4 py-3 text-sm ${
        isError ? 'border-rust-100 bg-rust-50 text-rust-700' : 'border-ledger-100 bg-ledger-50 text-ledger-700'
      }`}
    >
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs font-medium underline-offset-2 hover:underline"
          aria-label="Dismiss message"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
