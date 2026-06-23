import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Navbar from '../components/Navbar';
import SummaryStrip from '../components/SummaryStrip';
import FilterBar from '../components/FilterBar';
import OpportunityList from '../components/OpportunityList';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import { Spinner, EmptyState, AlertBanner } from '../components/Feedback';
import { useAuth } from '../context/AuthContext';
import { opportunityApi } from '../services/opportunityService';
import { getErrorMessage } from '../services/api';

const DEFAULT_FILTERS = { search: '', stage: '', priority: '', mine: false, sortBy: 'createdAt', order: 'desc' };
const PAGE_SIZE = 10;

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [opportunities, setOpportunities] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState('');

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState('');

  // Debounce the free-text search so we don't fire a request on every keystroke.
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(filters.search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handle);
  }, [filters.search]);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await opportunityApi.summary();
      setSummary(res.data);
    } catch {
      // Summary is supplementary — a failure here shouldn't block the main list.
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const fetchOpportunities = useCallback(async () => {
    setListLoading(true);
    setError('');
    try {
      const res = await opportunityApi.list({
        search: debouncedSearch || undefined,
        stage: filters.stage || undefined,
        priority: filters.priority || undefined,
        mine: filters.mine || undefined,
        sortBy: filters.sortBy,
        order: filters.order,
        page,
        limit: PAGE_SIZE,
      });
      setOpportunities(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setListLoading(false);
    }
  }, [debouncedSearch, filters.stage, filters.priority, filters.mine, filters.sortBy, filters.order, page]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const handleFilterChange = (next) => {
    setFilters(next);
    if (next.stage !== filters.stage || next.priority !== filters.priority || next.mine !== filters.mine) {
      setPage(1);
    }
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const handleEdit = (opportunity) => navigate(`/opportunities/${opportunity._id}/edit`);

  const handleDeleteConfirmed = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await opportunityApi.remove(pendingDelete._id);
      setPendingDelete(null);
      setNotice(`"${pendingDelete.customerName}" was deleted.`);
      fetchOpportunities();
      fetchSummary();
    } catch (err) {
      setError(getErrorMessage(err));
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <Navbar />

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-800">Opportunity pipeline</h1>
            <p className="text-sm text-ink-400">Shared across your whole team — everyone can view, only owners can edit.</p>
          </div>
        </div>

        <SummaryStrip summary={summary} loading={summaryLoading} />

        {notice && <AlertBanner variant="success" message={notice} onDismiss={() => setNotice('')} />}
        {error && <AlertBanner variant="error" message={error} onDismiss={() => setError('')} />}

        <FilterBar filters={filters} onChange={handleFilterChange} onReset={handleReset} />

        {listLoading ? (
          <Spinner label="Loading opportunities…" />
        ) : opportunities.length === 0 ? (
          <EmptyState
            title="No opportunities match these filters"
            description="Try clearing your filters, or create the first opportunity in the pipeline."
            action={
              <button
                type="button"
                onClick={() => navigate('/opportunities/new')}
                className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-ledger-600 px-3 py-2 text-sm font-medium text-white hover:bg-ledger-700"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                New opportunity
              </button>
            }
          />
        ) : (
          <>
            <OpportunityList
              opportunities={opportunities}
              currentUserId={user?.id}
              onEdit={handleEdit}
              onDelete={setPendingDelete}
            />
            <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={setPage} />
          </>
        )}
      </main>

      {/* Mobile floating action button (desktop has the button in the navbar) */}
      <button
        type="button"
        onClick={() => navigate('/opportunities/new')}
        className="fixed bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full bg-ledger-600 text-white shadow-raised sm:hidden"
        aria-label="New opportunity"
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
      </button>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this opportunity?"
        description={pendingDelete ? `This will permanently remove "${pendingDelete.customerName}" from the pipeline.` : ''}
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
