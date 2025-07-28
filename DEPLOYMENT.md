# Deployment Guide for Render

## Prerequisites
- GitHub repository with your code pushed
- Render account (sign up at https://render.com)

## Steps to Deploy on Render

### 1. Connect Your GitHub Repository
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" and select "Static Site"
3. Connect your GitHub account if not already connected
4. Select your repository: `rajchaudhariiiii98/guest-review-frontend`

### 2. Configure the Static Site
- **Name**: `guest-review-frontend` (or your preferred name)
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment**: Static Site

### 3. Environment Variables (if needed)
Add any environment variables if your app requires them:
- Go to your service settings
- Add environment variables under "Environment" tab

### 4. Deploy
1. Click "Create Static Site"
2. Render will automatically build and deploy your site
3. Your site will be available at: `https://your-app-name.onrender.com`

### 5. Custom Domain (Optional)
1. Go to your service settings
2. Under "Custom Domains" tab
3. Add your custom domain

## Automatic Deployments
- Render automatically deploys when you push to the `main` branch
- You can also manually deploy from the dashboard

## Troubleshooting
- Check build logs in the Render dashboard
- Ensure all dependencies are in `package.json`
- Verify the build command works locally: `npm run build`

## Your Backend API
Your frontend is configured to use the backend at: `https://guest-review-backend.onrender.com` 