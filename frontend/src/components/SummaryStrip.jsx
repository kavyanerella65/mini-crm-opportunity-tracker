import { Flame, Layers, TrendingUp, Trophy } from 'lucide-react';
import { formatCurrency } from '../utils/format';

const ITEMS = [
  { key: 'openPipelineValue', label: 'Open pipeline value', icon: TrendingUp, format: 'currency', accent: 'text-ink-700' },
  { key: 'wonValue', label: 'Won value', icon: Trophy, format: 'currency', accent: 'text-ledger-700' },
  { key: 'highPriorityOpen', label: 'High priority, open', icon: Flame, format: 'number', accent: 'text-rust-700' },
  { key: 'totalOpportunities', label: 'Total opportunities', icon: Layers, format: 'number', accent: 'text-ink-700' },
];

export default function SummaryStrip({ summary, loading }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {ITEMS.map(({ key, label, icon: Icon, format, accent }, i) => (
        <div
          key={key}
          className="animate-rise rounded-card border border-line bg-white p-4 shadow-panel"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</span>
            <Icon className="h-4 w-4 text-ink-300" aria-hidden="true" />
          </div>
          <p className={`mt-2 font-mono tabular text-xl font-semibold sm:text-2xl ${accent}`}>
            {loading ? (
              <span className="inline-block h-6 w-20 animate-pulse rounded bg-ink-50" />
            ) : format === 'currency' ? (
              formatCurrency(summary?.[key])
            ) : (
              summary?.[key] ?? 0
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
