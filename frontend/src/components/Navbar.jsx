import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = (user?.name || '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink-700">
            <svg viewBox="0 0 32 32" className="h-4 w-4">
              <rect x="7" y="20" width="4" height="7" rx="1" fill="#F4F5F9" />
              <rect x="14" y="14" width="4" height="13" rx="1" fill="#2C9A75" />
              <rect x="21" y="8" width="4" height="19" rx="1" fill="#D26A41" />
            </svg>
          </span>
          <span className="font-display text-base font-semibold tracking-tight text-ink-800">
            Pipeline Ledger
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/opportunities/new"
            className="hidden items-center gap-1.5 rounded-md bg-ledger-600 px-3 py-2 text-sm font-medium text-white shadow-panel transition hover:bg-ledger-700 sm:inline-flex"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New opportunity
          </Link>

          <div className="flex items-center gap-2 rounded-md border border-line bg-white px-2 py-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-100 text-[11px] font-semibold text-ink-600">
              {initials}
            </span>
            <span className="hidden text-sm text-ink-600 sm:inline">{user?.name}</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-3 py-2 text-sm font-medium text-ink-500 transition hover:border-rust-100 hover:text-rust-700"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
