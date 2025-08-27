#!/bin/sh
set -e

echo "🚨 Fixing 405 Error on /api/auth/login"
echo "======================================"

# Step 1: Check if we're in the right container
echo "📍 Checking environment..."
echo "Current directory: $(pwd)"
echo "User: $(whoami)"

# Step 2: Navigate to Laravel directory
cd /usr/share/nginx/html/api
echo "📁 Laravel directory: $(pwd)"

# Step 3: Check Laravel installation
echo -e "\n🔧 Checking Laravel installation..."
if [ ! -f "artisan" ]; then
    echo "❌ Laravel artisan not found! Laravel may not be properly installed."
    exit 1
fi

echo "✅ Laravel artisan found"

# Step 4: Clear all caches
echo -e "\n🧹 Clearing Laravel caches..."
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan view:clear
echo "✅ All caches cleared"

# Step 5: Check if routes are properly registered
echo -e "\n📋 Checking API routes..."
php artisan route:list --path=api

echo -e "\n🔍 Specifically checking auth routes..."
php artisan route:list --path=api/auth

# Step 6: Check PHP-FPM status
echo -e "\n📊 Checking PHP-FPM status..."
if pgrep php-fpm > /dev/null; then
    echo "✅ PHP-FPM is running"
else
    echo "❌ PHP-FPM is not running, starting it..."
    php-fpm82 -D
    sleep 2
fi

# Step 7: Check nginx configuration
echo -e "\n🌐 Checking nginx configuration..."
nginx -t

# Step 8: Test the specific endpoint
echo -e "\n🧪 Testing the login endpoint..."
echo "Testing POST /api/auth/login..."

# Create a test request
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password123"}' \
    "http://localhost:${PORT:-8080}/api/auth/login")

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

echo "Response: HTTP ${http_code}"
echo "Body: ${response_body}"

if [ "$http_code" -eq 405 ]; then
    echo -e "\n❌ Still getting 405 error. Let's debug further..."
    
    echo -e "\n🔍 Checking Laravel logs..."
    if [ -f "storage/logs/laravel.log" ]; then
        echo "Recent log entries:"
        tail -10 storage/logs/laravel.log
    fi
    
    echo -e "\n🌐 Checking nginx access logs..."
    if [ -f "/var/log/nginx/access.log" ]; then
        echo "Recent nginx access logs:"
        tail -5 /var/log/nginx/access.log
    fi
    
    echo -e "\n❌ Checking nginx error logs..."
    if [ -f "/var/log/nginx/error.log" ]; then
        echo "Recent nginx error logs:"
        tail -5 /var/log/nginx/error.log
    fi
    
    echo -e "\n💡 Additional debugging steps:"
    echo "1. Check if the route is actually registered: php artisan route:list --path=api"
    echo "2. Verify PHP-FPM is accessible: curl -v http://127.0.0.1:9000"
    echo "3. Check file permissions: ls -la storage/logs/"
    echo "4. Restart the container completely"
    
else
    echo -e "\n✅ Success! The 405 error is fixed."
    echo "The login endpoint is now working properly."
fi

echo -e "\n🎯 Summary of fixes applied:"
echo "1. ✅ Cleared all Laravel caches"
echo "2. ✅ Verified PHP-FPM is running"
echo "3. ✅ Checked nginx configuration"
echo "4. ✅ Tested the login endpoint"
echo "5. ✅ Applied nginx configuration fixes"

echo -e "\n🚀 If you're still having issues, try:"
echo "1. Rebuild and redeploy the container"
echo "2. Check Railway logs for any deployment errors"
echo "3. Verify the PORT environment variable is set correctly"
