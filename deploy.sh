#!/bin/bash

echo "🚀 Preparing Availly for Railway deployment..."

# Check if we're on main branch
if [[ $(git branch --show-current) != "main" ]]; then
    echo "❌ Error: Must be on main branch for production deployment"
    echo "Current branch: $(git branch --show-current)"
    exit 1
fi

# Check if working tree is clean
if [[ -n $(git status --porcelain) ]]; then
    echo "❌ Error: Working tree is not clean. Please commit or stash changes."
    git status --porcelain
    exit 1
fi

echo "✅ Git status: Clean working tree on main branch"

# Pull latest changes
echo "📥 Pulling latest changes from main..."
git pull origin main

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "npm install -g @railway/cli"
    exit 1
fi

echo "✅ Railway CLI found"

# Check if logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway. Please run: railway login"
    exit 1
fi

echo "✅ Logged in to Railway"

# Build the application locally to test
echo "🔨 Building application locally..."
if ! docker build -t availly:test .; then
    echo "❌ Docker build failed"
    exit 1
fi

echo "✅ Docker build successful"

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your app should be available at: https://availly.me"
echo "📊 Monitor deployment at: https://railway.app"
echo ""
echo "💡 Remember to:"
echo "   - Set environment variables in Railway dashboard"
echo "   - Configure your domain (availly.me) in Railway"
echo "   - Set up PostgreSQL and Redis services in Railway"
