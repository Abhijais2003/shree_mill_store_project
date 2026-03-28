import type {
  Product, ProductCreateRequest, ProductUpdateRequest, StockAdjustRequest,
  Category, Brand, ActivityLog, OcrResult, DashboardStats, Page,
} from '../types';

const BASE = '/api/v1';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Products
export const productApi = {
  list: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Page<Product>>(`${BASE}/products${query}`);
  },
  get: (id: number) => request<Product>(`${BASE}/products/${id}`),
  create: (data: ProductCreateRequest) =>
    request<Product>(`${BASE}/products`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: ProductUpdateRequest) =>
    request<Product>(`${BASE}/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`${BASE}/products/${id}`, { method: 'DELETE' }),
  adjustStock: (id: number, data: StockAdjustRequest) =>
    request<Product>(`${BASE}/products/${id}/stock`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// Categories
export const categoryApi = {
  list: () => request<Category[]>(`${BASE}/categories`),
  get: (id: number) => request<Category>(`${BASE}/categories/${id}`),
  create: (data: { name: string; description?: string }) =>
    request<Category>(`${BASE}/categories`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: { name: string; description?: string }) =>
    request<Category>(`${BASE}/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`${BASE}/categories/${id}`, { method: 'DELETE' }),
};

// Brands
export const brandApi = {
  list: () => request<Brand[]>(`${BASE}/brands`),
  get: (id: number) => request<Brand>(`${BASE}/brands/${id}`),
  create: (data: { name: string }) =>
    request<Brand>(`${BASE}/brands`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: { name: string }) =>
    request<Brand>(`${BASE}/brands/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`${BASE}/brands/${id}`, { method: 'DELETE' }),
};

// Activity
export const activityApi = {
  list: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Page<ActivityLog>>(`${BASE}/activity${query}`);
  },
};

// OCR
export const ocrApi = {
  scan: async (file: File): Promise<OcrResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE}/ocr/scan`, { method: 'POST', body: formData });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || 'OCR scan failed');
    }
    return res.json();
  },
};

// Dashboard
export const dashboardApi = {
  stats: () => request<DashboardStats>(`${BASE}/dashboard/stats`),
};
