import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, AlertTriangle, TrendingUp, IndianRupee } from 'lucide-react';
import { dashboardApi } from '../services/api';
import { formatCurrency, formatNumber, formatDate } from '../utils/format';
import StockBadge from '../components/StockBadge';
import type { DashboardStats } from '../types';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.stats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" />
      </div>
    );
  }

  if (!stats) {
    return <p className="text-gray-500 text-center mt-10">Could not load dashboard data.</p>;
  }

  const statCards = [
    { label: 'Total Items', value: formatNumber(stats.totalProducts), icon: Package, color: 'bg-blue-50 text-blue-800' },
    { label: 'Total Stock', value: formatNumber(stats.totalQuantity), icon: TrendingUp, color: 'bg-green-50 text-green-800' },
    { label: 'Total Value', value: formatCurrency(stats.totalValue), icon: IndianRupee, color: 'bg-purple-50 text-purple-800' },
    { label: 'Low Stock', value: formatNumber(stats.lowStockCount), icon: AlertTriangle, color: 'bg-red-50 text-red-800' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border p-4 shadow-sm">
            <div className={`inline-flex p-2 rounded-lg ${card.color} mb-2`}>
              <card.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Low Stock Alerts */}
      {stats.lowStockItems.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-600" />
              Low Stock Items
            </h3>
            <Link to="/products" className="text-sm text-blue-700 hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y">
            {stats.lowStockItems.slice(0, 5).map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.type} {item.size && `- ${item.size}`}</p>
                </div>
                <StockBadge quantity={item.quantity} minStock={item.minStock} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Recent Activity</h3>
          <Link to="/activity" className="text-sm text-blue-700 hover:underline">
            View all
          </Link>
        </div>
        {stats.recentActivity.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No activity yet. Start by adding your first product.</p>
        ) : (
          <div className="divide-y">
            {stats.recentActivity.map((log) => (
              <div key={log.id} className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{log.productName}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    log.action === 'DELETED' ? 'bg-red-100 text-red-800' :
                    log.action === 'CREATED' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {log.action.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDate(log.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      {stats.categoryBreakdown.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">By Category</h3>
          </div>
          <div className="divide-y">
            {stats.categoryBreakdown.map((cat) => (
              <div key={cat.category} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{cat.category}</p>
                  <p className="text-sm text-gray-500">{cat.count} items</p>
                </div>
                <p className="font-semibold text-gray-900">{formatCurrency(cat.value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
