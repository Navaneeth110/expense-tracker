# Deploy to Render

This guide will help you deploy your expense tracker app to Render.

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Your code should be in a GitHub repository

## Step 1: Deploy Backend

1. **Go to Render Dashboard**
   - Log in to [render.com](https://render.com)
   - Click "New +" and select "Web Service"

2. **Connect Repository**
   - Connect your GitHub repository
   - Select the repository containing your code

3. **Configure Backend Service**
   - **Name**: `expense-tracker-backend`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free (or choose paid plan)

4. **Environment Variables**
   - `PYTHON_VERSION`: `3.12.0`
   - `DATABASE_URL`: `sqlite:///./expense_data.db`

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete
   - Note the service URL (e.g., `https://expense-tracker-backend-abc123.onrender.com`)

## Step 2: Deploy Frontend

1. **Create New Static Site**
   - Click "New +" and select "Static Site"

2. **Configure Frontend Service**
   - **Name**: `expense-tracker-frontend`
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: Free

3. **Environment Variables**
   - `VITE_API_BASE_URL`: Your backend service URL from Step 1

4. **Deploy**
   - Click "Create Static Site"
   - Wait for build to complete

## Step 3: Update Frontend Configuration

1. **Update API Base URL**
   - In your frontend code, update `frontend/render.yaml`
   - Replace `your-backend-service-name` with your actual backend service name

2. **Redeploy Frontend**
   - Push changes to GitHub
   - Render will automatically redeploy

## Important Notes

### Database Persistence
- **Free Plan**: Data will be lost when the service restarts
- **Paid Plan**: Consider using PostgreSQL for persistent data storage

### CORS Configuration
- Backend is configured to allow requests from Render domains
- Frontend will make API calls to your backend service

### Environment Variables
- Backend automatically gets `$PORT` from Render
- Frontend needs `VITE_API_BASE_URL` pointing to your backend

## Troubleshooting

### Backend Issues
- Check build logs for dependency issues
- Ensure `requirements.txt` is in the backend directory
- Verify Python version compatibility

### Frontend Issues
- Check if `VITE_API_BASE_URL` is correctly set
- Ensure build command completes successfully
- Verify `dist` folder is generated

### CORS Issues
- Check backend CORS configuration
- Verify frontend is calling the correct backend URL
- Check browser console for CORS errors

## Alternative: Single Repository Deployment

If you prefer to deploy both services from one repository:

1. **Use `render.yaml` in root directory**
2. **Configure both services in one file**
3. **Set build contexts for each service**

## Cost Considerations

- **Free Plan**: Limited bandwidth and compute hours
- **Paid Plans**: Start at $7/month for persistent services
- **Database**: Consider external database service for production

## Next Steps

After successful deployment:
1. Test all functionality
2. Set up custom domain (optional)
3. Configure monitoring and alerts
4. Set up CI/CD for automatic deployments
