import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  AlertTriangle, 
  Info, 
  Lightbulb,
  Target,
  DollarSign
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

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

export default function Insights() {
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['insights'],
    queryFn: dashboardApi.getInsights,
  })

  const { data: categoryBreakdown, isLoading: breakdownLoading } = useQuery({
    queryKey: ['category-breakdown'],
    queryFn: dashboardApi.getCategoryBreakdown,
  })

  const { data: budgetUsage, isLoading: budgetLoading } = useQuery({
    queryKey: ['budget-usage'],
    queryFn: dashboardApi.getBudgetUsage,
  })

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: dashboardApi.getOverview,
  })

  if (insightsLoading || breakdownLoading || budgetLoading || overviewLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const getInsightIcon = (severity: string) => {
    switch (severity) {
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-destructive" />
      case 'warning':
        return <TrendingUp className="h-5 w-5 text-warning" />
      case 'info':
        return <Info className="h-5 w-5 text-primary" />
      default:
        return <Lightbulb className="h-5 w-5 text-primary" />
    }
  }

  const getInsightColor = (severity: string) => {
    switch (severity) {
      case 'alert':
        return 'border-destructive bg-destructive/10'
      case 'warning':
        return 'border-warning bg-warning/10'
      case 'info':
        return 'border-primary bg-primary/10'
      default:
        return 'border-primary bg-primary/10'
    }
  }

  const topCategory = categoryBreakdown?.[0]
  const exceededBudgets = budgetUsage?.filter(budget => budget.is_exceeded) || []
  const warningBudgets = budgetUsage?.filter(budget => budget.percentage_used > 80 && !budget.is_exceeded) || []

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold gradient-text">Insights</h1>
        <p className="text-muted-foreground mt-1">AI-powered financial insights and recommendations</p>
      </motion.div>

      {/* Key Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month's Spending</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overview?.total_expenses_this_month || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {overview?.expenses_count || 0} transactions
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Spending Category</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topCategory?.category || 'No expenses'}</div>
            <p className="text-xs text-muted-foreground">
              {topCategory ? `${topCategory.percentage.toFixed(1)}% of total spending` : 'Start tracking expenses'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exceededBudgets.length + warningBudgets.length}</div>
            <p className="text-xs text-muted-foreground">
              {exceededBudgets.length} exceeded, {warningBudgets.length} at risk
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Insights */}
      {insights && insights.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI Insights
              </CardTitle>
              <CardDescription>Smart recommendations to improve your finances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${getInsightColor(insight.severity)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getInsightIcon(insight.severity)}
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground">{insight.message}</p>
                        {insight.amount && (
                          <p className="text-sm font-medium mt-2">
                            Impact: {formatCurrency(insight.amount)}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Spending Analysis */}
      {categoryBreakdown && categoryBreakdown.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Spending Analysis</CardTitle>
              <CardDescription>Breakdown of your spending by category this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryBreakdown.map((category, index) => (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-medium">{category.category.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium">{category.category}</p>
                        <p className="text-sm text-muted-foreground">{category.count} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(category.amount)}</p>
                      <p className="text-sm text-muted-foreground">{category.percentage.toFixed(1)}%</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Budget Status */}
      {budgetUsage && budgetUsage.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Budget Status</CardTitle>
              <CardDescription>Current status of your monthly budgets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetUsage.map((budget, index) => (
                  <motion.div
                    key={budget.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${
                      budget.is_exceeded 
                        ? 'border-destructive bg-destructive/10' 
                        : budget.percentage_used > 80 
                          ? 'border-warning bg-warning/10'
                          : 'border-primary bg-primary/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{budget.category}</h4>
                      <span className={`text-sm font-medium ${
                        budget.is_exceeded ? 'text-destructive' : 
                        budget.percentage_used > 80 ? 'text-warning' : 'text-primary'
                      }`}>
                        {budget.percentage_used.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>Spent: {formatCurrency(budget.spent_amount)}</span>
                      <span>Budget: {formatCurrency(budget.budget_amount)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(budget.percentage_used, 100)}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className={`h-2 rounded-full ${
                          budget.is_exceeded 
                            ? 'bg-destructive' 
                            : budget.percentage_used > 80 
                              ? 'bg-warning' 
                              : 'bg-primary'
                        }`}
                      />
                    </div>
                    {budget.is_exceeded && (
                      <p className="text-sm text-destructive mt-2">
                        Budget exceeded by {formatCurrency(budget.spent_amount - budget.budget_amount)}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recommendations */}
      <motion.div variants={itemVariants}>
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle>Smart Recommendations</CardTitle>
            <CardDescription>Personalized suggestions to improve your financial health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCategory && topCategory.percentage > 40 && (
                <div className="p-4 rounded-lg border border-warning bg-warning/10">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-warning mt-0.5" />
                    <div>
                      <h4 className="font-medium mb-1">High Spending in {topCategory.category}</h4>
                      <p className="text-sm text-muted-foreground">
                        You're spending {topCategory.percentage.toFixed(1)}% of your money on {topCategory.category.toLowerCase()}. 
                        Consider setting a budget for this category to better control your expenses.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {exceededBudgets.length > 0 && (
                <div className="p-4 rounded-lg border border-destructive bg-destructive/10">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <h4 className="font-medium mb-1">Budget Exceeded</h4>
                      <p className="text-sm text-muted-foreground">
                        You've exceeded {exceededBudgets.length} budget{exceededBudgets.length > 1 ? 's' : ''}. 
                        Review your spending patterns and consider adjusting your budgets or reducing expenses.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {overview && overview.average_expense > 1000 && (
                <div className="p-4 rounded-lg border border-info bg-info/10">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-info mt-0.5" />
                    <div>
                      <h4 className="font-medium mb-1">High Average Transaction</h4>
                      <p className="text-sm text-muted-foreground">
                        Your average transaction is {formatCurrency(overview.average_expense)}. 
                        Consider breaking down large purchases or looking for ways to reduce individual transaction amounts.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(!insights || insights.length === 0) && (
                <div className="p-4 rounded-lg border border-primary bg-primary/10">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium mb-1">Start Tracking</h4>
                      <p className="text-sm text-muted-foreground">
                        Add more expenses and set budgets to get personalized insights and recommendations.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
