#!/bin/sh
set -e

echo "Starting deployment..."

# Inject frontend env
if [ -f /usr/share/nginx/html/env.template.js ]; then
  envsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js
fi

# Render nginx config
if [ -f /etc/nginx/conf.d/default.conf.template ]; then
  envsubst '$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
fi

# Start PHP-FPM
php-fpm82 -D
sleep 2

# Start Nginx
exec "$@"
