import { STAGE_STYLES, PRIORITY_STYLES } from '../utils/constants';

export function StageBadge({ stage }) {
  const style = STAGE_STYLES[stage] || STAGE_STYLES.New;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${style.badge}`}>
      {stage}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>
      {priority}
    </span>
  );
}
