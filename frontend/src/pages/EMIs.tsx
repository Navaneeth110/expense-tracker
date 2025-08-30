import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { formatCurrency, formatDate } from '@/lib/utils'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
}

export default function EMIs() {
  const navigate = useNavigate()

  const { data: emiExpenses, isLoading } = useQuery({
    queryKey: ['emi-expenses'],
    queryFn: () => fetch('/api/emi/').then(res => res.json()),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const totalEMIAmount = emiExpenses?.reduce((sum: number, emi: any) => sum + emi.total_amount, 0) || 0
  const totalPaid = emiExpenses?.reduce((sum: number, emi: any) => sum + emi.total_paid, 0) || 0
  const totalRemaining = emiExpenses?.reduce((sum: number, emi: any) => sum + emi.remaining_amount, 0) || 0
  const activeEMIs = emiExpenses?.filter((emi: any) => emi.remaining_emi_count > 0).length || 0

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">EMI Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage your EMI expenses</p>
        </div>
        <Button 
          variant="gradient" 
          size="lg"
          onClick={() => navigate('/expenses')}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Add EMI Expense
        </Button>
      </motion.div>

      {/* Overview Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total EMI Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEMIAmount)}</div>
            <p className="text-xs text-muted-foreground">
              All EMI expenses combined
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-muted-foreground">
              Amount paid so far
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Amount</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRemaining)}</div>
            <p className="text-xs text-muted-foreground">
              Still to be paid
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active EMIs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEMIs}</div>
            <p className="text-xs text-muted-foreground">
              Ongoing EMI payments
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* EMI List */}
      <motion.div variants={itemVariants}>
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle>EMI Details</CardTitle>
            <CardDescription>All your EMI expenses with payment progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emiExpenses && emiExpenses.length > 0 ? (
                emiExpenses.map((emi: any, index: number) => (
                  <motion.div
                    key={emi.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{emi.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {emi.category} • {emi.payment_mode} • Started {formatDate(emi.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{formatCurrency(emi.monthly_amount)}</div>
                        <div className="text-sm text-muted-foreground">per month</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <div className="text-sm font-medium">Principal Amount</div>
                        <div className="text-lg">{formatCurrency(emi.principal_amount)}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Total Amount</div>
                        <div className="text-lg">{formatCurrency(emi.total_amount)}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Interest Rate</div>
                        <div className="text-lg">{emi.interest_rate}% p.a.</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Tenure</div>
                        <div className="text-lg">{emi.tenure} months</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{formatCurrency(emi.total_paid)} / {formatCurrency(emi.total_amount)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(emi.total_paid / emi.total_amount) * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="h-2 rounded-full bg-primary"
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Months Paid: {Math.ceil(emi.total_paid / emi.monthly_amount)} / {emi.tenure}</span>
                        <span>Remaining: {formatCurrency(emi.remaining_amount)}</span>
                      </div>
                    </div>

                    {emi.remaining_emi_count > 0 && (
                      <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-800 dark:text-blue-200">
                            {emi.remaining_emi_count} EMI{emi.remaining_emi_count > 1 ? 's' : ''} remaining
                          </span>
                        </div>
                      </div>
                    )}

                    {emi.remaining_emi_count === 0 && (
                      <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-green-800 dark:text-green-200">
                            EMI completed successfully!
                          </span>
                        </div>
                      </div>
                    )}
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
                  <h3 className="text-lg font-semibold mb-2">No EMI expenses found</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first EMI expense to start tracking
                  </p>
                  <Button 
                    variant="gradient"
                    onClick={() => navigate('/expenses')}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Add EMI Expense
                  </Button>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
