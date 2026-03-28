import { useState, useMemo } from 'react';
import { useActivity } from '../hooks/useActivity';
import { formatDate } from '../utils/format';

const ACTION_COLORS: Record<string, string> = {
  CREATED: 'bg-green-100 text-green-800',
  UPDATED: 'bg-blue-100 text-blue-800',
  DELETED: 'bg-red-100 text-red-800',
  STOCK_ADDED: 'bg-emerald-100 text-emerald-800',
  STOCK_REMOVED: 'bg-orange-100 text-orange-800',
};

export default function ActivityLogPage() {
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(0);

  const params = useMemo(() => {
    const p: Record<string, string> = { page: String(page), size: '20' };
    if (actionFilter) p.action = actionFilter;
    return p;
  }, [actionFilter, page]);

  const { data, loading } = useActivity(params);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Activity Log</h2>
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Actions</option>
          <option value="CREATED">Created</option>
          <option value="UPDATED">Updated</option>
          <option value="DELETED">Deleted</option>
          <option value="STOCK_ADDED">Stock Added</option>
          <option value="STOCK_REMOVED">Stock Removed</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" />
        </div>
      ) : !data || data.content.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <p className="text-gray-500">No activity recorded yet.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {data.content.map((log) => (
              <div key={log.id} className="bg-white rounded-xl border p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">{log.productName}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800'}`}>
                    {log.action.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                <p className="text-xs text-gray-400 mt-2">{formatDate(log.createdAt)}</p>
              </div>
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-gray-500">
                Page {data.number + 1} of {data.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={data.first}
                  className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={data.last}
                  className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
