import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Pencil, Trash2, Minus, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useBrands } from '../hooks/useBrands';
import { productApi } from '../services/api';
import StockBadge from '../components/StockBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatCurrency } from '../utils/format';

export default function ProductList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState('');
  const [brandId, setBrandId] = useState('');
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const params = useMemo(() => {
    const p: Record<string, string> = { page: String(page), size: '20' };
    if (search) p.search = search;
    if (categoryId) p.categoryId = categoryId;
    if (type) p.type = type;
    if (brandId) p.brandId = brandId;
    return p;
  }, [search, categoryId, type, brandId, page]);

  const { data, loading, refetch } = useProducts(params);
  const { categories } = useCategories();
  const { brands } = useBrands();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await productApi.delete(deleteId);
      toast.success('Product deleted');
      setDeleteId(null);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const handleStockAdjust = async (id: number, adjustment: number) => {
    try {
      await productApi.adjustStock(id, { adjustment, reason: 'Quick adjust' });
      toast.success(adjustment > 0 ? 'Stock added' : 'Stock removed');
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Adjust failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Inventory</h2>
        <Link
          to="/products/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-800 text-white text-sm font-medium rounded-lg hover:bg-blue-900"
        >
          <Plus size={18} /> Add Item
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, type, or size..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-2.5 border rounded-lg ${showFilters ? 'bg-blue-50 border-blue-300' : ''}`}
        >
          <Filter size={18} />
        </button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-lg border">
          <select
            value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value); setPage(0); }}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={brandId}
            onChange={(e) => { setBrandId(e.target.value); setPage(0); }}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Filter by type..."
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(0); }}
            className="border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      )}

      {/* Products List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" />
        </div>
      ) : !data || data.content.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <Package size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No items found.</p>
          <Link to="/products/new" className="text-blue-700 text-sm hover:underline mt-1 inline-block">
            Add your first item
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {data.content.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => navigate(`/products/${product.id}/edit`)}
                  >
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {product.type}
                      {product.brandName && ` | ${product.brandName}`}
                      {product.size && ` | ${product.size}`}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <StockBadge quantity={product.quantity} minStock={product.minStock} />
                      <span className="text-sm text-gray-600">{formatCurrency(product.unitPrice)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 ml-3">
                    <button
                      onClick={() => handleStockAdjust(product.id, -1)}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600"
                      title="Remove 1"
                    >
                      <Minus size={16} />
                    </button>
                    <button
                      onClick={() => handleStockAdjust(product.id, 1)}
                      className="p-2 rounded-lg hover:bg-green-50 text-gray-500 hover:text-green-600"
                      title="Add 1"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => navigate(`/products/${product.id}/edit`)}
                      className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteId(product.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-gray-500">
                Showing {data.number * data.size + 1}–{Math.min((data.number + 1) * data.size, data.totalElements)} of {data.totalElements}
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

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Product"
        message="Are you sure you want to delete this product? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
