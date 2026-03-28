import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';
import type { DashboardStats } from '../../types';

// Mock the api module
vi.mock('../../services/api', () => ({
  dashboardApi: {
    stats: vi.fn(),
  },
}));

// Import after mock so we get the mocked version
import { dashboardApi } from '../../services/api';

const mockStats: DashboardStats = {
  totalProducts: 150,
  totalQuantity: 5000,
  totalValue: 250000,
  lowStockCount: 3,
  lowStockItems: [
    {
      id: 1,
      name: 'Steel Rod 10mm',
      categoryId: 1,
      categoryName: 'Rods',
      type: 'Rod',
      shape: 'Round',
      brandId: 1,
      brandName: 'Tata',
      size: '10mm',
      quantity: 2,
      unitPrice: 500,
      minStock: 10,
      description: null,
      imageUrl: null,
      lowStock: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ],
  recentActivity: [
    {
      id: 1,
      productId: 1,
      productName: 'Steel Rod 10mm',
      action: 'CREATED',
      details: 'Product created',
      oldValue: null,
      newValue: null,
      createdAt: '2024-06-15T10:30:00Z',
    },
  ],
  categoryBreakdown: [
    { category: 'Rods', count: 50, value: 100000 },
  ],
};

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner initially', () => {
    // Never resolve so we stay in loading state
    vi.mocked(dashboardApi.stats).mockReturnValue(new Promise(() => {}));
    const { container } = renderDashboard();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows error message when API fails', async () => {
    vi.mocked(dashboardApi.stats).mockRejectedValue(new Error('fail'));
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Could not load dashboard data.')).toBeInTheDocument();
    });
  });

  it('renders stat cards with formatted data', async () => {
    vi.mocked(dashboardApi.stats).mockResolvedValue(mockStats);
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Total Items')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Stock')).toBeInTheDocument();
    expect(screen.getByText('Total Value')).toBeInTheDocument();
    expect(screen.getByText('Low Stock')).toBeInTheDocument();
  });

  it('renders low stock items', async () => {
    vi.mocked(dashboardApi.stats).mockResolvedValue(mockStats);
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Low Stock Items')).toBeInTheDocument();
    });

    expect(screen.getByText('2 in stock')).toBeInTheDocument();
  });

  it('renders recent activity', async () => {
    vi.mocked(dashboardApi.stats).mockResolvedValue(mockStats);
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });

    expect(screen.getByText('CREATED')).toBeInTheDocument();
    expect(screen.getByText('Product created')).toBeInTheDocument();
  });

  it('renders category breakdown', async () => {
    vi.mocked(dashboardApi.stats).mockResolvedValue(mockStats);
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('By Category')).toBeInTheDocument();
    });

    expect(screen.getByText('Rods')).toBeInTheDocument();
    expect(screen.getByText('50 items')).toBeInTheDocument();
  });
});
