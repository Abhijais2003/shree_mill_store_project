export interface Category {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  type: string;
  shape: string | null;
  brandId: number | null;
  brandName: string | null;
  size: string | null;
  quantity: number;
  unitPrice: number;
  minStock: number;
  description: string | null;
  imageUrl: string | null;
  lowStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCreateRequest {
  name: string;
  categoryId: number;
  type: string;
  shape?: string;
  brandId?: number;
  size?: string;
  quantity?: number;
  unitPrice?: number;
  minStock?: number;
  description?: string;
  imageUrl?: string;
}

export interface ProductUpdateRequest extends ProductCreateRequest {}

export interface StockAdjustRequest {
  adjustment: number;
  reason?: string;
}

export interface ActivityLog {
  id: number;
  productId: number | null;
  productName: string;
  action: string;
  details: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
}

export interface OcrItem {
  name: string;
  quantity: number;
  unitPrice: number;
  confidence: number;
}

export interface OcrResult {
  rawText: string;
  items: OcrItem[];
  warnings: string[];
}

export interface DashboardStats {
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
  lowStockCount: number;
  lowStockItems: Product[];
  recentActivity: ActivityLog[];
  categoryBreakdown: CategoryBreakdown[];
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  value: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
