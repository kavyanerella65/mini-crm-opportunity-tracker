import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Spinner, AlertBanner } from '../components/Feedback';
import { useAuth } from '../context/AuthContext';
import { opportunityApi } from '../services/opportunityService';
import { getErrorMessage } from '../services/api';
import { STAGES, PRIORITIES } from '../utils/constants';
import { formatDateForInput } from '../utils/format';

const EMPTY_FORM = {
  customerName: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  requirement: '',
  estimatedValue: '',
  stage: 'New',
  priority: 'Medium',
  nextFollowUpDate: '',
  notes: '',
};

export default function OpportunityForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await opportunityApi.getById(id);
        const opp = res.data;

        const ownerId = opp.owner?._id || opp.owner;
        if (ownerId !== user?.id) {
          if (!cancelled) setForbidden(true);
          return;
        }

        if (!cancelled) {
          setForm({
            customerName: opp.customerName || '',
            contactName: opp.contactName || '',
            contactEmail: opp.contactEmail || '',
            contactPhone: opp.contactPhone || '',
            requirement: opp.requirement || '',
            estimatedValue: opp.estimatedValue ?? '',
            stage: opp.stage || 'New',
            priority: opp.priority || 'Medium',
            nextFollowUpDate: formatDateForInput(opp.nextFollowUpDate),
            notes: opp.notes || '',
          });
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, isEditMode, user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = {
      ...form,
      estimatedValue: form.estimatedValue === '' ? 0 : Number(form.estimatedValue),
      nextFollowUpDate: form.nextFollowUpDate || undefined,
      contactEmail: form.contactEmail || undefined,
    };

    try {
      if (isEditMode) {
        await opportunityApi.update(id, payload);
      } else {
        await opportunityApi.create(payload);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-400 hover:text-ink-600"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to pipeline
        </button>

        <h1 className="font-display text-2xl font-semibold text-ink-800">
          {isEditMode ? 'Edit opportunity' : 'New opportunity'}
        </h1>
        <p className="mt-1 text-sm text-ink-400">
          {isEditMode ? 'Only you can edit this opportunity since you created it.' : 'It will be added to the shared pipeline for the whole team.'}
        </p>

        <div className="mt-5">
          {loading ? (
            <Spinner label="Loading opportunity…" />
          ) : forbidden ? (
            <AlertBanner message="You can only edit opportunities you created." />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 rounded-card border border-line bg-white p-5 shadow-panel sm:p-6">
              <AlertBanner message={error} onDismiss={() => setError('')} />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Customer / company name" required>
                  <input
                    name="customerName"
                    required
                    value={form.customerName}
                    onChange={handleChange}
                    placeholder="Acme Corporation"
                    className={inputClass}
                  />
                </Field>
                <Field label="Contact person name">
                  <input name="contactName" value={form.contactName} onChange={handleChange} placeholder="Priya Sharma" className={inputClass} />
                </Field>
                <Field label="Contact email">
                  <input
                    type="email"
                    name="contactEmail"
                    value={form.contactEmail}
                    onChange={handleChange}
                    placeholder="priya@acme.com"
                    className={inputClass}
                  />
                </Field>
                <Field label="Contact phone">
                  <input name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="+91 90000 00000" className={inputClass} />
                </Field>
              </div>

              <Field label="Requirement / need summary" required>
                <textarea
                  name="requirement"
                  required
                  rows={3}
                  value={form.requirement}
                  onChange={handleChange}
                  placeholder="What does the customer need?"
                  className={inputClass}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Estimated deal value (₹)">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    name="estimatedValue"
                    value={form.estimatedValue}
                    onChange={handleChange}
                    placeholder="0"
                    className={`${inputClass} font-mono`}
                  />
                </Field>
                <Field label="Next follow-up date">
                  <input type="date" name="nextFollowUpDate" value={form.nextFollowUpDate} onChange={handleChange} className={inputClass} />
                </Field>
                <Field label="Stage">
                  <select name="stage" value={form.stage} onChange={handleChange} className={inputClass}>
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Priority">
                  <select name="priority" value={form.priority} onChange={handleChange} className={inputClass}>
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Notes">
                <textarea
                  name="notes"
                  rows={3}
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Any extra context for the team…"
                  className={inputClass}
                />
              </Field>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="rounded-md border border-line px-4 py-2.5 text-sm font-medium text-ink-600 hover:bg-canvas"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-md bg-ledger-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ledger-700 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" aria-hidden="true" />
                  {submitting ? 'Saving…' : isEditMode ? 'Save changes' : 'Create opportunity'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

const inputClass =
  'w-full rounded-md border border-line px-3 py-2 text-sm text-ink-700 placeholder:text-ink-300 focus:border-ledger-400 focus:outline-none';

function Field({ label, required, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink-600">
        {label} {required && <span className="text-rust-600">*</span>}
      </span>
      {children}
    </label>
  );
}
