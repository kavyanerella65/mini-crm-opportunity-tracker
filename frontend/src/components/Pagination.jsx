import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, total, onPageChange }) {
  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between px-1 py-2 text-sm text-ink-400">
      <span>
        Page <span className="font-medium text-ink-600">{page}</span> of{' '}
        <span className="font-medium text-ink-600">{totalPages}</span> · {total} total
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-2.5 py-1.5 font-medium text-ink-600 hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Prev
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-2.5 py-1.5 font-medium text-ink-600 hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
