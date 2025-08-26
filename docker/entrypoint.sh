#!/bin/sh
set -e

# Replace environment variables in the template
envsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js

# Start PHP-FPM in background
php-fpm82 -D

# Wait a moment for PHP-FPM to start
sleep 2

# Start nginx
exec "$@"
