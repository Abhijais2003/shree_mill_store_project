import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatNumber } from '../format';

describe('formatCurrency', () => {
  it('formats a number as INR currency', () => {
    const result = formatCurrency(1234.5);
    // Should contain the rupee symbol and formatted number
    expect(result).toContain('1,234.50');
  });

  it('formats zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0.00');
  });

  it('formats large numbers with Indian grouping', () => {
    const result = formatCurrency(1234567);
    // Indian number system: 12,34,567
    expect(result).toContain('12,34,567.00');
  });
});

describe('formatDate', () => {
  it('formats an ISO date string', () => {
    const result = formatDate('2024-06-15T10:30:00Z');
    // Should contain day, month abbreviation, and year
    expect(result).toMatch(/15/);
    expect(result).toMatch(/Jun/);
    expect(result).toMatch(/2024/);
  });
});

describe('formatNumber', () => {
  it('formats a number with Indian grouping', () => {
    expect(formatNumber(1234567)).toBe('12,34,567');
  });

  it('formats zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('formats small numbers without separators', () => {
    expect(formatNumber(999)).toBe('999');
  });
});
