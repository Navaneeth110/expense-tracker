from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract
from datetime import date, datetime, timedelta
import calendar
from dateutil.relativedelta import relativedelta
import math
from typing import Optional

import models, schemas

# EMI Calculation Functions
def calculate_emi(principal: float, tenure: int, interest_rate: float, processing_fees: float = 0, gst: float = 0):
    """
    Calculate EMI details including monthly amount, total amount, etc.
    """
    if interest_rate == 0:
        # No cost EMI
        monthly_amount = principal / tenure
        total_interest = 0
    else:
        # Regular EMI with interest
        monthly_rate = interest_rate / (12 * 100)  # Convert annual rate to monthly rate
        if monthly_rate > 0:
            monthly_amount = principal * (monthly_rate * (1 + monthly_rate) ** tenure) / ((1 + monthly_rate) ** tenure - 1)
        else:
            monthly_amount = principal / tenure
        total_interest = (monthly_amount * tenure) - principal
    
    # Add processing fees and GST
    total_processing_fees = processing_fees + gst
    total_amount = (monthly_amount * tenure) + total_processing_fees
    
    return {
        'monthly_amount': round(monthly_amount, 2),
        'total_amount': round(total_amount, 2),
        'total_interest': round(total_interest, 2),
        'total_processing_fees': round(total_processing_fees, 2)
    }

# Payment Modes CRUD
def create_payment_mode(db: Session, payment_mode: schemas.PaymentModeCreate):
    db_payment_mode = models.PaymentMode(**payment_mode.dict())
    db.add(db_payment_mode)
    db.commit()
    db.refresh(db_payment_mode)
    return db_payment_mode

def get_payment_modes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.PaymentMode).offset(skip).limit(limit).all()

def get_payment_mode(db: Session, payment_mode_id: int):
    return db.query(models.PaymentMode).filter(models.PaymentMode.id == payment_mode_id).first()

def update_payment_mode(db: Session, payment_mode_id: int, payment_mode: schemas.PaymentModeUpdate):
    db_payment_mode = get_payment_mode(db, payment_mode_id)
    if db_payment_mode:
        update_data = payment_mode.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_payment_mode, field, value)
        db.commit()
        db.refresh(db_payment_mode)
    return db_payment_mode

def delete_payment_mode(db: Session, payment_mode_id: int):
    db_payment_mode = get_payment_mode(db, payment_mode_id)
    if db_payment_mode:
        db.delete(db_payment_mode)
        db.commit()
    return db_payment_mode

# Expenses CRUD
def create_expense(db: Session, expense: schemas.ExpenseCreate):
    expense_data = expense.dict()
    
    # Handle EMI calculation
    if expense_data.get('is_emi'):
        principal = expense_data['amount']
        tenure = expense_data.get('emi_tenure', 0)
        interest_rate = expense_data.get('emi_interest_rate', 0)
        processing_fees = expense_data.get('emi_processing_fees', 0)
        gst = expense_data.get('emi_gst', 0)
        
        emi_calc = calculate_emi(principal, tenure, interest_rate, processing_fees, gst)
        
        expense_data['emi_principal_amount'] = principal
        expense_data['emi_monthly_amount'] = emi_calc['monthly_amount']
        expense_data['emi_total_amount'] = emi_calc['total_amount']
        # Update the amount to the total EMI amount
        expense_data['amount'] = emi_calc['total_amount']
    
    db_expense = models.Expense(**expense_data)
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    
    # Ensure the payment_mode relationship is loaded with proper updated_at handling
    if db_expense.payment_mode and db_expense.payment_mode.updated_at is None:
        db_expense.payment_mode.updated_at = db_expense.payment_mode.created_at
    
    return db_expense

def get_expenses(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category: Optional[str] = None,
    payment_mode_id: Optional[int] = None
):
    query = db.query(models.Expense)
    
    if start_date:
        query = query.filter(models.Expense.date >= start_date)
    if end_date:
        query = query.filter(models.Expense.date <= end_date)
    if category:
        query = query.filter(models.Expense.category == category)
    if payment_mode_id:
        query = query.filter(models.Expense.payment_mode_id == payment_mode_id)
    
    return query.order_by(models.Expense.date.desc()).offset(skip).limit(limit).all()

def get_expense(db: Session, expense_id: int):
    return db.query(models.Expense).filter(models.Expense.id == expense_id).first()

def update_expense(db: Session, expense_id: int, expense: schemas.ExpenseUpdate):
    db_expense = get_expense(db, expense_id)
    if db_expense:
        update_data = expense.dict(exclude_unset=True)
        
        # Convert string date to date object if present
        if 'date' in update_data and update_data['date']:
            from datetime import datetime
            update_data['date'] = datetime.strptime(update_data['date'], '%Y-%m-%d').date()
        
        # Handle EMI calculation if EMI fields are being updated
        if any(key.startswith('emi_') for key in update_data.keys()) or update_data.get('is_emi'):
            if update_data.get('is_emi'):
                principal = update_data.get('amount', db_expense.amount)
                tenure = update_data.get('emi_tenure', db_expense.emi_tenure or 0)
                interest_rate = update_data.get('emi_interest_rate', db_expense.emi_interest_rate or 0)
                processing_fees = update_data.get('emi_processing_fees', db_expense.emi_processing_fees or 0)
                gst = update_data.get('emi_gst', db_expense.emi_gst or 0)
                
                emi_calc = calculate_emi(principal, tenure, interest_rate, processing_fees, gst)
                
                update_data['emi_principal_amount'] = principal
                update_data['emi_monthly_amount'] = emi_calc['monthly_amount']
                update_data['emi_total_amount'] = emi_calc['total_amount']
                # Update the amount to the total EMI amount
                update_data['amount'] = emi_calc['total_amount']
        
        for field, value in update_data.items():
            setattr(db_expense, field, value)
        db_expense.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_expense)
    return db_expense

def delete_expense(db: Session, expense_id: int):
    db_expense = get_expense(db, expense_id)
    if db_expense:
        db.delete(db_expense)
        db.commit()
    return db_expense



def mark_expense_as_paid(db: Session, expense_id: int, paid_amount: Optional[float] = None, paid_date: Optional[str] = None):
    """Mark an expense as paid"""
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not expense:
        return None
    
    # For EMI expenses, increment the paid amount by one month's EMI
    if expense.is_emi:
        monthly_amount = expense.emi_monthly_amount or 0
        current_paid = expense.paid_amount or 0
        expense.paid_amount = current_paid + monthly_amount
        
        # Check if all installments are now paid
        total_amount = expense.emi_total_amount or expense.amount
        if expense.paid_amount >= total_amount:
            expense.is_paid = True
            expense.paid_amount = total_amount  # Don't exceed total amount
        else:
            expense.is_paid = False  # Still has pending installments
    else:
        # For non-EMI expenses, mark the entire amount as paid
        expense.is_paid = True
        expense.paid_amount = paid_amount or expense.amount
    
    # Convert string date to date object if provided, otherwise use today
    if paid_date:
        expense.paid_date = datetime.strptime(paid_date, "%Y-%m-%d").date()
    else:
        expense.paid_date = date.today()
    
    db.commit()
    db.refresh(expense)
    return expense

def mark_expense_as_unpaid(db: Session, expense_id: int):
    """Mark an expense as unpaid"""
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not expense:
        return None
    
    expense.is_paid = False
    expense.paid_date = None
    expense.paid_amount = None
    
    db.commit()
    db.refresh(expense)
    return expense

def get_bill_payment_modes(db: Session, month: Optional[str] = None, year: Optional[int] = None):
    """Get payment modes with bill details for credit card tracking"""
    # Get all payment modes that have expenses
    payment_modes = db.query(models.PaymentMode).join(models.Expense).distinct().all()
    
    result = []
    for payment_mode in payment_modes:
        # Build query for expenses
        query = db.query(models.Expense).filter(models.Expense.payment_mode_id == payment_mode.id)
        
        # Filter by month/year if provided
        if month and year:
            start_date = datetime.strptime(f"{year}-{month}-01", "%Y-%m-%d").date()
            end_date = (start_date + relativedelta(months=1)) - timedelta(days=1)
            query = query.filter(
                and_(
                    models.Expense.date >= start_date,
                    models.Expense.date <= end_date
                )
            )
        
        expenses = query.all()
        
        if not expenses:
            continue
        
        total_amount = sum(exp.amount for exp in expenses)
        # For EMI expenses, use paid_amount; for non-EMI, use is_paid
        paid_amount = sum(
            exp.paid_amount or 0 if exp.is_emi else (exp.amount if exp.is_paid else 0) 
            for exp in expenses
        )
        unpaid_amount = total_amount - paid_amount
        expense_count = len(expenses)
        # Count as paid if it's an EMI with any paid amount, or non-EMI with is_paid=True
        paid_count = sum(
            1 for exp in expenses 
            if (exp.is_emi and (exp.paid_amount or 0) > 0) or (not exp.is_emi and exp.is_paid)
        )
        unpaid_count = expense_count - paid_count
        
        result.append(schemas.BillPaymentMode(
            id=payment_mode.id,
            name=payment_mode.name,
            total_amount=total_amount,
            paid_amount=paid_amount,
            unpaid_amount=unpaid_amount,
            expense_count=expense_count,
            paid_count=paid_count,
            unpaid_count=unpaid_count,
            expenses=expenses
        ))
    
    return result

# EMI-specific functions
def get_emi_expenses(db: Session, skip: int = 0, limit: int = 100):
    """Get all EMI expenses with payment status"""
    emi_expenses = db.query(models.Expense).filter(models.Expense.is_emi == True).offset(skip).limit(limit).all()
    
    result = []
    for expense in emi_expenses:
        if not expense.emi_tenure:
            continue
            
        # Calculate EMI progress
        months_passed = calculate_months_passed(expense.date)
        
        # Calculate payment status
        if expense.is_paid:
            # If marked as fully paid, use the stored paid amount
            total_paid = expense.paid_amount or expense.amount
        else:
            # Use the stored paid amount if available, otherwise calculate based on time
            total_paid = expense.paid_amount or (months_passed * (expense.emi_monthly_amount or 0))
            # Don't exceed the total amount
            total_paid = min(total_paid, expense.emi_total_amount or expense.amount)
        
        remaining_amount = (expense.emi_total_amount or expense.amount) - total_paid
        
        # Calculate progress based on actual payments, not just time
        if expense.emi_monthly_amount and expense.emi_monthly_amount > 0:
            months_paid = int(total_paid / expense.emi_monthly_amount)
            remaining_emi_count = max(0, expense.emi_tenure - months_paid)
        else:
            remaining_emi_count = max(0, expense.emi_tenure - months_passed)
        
        result.append(schemas.EMIDetails(
            id=expense.id,
            title=expense.title,
            category=expense.category,
            date=expense.date,
            payment_mode=expense.payment_mode.name,  # Convert to string
            principal_amount=expense.emi_principal_amount or expense.amount,
            total_amount=expense.emi_total_amount or expense.amount,
            monthly_amount=expense.emi_monthly_amount or 0,
            tenure=expense.emi_tenure,
            interest_rate=expense.emi_interest_rate or 0,
            processing_fees=expense.emi_processing_fees or 0,  # Add missing field
            gst=expense.emi_gst or 0,  # Add missing field
            remaining_emi_count=remaining_emi_count,
            total_paid=total_paid,
            remaining_amount=remaining_amount,
            is_paid=expense.is_paid,
            paid_date=expense.paid_date
        ))
    
    return result

def calculate_months_passed(start_date: date) -> int:
    """Calculate how many months have passed since the EMI start date"""
    today = date.today()
    months_passed = (today.year - start_date.year) * 12 + (today.month - start_date.month)
    return max(0, months_passed)

# Budget CRUD
def create_budget(db: Session, budget: schemas.BudgetCreate):
    db_budget = models.Budget(**budget.dict())
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget

def get_budgets(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Budget).offset(skip).limit(limit).all()

def get_budget(db: Session, budget_id: int):
    return db.query(models.Budget).filter(models.Budget.id == budget_id).first()

def update_budget(db: Session, budget_id: int, budget: schemas.BudgetUpdate):
    db_budget = get_budget(db, budget_id)
    if db_budget:
        update_data = budget.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_budget, field, value)
        db_budget.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_budget)
    return db_budget

def delete_budget(db: Session, budget_id: int):
    db_budget = get_budget(db, budget_id)
    if db_budget:
        db.delete(db_budget)
        db.commit()
    return db_budget

# Dashboard Analytics
def get_dashboard_overview(db: Session):
    # Get current month
    now = datetime.now()
    current_month = now.strftime("%Y-%m")
    start_of_month = date(now.year, now.month, 1)
    end_of_month = date(now.year, now.month, calendar.monthrange(now.year, now.month)[1])
    
    # Total expenses
    total_expenses = db.query(func.sum(models.Expense.amount)).scalar() or 0
    
    # This month's expenses
    this_month_expenses = db.query(func.sum(models.Expense.amount)).filter(
        and_(models.Expense.date >= start_of_month, models.Expense.date <= end_of_month)
    ).scalar() or 0
    
    # Top category
    top_category_result = db.query(
        models.Expense.category,
        func.sum(models.Expense.amount).label('total_amount')
    ).filter(
        and_(models.Expense.date >= start_of_month, models.Expense.date <= end_of_month)
    ).group_by(models.Expense.category).order_by(func.sum(models.Expense.amount).desc()).first()
    
    top_category = top_category_result[0] if top_category_result else "No expenses"
    top_category_amount = top_category_result[1] if top_category_result else 0
    
    # Most used payment mode
    most_used_payment = db.query(
        models.PaymentMode.name,
        func.count(models.Expense.id).label('usage_count')
    ).join(models.Expense).filter(
        and_(models.Expense.date >= start_of_month, models.Expense.date <= end_of_month)
    ).group_by(models.PaymentMode.name).order_by(func.count(models.Expense.id).desc()).first()
    
    most_used_payment_mode = most_used_payment[0] if most_used_payment else "No payments"
    
    # Expenses count and average
    expenses_count = db.query(func.count(models.Expense.id)).scalar() or 0
    average_expense = total_expenses / expenses_count if expenses_count > 0 else 0
    
    return {
        "total_expenses": total_expenses,
        "total_expenses_this_month": this_month_expenses,
        "top_category": top_category,
        "top_category_amount": top_category_amount,
        "most_used_payment_mode": most_used_payment_mode,
        "expenses_count": expenses_count,
        "average_expense": average_expense
    }

def get_category_breakdown(db: Session):
    now = datetime.now()
    start_of_month = date(now.year, now.month, 1)
    end_of_month = date(now.year, now.month, calendar.monthrange(now.year, now.month)[1])
    
    total_expenses = db.query(func.sum(models.Expense.amount)).filter(
        and_(models.Expense.date >= start_of_month, models.Expense.date <= end_of_month)
    ).scalar() or 0
    
    if total_expenses == 0:
        return []
    
    breakdown = db.query(
        models.Expense.category,
        func.sum(models.Expense.amount).label('amount'),
        func.count(models.Expense.id).label('count')
    ).filter(
        and_(models.Expense.date >= start_of_month, models.Expense.date <= end_of_month)
    ).group_by(models.Expense.category).all()
    
    return [
        {
            "category": item.category,
            "amount": item.amount,
            "percentage": round((item.amount / total_expenses) * 100, 1),
            "count": item.count
        }
        for item in breakdown
    ]

def get_budget_usage(db: Session):
    now = datetime.now()
    current_month = now.strftime("%Y-%m")
    
    budgets = db.query(models.Budget).filter(models.Budget.month == current_month).all()
    budget_usage = []
    
    for budget in budgets:
        # Get expenses for this category in current month
        start_of_month = date(now.year, now.month, 1)
        end_of_month = date(now.year, now.month, calendar.monthrange(now.year, now.month)[1])
        
        spent_amount = db.query(func.sum(models.Expense.amount)).filter(
            and_(
                models.Expense.category == budget.category,
                models.Expense.date >= start_of_month,
                models.Expense.date <= end_of_month
            )
        ).scalar() or 0
        
        percentage_used = (spent_amount / budget.amount) * 100 if budget.amount > 0 else 0
        is_exceeded = spent_amount > budget.amount
        
        budget_usage.append({
            "category": budget.category,
            "budget_amount": budget.amount,
            "spent_amount": spent_amount,
            "percentage_used": percentage_used,
            "is_exceeded": is_exceeded
        })
    
    return budget_usage

def get_insights(db: Session):
    now = datetime.now()
    start_of_month = date(now.year, now.month, 1)
    end_of_month = date(now.year, now.month, calendar.monthrange(now.year, now.month)[1])
    
    insights = []
    
    # Get this month's expenses by category
    category_expenses = db.query(
        models.Expense.category,
        func.sum(models.Expense.amount).label('total_amount')
    ).filter(
        and_(models.Expense.date >= start_of_month, models.Expense.date <= end_of_month)
    ).group_by(models.Expense.category).all()
    
    # Get last month's expenses for comparison
    last_month_start = date(now.year, now.month - 1, 1) if now.month > 1 else date(now.year - 1, 12, 1)
    last_month_end = date(now.year, now.month - 1, calendar.monthrange(now.year, now.month - 1)[1]) if now.month > 1 else date(now.year - 1, 12, 31)
    
    last_month_expenses = db.query(
        models.Expense.category,
        func.sum(models.Expense.amount).label('total_amount')
    ).filter(
        and_(models.Expense.date >= last_month_start, models.Expense.date <= last_month_end)
    ).group_by(models.Expense.category).all()
    
    last_month_dict = {item.category: item.total_amount for item in last_month_expenses}
    
    for category_expense in category_expenses:
        category = category_expense.category
        current_amount = category_expense.total_amount
        last_amount = last_month_dict.get(category, 0)
        
        if last_amount > 0:
            change_percentage = ((current_amount - last_amount) / last_amount) * 100
            
            if change_percentage > 20:
                insights.append({
                    "type": "spending_pattern",
                    "title": f"Spending Increase in {category}",
                    "message": f"Your {category} spending increased by {change_percentage:.1f}% compared to last month. Consider reviewing your expenses in this category.",
                    "severity": "warning",
                    "category": category,
                    "amount": current_amount
                })
            elif change_percentage < -20:
                insights.append({
                    "type": "spending_pattern",
                    "title": f"Spending Decrease in {category}",
                    "message": f"Great job! Your {category} spending decreased by {abs(change_percentage):.1f}% compared to last month.",
                    "severity": "info",
                    "category": category,
                    "amount": current_amount
                })
    
    # Check for high spending categories
    total_monthly_spending = sum(item.total_amount for item in category_expenses)
    for category_expense in category_expenses:
        percentage = (category_expense.total_amount / total_monthly_spending) * 100 if total_monthly_spending > 0 else 0
        
        if percentage > 40:
            insights.append({
                "type": "spending_pattern",
                "title": f"High {category_expense.category} Spending",
                "message": f"You're spending {percentage:.1f}% of your money on {category_expense.category}. Consider diversifying your expenses.",
                "severity": "alert",
                "category": category_expense.category,
                "amount": category_expense.total_amount
            })
    
    return insights

def get_expense_trends(db: Session):
    now = datetime.now()
    start_date = date(now.year, now.month, 1)
    end_date = date(now.year, now.month, calendar.monthrange(now.year, now.month)[1])
    
    # Get daily expenses for current month
    daily_expenses = db.query(
        models.Expense.date,
        func.sum(models.Expense.amount).label('amount'),
        func.count(models.Expense.id).label('count')
    ).filter(
        and_(models.Expense.date >= start_date, models.Expense.date <= end_date)
    ).group_by(models.Expense.date).order_by(models.Expense.date).all()
    
    return [
        {
            "date": expense.date.strftime("%Y-%m-%d"),
            "amount": expense.amount,
            "count": expense.count
        }
        for expense in daily_expenses
    ]
