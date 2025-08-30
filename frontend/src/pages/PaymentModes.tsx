import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, CreditCard, Building2, Smartphone, Wallet } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { paymentModesApi, PaymentMode, PaymentModeCreate } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { getPaymentModeIcon } from '@/lib/utils'

interface PaymentModeFormData {
  name: string
  type: string
  icon: string
  color: string
}

const paymentTypes = [
  { value: 'credit_card', label: 'Credit Card', icon: CreditCard, color: '#FF6B6B' },
  { value: 'debit_card', label: 'Debit Card', icon: CreditCard, color: '#4ECDC4' },
  { value: 'bank_account', label: 'Bank Account', icon: Building2, color: '#45B7D1' },
  { value: 'upi', label: 'UPI', icon: Smartphone, color: '#96CEB4' },
  { value: 'cash', label: 'Cash', icon: Wallet, color: '#FFEAA7' },
]

export default function PaymentModes() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMode, setEditingMode] = useState<PaymentMode | null>(null)
  const [formData, setFormData] = useState<PaymentModeFormData>({
    name: '',
    type: '',
    icon: '',
    color: '',
  })

  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: paymentModes, isLoading } = useQuery({
    queryKey: ['payment-modes'],
    queryFn: paymentModesApi.getAll,
  })

  const createMutation = useMutation({
    mutationFn: paymentModesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-modes'] })
      toast({
        title: "Success",
        description: "Payment mode created successfully",
      })
      setIsModalOpen(false)
      resetForm()
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create payment mode",
        variant: "destructive",
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PaymentModeCreate }) =>
      paymentModesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-modes'] })
      toast({
        title: "Success",
        description: "Payment mode updated successfully",
      })
      setIsModalOpen(false)
      setEditingMode(null)
      resetForm()
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update payment mode",
        variant: "destructive",
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: paymentModesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-modes'] })
      toast({
        title: "Success",
        description: "Payment mode deleted successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete payment mode",
        variant: "destructive",
      })
    },
  })

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      icon: '',
      color: '',
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const selectedType = paymentTypes.find(pt => pt.value === formData.type)
    const submitData: PaymentModeCreate = {
      name: formData.name,
      type: formData.type,
      icon: selectedType?.icon.name || 'CreditCard',
      color: selectedType?.color || '#FF6B6B',
    }

    if (editingMode) {
      updateMutation.mutate({ id: editingMode.id, data: submitData })
    } else {
      createMutation.mutate(submitData)
    }
  }

  const handleEdit = (mode: PaymentMode) => {
    setEditingMode(mode)
    setFormData({
      name: mode.name,
      type: mode.type,
      icon: mode.icon,
      color: mode.color,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this payment mode?')) {
      deleteMutation.mutate(id)
    }
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
          <h1 className="text-3xl font-bold gradient-text">Payment Modes</h1>
          <p className="text-muted-foreground mt-1">Manage your payment methods</p>
        </div>
        <Button 
          variant="gradient" 
          size="lg"
          onClick={() => {
            setEditingMode(null)
            resetForm()
            setIsModalOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Payment Mode
        </Button>
      </div>

      {/* Payment Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {paymentModes?.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{ backgroundColor: mode.color + '20' }}
                    >
                      {getPaymentModeIcon(mode.type)}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(mode)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(mode.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2">{mode.name}</CardTitle>
                  <CardDescription className="capitalize">
                    {mode.type.replace('_', ' ')}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {(!paymentModes || paymentModes.length === 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <CreditCard className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No payment modes yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your first payment method to start tracking expenses
          </p>
          <Button 
            variant="gradient"
            onClick={() => {
              setEditingMode(null)
              resetForm()
              setIsModalOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Payment Mode
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
                  {editingMode ? 'Edit Payment Mode' : 'Add Payment Mode'}
                </CardTitle>
                <CardDescription>
                  {editingMode ? 'Update your payment method details' : 'Add a new payment method'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
                      placeholder="e.g., HDFC Credit Card"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      <option value="">Select a type</option>
                      {paymentTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
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
                        editingMode ? 'Update' : 'Create'
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
