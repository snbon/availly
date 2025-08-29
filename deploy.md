# Railway Deployment Guide

## Pre-deployment Checklist

1. **Environment Variables**: All environment variables are already configured in Railway dashboard
2. **Branch**: Currently on `production` branch ✅
3. **Database**: Supabase PostgreSQL configured ✅
4. **Domain**: `availly.me` configured ✅

## Deployment Steps

### 1. Connect Repository to Railway
```bash
# If not already connected, link your GitHub repository to Railway
# This should be done through Railway dashboard
```

### 2. Deploy
```bash
# Push to production branch to trigger deployment
git add .
git commit -m "Add Railway deployment configuration"
git push origin production
```

### 3. Verify Deployment
After deployment, verify these routes work:
- `https://availly.me/` → Landing page
- `https://availly.me/login` → Login page  
- `https://availly.me/register` → Register page
- `https://availly.me/app/dashboard` → App dashboard (after login)
- `https://availly.me/api/health` → API health check
- `https://availly.me/{username}` → Public calendar links

## Build Process

The deployment will:
1. **Install PHP dependencies** with Composer
2. **Install Node.js dependencies** for React app
3. **Build React app** and output to Laravel's `public/` directory
4. **Cache Laravel configuration** for production performance
5. **Run database migrations** automatically
6. **Start Laravel server** on Railway's assigned port

## Routing Configuration

- **Static files**: Served directly from `public/`
- **API routes**: `/api/*` handled by Laravel
- **All other routes**: Serve React `index.html` for client-side routing
- **Public calendars**: `/{slug}` handled by React, API calls to `/api/public/{slug}/availability`

## Security Features

✅ **No secrets in code**: All sensitive data in Railway environment variables  
✅ **Production optimized**: Autoloader optimization, config caching  
✅ **SSL enabled**: Railway provides HTTPS automatically  
✅ **Database SSL**: Supabase connection uses SSL  

## Troubleshooting

If deployment fails:
1. Check Railway build logs
2. Verify all environment variables are set
3. Ensure `production` branch is up to date
4. Check API health endpoint: `/api/health`

## Post-deployment

After successful deployment:
1. Test user registration/login flow
2. Verify calendar connections work
3. Test public calendar sharing
4. Monitor Railway logs for any issues
