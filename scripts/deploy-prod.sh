#!/bin/bash

# Production deployment script for Availly
set -e

echo "🚀 Deploying Availly to Production..."

# Ensure we're on the prod branch
echo "📋 Checking git branch..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "prod" ]; then
    echo "❌ Error: You must be on the 'prod' branch to deploy"
    echo "Current branch: $CURRENT_BRANCH"
    echo "Run: git checkout prod"
    exit 1
fi

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: You have uncommitted changes"
    echo "Please commit or stash your changes before deploying"
    git status --short
    exit 1
fi

# Generate production build locally to test
echo "🔧 Testing production build..."
cd apps/web
npm ci
npm run build
cd ../..

echo "✅ Frontend build successful"

# Test Laravel configuration
echo "🔧 Testing Laravel configuration..."
cd apps/api
composer install --no-dev --optimize-autoloader
php artisan config:clear
php artisan route:clear
php artisan view:clear
cd ../..

echo "✅ Laravel configuration test successful"

# Push to production branch
echo "📤 Pushing to production branch..."
git push origin prod

echo "🎉 Deployment initiated!"
echo ""
echo "Next steps:"
echo "1. Monitor Render dashboard for deployment progress"
echo "2. Run database migrations: php artisan migrate --force"
echo "3. Verify deployment at:"
echo "   - Frontend: https://app.availly.me"
echo "   - API Health: https://availly.me/api/health"
echo "   - Public Calendar: https://availly.me/u/{username}"
echo ""
echo "📊 Check deployment status at: https://dashboard.render.com"
