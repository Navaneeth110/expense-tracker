# 🚀 Render Deployment Guide - Premium Expense Tracker

This guide will walk you through deploying your Premium Expense Tracker application on Render with PostgreSQL database.

## 📋 Prerequisites

1. **GitHub Account** with your code repository
2. **Render Account** (free tier available)
3. **PostgreSQL Database** (free tier available on Render)

## 🗄️ Step 1: Create PostgreSQL Database

1. **Login to Render Dashboard**
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Sign in with your account

2. **Create New PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - **Name**: `expense-tracker-db`
   - **Database**: `expense_tracker`
   - **User**: `expense_tracker_user`
   - **Plan**: Free
   - **Region**: Choose closest to your users
   - Click "Create Database"

3. **Save Database Credentials**
   - Note down the **Internal Database URL** (you'll need this later)
   - Format: `postgresql://user:password@host:port/database`

## 🔧 Step 2: Deploy Backend API

1. **Create New Web Service**
   - Click "New +" → "Web Service"
   - **Connect your repository** (GitHub)
   - **Name**: `expense-tracker-backend`
   - **Environment**: Python 3
   - **Region**: Same as database
   - **Branch**: `main` (or your preferred branch)
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

2. **Configure Environment Variables in Render UI**
   - **DATABASE_URL**: `postgresql://user:password@host:port/database` (from step 1)
   - **PYTHON_VERSION**: `3.11.0`
   - **PORT**: `8000`
   - **ALLOWED_ORIGINS**: `https://your-frontend-app-name.onrender.com` (you'll get this after creating frontend)

3. **Advanced Settings**
   - **Health Check Path**: `/`
   - **Auto-Deploy**: Enabled
   - Click "Create Web Service"

## 🎨 Step 3: Deploy Frontend

1. **Create New Static Site**
   - Click "New +" → "Static Site"
   - **Connect your repository** (same GitHub repo)
   - **Name**: `expense-tracker-frontend`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: `dist`

2. **Configure Environment Variables in Render UI**
   - **VITE_API_BASE_URL**: `https://your-backend-app-name.onrender.com`
   - Replace `your-backend-app` with your actual backend service name

3. **Configure Routes**
   - **Rewrite Rules**: Add rule for React Router
   - **Source**: `/*`
   - **Destination**: `/index.html`

4. **Click "Create Static Site"**

## 🔗 Step 4: Update CORS Configuration

1. **Get your frontend URL** from the frontend service dashboard
2. **Go back to your backend service** → Environment Variables
3. **Update ALLOWED_ORIGINS** to include your frontend URL:
   ```
   https://your-frontend-app-name.onrender.com
   ```
4. **Save changes** - this will trigger a redeploy

## 🚀 Step 5: Test Your Deployment

1. **Backend Health Check**
   - Visit: `https://your-backend-app.onrender.com/`
   - Should see: `{"message": "Premium Expense Tracker API"}`

2. **Frontend Application**
   - Visit: `https://your-frontend-app.onrender.com`
   - Should load the expense tracker application

3. **Database Connection**
   - Try adding a payment mode or expense
   - Check if data is being saved to PostgreSQL

## 🔒 Environment Variables Security

**IMPORTANT**: Never commit environment files with real values to GitHub!

### **Backend Environment Variables (set in Render UI):**
- `DATABASE_URL`: Your PostgreSQL connection string
- `ALLOWED_ORIGINS`: Your frontend URL(s)
- `PYTHON_VERSION`: 3.11.0
- `PORT`: 8000

### **Frontend Environment Variables (set in Render UI):**
- `VITE_API_BASE_URL`: Your backend service URL

### **How to Set in Render:**
1. Go to your service dashboard
2. Click "Environment" tab
3. Click "Add Environment Variable"
4. Enter key and value
5. Click "Save Changes"

## 🔧 Troubleshooting

### **Backend Issues**

1. **Build Failures**
   - Check build logs in Render dashboard
   - Ensure all dependencies are in `requirements.txt`
   - Verify Python version compatibility

2. **Database Connection Errors**
   - Verify `DATABASE_URL` environment variable is set correctly
   - Check if database is accessible from your region
   - Ensure database is not paused (free tier pauses after inactivity)

3. **CORS Errors**
   - Update `ALLOWED_ORIGINS` with your frontend URL
   - Check browser console for specific error messages

### **Frontend Issues**

1. **Build Failures**
   - Check build logs for npm errors
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

2. **API Connection Errors**
   - Verify `VITE_API_BASE_URL` environment variable is set correctly
   - Check if backend is running and accessible
   - Ensure CORS is properly configured

### **Database Issues**

1. **Connection Timeouts**
   - Free tier databases may have connection limits
   - Consider upgrading to paid plan for production use

2. **Data Loss**
   - Free tier databases may pause after inactivity
   - Always backup important data

## 📊 Monitoring & Maintenance

1. **Health Checks**
   - Monitor service health in Render dashboard
   - Set up alerts for service failures

2. **Logs**
   - Check service logs regularly
   - Monitor database performance

3. **Updates**
   - Keep dependencies updated
   - Monitor security advisories

## 💰 Cost Optimization

1. **Free Tier Limits**
   - Backend: 750 hours/month
   - Database: 90 days of inactivity before pause
   - Static Site: Unlimited

2. **Upgrade Considerations**
   - **Backend**: $7/month for always-on service
   - **Database**: $7/month for persistent database
   - **Custom Domain**: $10/month

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit sensitive data to Git
   - Use Render's environment variable system
   - Rotate database passwords regularly

2. **CORS Configuration**
   - Restrict origins to your domains only
   - Avoid using wildcards in production

3. **Database Security**
   - Use strong passwords
   - Enable SSL connections
   - Regular security updates

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [React Build & Deploy](https://create-react-app.dev/docs/deployment/)
- [PostgreSQL Best Practices](https://www.postgresql.org/docs/current/)

## 🎯 Next Steps

After successful deployment:

1. **Set up custom domain** (optional)
2. **Configure SSL certificates** (automatic on Render)
3. **Set up monitoring and alerts**
4. **Implement CI/CD pipeline**
5. **Add backup strategies**

---

**Need Help?** Check the troubleshooting section or visit [Render Community](https://community.render.com/)
