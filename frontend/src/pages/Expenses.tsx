import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Search, Filter, Calculator } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { expensesApi, paymentModesApi, Expense, ExpenseCreate, ExpenseUpdate } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, formatDate, getCategoryIcon, getCategoryColor } from '@/lib/utils'

interface ExpenseFormData {
  title: string
  amount: string
  category: string
  date: string
  description: string
  payment_mode_id: number
  is_emi: boolean
  emi_tenure: string
  emi_processing_fees: string
  emi_interest_rate: string
  emi_gst: string
}

const categories = [
  'Food', 'Transport', 'Shopping', 'Entertainment', 'Healthcare', 
  'Education', 'Bills', 'Travel', 'Gifts', 'Other'
]

export default function Expenses() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [emiCalculation, setEmiCalculation] = useState<any>(null)
  const [formData, setFormData] = useState<ExpenseFormData>({
    title: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    payment_mode_id: 0,
    is_emi: false,
    emi_tenure: '',
    emi_processing_fees: '',
    emi_interest_rate: '',
    emi_gst: '',
  })

  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => expensesApi.getAll(),
  })

  const { data: paymentModes } = useQuery({
    queryKey: ['payment-modes'],
    queryFn: paymentModesApi.getAll,
  })

  const createMutation = useMutation({
    mutationFn: expensesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] })
      queryClient.invalidateQueries({ queryKey: ['category-breakdown'] })
      queryClient.invalidateQueries({ queryKey: ['emi-expenses'] })
      toast({
        title: "Success",
        description: "Expense added successfully",
      })
      setIsModalOpen(false)
      resetForm()
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ExpenseUpdate }) =>
      expensesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] })
      queryClient.invalidateQueries({ queryKey: ['category-breakdown'] })
      queryClient.invalidateQueries({ queryKey: ['emi-expenses'] })
      toast({
        title: "Success",
        description: "Expense updated successfully",
      })
      setIsModalOpen(false)
      setEditingExpense(null)
      resetForm()
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update expense",
        variant: "destructive",
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: expensesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] })
      queryClient.invalidateQueries({ queryKey: ['category-breakdown'] })
      queryClient.invalidateQueries({ queryKey: ['emi-expenses'] })
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      })
    },
  })

  const resetForm = () => {
    setFormData({
      title: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      payment_mode_id: 0,
      is_emi: false,
      emi_tenure: '',
      emi_processing_fees: '',
      emi_interest_rate: '',
      emi_gst: '',
    })
    setEmiCalculation(null)
  }

  const calculateEMI = async () => {
    if (!formData.amount || !formData.emi_tenure) {
      toast({
        title: "Error",
        description: "Please enter amount and tenure for EMI calculation",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch('/api/emi/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          principal: parseFloat(formData.amount),
          tenure: parseInt(formData.emi_tenure),
          interest_rate: parseFloat(formData.emi_interest_rate) || 0,
          processing_fees: parseFloat(formData.emi_processing_fees) || 0,
          gst: parseFloat(formData.emi_gst) || 0,
        }),
      })
      
      if (response.ok) {
        const calculation = await response.json()
        setEmiCalculation(calculation)
        toast({
          title: "EMI Calculated",
          description: `Monthly EMI: ${formatCurrency(calculation.monthly_amount)}`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate EMI",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.amount || !formData.category || !formData.payment_mode_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (formData.is_emi && (!formData.emi_tenure || !emiCalculation)) {
      toast({
        title: "Error",
        description: "Please calculate EMI before submitting",
        variant: "destructive",
      })
      return
    }

    const submitData: ExpenseCreate = {
      title: formData.title,
      amount: parseFloat(formData.amount) || 0,
      category: formData.category,
      date: formData.date,
      description: formData.description,
      payment_mode_id: formData.payment_mode_id,
      is_emi: formData.is_emi,
      emi_tenure: formData.is_emi ? parseInt(formData.emi_tenure) : undefined,
      emi_processing_fees: formData.is_emi ? parseFloat(formData.emi_processing_fees) || 0 : undefined,
      emi_interest_rate: formData.is_emi ? parseFloat(formData.emi_interest_rate) || 0 : undefined,
      emi_gst: formData.is_emi ? parseFloat(formData.emi_gst) || 0 : undefined,
    }

    if (editingExpense) {
      // For updates, only send the fields that are actually being updated
      const updateData: ExpenseUpdate = {
        title: formData.title,
        amount: parseFloat(formData.amount) || 0,
        category: formData.category,
        date: formData.date,
        description: formData.description,
        payment_mode_id: formData.payment_mode_id,
        is_emi: formData.is_emi,
        emi_tenure: formData.is_emi ? parseInt(formData.emi_tenure) : undefined,
        emi_processing_fees: formData.is_emi ? parseFloat(formData.emi_processing_fees) || 0 : undefined,
        emi_interest_rate: formData.is_emi ? parseFloat(formData.emi_interest_rate) || 0 : undefined,
        emi_gst: formData.is_emi ? parseFloat(formData.emi_gst) || 0 : undefined,
      }
      updateMutation.mutate({ id: editingExpense.id, data: updateData })
    } else {
      createMutation.mutate(submitData)
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setFormData({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date,
      description: expense.description || '',
      payment_mode_id: expense.payment_mode_id,
      is_emi: expense.is_emi || false,
      emi_tenure: expense.emi_tenure?.toString() || '',
      emi_processing_fees: expense.emi_processing_fees?.toString() || '',
      emi_interest_rate: expense.emi_interest_rate?.toString() || '',
      emi_gst: expense.emi_gst?.toString() || '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      deleteMutation.mutate(id)
    }
  }

  const filteredExpenses = (expenses || []).filter(expense => {
    const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || expense.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Expenses</h1>
          <p className="text-muted-foreground mt-1">Track and manage your expenses</p>
        </div>
        <Button 
          variant="gradient" 
          size="lg"
          onClick={() => {
            setEditingExpense(null)
            resetForm()
            setIsModalOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border rounded-md bg-background appearance-none"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredExpenses.map((expense, index) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                        style={{ backgroundColor: getCategoryColor(expense.category) + '20' }}
                      >
                        {getCategoryIcon(expense.category)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{expense.title}</h3>
                          {expense.is_emi && (
                            <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                              EMI
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {expense.category} • {formatDate(expense.date)}
                        </p>
                        {expense.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {expense.description}
                          </p>
                        )}
                        {expense.is_emi && expense.emi_monthly_amount && (
                          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                            Monthly EMI: {formatCurrency(expense.emi_monthly_amount)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-destructive">
                          -{formatCurrency(expense.amount)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {expense.payment_mode.name}
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(expense)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(expense.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredExpenses.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Search className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No expenses found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || selectedCategory 
              ? 'Try adjusting your search or filters' 
              : 'Add your first expense to start tracking'
            }
          </p>
          {!searchTerm && !selectedCategory && (
            <Button 
              variant="gradient"
              onClick={() => {
                setEditingExpense(null)
                resetForm()
                setIsModalOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          )}
        </motion.div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <Card>
                <CardHeader>
                  <CardTitle>{editingExpense ? 'Edit Expense' : 'Add Expense'}</CardTitle>
                  <CardDescription>
                    {editingExpense ? 'Update expense details' : 'Add a new expense to your tracker'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full p-2 border rounded-md bg-background"
                        placeholder="e.g., Grocery shopping"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Amount</label>
                      <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full p-2 border rounded-md bg-background"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full p-2 border rounded-md bg-background"
                      >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Date</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full p-2 border rounded-md bg-background"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Payment Mode</label>
                      <select
                        value={formData.payment_mode_id}
                        onChange={(e) => setFormData({ ...formData, payment_mode_id: parseInt(e.target.value) || 0 })}
                        className="w-full p-2 border rounded-md bg-background"
                      >
                        <option value="">Select payment mode</option>
                        {paymentModes?.map(mode => (
                          <option key={mode.id} value={mode.id}>{mode.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* EMI Toggle */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_emi"
                        checked={formData.is_emi}
                        onChange={(e) => setFormData({ ...formData, is_emi: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="is_emi" className="text-sm font-medium">
                        This is an EMI expense
                      </label>
                    </div>

                    {/* EMI Fields */}
                    {formData.is_emi && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 p-4 border rounded-lg bg-muted/20"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Tenure (months)</label>
                            <input
                              type="number"
                              value={formData.emi_tenure}
                              onChange={(e) => setFormData({ ...formData, emi_tenure: e.target.value })}
                              className="w-full p-2 border rounded-md bg-background"
                              placeholder="12"
                              min="1"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Interest Rate (% p.a.)</label>
                            <input
                              type="number"
                              value={formData.emi_interest_rate}
                              onChange={(e) => setFormData({ ...formData, emi_interest_rate: e.target.value })}
                              className="w-full p-2 border rounded-md bg-background"
                              placeholder="0"
                              step="0.01"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Processing Fees</label>
                            <input
                              type="number"
                              value={formData.emi_processing_fees}
                              onChange={(e) => setFormData({ ...formData, emi_processing_fees: e.target.value })}
                              className="w-full p-2 border rounded-md bg-background"
                              placeholder="0"
                              step="0.01"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">GST</label>
                            <input
                              type="number"
                              value={formData.emi_gst}
                              onChange={(e) => setFormData({ ...formData, emi_gst: e.target.value })}
                              className="w-full p-2 border rounded-md bg-background"
                              placeholder="0"
                              step="0.01"
                              min="0"
                            />
                          </div>
                        </div>
                        
                        <Button
                          type="button"
                          variant="outline"
                          onClick={calculateEMI}
                          className="w-full"
                        >
                          <Calculator className="mr-2 h-4 w-4" />
                          Calculate EMI
                        </Button>

                        {emiCalculation && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                          >
                            <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">EMI Calculation</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>Monthly EMI: <span className="font-medium">{formatCurrency(emiCalculation.monthly_amount)}</span></div>
                              <div>Total Amount: <span className="font-medium">{formatCurrency(emiCalculation.total_amount)}</span></div>
                              <div>Total Interest: <span className="font-medium">{formatCurrency(emiCalculation.total_interest)}</span></div>
                              <div>Processing Fees: <span className="font-medium">{formatCurrency(emiCalculation.total_processing_fees)}</span></div>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}

                    <div>
                      <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full p-2 border rounded-md bg-background"
                        placeholder="Add any additional details..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="gradient"
                        className="flex-1"
                        disabled={createMutation.isPending || updateMutation.isPending}
                      >
                        {createMutation.isPending || updateMutation.isPending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          editingExpense ? 'Update' : 'Add'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
