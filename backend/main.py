from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
import calendar
from dateutil.relativedelta import relativedelta
import os

import crud, models, schemas
from database import SessionLocal, engine

# Drop and recreate all tables to handle schema changes
models.Base.metadata.drop_all(bind=engine)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Premium Expense Tracker API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://*.onrender.com",  # Allow Render domains
        "https://*.render.com",    # Allow Render domains
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Premium Expense Tracker API"}

# Payment Modes APIs
@app.post("/payment-modes/", response_model=schemas.PaymentMode)
def create_payment_mode(payment_mode: schemas.PaymentModeCreate, db: Session = Depends(get_db)):
    return crud.create_payment_mode(db=db, payment_mode=payment_mode)

@app.get("/payment-modes/", response_model=List[schemas.PaymentMode])
def get_payment_modes(db: Session = Depends(get_db)):
    return crud.get_payment_modes(db=db)

@app.put("/payment-modes/{payment_mode_id}", response_model=schemas.PaymentMode)
def update_payment_mode(payment_mode_id: int, payment_mode: schemas.PaymentModeUpdate, db: Session = Depends(get_db)):
    db_payment_mode = crud.get_payment_mode(db=db, payment_mode_id=payment_mode_id)
    if not db_payment_mode:
        raise HTTPException(status_code=404, detail="Payment mode not found")
    return crud.update_payment_mode(db=db, payment_mode_id=payment_mode_id, payment_mode=payment_mode)

@app.delete("/payment-modes/{payment_mode_id}")
def delete_payment_mode(payment_mode_id: int, db: Session = Depends(get_db)):
    db_payment_mode = crud.get_payment_mode(db=db, payment_mode_id=payment_mode_id)
    if not db_payment_mode:
        raise HTTPException(status_code=404, detail="Payment mode not found")
    crud.delete_payment_mode(db=db, payment_mode_id=payment_mode_id)
    return {"message": "Payment mode deleted successfully"}

# Expenses APIs
@app.post("/expenses/", response_model=schemas.Expense)
def create_expense(expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    return crud.create_expense(db=db, expense=expense)

@app.get("/expenses/", response_model=List[schemas.Expense])
def get_expenses(
    skip: int = 0, 
    limit: int = 100, 
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category: Optional[str] = None,
    payment_mode_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    return crud.get_expenses(
        db=db, 
        skip=skip, 
        limit=limit, 
        start_date=start_date,
        end_date=end_date,
        category=category,
        payment_mode_id=payment_mode_id
    )

@app.put("/expenses/{expense_id}", response_model=schemas.Expense)
def update_expense(expense_id: int, expense: schemas.ExpenseUpdate, db: Session = Depends(get_db)):
    print(f"DEBUG: Updating expense {expense_id} with data: {expense.dict()}")
    db_expense = crud.get_expense(db=db, expense_id=expense_id)
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return crud.update_expense(db=db, expense_id=expense_id, expense=expense)

@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    db_expense = crud.get_expense(db=db, expense_id=expense_id)
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    crud.delete_expense(db=db, expense_id=expense_id)
    return {"message": "Expense deleted successfully"}

# EMI APIs
@app.get("/emi/", response_model=List[schemas.EMIDetails])
def get_emi_expenses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_emi_expenses(db=db, skip=skip, limit=limit)

@app.post("/emi/calculate")
def calculate_emi(
    request: dict,
    db: Session = Depends(get_db)
):
    """Calculate EMI details without creating an expense"""
    principal = request.get('principal', 0)
    tenure = request.get('tenure', 0)
    interest_rate = request.get('interest_rate', 0)
    processing_fees = request.get('processing_fees', 0)
    gst = request.get('gst', 0)
    
    emi_calc = crud.calculate_emi(principal, tenure, interest_rate, processing_fees, gst)
    return {
        "principal": principal,
        "tenure": tenure,
        "interest_rate": interest_rate,
        "processing_fees": processing_fees,
        "gst": gst,
        "monthly_amount": emi_calc['monthly_amount'],
        "total_amount": emi_calc['total_amount'],
        "total_interest": emi_calc['total_interest'],
        "total_processing_fees": emi_calc['total_processing_fees']
    }

# Bill Management APIs
@app.get("/bills/", response_model=List[schemas.BillPaymentMode])
def get_bills(month: Optional[str] = None, year: Optional[int] = None, db: Session = Depends(get_db)):
    """Get all payment modes with bill details"""
    return crud.get_bill_payment_modes(db=db, month=month, year=year)



@app.post("/expenses/{expense_id}/mark-paid")
def mark_expense_paid(
    expense_id: int, 
    paid_amount: Optional[float] = None, 
    paid_date: Optional[str] = None, 
    db: Session = Depends(get_db)
):
    """Mark an expense as paid"""
    expense = crud.mark_expense_as_paid(db=db, expense_id=expense_id, paid_amount=paid_amount, paid_date=paid_date)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense marked as paid", "expense": expense}

@app.post("/expenses/{expense_id}/mark-unpaid")
def mark_expense_unpaid(expense_id: int, db: Session = Depends(get_db)):
    """Mark an expense as unpaid"""
    expense = crud.mark_expense_as_unpaid(db=db, expense_id=expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense marked as unpaid", "expense": expense}

# Budgets APIs
@app.post("/budgets/", response_model=schemas.Budget)
def create_budget(budget: schemas.BudgetCreate, db: Session = Depends(get_db)):
    return crud.create_budget(db=db, budget=budget)

@app.get("/budgets/", response_model=List[schemas.Budget])
def get_budgets(db: Session = Depends(get_db)):
    return crud.get_budgets(db=db)

@app.put("/budgets/{budget_id}", response_model=schemas.Budget)
def update_budget(budget_id: int, budget: schemas.BudgetUpdate, db: Session = Depends(get_db)):
    db_budget = crud.get_budget(db=db, budget_id=budget_id)
    if not db_budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    return crud.update_budget(db=db, budget_id=budget_id, budget=budget)

@app.delete("/budgets/{budget_id}")
def delete_budget(budget_id: int, db: Session = Depends(get_db)):
    db_budget = crud.get_budget(db=db, budget_id=budget_id)
    if not db_budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    crud.delete_budget(db=db, budget_id=budget_id)
    return {"message": "Budget deleted successfully"}

# Dashboard APIs
@app.get("/dashboard/overview")
def get_dashboard_overview(db: Session = Depends(get_db)):
    return crud.get_dashboard_overview(db=db)

@app.get("/dashboard/category-breakdown")
def get_category_breakdown(db: Session = Depends(get_db)):
    return crud.get_category_breakdown(db=db)

@app.get("/dashboard/budget-usage")
def get_budget_usage(db: Session = Depends(get_db)):
    return crud.get_budget_usage(db=db)

@app.get("/dashboard/insights")
def get_insights(db: Session = Depends(get_db)):
    return crud.get_insights(db=db)

@app.get("/dashboard/expense-trends")
def get_expense_trends(db: Session = Depends(get_db)):
    return crud.get_expense_trends(db=db)
