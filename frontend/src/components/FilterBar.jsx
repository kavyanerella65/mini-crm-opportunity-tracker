import { Search, SlidersHorizontal, X } from 'lucide-react';
import { STAGES, PRIORITIES } from '../utils/constants';

export default function FilterBar({ filters, onChange, onReset }) {
  const { search, stage, priority, mine, sortBy, order } = filters;

  const update = (patch) => onChange({ ...filters, ...patch });

  const hasActiveFilters = search || stage || priority || mine;

  return (
    <div className="flex flex-col gap-3 rounded-card border border-line bg-white p-3 shadow-panel sm:flex-row sm:items-center sm:gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" aria-hidden="true" />
        <input
          type="text"
          value={search}
          onChange={(e) => update({ search: e.target.value })}
          placeholder="Search customer, contact, or requirement…"
          className="w-full rounded-md border border-line bg-canvas py-2 pl-9 pr-3 text-sm text-ink-700 placeholder:text-ink-300 focus:border-ledger-400 focus:bg-white focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={stage}
          onChange={(e) => update({ stage: e.target.value })}
          className="rounded-md border border-line bg-canvas px-2.5 py-2 text-sm text-ink-600 focus:border-ledger-400 focus:bg-white focus:outline-none"
        >
          <option value="">All stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(e) => update({ priority: e.target.value })}
          className="rounded-md border border-line bg-canvas px-2.5 py-2 text-sm text-ink-600 focus:border-ledger-400 focus:bg-white focus:outline-none"
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          value={`${sortBy}:${order}`}
          onChange={(e) => {
            const [nextSortBy, nextOrder] = e.target.value.split(':');
            update({ sortBy: nextSortBy, order: nextOrder });
          }}
          className="rounded-md border border-line bg-canvas px-2.5 py-2 text-sm text-ink-600 focus:border-ledger-400 focus:bg-white focus:outline-none"
        >
          <option value="createdAt:desc">Newest first</option>
          <option value="createdAt:asc">Oldest first</option>
          <option value="estimatedValue:desc">Value: high to low</option>
          <option value="estimatedValue:asc">Value: low to high</option>
          <option value="nextFollowUpDate:asc">Follow-up: soonest</option>
          <option value="customerName:asc">Customer: A–Z</option>
        </select>

        <label className="inline-flex select-none items-center gap-1.5 rounded-md border border-line bg-canvas px-2.5 py-2 text-sm text-ink-600">
          <input
            type="checkbox"
            checked={mine}
            onChange={(e) => update({ mine: e.target.checked })}
            className="h-3.5 w-3.5 rounded border-ink-300 text-ledger-600 focus:ring-ledger-400"
          />
          My opportunities
        </label>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 rounded-md px-2 py-2 text-sm text-ink-400 hover:text-ink-600"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Clear
          </button>
        )}

        <span className="hidden items-center gap-1 px-1 text-ink-200 lg:inline-flex">
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}
