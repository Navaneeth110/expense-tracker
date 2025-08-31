import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CreditCard, 
  DollarSign, 
  CheckCircle, 
  Circle, 
  ChevronDown, 
  ChevronUp,
  Calendar,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, formatDate, getCategoryIcon, getCategoryColor } from '@/lib/utils'

interface BillPaymentMode {
  id: number
  name: string
  total_amount: number
  paid_amount: number
  unpaid_amount: number
  expense_count: number
  paid_count: number
  unpaid_count: number
  expenses: any[]
}

export default function Bills() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [year, month] = selectedMonth.split('-').map(Number)

  const { data: bills, isLoading } = useQuery({
    queryKey: ['bills', year, month],
    queryFn: () => fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/bills/?year=${year}&month=${String(month).padStart(2, '0')}`).then(res => res.json()),
  })

  const markPaidMutation = useMutation({
    mutationFn: (expenseId: number) => 
      fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/expenses/${expenseId}/mark-paid`, { method: 'POST' }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills', year, month] })
      queryClient.invalidateQueries({ queryKey: ['emi-expenses'] })
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      toast({
        title: "Success",
        description: "Expense marked as paid",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark expense as paid",
        variant: "destructive",
      })
    },
  })

  const markUnpaidMutation = useMutation({
    mutationFn: (expenseId: number) => 
      fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/expenses/${expenseId}/mark-unpaid`, { method: 'POST' }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills', year, month] })
      queryClient.invalidateQueries({ queryKey: ['emi-expenses'] })
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      toast({
        title: "Success",
        description: "Expense marked as unpaid",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark expense as unpaid",
        variant: "destructive",
      })
    },
  })

  const toggleCard = (cardId: number) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId)
    } else {
      newExpanded.add(cardId)
    }
    setExpandedCards(newExpanded)
  }

  const handleMarkPaid = (expenseId: number) => {
    markPaidMutation.mutate(expenseId)
  }

  const handleMarkUnpaid = (expenseId: number) => {
    markUnpaidMutation.mutate(expenseId)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const totalAmount = bills?.reduce((sum: number, bill: BillPaymentMode) => sum + bill.total_amount, 0) || 0
  const totalPaid = bills?.reduce((sum: number, bill: BillPaymentMode) => sum + bill.paid_amount, 0) || 0
  const totalUnpaid = bills?.reduce((sum: number, bill: BillPaymentMode) => sum + bill.unpaid_amount, 0) || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">My Bills</h1>
          <p className="text-muted-foreground mt-1">Track and manage your credit card payments</p>
        </div>
      </div>

      {/* Month Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <label className="text-sm font-medium">Filter by Month:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="p-2 border rounded-md bg-background"
            />
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              All expenses this month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-muted-foreground">
              Successfully paid
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalUnpaid)}</div>
            <p className="text-xs text-muted-foreground">
              Still to be paid
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bills List */}
      <div className="space-y-4">
        <AnimatePresence>
          {bills && bills.length > 0 ? (
            bills.map((bill: BillPaymentMode, index: number) => (
              <motion.div
                key={bill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardHeader 
                    className="cursor-pointer"
                    onClick={() => toggleCard(bill.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <CreditCard className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{bill.name}</CardTitle>
                          <CardDescription>
                            {bill.expense_count} expenses • {bill.paid_count} paid • {bill.unpaid_count} pending
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold">{formatCurrency(bill.total_amount)}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(bill.paid_amount)} paid
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          {expandedCards.has(bill.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <AnimatePresence>
                    {expandedCards.has(bill.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            {bill.expenses.map((expense: any) => (
                              <motion.div
                                key={expense.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                                    style={{ backgroundColor: getCategoryColor(expense.category) + '20' }}
                                  >
                                    {getCategoryIcon(expense.category)}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium">{expense.title}</h4>
                                      {expense.is_emi && (
                                        <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                          EMI
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {expense.category} • {formatDate(expense.date)}
                                    </p>
                                    {expense.is_emi && expense.emi_monthly_amount && (
                                      <p className="text-sm text-blue-600 dark:text-blue-400">
                                        Monthly EMI: {formatCurrency(expense.emi_monthly_amount)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <div className="font-semibold">{formatCurrency(expense.amount)}</div>
                                    {(expense.is_paid || (expense.is_emi && (expense.paid_amount || 0) > 0)) && (
                                      <div className="text-sm text-green-600">
                                        {expense.is_emi ? (
                                          `Paid: ${formatCurrency(expense.paid_amount || 0)}`
                                        ) : (
                                          `Paid on ${formatDate(expense.paid_date)}`
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <Button
                                    variant={expense.is_paid || (expense.is_emi && (expense.paid_amount || 0) > 0) ? "outline" : "default"}
                                    size="sm"
                                    onClick={() => (expense.is_paid || (expense.is_emi && (expense.paid_amount || 0) > 0)) ? handleMarkUnpaid(expense.id) : handleMarkPaid(expense.id)}
                                    disabled={markPaidMutation.isPending || markUnpaidMutation.isPending}
                                  >
                                    {(expense.is_paid || (expense.is_emi && (expense.paid_amount || 0) > 0)) ? (
                                      <>
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Paid
                                      </>
                                    ) : (
                                      <>
                                        <Circle className="h-4 w-4 mr-1" />
                                        Mark Paid
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <CreditCard className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No bills found</h3>
              <p className="text-muted-foreground mb-4">
                {selectedMonth ? `No expenses found for ${selectedMonth}` : 'Add some expenses to see your bills here'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
