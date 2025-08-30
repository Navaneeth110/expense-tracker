from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

# Payment Mode Schemas
class PaymentModeBase(BaseModel):
    name: str
    type: str
    icon: str
    color: str

class PaymentModeCreate(PaymentModeBase):
    pass

class PaymentModeUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None

class PaymentMode(PaymentModeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Expense Schemas
class ExpenseBase(BaseModel):
    title: str
    amount: float
    category: str
    date: date
    description: Optional[str] = None
    payment_mode_id: int
    is_emi: bool = False
    emi_tenure: Optional[int] = None
    emi_processing_fees: Optional[float] = None
    emi_interest_rate: Optional[float] = None
    emi_gst: Optional[float] = None
    emi_monthly_amount: Optional[float] = None
    emi_total_amount: Optional[float] = None
    emi_principal_amount: Optional[float] = None
    is_paid: bool = False
    paid_date: Optional[date] = None
    paid_amount: Optional[float] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    date: Optional[str] = None
    description: Optional[str] = None
    payment_mode_id: Optional[int] = None
    is_emi: Optional[bool] = None
    emi_tenure: Optional[int] = None
    emi_processing_fees: Optional[float] = None
    emi_interest_rate: Optional[float] = None
    emi_gst: Optional[float] = None
    emi_monthly_amount: Optional[float] = None
    emi_total_amount: Optional[float] = None
    emi_principal_amount: Optional[float] = None
    is_paid: Optional[bool] = None
    paid_date: Optional[date] = None
    paid_amount: Optional[float] = None

class Expense(ExpenseBase):
    id: int
    payment_mode: PaymentMode
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

# Budget Schemas
class BudgetBase(BaseModel):
    category: str
    amount: float
    month: str

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    category: Optional[str] = None
    amount: Optional[float] = None
    month: Optional[str] = None

class Budget(BudgetBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Dashboard Schemas
class CategoryBreakdown(BaseModel):
    category: str
    amount: float
    percentage: float
    count: int

class BudgetUsage(BaseModel):
    category: str
    budget_amount: float
    spent_amount: float
    percentage_used: float
    is_exceeded: bool

class Insight(BaseModel):
    type: str  # spending_pattern, budget_alert, trend
    title: str
    message: str
    severity: str  # info, warning, alert
    category: Optional[str] = None
    amount: Optional[float] = None

class ExpenseTrend(BaseModel):
    date: str
    amount: float
    count: int

class DashboardOverview(BaseModel):
    total_expenses: float
    total_expenses_this_month: float
    top_category: str
    top_category_amount: float
    most_used_payment_mode: str
    expenses_count: int
    average_expense: float

# EMI Schemas
class EMIDetails(BaseModel):
    id: int
    title: str
    principal_amount: float
    monthly_amount: float
    total_amount: float
    tenure: int
    interest_rate: float
    processing_fees: float
    gst: float
    category: str
    payment_mode: str
    date: date
    remaining_emi_count: int
    total_paid: float
    remaining_amount: float
    is_paid: bool
    paid_date: Optional[date] = None

    class Config:
        from_attributes = True

class BillPaymentMode(BaseModel):
    id: int
    name: str
    total_amount: float
    paid_amount: float
    unpaid_amount: float
    expense_count: int
    paid_count: int
    unpaid_count: int
    expenses: List[Expense]

    class Config:
        from_attributes = True
