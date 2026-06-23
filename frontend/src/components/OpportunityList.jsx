import { Calendar, Pencil, Trash2, User } from 'lucide-react';
import { StageBadge, PriorityBadge } from './Badges';
import { STAGE_STYLES } from '../utils/constants';
import { formatCurrency, formatDate, isOverdue } from '../utils/format';

function FollowUpDate({ value }) {
  const overdue = isOverdue(value);
  return (
    <span className={`inline-flex items-center gap-1 font-mono text-xs tabular ${overdue ? 'text-rust-700' : 'text-ink-500'}`}>
      <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
      {formatDate(value)}
      {overdue && <span className="ml-1 rounded bg-rust-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">Overdue</span>}
    </span>
  );
}

function RowActions({ opportunity, isOwner, onEdit, onDelete }) {
  if (!isOwner) {
    return <span className="text-xs text-ink-300">View only</span>;
  }
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onEdit(opportunity)}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-ink-500 hover:bg-ink-50 hover:text-ink-700"
        aria-label={`Edit ${opportunity.customerName}`}
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        Edit
      </button>
      <button
        type="button"
        onClick={() => onDelete(opportunity)}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-rust-600 hover:bg-rust-50"
        aria-label={`Delete ${opportunity.customerName}`}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        Delete
      </button>
    </div>
  );
}

export default function OpportunityList({ opportunities, currentUserId, onEdit, onDelete }) {
  return (
    <div className="rounded-card border border-line bg-white shadow-panel">
      {/* Desktop table */}
      <table className="hidden w-full text-left md:table">
        <thead>
          <tr className="border-b border-line text-xs font-medium uppercase tracking-wide text-ink-400">
            <th className="py-3 pl-4">Customer</th>
            <th className="py-3">Requirement</th>
            <th className="py-3">Value</th>
            <th className="py-3">Stage</th>
            <th className="py-3">Priority</th>
            <th className="py-3">Follow-up</th>
            <th className="py-3">Owner</th>
            <th className="py-3">Created</th>
            <th className="py-3 pr-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {opportunities.map((opp) => {
            const owner = opp.owner?._id === currentUserId || opp.owner === currentUserId;
            const rail = (STAGE_STYLES[opp.stage] || STAGE_STYLES.New).rail;
            return (
              <tr key={opp._id} className="border-b border-line last:border-0 hover:bg-canvas/60">
                <td className="py-3 pl-4">
                  <div className="flex items-center gap-2.5">
                    <span className={`h-7 w-1 flex-shrink-0 rounded-full ${rail}`} aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-ink-800">{opp.customerName}</p>
                      {opp.contactName && <p className="text-xs text-ink-400">{opp.contactName}</p>}
                    </div>
                  </div>
                </td>
                <td className="max-w-[220px] py-3 pr-2 text-sm text-ink-500">
                  <p className="truncate" title={opp.requirement}>{opp.requirement}</p>
                </td>
                <td className="py-3 font-mono text-sm tabular text-ink-700">{formatCurrency(opp.estimatedValue)}</td>
                <td className="py-3"><StageBadge stage={opp.stage} /></td>
                <td className="py-3"><PriorityBadge priority={opp.priority} /></td>
                <td className="py-3"><FollowUpDate value={opp.nextFollowUpDate} /></td>
                <td className="py-3 text-sm text-ink-500">
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-ink-300" aria-hidden="true" />
                    {owner ? 'You' : opp.owner?.name || 'Unknown'}
                  </span>
                </td>
                <td className="py-3 font-mono text-xs tabular text-ink-400">{formatDate(opp.createdAt)}</td>
                <td className="py-3 pr-4 text-right">
                  <RowActions opportunity={opp} isOwner={owner} onEdit={onEdit} onDelete={onDelete} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Mobile cards */}
      <ul className="divide-y divide-line md:hidden">
        {opportunities.map((opp) => {
          const owner = opp.owner?._id === currentUserId || opp.owner === currentUserId;
          const rail = (STAGE_STYLES[opp.stage] || STAGE_STYLES.New).rail;
          return (
            <li key={opp._id} className="flex gap-3 p-4">
              <span className={`mt-0.5 h-auto w-1 flex-shrink-0 self-stretch rounded-full ${rail}`} aria-hidden="true" />
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-ink-800">{opp.customerName}</p>
                    {opp.contactName && <p className="text-xs text-ink-400">{opp.contactName}</p>}
                  </div>
                  <p className="font-mono text-sm tabular font-semibold text-ink-700">{formatCurrency(opp.estimatedValue)}</p>
                </div>
                <p className="text-sm text-ink-500">{opp.requirement}</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <StageBadge stage={opp.stage} />
                  <PriorityBadge priority={opp.priority} />
                  <FollowUpDate value={opp.nextFollowUpDate} />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="inline-flex items-center gap-2 text-xs text-ink-400">
                    <span className="inline-flex items-center gap-1">
                      <User className="h-3.5 w-3.5" aria-hidden="true" />
                      {owner ? 'You' : opp.owner?.name || 'Unknown'}
                    </span>
                    <span className="font-mono tabular text-ink-300">· {formatDate(opp.createdAt)}</span>
                  </span>
                  <RowActions opportunity={opp} isOwner={owner} onEdit={onEdit} onDelete={onDelete} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
