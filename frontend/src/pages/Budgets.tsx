import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Target, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { budgetsApi, Budget, BudgetCreate } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, getCategoryIcon, getCategoryColor } from '@/lib/utils'
import { dashboardApi } from '@/lib/api/dashboard'

interface BudgetFormData {
  category: string
  amount: number
  month: string
}

const categories = [
  'Food', 'Transport', 'Shopping', 'Entertainment', 'Healthcare', 
  'Education', 'Bills', 'Travel', 'Gifts', 'Other'
]

export default function Budgets() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [formData, setFormData] = useState<BudgetFormData>({
    category: '',
    amount: 0,
    month: new Date().toISOString().slice(0, 7), // YYYY-MM format
  })

  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: budgets, isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: budgetsApi.getAll,
  })

  const { data: budgetUsage } = useQuery({
    queryKey: ['budget-usage'],
    queryFn: () => dashboardApi.getBudgetUsage(),
  })

  const createMutation = useMutation({
    mutationFn: budgetsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budget-usage'] })
      toast({
        title: "Success",
        description: "Budget created successfully",
      })
      setIsModalOpen(false)
      resetForm()
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create budget",
        variant: "destructive",
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BudgetCreate }) =>
      budgetsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budget-usage'] })
      toast({
        title: "Success",
        description: "Budget updated successfully",
      })
      setIsModalOpen(false)
      setEditingBudget(null)
      resetForm()
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update budget",
        variant: "destructive",
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: budgetsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budget-usage'] })
      toast({
        title: "Success",
        description: "Budget deleted successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete budget",
        variant: "destructive",
      })
    },
  })

  const resetForm = () => {
    setFormData({
      category: '',
      amount: 0,
      month: new Date().toISOString().slice(0, 7),
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.category || !formData.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const submitData: BudgetCreate = {
      category: formData.category,
      amount: formData.amount,
      month: formData.month,
    }

    if (editingBudget) {
      updateMutation.mutate({ id: editingBudget.id, data: submitData })
    } else {
      createMutation.mutate(submitData)
    }
  }

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget)
    setFormData({
      category: budget.category,
      amount: budget.amount,
      month: budget.month,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      deleteMutation.mutate(id)
    }
  }

  const getBudgetUsage = (category: string) => {
    return budgetUsage?.find((usage: any) => usage.category === category)
  }

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
          <h1 className="text-3xl font-bold gradient-text">Budgets</h1>
          <p className="text-muted-foreground mt-1">Set and track your monthly budgets</p>
        </div>
        <Button 
          variant="gradient" 
          size="lg"
          onClick={() => {
            setEditingBudget(null)
            resetForm()
            setIsModalOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Budget
        </Button>
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {budgets?.map((budget, index) => {
            const usage = getBudgetUsage(budget.category)
            const percentageUsed = usage ? usage.percentage_used : 0
            const isExceeded = usage ? usage.is_exceeded : false
            
            return (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                        style={{ backgroundColor: getCategoryColor(budget.category) + '20' }}
                      >
                        {getCategoryIcon(budget.category)}
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(budget)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(budget.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-lg mb-2">{budget.category}</CardTitle>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Budget</span>
                        <span className="font-semibold">{formatCurrency(budget.amount)}</span>
                      </div>
                      
                      {usage && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Spent</span>
                            <span className="font-semibold">{formatCurrency(usage.spent_amount)}</span>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className={`font-medium ${
                                isExceeded ? 'text-destructive' : 
                                percentageUsed > 80 ? 'text-warning' : 'text-primary'
                              }`}>
                                {percentageUsed.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(percentageUsed, 100)}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                                className={`h-2 rounded-full ${
                                  isExceeded 
                                    ? 'bg-destructive' 
                                    : percentageUsed > 80 
                                      ? 'bg-warning' 
                                      : 'bg-primary'
                                }`}
                              />
                            </div>
                          </div>
                          
                          {isExceeded && (
                            <div className="flex items-center gap-2 text-destructive text-sm">
                              <TrendingUp className="h-4 w-4" />
                              <span>Budget exceeded by {formatCurrency(usage.spent_amount - budget.amount)}</span>
                            </div>
                          )}
                        </>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        {new Date(budget.month + '-01').toLocaleDateString('en-IN', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {(!budgets || budgets.length === 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Target className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No budgets set</h3>
          <p className="text-muted-foreground mb-4">
            Set monthly budgets to track your spending and stay on target
          </p>
          <Button 
            variant="gradient"
            onClick={() => {
              setEditingBudget(null)
              resetForm()
              setIsModalOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Budget
          </Button>
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-lg shadow-lg w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader>
                <CardTitle>
                  {editingBudget ? 'Edit Budget' : 'Add Budget'}
                </CardTitle>
                <CardDescription>
                  {editingBudget ? 'Update budget details' : 'Set a new monthly budget'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <label className="text-sm font-medium mb-2 block">Amount</label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 border rounded-md bg-background"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Month</label>
                    <input
                      type="month"
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
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
                        editingBudget ? 'Update' : 'Create'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
