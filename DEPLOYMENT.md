# 🚀 Railway Production Deployment Guide

## Overview
This guide will help you deploy Availly to Railway as a single monorepo service. The deployment will serve both the React web app and Laravel API from the same domain (`availly.me`).

## Architecture
- **Domain**: `availly.me`
- **Web App Routes**: `/`, `/login`, `/app/*`, `/{slug}` (public calendar)
- **API Routes**: `/api/*`
- **Single Service**: Both web and API served from one Railway service

## Prerequisites
1. ✅ On `main` branch
2. ✅ Clean working tree
3. ✅ Railway CLI installed: `npm install -g @railway/cli`
4. ✅ Logged into Railway: `railway login`

## Quick Deployment
```bash
# Make sure you're on main branch
git checkout main
git pull origin main

# Run the deployment script
./deploy.sh
```

## Manual Deployment Steps

### 1. Prepare the Repository
```bash
# Ensure you're on main branch
git checkout main
git pull origin main

# Verify clean working tree
git status
```

### 2. Deploy to Railway
```bash
# Deploy the monorepo
railway up
```

### 3. Configure Environment Variables
In Railway dashboard, set these environment variables:

#### App URLs
```
VITE_API_URL=https://availly.me
VITE_APP_URL=https://availly.me
VITE_PUBLIC_URL=https://availly.me
```

#### Database (PostgreSQL)
```
DB_CONNECTION=pgsql
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_DATABASE=${DB_DATABASE}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}
```

#### Redis
```
REDIS_HOST=${REDIS_HOST}
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_PORT=${REDIS_PORT}
```

#### Mail (Resend)
```
MAIL_MAILER=resend
MAIL_FROM_ADDRESS=noreply@availly.me
MAIL_FROM_NAME="Availly"
RESEND_API_KEY=${RESEND_API_KEY}
```

#### App Configuration
```
APP_NAME=Availly
APP_ENV=production
APP_KEY=${APP_KEY}
APP_DEBUG=false
APP_URL=https://availly.me
```

#### Session & Security
```
SESSION_DRIVER=redis
SESSION_LIFETIME=120
SANCTUM_STATEFUL_DOMAINS=availly.me
SESSION_DOMAIN=.availly.me
```

#### Queue & Cache
```
QUEUE_CONNECTION=redis
CACHE_DRIVER=redis
```

#### Logging
```
LOG_CHANNEL=stack
LOG_LEVEL=error
```

### 4. Set Up Railway Services

#### PostgreSQL Service
1. Add PostgreSQL service in Railway
2. Railway will automatically provide `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`

#### Redis Service
1. Add Redis service in Railway
2. Railway will automatically provide `REDIS_HOST`, `REDIS_PASSWORD`, `REDIS_PORT`

### 5. Configure Domain
1. In Railway dashboard, go to your service
2. Add custom domain: `availly.me`
3. Update your DNS to point to Railway's provided CNAME

### 6. Run Laravel Setup Commands
After deployment, run these commands in Railway's shell:

```bash
# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Clear and cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set proper permissions
chmod -R 755 storage bootstrap/cache
```

## How It Works

### Docker Build Process
1. **Web Build Stage**: Builds React app with `npm run build`
2. **API Build Stage**: Installs PHP dependencies and prepares Laravel app
3. **Production Stage**: Combines both apps with nginx reverse proxy

### Nginx Configuration
- **Static Files**: Served directly from React build
- **API Routes** (`/api/*`): Proxied to PHP-FPM
- **All Other Routes**: Served by React Router (SPA)
- **Health Check**: `/health` endpoint for Railway

### URL Routing
- `https://availly.me` → React landing page
- `https://availly.me/login` → React auth pages
- `https://availly.me/app/*` → React application
- `https://availly.me/{slug}` → React public calendar view
- `https://availly.me/api/*` → Laravel API endpoints

## Troubleshooting

### Common Issues

#### Build Fails
- Check that all dependencies are properly specified in package.json
- Verify Dockerfile syntax
- Check for missing files in .dockerignore

#### API Not Working
- Verify PHP-FPM is running: `ps aux | grep php-fpm`
- Check nginx logs: `tail -f /var/log/nginx/error.log`
- Verify environment variables are set correctly

#### Web App Not Loading
- Check React build output in `/usr/share/nginx/html`
- Verify nginx is serving static files correctly
- Check browser console for JavaScript errors

#### Database Connection Issues
- Verify PostgreSQL service is running in Railway
- Check environment variables are properly set
- Test connection with `php artisan tinker`

### Logs
- **Nginx**: `/var/log/nginx/`
- **PHP-FPM**: `/var/log/php-fpm/`
- **Laravel**: `storage/logs/` (if accessible)

## Monitoring
- **Railway Dashboard**: Monitor service health and logs
- **Health Check**: `/health` endpoint for automated monitoring
- **Custom Domain**: Monitor DNS propagation and SSL certificate

## Security Notes
- All security headers are configured in nginx
- HTTPS enforced through Railway
- Session cookies are secure and httpOnly
- CSRF protection enabled for Laravel
- Rate limiting can be added via Laravel middleware

## Performance
- Static assets cached for 1 year
- React app cached with no-cache headers
- PHP-FPM configured for optimal performance
- OPcache enabled for PHP
- Gzip compression enabled

## Support
If you encounter issues:
1. Check Railway logs first
2. Verify environment variables
3. Test locally with Docker if possible
4. Check this guide for common solutions
