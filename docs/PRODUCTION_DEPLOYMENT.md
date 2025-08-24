# Production Deployment Guide for Availly

## Overview

This guide covers deploying Availly to production on Render with the following architecture:
- **Backend API**: `availly.me` (Laravel API + Public Calendar Links)
- **Frontend App**: `app.availly.me` (React SPA)
- **Public Links**: `availly.me/u/{username}` (Public calendar access)

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **Domain Setup**: Configure DNS for `availly.me` and `app.availly.me`
3. **Third-party Services**:
   - Resend account for email
   - Google OAuth app for calendar integration
   - Microsoft OAuth app for calendar integration

## Environment Variables

### Required Environment Variables for API Service

Copy these to your Render dashboard for the `availly-api` service:

```bash
# Application
APP_NAME=Availly
APP_ENV=production
APP_DEBUG=false
APP_TIMEZONE=UTC
APP_URL=https://availly.me
FRONTEND_URL=https://app.availly.me

# Generate a new key with: php artisan key:generate --show
APP_KEY=base64:YOUR_GENERATED_KEY_HERE

# Database (Auto-configured by Render)
DB_CONNECTION=pgsql
DB_HOST=${RENDER_DATABASE_HOST}
DB_PORT=${RENDER_DATABASE_PORT}
DB_DATABASE=${RENDER_DATABASE_NAME}
DB_USERNAME=${RENDER_DATABASE_USER}
DB_PASSWORD=${RENDER_DATABASE_PASSWORD}

# Cache & Sessions (Auto-configured by Render Redis)
CACHE_STORE=redis
SESSION_DRIVER=redis
SESSION_LIFETIME=120
SESSION_DOMAIN=.availly.me
SESSION_SECURE_COOKIES=true
QUEUE_CONNECTION=redis

REDIS_HOST=${RENDER_REDIS_HOST}
REDIS_PASSWORD=${RENDER_REDIS_PASSWORD}
REDIS_PORT=${RENDER_REDIS_PORT}

# Email (Resend)
MAIL_MAILER=resend
MAIL_FROM_ADDRESS=noreply@availly.me
MAIL_FROM_NAME=Availly
RESEND_API_KEY=re_YOUR_RESEND_API_KEY

# OAuth - Google Calendar
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://availly.me/api/auth/google/callback

# OAuth - Microsoft Calendar
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
MICROSOFT_REDIRECT_URI=https://availly.me/api/auth/microsoft/callback

# Apple CalDAV (Optional)
APPLE_CLIENT_ID=your_apple_client_id
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
your_apple_private_key_content
-----END PRIVATE KEY-----"

# Security & CORS
SANCTUM_STATEFUL_DOMAINS=app.availly.me,availly.me
CORS_ALLOWED_ORIGINS=https://app.availly.me,https://availly.me
```

### Required Environment Variables for Frontend Service

```bash
VITE_API_URL=https://availly.me/api
VITE_APP_URL=https://app.availly.me
```

## Deployment Steps

### 1. Push Production Branch

```bash
# Commit all changes to the prod branch
git add .
git commit -m "Production deployment setup"
git push origin prod
```

### 2. Set Up Render Services

1. **Connect Repository**:
   - Go to Render Dashboard
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Select the `prod` branch

2. **Configure Blueprint**:
   - Render will automatically detect the `render.yaml` file
   - This will create:
     - PostgreSQL database (`availly-db`)
     - Redis instance (`availly-redis`)
     - API service (`availly-api`)
     - Frontend service (`availly-frontend`)

3. **Set Environment Variables**:
   - Go to each service's Environment tab
   - Add the required environment variables listed above
   - Generate `APP_KEY` locally: `cd apps/api && php artisan key:generate --show`

### 3. Domain Configuration

#### DNS Setup
Point your domains to Render:

```
# For availly.me (API + Public Links)
Type: CNAME
Name: @
Value: availly-api.onrender.com

# For app.availly.me (Frontend)
Type: CNAME  
Name: app
Value: availly-frontend.onrender.com
```

#### SSL Certificates
Render automatically provides SSL certificates for custom domains.

### 4. Database Migration

After deployment, run migrations:

1. Go to your API service in Render Dashboard
2. Open the Shell tab
3. Run: `php artisan migrate --force`

### 5. OAuth App Configuration

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create/select your project
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials:
   - Authorized JavaScript origins: `https://app.availly.me`
   - Authorized redirect URIs: `https://availly.me/api/auth/google/callback`

#### Microsoft OAuth
1. Go to [Azure App Registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps)
2. Create new registration:
   - Redirect URI: `https://availly.me/api/auth/microsoft/callback`
3. Add Microsoft Graph permissions:
   - `Calendars.Read`
   - `Calendars.ReadWrite`
   - `offline_access`

#### Resend Email
1. Sign up at [Resend](https://resend.com)
2. Verify your domain `availly.me`
3. Create API key
4. Add to environment variables

## URL Structure

### Frontend Application
- **Base URL**: `https://app.availly.me`
- **Routes**: All React Router routes (dashboard, settings, etc.)

### API Endpoints
- **Base URL**: `https://availly.me/api`
- **Health Check**: `https://availly.me/api/health`
- **Authentication**: `https://availly.me/api/auth/*`

### Public Calendar Links
- **Public Profile**: `https://availly.me/u/{username}`
- **Availability API**: `https://availly.me/api/public/{slug}/availability`

## Monitoring & Maintenance

### Health Checks
- API: `https://availly.me/api/health`
- Frontend: Served via nginx, monitors HTTP response

### Logs
- View logs in Render Dashboard under each service
- Laravel logs are formatted as JSON for better parsing

### Scaling
- Start with Render's Starter plan
- Monitor resource usage and upgrade as needed
- Queue workers auto-scale with Redis

### Backups
- Database: Render provides automated backups
- Consider additional backup strategy for critical data

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to git
2. **HTTPS Only**: All traffic is encrypted via Render's SSL
3. **CORS**: Properly configured for cross-origin requests
4. **Session Security**: Secure cookies with proper domain settings
5. **Rate Limiting**: Consider implementing rate limiting for API endpoints

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Verify database environment variables
   - Check if migrations have run

2. **OAuth Callback Errors**:
   - Verify redirect URIs match exactly
   - Check OAuth client credentials

3. **CORS Issues**:
   - Verify CORS_ALLOWED_ORIGINS includes both domains
   - Check frontend API_URL configuration

4. **Session Issues**:
   - Verify SESSION_DOMAIN is set to `.availly.me`
   - Check Redis connection

### Debug Commands

```bash
# Check environment configuration
php artisan config:show

# Test database connection
php artisan migrate:status

# Clear caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

## Post-Deployment Checklist

- [ ] API health check responds correctly
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] Email verification sends
- [ ] Google OAuth flow works
- [ ] Microsoft OAuth flow works
- [ ] Public calendar links work
- [ ] Database migrations completed
- [ ] SSL certificates active
- [ ] Monitoring setup complete

## Support

For deployment issues:
1. Check Render service logs
2. Verify environment variables
3. Test API endpoints individually
4. Check database connectivity
