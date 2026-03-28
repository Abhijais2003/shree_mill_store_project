import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { productApi } from '../services/api';
import { useCategories } from '../hooks/useCategories';
import { useBrands } from '../hooks/useBrands';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  categoryId: z.coerce.number().min(1, 'Category is required'),
  type: z.string().min(1, 'Type is required').max(100),
  shape: z.string().max(100).optional().or(z.literal('')),
  brandId: z.coerce.number().optional().or(z.literal(0)).transform(v => v || undefined),
  size: z.string().max(50).optional().or(z.literal('')),
  quantity: z.coerce.number().min(0, 'Cannot be negative').default(0),
  unitPrice: z.coerce.number().min(0, 'Cannot be negative').default(0),
  minStock: z.coerce.number().min(0, 'Cannot be negative').default(5),
  description: z.string().max(1000).optional().or(z.literal('')),
});

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  const { categories } = useCategories();
  const { brands } = useBrands();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      categoryId: 0,
      type: '',
      shape: '',
      brandId: 0,
      size: '',
      quantity: 0,
      unitPrice: 0,
      minStock: 5,
      description: '',
    },
  });

  useEffect(() => {
    if (id) {
      productApi.get(Number(id))
        .then((product) => {
          reset({
            name: product.name,
            categoryId: product.categoryId,
            type: product.type,
            shape: product.shape || '',
            brandId: product.brandId || 0,
            size: product.size || '',
            quantity: product.quantity,
            unitPrice: product.unitPrice,
            minStock: product.minStock,
            description: product.description || '',
          });
        })
        .catch(() => toast.error('Failed to load product'))
        .finally(() => setFetching(false));
    }
  }, [id, reset]);

  const onSubmit = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const payload = {
        name: data.name as string,
        categoryId: data.categoryId as number,
        type: data.type as string,
        shape: (data.shape as string) || undefined,
        brandId: (data.brandId as number) || undefined,
        size: (data.size as string) || undefined,
        quantity: data.quantity as number,
        unitPrice: data.unitPrice as number,
        minStock: data.minStock as number,
        description: (data.description as string) || undefined,
      };
      if (isEdit) {
        await productApi.update(Number(id), payload);
        toast.success('Product updated');
      } else {
        await productApi.create(payload);
        toast.success('Product added');
      }
      navigate('/products');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" />
      </div>
    );
  }

  const inputClass = "w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const errorClass = "text-red-600 text-xs mt-1";

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {isEdit ? 'Edit Product' : 'Add New Product'}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white rounded-xl border p-6 shadow-sm">
        <div>
          <label className={labelClass}>Product Name *</label>
          <input {...register('name')} className={inputClass} placeholder="e.g., Fenner V-Belt A-36" />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Category *</label>
            <select {...register('categoryId')} className={inputClass}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className={errorClass}>{errors.categoryId.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Type *</label>
            <input {...register('type')} className={inputClass} placeholder="e.g., V-Belt" />
            {errors.type && <p className={errorClass}>{errors.type.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Shape</label>
            <input {...register('shape')} className={inputClass} placeholder="e.g., V-Shape" />
          </div>
          <div>
            <label className={labelClass}>Brand</label>
            <select {...register('brandId')} className={inputClass}>
              <option value="0">No brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Size</label>
            <input {...register('size')} className={inputClass} placeholder="e.g., A-36" />
          </div>
          <div>
            <label className={labelClass}>Quantity</label>
            <input {...register('quantity')} type="number" min="0" className={inputClass} />
            {errors.quantity && <p className={errorClass}>{errors.quantity.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Unit Price (Rs.)</label>
            <input {...register('unitPrice')} type="number" min="0" step="0.01" className={inputClass} />
            {errors.unitPrice && <p className={errorClass}>{errors.unitPrice.message}</p>}
          </div>
        </div>

        <div>
          <label className={labelClass}>Low Stock Alert (min. quantity)</label>
          <input {...register('minStock')} type="number" min="0" className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea {...register('description')} className={inputClass} rows={3} placeholder="Optional notes..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-blue-800 text-white text-sm font-medium rounded-lg hover:bg-blue-900 disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-6 py-2.5 border text-sm font-medium rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
