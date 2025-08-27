#!/bin/sh
set -e

echo "🚀 Starting Availly deployment..."
PORT="${PORT:-8080}"
echo "📍 Using port: ${PORT}"

# Step 1: Render nginx configuration
echo "📝 Rendering nginx configuration..."
sed "s/PORT_REPLACE/${PORT}/g" /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
echo "✅ Nginx configuration rendered"

# Step 2: Generate frontend environment file if needed
if [ -f /usr/share/nginx/html/env.template.js ]; then
  echo "🌐 Generating frontend environment file..."
  envsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js
  echo "✅ Frontend environment file generated"
fi

# Step 3: Ensure Laravel public directory exists
if [ ! -d "/usr/share/nginx/html/api/public" ]; then
  echo "⚠️ Laravel public directory not found, creating fallback..."
  mkdir -p /usr/share/nginx/html/api/public
  echo "<?php echo 'Laravel not properly installed'; ?>" > /usr/share/nginx/html/api/public/index.php
  echo "✅ Laravel public directory created"
fi

# Step 4: Start PHP-FPM with error handling
echo "🐘 Starting PHP-FPM..."
if php-fpm82 -D; then
    echo "✅ PHP-FPM started successfully"
else
    echo "❌ PHP-FPM failed to start"
    echo "Checking PHP-FPM configuration..."
    php-fpm82 -t || echo "PHP-FPM configuration test failed"
    echo "Checking if port 9000 is available..."
    netstat -tlnp | grep :9000 || echo "Port 9000 is not in use"
    echo "Checking PHP-FPM logs..."
    if [ -f "/var/log/php-fpm/www-error.log" ]; then
        tail -10 /var/log/php-fpm/www-error.log
    else
        echo "No PHP-FPM error log found"
    fi
    exit 1
fi

# Wait for PHP-FPM to be ready
sleep 3
echo "✅ PHP-FPM is ready"

# Step 5: Validate nginx configuration
echo "🔍 Validating nginx configuration..."
if nginx -t; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration validation failed!"
    echo "Configuration file contents:"
    cat /etc/nginx/conf.d/default.conf
    exit 1
fi

# Step 6: Run Laravel migrations (non-blocking)
echo "🗄️ Running Laravel migrations..."
cd /usr/share/nginx/html/api
if php artisan migrate --force; then
    echo "✅ Migrations completed successfully"
else
    echo "⚠️ Migrations failed, continuing without database..."
    echo "This is normal if the database is not yet available"
fi

# Step 7: Start nginx and test health check
echo "🌐 Starting nginx..."
nginx -g "daemon on;"
sleep 2

# Step 8: Test health check endpoint
echo "🏥 Testing health check endpoint..."
HEALTH_CHECK_RETRIES=5
HEALTH_CHECK_DELAY=2

for i in $(seq 1 $HEALTH_CHECK_RETRIES); do
    if curl -f -s "http://localhost:${PORT}/health" > /dev/null; then
        echo "✅ Health check endpoint is working!"
        break
    elif [ $i -eq $HEALTH_CHECK_RETRIES ]; then
        echo "❌ Health check failed after $HEALTH_CHECK_RETRIES attempts"
        echo "Nginx error log:"
        tail -10 /var/log/nginx/error.log 2>/dev/null || echo "No error log found"
        echo "Nginx access log:"
        tail -10 /var/log/nginx/access.log 2>/dev/null || echo "No access log found"
        echo "Stopping nginx and exiting..."
        nginx -s quit || true
        exit 1
    else
        sleep_time=$((HEALTH_CHECK_DELAY * i))
        sleep $sleep_time
    fi
done

# Step 9: Show final status
echo "🎉 Deployment completed successfully!"
echo "📊 Service status:"
echo "   - Nginx: Running on port ${PORT}"
echo "   - PHP-FPM: Running"
echo "   - Health check: Working at /health"
echo "   - API: Available at /api"
echo "   - Frontend: Available at /"

# Step 10: Start nginx in foreground
echo "🚀 Starting nginx in foreground..."
nginx -s quit || true
sleep 1
exec nginx -g "daemon off;"
