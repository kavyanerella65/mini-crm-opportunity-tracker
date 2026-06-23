import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import { AlertBanner } from '../components/Feedback';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-ink-700">
            <svg viewBox="0 0 32 32" className="h-5 w-5">
              <rect x="7" y="20" width="4" height="7" rx="1" fill="#F4F5F9" />
              <rect x="14" y="14" width="4" height="13" rx="1" fill="#2C9A75" />
              <rect x="21" y="8" width="4" height="19" rx="1" fill="#D26A41" />
            </svg>
          </span>
          <h1 className="font-display text-xl font-semibold text-ink-800">Pipeline Ledger</h1>
          <p className="text-sm text-ink-400">Sign in to your shared opportunity pipeline.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-card border border-line bg-white p-6 shadow-panel">
          <AlertBanner message={error} onDismiss={() => setError('')} />

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-ink-600">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@company.com"
              className="w-full rounded-md border border-line px-3 py-2 text-sm text-ink-700 focus:border-ledger-400 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-ink-600">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-md border border-line px-3 py-2 pr-10 text-sm text-ink-700 focus:border-ledger-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-500"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-ledger-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ledger-700 disabled:opacity-60"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-ledger-700 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
