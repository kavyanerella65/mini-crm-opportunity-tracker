import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', onConfirm, onCancel, busy }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-card bg-white p-5 shadow-raised">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-rust-50 text-rust-700">
            <AlertTriangle className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-display text-sm font-semibold text-ink-800">{title}</h3>
            {description && <p className="mt-1 text-sm text-ink-400">{description}</p>}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-md border border-line px-3 py-2 text-sm font-medium text-ink-600 hover:bg-canvas disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-md bg-rust-600 px-3 py-2 text-sm font-medium text-white hover:bg-rust-700 disabled:opacity-50"
          >
            {busy ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
