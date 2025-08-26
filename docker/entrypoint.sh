#!/bin/sh
set -e

echo "Starting deployment..."

# Default PORT if not set
PORT="${PORT:-8080}"

# Render nginx config
sed "s/PORT_REPLACE/${PORT}/g" /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Inject frontend env if exists
if [ -f /usr/share/nginx/html/env.template.js ]; then
  envsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js
fi

# Start PHP-FPM
php-fpm82 -D
sleep 2

# Start Nginx
exec "$@"
