/**
 * Utility functions for currency and date formatting
 */

export function formatVND(amount: number): string {
  if (isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumberWithDots(value: number | string): string {
  const num = typeof value === 'string' ? parseInt(value.replace(/\D/g, ''), 10) : value;
  if (isNaN(num)) return '';
  return num.toLocaleString('vi-VN');
}

export function parseNumberFromDots(val: string): number {
  const cleaned = val.replace(/\D/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}
