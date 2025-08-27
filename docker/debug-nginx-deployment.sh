#!/bin/sh
set -e

echo "🔍 Debugging Nginx Deployment Issue..."
echo "======================================"

echo "📍 Current directory: $(pwd)"
echo "👤 User: $(whoami)"

# Check if we're in the right container
if [ ! -f "/usr/local/bin/entrypoint.sh" ]; then
    echo "❌ Not in the right container - entrypoint script not found"
    exit 1
fi

echo "✅ In the right container"

# Check the rendered nginx configuration
echo -e "\n📋 Checking rendered nginx configuration..."
if [ -f "/etc/nginx/conf.d/default.conf" ]; then
    echo "✅ Rendered config exists at /etc/nginx/conf.d/default.conf"
    echo "First 20 lines:"
    head -20 /etc/nginx/conf.d/default.conf
else
    echo "❌ Rendered config not found"
fi

# Check the main nginx configuration
echo -e "\n📋 Checking main nginx configuration..."
if [ -f "/etc/nginx/nginx.conf" ]; then
    echo "✅ Main nginx config exists"
    echo "Main config structure:"
    grep -E "^(user|worker_processes|events|http)" /etc/nginx/nginx.conf
else
    echo "❌ Main nginx config not found"
fi

# Check if nginx is running
echo -e "\n📊 Checking nginx process status..."
if pgrep nginx > /dev/null; then
    echo "✅ Nginx is running"
    ps aux | grep nginx | grep -v grep
else
    echo "❌ Nginx is not running"
fi

# Check nginx configuration syntax
echo -e "\n🧪 Testing nginx configuration syntax..."
if nginx -t; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has syntax errors"
    echo "Testing main config:"
    nginx -t -c /etc/nginx/nginx.conf 2>&1 || true
fi

# Check nginx logs
echo -e "\n📝 Checking nginx logs..."
if [ -f "/var/log/nginx/error.log" ]; then
    echo "Recent error log entries:"
    tail -10 /var/log/nginx/error.log || echo "Could not read error log"
else
    echo "No error log found"
fi

if [ -f "/var/log/nginx/access.log" ]; then
    echo "Recent access log entries:"
    tail -5 /var/log/nginx/access.log || echo "Could not read access log"
else
    echo "No access log found"
fi

# Check PHP-FPM status
echo -e "\n📊 Checking PHP-FPM status..."
if pgrep php-fpm > /dev/null; then
    echo "✅ PHP-FPM is running"
    ps aux | grep php-fpm | grep -v grep
else
    echo "❌ PHP-FPM is not running"
fi

# Test the health check endpoint
echo -e "\n🏥 Testing health check endpoint..."
if command -v curl >/dev/null 2>&1; then
    PORT="${PORT:-8080}"
    echo "Testing health check at http://localhost:${PORT}/health"
    if curl -f -s "http://localhost:${PORT}/health" > /dev/null; then
        echo "✅ Health check endpoint is working"
    else
        echo "❌ Health check endpoint failed"
        echo "Response:"
        curl -v "http://localhost:${PORT}/health" 2>&1 || true
    fi
else
    echo "⚠️ curl not available for testing"
fi

# Check file permissions
echo -e "\n🔐 Checking file permissions..."
echo "Nginx config directory:"
ls -la /etc/nginx/conf.d/
echo "Nginx main config:"
ls -la /etc/nginx/nginx.conf
echo "Nginx logs directory:"
ls -la /var/log/nginx/

# Check environment variables
echo -e "\n🌍 Checking environment variables..."
echo "PORT: ${PORT:-8080}"
echo "PATH: $PATH"

echo -e "\n🎯 Summary of issues found:"
echo "1. Check if nginx configuration is valid"
echo "2. Check if nginx process is running"
echo "3. Check nginx error logs for specific errors"
echo "4. Verify file permissions and ownership"
echo "5. Test health check endpoint manually"
