import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateInput(date: string | Date): string {
  return new Date(date).toISOString().split('T')[0]
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'Food': '🍕',
    'Transport': '🚗',
    'Shopping': '🛍️',
    'Entertainment': '🎬',
    'Healthcare': '🏥',
    'Education': '📚',
    'Bills': '📄',
    'Travel': '✈️',
    'Gifts': '🎁',
    'Other': '📦',
  }
  return icons[category] || '📦'
}

export function getPaymentModeIcon(type: string): string {
  const icons: Record<string, string> = {
    'credit_card': '💳',
    'debit_card': '💳',
    'bank_account': '🏦',
    'upi': '📱',
    'cash': '💰',
  }
  return icons[type] || '💳'
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Food': '#FF6B6B',
    'Transport': '#4ECDC4',
    'Shopping': '#45B7D1',
    'Entertainment': '#96CEB4',
    'Healthcare': '#FFEAA7',
    'Education': '#DDA0DD',
    'Bills': '#98D8C8',
    'Travel': '#F7DC6F',
    'Gifts': '#BB8FCE',
    'Other': '#85C1E9',
  }
  return colors[category] || '#85C1E9'
}
