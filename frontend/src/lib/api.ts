import axios from 'axios'

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Types
export interface PaymentMode {
  id: number
  name: string
  type: string
  icon: string
  color: string
  created_at: string
  updated_at: string | null
}

export interface PaymentModeCreate {
  name: string
  type: string
  icon: string
  color: string
}

export interface PaymentModeUpdate {
  name?: string
  type?: string
  icon?: string
  color?: string
}

export interface Expense {
  id: number
  title: string
  amount: number
  category: string
  date: string
  description: string | null
  payment_mode_id: number
  payment_mode: PaymentMode
  created_at: string
  updated_at: string
  is_emi: boolean
  emi_tenure: number | null
  emi_processing_fees: number | null
  emi_interest_rate: number | null
  emi_gst: number | null
  emi_monthly_amount: number | null
  emi_total_amount: number | null
  emi_principal_amount: number | null
  is_paid: boolean
  paid_date: string | null
  paid_amount: number | null
}

export interface ExpenseCreate {
  title: string
  amount: number
  category: string
  date: string
  description?: string
  payment_mode_id: number
  is_emi?: boolean
  emi_tenure?: number
  emi_processing_fees?: number
  emi_interest_rate?: number
  emi_gst?: number
}

export interface ExpenseUpdate {
  title?: string
  amount?: number
  category?: string
  date?: string
  description?: string
  payment_mode_id?: number
  is_emi?: boolean
  emi_tenure?: number
  emi_processing_fees?: number
  emi_interest_rate?: number
  emi_gst?: number
  is_paid?: boolean
  paid_date?: string
  paid_amount?: number
}

export interface Budget {
  id: number
  category: string
  amount: number
  month: string
  created_at: string
  updated_at: string
}

export interface BudgetCreate {
  category: string
  amount: number
  month: string
}

export interface BudgetUpdate {
  category?: string
  amount?: number
  month?: string
}

export interface DashboardOverview {
  total_expenses: number
  total_expenses_this_month: number
  top_category: string
  top_category_amount: number
  most_used_payment_mode: string
  expenses_count: number
  average_expense: number
}

export interface CategoryBreakdown {
  category: string
  amount: number
  percentage: number
  count: number
}

export interface BudgetUsage {
  category: string
  budget_amount: number
  spent_amount: number
  percentage_used: number
  is_exceeded: boolean
}

export interface Insight {
  type: string
  title: string
  message: string
  severity: string
  category?: string
  amount?: number
}

export interface ExpenseTrend {
  date: string
  amount: number
  count: number
}

// Payment Modes API
export const paymentModesApi = {
  getAll: () => api.get<PaymentMode[]>('/payment-modes/').then(res => res.data),
  create: (data: PaymentModeCreate) => api.post<PaymentMode>('/payment-modes/', data).then(res => res.data),
  update: (id: number, data: PaymentModeUpdate) => api.put<PaymentMode>(`/payment-modes/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/payment-modes/${id}`).then(res => res.data),
}

// Expenses API
export const expensesApi = {
  getAll: (params?: {
    skip?: number
    limit?: number
    start_date?: string
    end_date?: string
    category?: string
    payment_mode_id?: number
  }) => api.get<Expense[]>('/expenses/', { params }).then(res => res.data),
  create: (data: ExpenseCreate) => api.post<Expense>('/expenses/', data).then(res => res.data),
  update: (id: number, data: ExpenseUpdate) => api.put<Expense>(`/expenses/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/expenses/${id}`).then(res => res.data),
  markExpenseAsPaid: (id: number, paid_amount?: number, paid_date?: string) => 
    api.post(`/expenses/${id}/mark-paid`, { paid_amount, paid_date }).then(res => res.data),
  markExpenseAsUnpaid: (id: number) => 
    api.post(`/expenses/${id}/mark-unpaid`).then(res => res.data),

  getEMIExpenses: () => api.get('/emi/').then(res => res.data),
}

// Budgets API
export const budgetsApi = {
  getAll: () => api.get<Budget[]>('/budgets/').then(res => res.data),
  create: (data: BudgetCreate) => api.post<Budget>('/budgets/', data).then(res => res.data),
  update: (id: number, data: BudgetUpdate) => api.put<Budget>(`/budgets/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/budgets/${id}`).then(res => res.data),
}

// Dashboard API
export const dashboardApi = {
  getOverview: () => api.get<DashboardOverview>('/dashboard/overview').then(res => res.data),
  getCategoryBreakdown: () => api.get<CategoryBreakdown[]>('/dashboard/category-breakdown').then(res => res.data),
  getBudgetUsage: () => api.get<BudgetUsage[]>('/dashboard/budget-usage').then(res => res.data),
  getInsights: () => api.get<Insight[]>('/dashboard/insights').then(res => res.data),
  getExpenseTrends: () => api.get<ExpenseTrend[]>('/dashboard/expense-trends').then(res => res.data),
}

export default api
