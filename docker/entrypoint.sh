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

# Run Laravel migrations
echo "Running Laravel migrations..."
cd /usr/share/nginx/html/api
php artisan migrate --force || echo "⚠️ Migrations failed, continuing..."

# Start PHP-FPM
echo "Starting PHP-FPM..."
php-fpm82 -D
sleep 2

# Validate Nginx config and start
echo "Validating nginx configuration..."
nginx -t

echo "Starting nginx..."
exec nginx -g "daemon off;"
