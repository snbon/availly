# Production Deployment Guide — Availly

## Overview

This guide covers deploying Availly to production on Railway with the following domain structure:
- **Frontend (React)**: `app.availly.me` - The main application dashboard
- **API (Laravel)**: `api.availly.me` - Backend API
- **Public Links**: `availly.me/u/{username}` - Public calendar views
- **Landing Page**: `availly.me` - Landing page (separate repo, not yet created)

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Domain**: Ownership of `availly.me` domain
3. **Services Setup**:
   - PostgreSQL database (Railway or Supabase)
   - Redis instance (Railway)
   - Email service (Resend)

## Railway Project Setup

### 1. Create Railway Project

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway new
```

### 2. Deploy Services

You'll need to deploy 3 separate services:

#### A. PostgreSQL Database
```bash
# Add PostgreSQL service
railway add postgresql
```

#### B. Redis Cache
```bash
# Add Redis service  
railway add redis
```

#### C. API Service (Laravel)
```bash
# From project root, deploy API
cd apps/api
railway up
```

#### D. Frontend Service (React)
```bash
# From project root, deploy frontend
cd apps/web  
railway up
```

## Environment Configuration

### API Service Environment Variables

Set these in Railway dashboard for your API service:

```bash
# App Configuration
APP_NAME="Availly"
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_KEY_HERE  # Generate with: php artisan key:generate --show
APP_DEBUG=false
APP_URL=https://api.availly.me

# Database (Auto-filled by Railway PostgreSQL service)
DATABASE_URL=${{Postgres.DATABASE_URL}}
DB_CONNECTION=pgsql

# Redis (Auto-filled by Railway Redis service)  
REDIS_URL=${{Redis.REDIS_URL}}
SESSION_DRIVER=redis
CACHE_STORE=redis
QUEUE_CONNECTION=redis

# Mail Configuration
RESEND_API_KEY=re_your_resend_api_key_here
MAIL_FROM_ADDRESS=noreply@availly.me

# OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret

# CORS and Sanctum
FRONTEND_URL=https://app.availly.me
PUBLIC_URL=https://availly.me
SANCTUM_STATEFUL_DOMAINS=app.availly.me
SESSION_DOMAIN=.availly.me
```

### Frontend Service Environment Variables

Set these in Railway dashboard for your frontend service:

```bash
VITE_API_URL=https://api.availly.me
VITE_APP_URL=https://app.availly.me  
VITE_PUBLIC_URL=https://availly.me
NODE_ENV=production
```

## Domain Configuration

### 1. DNS Setup

In your domain registrar (e.g., Cloudflare, GoDaddy), add these DNS records:

```
Type    Name    Value                           TTL
CNAME   api     your-api-service.railway.app    Auto
CNAME   app     your-frontend-service.railway.app    Auto
A       @       your-landing-page-ip            Auto
CNAME   www     availly.me                      Auto
```

### 2. Railway Custom Domains

In Railway dashboard:

1. **API Service**: Add custom domain `api.availly.me`
2. **Frontend Service**: Add custom domain `app.availly.me`

Railway will automatically provision SSL certificates.

## Deployment Steps

### 1. Initial Deployment

```bash
# Deploy API
cd apps/api
railway up

# Deploy Frontend  
cd ../web
railway up
```

### 2. Database Setup

```bash
# Connect to API service
railway shell

# Run migrations
php artisan migrate --force

# Seed initial data (if needed)
php artisan db:seed --force
```

### 3. Verify Deployment

Check these endpoints:
- `https://api.availly.me/api/health` - API health check
- `https://app.availly.me/health` - Frontend health check
- `https://app.availly.me` - Main application

## OAuth Configuration

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select project
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://api.availly.me/auth/google/callback`

### Microsoft OAuth  
1. Go to [Azure Portal](https://portal.azure.com/)
2. Register application
3. Add redirect URI: `https://api.availly.me/auth/microsoft/callback`
4. Grant Calendar permissions

## Public Calendar Routes

The public calendar will be accessible at:
- `https://availly.me/u/{username}` - Individual user calendars

This requires the landing page service to proxy requests to the API or handle routing appropriately.

## Monitoring and Logs

### Railway Logs
```bash
# View API logs
railway logs --service api

# View Frontend logs  
railway logs --service web
```

### Health Checks
- API: `GET /api/health`
- Frontend: `GET /health`

## Security Considerations

1. **HTTPS Only**: All domains use SSL
2. **CORS**: Configured for `app.availly.me` origin
3. **Session Security**: Secure cookies with domain `.availly.me`
4. **Environment Variables**: Never commit secrets to git
5. **Database**: Use connection pooling and read replicas if needed

## Scaling

### Horizontal Scaling
```bash
# Scale API service
railway scale --replicas 2

# Scale frontend service  
railway scale --replicas 2
```

### Vertical Scaling
Upgrade Railway plan for more CPU/RAM per instance.

## Backup Strategy

1. **Database**: Railway PostgreSQL includes automated backups
2. **Files**: Use Railway volume mounts for persistent storage
3. **Environment**: Export environment variables regularly

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check `FRONTEND_URL` and `SANCTUM_STATEFUL_DOMAINS`
2. **Database Connection**: Verify `DATABASE_URL` is set
3. **Redis Connection**: Verify `REDIS_URL` is set  
4. **Domain SSL**: Wait 5-10 minutes after adding custom domain

### Debug Commands
```bash
# Check environment
railway shell
env | grep APP

# Test database connection
php artisan migrate:status

# Test Redis connection  
php artisan tinker
Cache::put('test', 'value')
Cache::get('test')
```

## Next Steps

1. **Landing Page**: Create separate repository for `availly.me` landing page
2. **CDN**: Consider adding Cloudflare for static asset caching
3. **Monitoring**: Add application monitoring (e.g., Sentry)
4. **Analytics**: Integrate analytics service
5. **Backup**: Set up automated backups beyond Railway defaults
