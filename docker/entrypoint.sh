#!/bin/sh
set -e

echo "Starting deployment..."
PORT="${PORT:-8080}"

# Render nginx config
echo "Rendering nginx configuration for port ${PORT}..."
sed "s/PORT_REPLACE/${PORT}/g" /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Generate frontend env.js if needed
if [ -f /usr/share/nginx/html/env.template.js ]; then
  envsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js
fi

# Ensure Laravel public directory exists
if [ ! -d "/usr/share/nginx/html/api/public" ]; then
  echo "⚠️ Laravel public directory not found, creating it..."
  mkdir -p /usr/share/nginx/html/api/public
  echo "<?php echo 'Laravel not properly installed'; ?>" > /usr/share/nginx/html/api/public/index.php
fi

# Start PHP-FPM first
echo "Starting PHP-FPM..."
php-fpm82 -D
sleep 2

# Validate Nginx config before proceeding
echo "Validating nginx configuration..."
if ! nginx -t; then
    echo "❌ Nginx configuration validation failed!"
    echo "Configuration file:"
    cat /etc/nginx/conf.d/default.conf
    exit 1
fi
echo "✅ Nginx configuration is valid"

# Start nginx in background to test health check
echo "Starting nginx in background for health check test..."
nginx -g "daemon on;"
sleep 2

# Test health check endpoint
echo "Testing health check endpoint..."
if curl -f -s "http://localhost:${PORT}/health" > /dev/null; then
    echo "✅ Health check endpoint is working"
else
    echo "❌ Health check endpoint failed"
    echo "Nginx error log:"
    tail -10 /var/log/nginx/error.log || echo "No error log found"
    echo "Nginx access log:"
    tail -10 /var/log/nginx/access.log || echo "No access log found"
fi

# Try to run Laravel migrations (but don't fail if database is not available)
echo "Running Laravel migrations..."
cd /usr/share/nginx/html/api
if php artisan migrate --force; then
    echo "✅ Migrations completed successfully"
else
    echo "⚠️ Migrations failed, continuing without database..."
    echo "This is normal if the database is not yet available"
fi

# Stop background nginx and start in foreground
echo "Stopping background nginx and starting in foreground..."
nginx -s quit || true
sleep 1

echo "Starting nginx in foreground..."
exec nginx -g "daemon off;"
