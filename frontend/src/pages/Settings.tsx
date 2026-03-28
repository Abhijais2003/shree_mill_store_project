import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCategories } from '../hooks/useCategories';
import { useBrands } from '../hooks/useBrands';
import { categoryApi, brandApi } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'categories' | 'brands'>('categories');

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Settings</h2>

      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'categories' ? 'border-blue-800 text-blue-800' : 'border-transparent text-gray-500'
          }`}
        >
          Categories
        </button>
        <button
          onClick={() => setActiveTab('brands')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'brands' ? 'border-blue-800 text-blue-800' : 'border-transparent text-gray-500'
          }`}
        >
          Brands
        </button>
      </div>

      {activeTab === 'categories' ? <CategoryManager /> : <BrandManager />}
    </div>
  );
}

function CategoryManager() {
  const { categories, refetch } = useCategories();
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      await categoryApi.create({ name: newName.trim(), description: newDesc.trim() || undefined });
      toast.success('Category added');
      setNewName('');
      setNewDesc('');
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setAdding(false);
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      await categoryApi.update(id, { name: editName.trim(), description: editDesc.trim() || undefined });
      toast.success('Category updated');
      setEditId(null);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await categoryApi.delete(deleteId);
      toast.success('Category deleted');
      setDeleteId(null);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    }
  };

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="bg-white rounded-xl border p-4 shadow-sm space-y-3">
        <p className="text-sm font-medium text-gray-700">Add Category</p>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm"
          placeholder="Category name"
        />
        <input
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm"
          placeholder="Description (optional)"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newName.trim()}
          className="px-4 py-2 bg-blue-800 text-white text-sm font-medium rounded-lg hover:bg-blue-900 disabled:opacity-50 flex items-center gap-1.5"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-xl border p-4 shadow-sm">
            {editId === cat.id ? (
              <div className="space-y-2">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
                <input
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Description"
                />
                <div className="flex gap-2">
                  <button onClick={() => handleUpdate(cat.id)} className="p-2 rounded-lg hover:bg-green-50 text-green-600">
                    <Check size={16} />
                  </button>
                  <button onClick={() => setEditId(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{cat.name}</p>
                  {cat.description && <p className="text-sm text-gray-500">{cat.description}</p>}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setEditId(cat.id); setEditName(cat.name); setEditDesc(cat.description || ''); }}
                    className="p-2 rounded-lg hover:bg-blue-50 text-gray-500"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteId(cat.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Category"
        message="Are you sure? Categories with products cannot be deleted."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

function BrandManager() {
  const { brands, refetch } = useBrands();
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      await brandApi.create({ name: newName.trim() });
      toast.success('Brand added');
      setNewName('');
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setAdding(false);
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      await brandApi.update(id, { name: editName.trim() });
      toast.success('Brand updated');
      setEditId(null);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await brandApi.delete(deleteId);
      toast.success('Brand deleted');
      setDeleteId(null);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border p-4 shadow-sm space-y-3">
        <p className="text-sm font-medium text-gray-700">Add Brand</p>
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg text-sm"
            placeholder="Brand name"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            disabled={adding || !newName.trim()}
            className="px-4 py-2 bg-blue-800 text-white text-sm font-medium rounded-lg hover:bg-blue-900 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {brands.map((brand) => (
          <div key={brand.id} className="bg-white rounded-xl border p-4 shadow-sm">
            {editId === brand.id ? (
              <div className="flex items-center gap-2">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdate(brand.id)}
                />
                <button onClick={() => handleUpdate(brand.id)} className="p-2 rounded-lg hover:bg-green-50 text-green-600">
                  <Check size={16} />
                </button>
                <button onClick={() => setEditId(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">{brand.name}</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setEditId(brand.id); setEditName(brand.name); }}
                    className="p-2 rounded-lg hover:bg-blue-50 text-gray-500"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteId(brand.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Brand"
        message="Are you sure? Brands with products cannot be deleted."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
