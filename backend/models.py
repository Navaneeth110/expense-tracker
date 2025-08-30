from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class PaymentMode(Base):
    __tablename__ = "payment_modes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    type = Column(String, default='credit_card')  # credit_card, debit_card, bank_account, upi, etc.
    icon = Column(String, default='CreditCard')
    color = Column(String, default='#FF6B6B')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    expenses = relationship("Expense", back_populates="payment_mode")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    amount = Column(Float)
    category = Column(String, index=True)
    date = Column(Date, index=True)
    description = Column(String, nullable=True)
    payment_mode_id = Column(Integer, ForeignKey("payment_modes.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # EMI fields
    is_emi = Column(Boolean, default=False)
    emi_tenure = Column(Integer, nullable=True)
    emi_processing_fees = Column(Float, nullable=True)
    emi_interest_rate = Column(Float, nullable=True)
    emi_gst = Column(Float, nullable=True)
    emi_monthly_amount = Column(Float, nullable=True)
    emi_total_amount = Column(Float, nullable=True)
    emi_principal_amount = Column(Float, nullable=True)
    
    # Payment status fields
    is_paid = Column(Boolean, default=False)
    paid_date = Column(Date, nullable=True)
    paid_amount = Column(Float, nullable=True)

    payment_mode = relationship("PaymentMode", back_populates="expenses")

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True)
    amount = Column(Float)
    month = Column(String)  # YYYY-MM format
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
