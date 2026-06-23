export const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
export const PRIORITIES = ['Low', 'Medium', 'High'];

// Maps each stage to the "ledger rail" color used as the left-edge accent
// on opportunity rows/cards — the page's signature visual device.
export const STAGE_STYLES = {
  New: { rail: 'bg-ink-300', badge: 'bg-ink-100 text-ink-600' },
  Contacted: { rail: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700' },
  Qualified: { rail: 'bg-violet-500', badge: 'bg-violet-50 text-violet-700' },
  'Proposal Sent': { rail: 'bg-amber-600', badge: 'bg-amber-50 text-amber-600' },
  Won: { rail: 'bg-ledger-600', badge: 'bg-ledger-50 text-ledger-700' },
  Lost: { rail: 'bg-rust-600', badge: 'bg-rust-50 text-rust-700' },
};

export const PRIORITY_STYLES = {
  Low: 'bg-ink-100 text-ink-500',
  Medium: 'bg-amber-50 text-amber-600',
  High: 'bg-rust-50 text-rust-700',
};
