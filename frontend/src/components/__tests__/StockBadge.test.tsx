import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StockBadge from '../StockBadge';

describe('StockBadge', () => {
  it('shows low stock (red) when quantity <= minStock', () => {
    render(<StockBadge quantity={2} minStock={5} />);
    const badge = screen.getByText('2 in stock');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-red-100');
    expect(badge.className).toContain('text-red-800');
  });

  it('shows low stock (red) when quantity equals minStock', () => {
    render(<StockBadge quantity={5} minStock={5} />);
    const badge = screen.getByText('5 in stock');
    expect(badge.className).toContain('bg-red-100');
  });

  it('shows warning (yellow) when quantity is between minStock and minStock*2', () => {
    render(<StockBadge quantity={8} minStock={5} />);
    const badge = screen.getByText('8 in stock');
    expect(badge.className).toContain('bg-yellow-100');
    expect(badge.className).toContain('text-yellow-800');
  });

  it('shows healthy (green) when quantity > minStock * 2', () => {
    render(<StockBadge quantity={20} minStock={5} />);
    const badge = screen.getByText('20 in stock');
    expect(badge.className).toContain('bg-green-100');
    expect(badge.className).toContain('text-green-800');
  });

  it('treats quantity at exactly minStock*2 as warning', () => {
    render(<StockBadge quantity={10} minStock={5} />);
    const badge = screen.getByText('10 in stock');
    expect(badge.className).toContain('bg-yellow-100');
  });

  it('treats quantity just above minStock*2 as healthy', () => {
    render(<StockBadge quantity={11} minStock={5} />);
    const badge = screen.getByText('11 in stock');
    expect(badge.className).toContain('bg-green-100');
  });
});
