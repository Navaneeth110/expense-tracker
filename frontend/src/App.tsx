import { Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import PaymentModes from '@/pages/PaymentModes'
import Expenses from '@/pages/Expenses'
import EMIs from '@/pages/EMIs'
import Bills from '@/pages/Bills'
import Budgets from '@/pages/Budgets'
import Insights from '@/pages/Insights'

function App() {
  const location = useLocation()

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-1"
        >
          <Routes location={location}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/payment-modes" element={<PaymentModes />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/emis" element={<EMIs />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/insights" element={<Insights />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </Layout>
  )
}

export default App
