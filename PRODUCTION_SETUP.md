# Availly - Production Setup Guide

## 🚀 Quick Deploy

```bash
# Switch to production branch
git checkout prod

# Run deployment script
./scripts/deploy-prod.sh
```

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  app.availly.me │    │   availly.me    │    │   availly.me    │
│                 │    │                 │    │                 │
│  React Frontend │───▶│  Laravel API    │───▶│  Public Links   │
│                 │    │                 │    │  /u/{username}  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐               │
         │              │   PostgreSQL    │               │
         │              │    Database     │               │
         │              └─────────────────┘               │
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐               │
         └──────────────▶│     Redis       │◀──────────────┘
                        │ Cache & Queue   │
                        └─────────────────┘
```

## 📋 Pre-Deployment Checklist

### 1. Domain Setup
- [ ] Purchase domain `availly.me`
- [ ] Configure DNS:
  - `availly.me` → CNAME to `availly-api.onrender.com`
  - `app.availly.me` → CNAME to `availly-frontend.onrender.com`

### 2. Third-Party Services
- [ ] **Resend Account** (Email delivery)
  - Sign up at [resend.com](https://resend.com)
  - Verify domain `availly.me`
  - Generate API key
  
- [ ] **Google OAuth** (Calendar integration)
  - Create project in [Google Cloud Console](https://console.cloud.google.com)
  - Enable Google Calendar API
  - Create OAuth 2.0 credentials
  
- [ ] **Microsoft OAuth** (Calendar integration)
  - Register app in [Azure Portal](https://portal.azure.com)
  - Configure Microsoft Graph permissions

### 3. Render Account
- [ ] Sign up at [render.com](https://render.com)
- [ ] Connect GitHub repository
- [ ] Have credit card ready (for paid services)

## 🔧 Deployment Steps

### Step 1: Prepare Production Branch

```bash
# Create and switch to production branch
git checkout -b prod

# Commit all changes
git add .
git commit -m "Production setup"
git push origin prod
```

### Step 2: Deploy to Render

1. **Connect Repository**
   - Go to Render Dashboard
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Select the `prod` branch

2. **Configure Services**
   - Render will detect `render.yaml` and create:
     - PostgreSQL database
     - Redis cache
     - API service (availly-api)
     - Frontend service (availly-frontend)

### Step 3: Environment Variables

Add these to your **API service** in Render:

```bash
# Core Application
APP_NAME=Availly
APP_ENV=production
APP_DEBUG=false
APP_URL=https://availly.me
FRONTEND_URL=https://app.availly.me

# Generate with: php artisan key:generate --show
APP_KEY=base64:YOUR_GENERATED_KEY_HERE

# Email (Resend)
RESEND_API_KEY=re_YOUR_RESEND_API_KEY
MAIL_FROM_ADDRESS=noreply@availly.me

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret

# Security
SANCTUM_STATEFUL_DOMAINS=app.availly.me,availly.me
```

**Frontend service** environment variables:
```bash
VITE_API_URL=https://availly.me/api
VITE_APP_URL=https://app.availly.me
```

### Step 4: Post-Deployment

1. **Run Migrations**
   ```bash
   # In Render API service shell
   php artisan migrate --force
   ```

2. **Verify Deployment**
   - Frontend: https://app.availly.me
   - API Health: https://availly.me/api/health
   - Public Calendar: https://availly.me/u/{username}

## 🌐 URL Structure

| Service | URL Pattern | Purpose |
|---------|-------------|---------|
| Frontend App | `https://app.availly.me/*` | Main application dashboard |
| API Endpoints | `https://availly.me/api/*` | REST API for frontend |
| Public Calendar | `https://availly.me/u/{username}` | Public calendar links |
| Landing Page | `https://availly.me` | Future landing page |

## 🔒 Security Features

- **HTTPS Only**: All traffic encrypted via Render SSL
- **CORS Protection**: Configured for specific domains
- **Secure Sessions**: HttpOnly cookies with proper domain
- **Rate Limiting**: Built-in Laravel rate limiting
- **Input Validation**: Laravel request validation
- **SQL Injection Protection**: Eloquent ORM with parameterized queries

## 📊 Monitoring & Maintenance

### Health Checks
- **API**: `GET https://availly.me/api/health`
- **Frontend**: Served via nginx (HTTP 200 response)

### Logs
- View in Render Dashboard under each service
- Laravel logs formatted as JSON for better parsing

### Scaling
- **Starter Plan**: Good for initial launch
- **Professional Plan**: For higher traffic
- **Queue Workers**: Auto-scale with Redis

### Backups
- **Database**: Render provides automated backups
- **Code**: Git repository serves as backup
- **Environment**: Document all env vars securely

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   ```bash
   # Check CORS configuration
   php artisan config:show cors
   
   # Verify allowed origins include both domains
   ```

2. **Database Connection**
   ```bash
   # Test database connection
   php artisan migrate:status
   
   # Check environment variables
   php artisan config:show database.connections.pgsql
   ```

3. **OAuth Callback Issues**
   - Verify redirect URIs match exactly
   - Check OAuth client credentials
   - Ensure HTTPS is used in production

4. **Session Problems**
   ```bash
   # Clear caches
   php artisan config:clear
   php artisan cache:clear
   php artisan route:clear
   ```

### Debug Commands

```bash
# Check all configuration
php artisan about

# Test email sending
php artisan tinker
>>> Mail::raw('Test email', function($msg) { $msg->to('test@example.com')->subject('Test'); });

# Check queue status
php artisan queue:work --once
```

## 📈 Performance Optimization

### Laravel Optimizations
```bash
# Cache configuration (in Dockerfile)
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Optimize Composer autoloader
composer install --optimize-autoloader --no-dev
```

### Frontend Optimizations
- Vite build optimization
- Asset compression via nginx
- CDN integration (future)

### Database Optimizations
- Proper indexing on frequently queried columns
- Connection pooling via PostgreSQL
- Query optimization with Laravel Debugbar (dev only)

## 🔄 Deployment Workflow

### Development to Production
```bash
# 1. Develop on feature branches
git checkout -b feature/new-feature

# 2. Merge to dev branch
git checkout dev
git merge feature/new-feature

# 3. Test on dev branch
# Run tests, verify functionality

# 4. Merge to prod branch
git checkout prod
git merge dev

# 5. Deploy to production
./scripts/deploy-prod.sh
```

### Hotfixes
```bash
# 1. Create hotfix from prod
git checkout prod
git checkout -b hotfix/critical-fix

# 2. Make minimal changes
# Fix the issue

# 3. Deploy hotfix
git checkout prod
git merge hotfix/critical-fix
./scripts/deploy-prod.sh

# 4. Merge back to dev
git checkout dev
git merge prod
```

## 📞 Support & Maintenance

### Regular Maintenance
- [ ] Weekly: Review logs for errors
- [ ] Monthly: Update dependencies
- [ ] Quarterly: Security audit
- [ ] Annually: SSL certificate renewal (auto via Render)

### Monitoring Checklist
- [ ] API response times
- [ ] Database performance
- [ ] Queue processing
- [ ] Error rates
- [ ] User activity

### Backup Strategy
- [ ] Database: Automated via Render
- [ ] Environment variables: Secure documentation
- [ ] Code: Git repository with multiple remotes
- [ ] Configuration: Infrastructure as Code (render.yaml)

---

## 🎯 Next Steps After Deployment

1. **Create Landing Page** at `availly.me`
2. **Set up Analytics** (Google Analytics, Mixpanel, etc.)
3. **Configure Monitoring** (Sentry, LogRocket, etc.)
4. **Set up CI/CD** for automated testing
5. **Performance Monitoring** (New Relic, DataDog, etc.)
6. **User Feedback** collection system
7. **Documentation** for end users

---

**🚀 Ready to deploy? Run `./scripts/deploy-prod.sh` from the prod branch!**
