#!/bin/sh
set -e

echo "Starting Availly deployment..."

# Replace environment variables in the template
if [ -f /usr/share/nginx/html/env.template.js ]; then
    echo "Processing environment variables..."
    envsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js
    echo "Environment variables processed successfully"
else
    echo "Warning: env.template.js not found, skipping environment variable processing"
fi

# Start PHP-FPM in background
echo "Starting PHP-FPM..."
php-fpm82 -D

# Wait a moment for PHP-FPM to start
sleep 3

# Check if PHP-FPM is running
if pgrep php-fpm82 > /dev/null; then
    echo "PHP-FPM started successfully"
else
    echo "Error: PHP-FPM failed to start"
    exit 1
fi

# Start nginx
echo "Starting nginx..."
exec "$@"
