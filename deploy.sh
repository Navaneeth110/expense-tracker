#!/bin/bash

echo "🚀 Premium Expense Tracker - Render Deployment Script"
echo "=================================================="

# Check if render CLI is installed
if ! command -v render &> /dev/null; then
    echo "❌ Render CLI not found. Please install it first:"
    echo "   npm install -g @render/cli"
    echo "   or visit: https://render.com/docs/cli"
    exit 1
fi

# Check if logged in to Render
if ! render whoami &> /dev/null; then
    echo "❌ Not logged in to Render. Please run: render login"
    exit 1
fi

echo "✅ Render CLI found and authenticated"

# Create new service
echo "📝 Creating new Render service..."
echo "Please provide the following information:"

read -p "Service name (e.g., expense-tracker): " SERVICE_NAME
read -p "Git repository URL: " REPO_URL
read -p "Branch to deploy (default: main): " BRANCH
BRANCH=${BRANCH:-main}

echo ""
echo "🔧 Creating service configuration..."

# Create render.yaml for the specific service
cat > render.yaml << EOF
services:
  - type: web
    name: ${SERVICE_NAME}-backend
    env: python
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port \$PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: PORT
        value: 8000
      # IMPORTANT: Set these in Render UI after deployment:
      # - DATABASE_URL: Your PostgreSQL connection string
      # - ALLOWED_ORIGINS: Your frontend URL
    healthCheckPath: /
    autoDeploy: true

  - type: web
    name: ${SERVICE_NAME}-frontend
    env: static
    plan: free
    buildCommand: npm ci && npm run build
    staticPublishPath: ./dist
    # IMPORTANT: Set this in Render UI after deployment:
    # - VITE_API_BASE_URL: Your backend service URL
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
    autoDeploy: true

databases:
  - name: ${SERVICE_NAME}-db
    databaseName: expense_tracker
    user: expense_tracker_user
    plan: free
EOF

echo "✅ Created render.yaml configuration"
echo ""
echo "🔒 SECURITY REMINDER:"
echo "   - Never commit environment files with real values to GitHub"
echo "   - Set all environment variables in Render's UI after deployment"
echo ""
echo "📋 Next steps:"
echo "1. Push your code to the repository: $REPO_URL"
echo "2. Create PostgreSQL database in Render dashboard first"
echo "3. Run: render blueprint apply"
echo "4. Set environment variables in Render UI:"
echo "   - Backend: DATABASE_URL, ALLOWED_ORIGINS"
echo "   - Frontend: VITE_API_BASE_URL"
echo "5. Or manually create services in Render dashboard"
echo ""
echo "🔗 Render Dashboard: https://dashboard.render.com"
echo ""
echo "📚 For more help, visit: https://render.com/docs"
