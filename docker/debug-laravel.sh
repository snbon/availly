#!/bin/sh
set -e

echo "🔍 Debugging Laravel Application..."
echo "=================================="

cd /usr/share/nginx/html/api

echo "📁 Current directory: $(pwd)"
echo "🔧 Laravel version: $(php artisan --version)"

echo -e "\n📋 Checking registered API routes..."
php artisan route:list --path=api

echo -e "\n🔍 Testing specific auth routes..."
php artisan route:list --path=api/auth

echo -e "\n📝 Checking Laravel logs..."
if [ -f "storage/logs/laravel.log" ]; then
    echo "Recent Laravel log entries:"
    tail -20 storage/logs/laravel.log
else
    echo "No Laravel log file found"
fi

echo -e "\n⚙️ Checking Laravel configuration..."
echo "APP_ENV: $(php artisan tinker --execute='echo config("app.env");')"
echo "APP_DEBUG: $(php artisan tinker --execute='echo config("app.debug");')"
echo "APP_URL: $(php artisan tinker --execute='echo config("app.url");')"

echo -e "\n🧪 Testing route cache..."
if [ -f "bootstrap/cache/routes.php" ]; then
    echo "Route cache exists, clearing it..."
    php artisan route:clear
    echo "Route cache cleared"
else
    echo "No route cache found"
fi

echo -e "\n🔄 Testing route registration..."
php artisan route:list --path=api | grep "auth/login" || echo "❌ /auth/login route not found!"

echo -e "\n📊 Checking PHP-FPM status..."
ps aux | grep php-fpm || echo "PHP-FPM not running"

echo -e "\n🌐 Testing nginx configuration..."
nginx -t

echo -e "\n💡 If you see 405 errors, check:"
echo "1. Route is properly registered (should see POST /api/auth/login above)"
echo "2. Laravel logs for any errors"
echo "3. PHP-FPM is running and accessible"
echo "4. Nginx configuration is valid"
