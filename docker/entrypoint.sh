#!/bin/sh
set -e

echo "Starting deployment..."
PORT="${PORT:-8080}"

# Render nginx config
sed "s/PORT_REPLACE/${PORT}/g" /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Generate frontend env.js if needed
if [ -f /usr/share/nginx/html/env.template.js ]; then
  envsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js
fi

# Run Laravel migrations
echo "Running Laravel migrations..."
cd /usr/share/nginx/html/api
php artisan migrate --force || echo "⚠️ Migrations failed, continuing..."

# Start PHP-FPM
php-fpm82 -D
sleep 1

# Validate Nginx config and start
nginx -t
exec "$@"
