#!/bin/sh
set -e

echo "Starting deployment..."
PORT="${PORT:-8080}"
echo "Using PORT=$PORT"

# render nginx
sed "s/PORT_REPLACE/${PORT}/g" /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
echo "Rendered /etc/nginx/conf.d/default.conf:"
sed -n '1,120p' /etc/nginx/conf.d/default.conf

# start PHP-FPM
php-fpm82 -D
sleep 1

# validate nginx, then start
nginx -t
exec "$@"
