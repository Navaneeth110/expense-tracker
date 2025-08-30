# 🚀 Premium Expense Tracker - Setup Guide

A modern, visually stunning expense tracker app with a premium personal finance dashboard. Built with FastAPI, React, and beautiful animations.

## 📋 Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **npm or yarn**

## 🛠 Installation

### 1. Clone and Setup

```bash
# Navigate to the project directory
cd premium-expense-tracker

# Make the run script executable
chmod +x run.sh
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# The database will be created automatically when you first run the app
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

## 🚀 Running the Application

### Option 1: Quick Start (Recommended)

Use the provided script to run both servers simultaneously:

```bash
./run.sh
```

This will start:
- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:3000

### Option 2: Manual Start

#### Start Backend
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Start Frontend (in a new terminal)
```bash
cd frontend
npm run dev
```

## 📱 Features

### ✨ Core Functionalities

1. **Payment Modes Management**
   - Add, edit, delete payment methods (credit cards, debit cards, bank accounts, UPI)
   - Beautiful card designs with logos and colors
   - Local database storage

2. **Expense Tracking**
   - Add expenses with title, amount, category, date, payment mode
   - Beautiful transaction list with category icons and payment mode logos
   - Search and filter functionality

3. **Dashboard**
   - Overview cards (total expenses, top category, most used payment mode)
   - Interactive charts (pie chart for categories, line chart for trends)
   - Smooth animations with Framer Motion
   - Dark/Light mode toggle

4. **Budget Management**
   - Set monthly budgets per category
   - Progress bars and visual indicators
   - Alerts when budgets are exceeded

5. **AI Insights**
   - Smart spending pattern analysis
   - Personalized recommendations
   - Trend analysis and alerts

### 🎨 Design Features

- **Apple/Notion-like aesthetics** with rounded cards and soft shadows
- **Gradient accents** and smooth animations
- **Glass morphism effects** with backdrop blur
- **Responsive design** for desktop and mobile
- **Dark/Light mode** with beautiful theme switching

## 🗄 Database

The application uses **SQLite** for local storage. The database file (`expense_tracker.db`) will be created automatically in the backend directory when you first run the application.

### Database Schema

- **Payment Modes**: Store payment method information
- **Expenses**: Track individual expenses with categories and payment modes
- **Budgets**: Monthly budget settings per category

## 🔧 API Endpoints

### Payment Modes
- `GET /payment-modes/` - Get all payment modes
- `POST /payment-modes/` - Create new payment mode
- `PUT /payment-modes/{id}` - Update payment mode
- `DELETE /payment-modes/{id}` - Delete payment mode

### Expenses
- `GET /expenses/` - Get all expenses (with filters)
- `POST /expenses/` - Create new expense
- `PUT /expenses/{id}` - Update expense
- `DELETE /expenses/{id}` - Delete expense

### Budgets
- `GET /budgets/` - Get all budgets
- `POST /budgets/` - Create new budget
- `PUT /budgets/{id}` - Update budget
- `DELETE /budgets/{id}` - Delete budget

### Dashboard
- `GET /dashboard/overview` - Get dashboard overview
- `GET /dashboard/category-breakdown` - Get category breakdown
- `GET /dashboard/budget-usage` - Get budget usage
- `GET /dashboard/insights` - Get AI insights
- `GET /dashboard/expense-trends` - Get expense trends

## 🎯 Getting Started

1. **Start the application** using the run script or manual commands
2. **Open your browser** and go to http://localhost:3000
3. **Add payment modes** first (Credit Card, Debit Card, UPI, etc.)
4. **Set budgets** for different categories
5. **Start tracking expenses** and watch your dashboard come to life!

## 🎨 Customization

### Colors and Themes
- Modify `frontend/src/index.css` for custom CSS variables
- Update `frontend/tailwind.config.js` for custom colors and animations

### Categories
- Edit the categories array in the respective components to add/remove expense categories

### Payment Types
- Modify the payment types in `frontend/src/pages/PaymentModes.tsx`

## 🐛 Troubleshooting

### Backend Issues
- Ensure Python 3.8+ is installed
- Check if all dependencies are installed: `pip install -r requirements.txt`
- Verify the database file is created in the backend directory

### Frontend Issues
- Ensure Node.js 16+ is installed
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### Port Issues
- If port 8000 or 3000 is in use, modify the ports in the respective configuration files
- Backend: Modify the uvicorn command
- Frontend: Modify `frontend/vite.config.ts`

## 📱 Mobile Responsiveness

The application is fully responsive and works great on:
- Desktop browsers
- Tablets
- Mobile phones

## 🔒 Security

- All data is stored locally in SQLite
- No external API calls or cloud dependencies
- CORS is configured for local development

## 🚀 Deployment

For production deployment:
1. Build the frontend: `cd frontend && npm run build`
2. Serve the built files with a static server
3. Deploy the FastAPI backend to your preferred hosting service
4. Update the API base URL in the frontend configuration

## 📄 License

This project is open source and available under the MIT License.

---

**Enjoy tracking your expenses with style! 💰✨**
