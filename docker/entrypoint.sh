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
sleep 5

# Check if PHP-FPM is running
if pgrep php-fpm82 > /dev/null; then
    echo "PHP-FPM started successfully"
    echo "PHP-FPM processes: $(pgrep php-fpm82 | wc -l)"
else
    echo "Error: PHP-FPM failed to start"
    echo "Checking PHP-FPM logs..."
    if [ -f /var/log/php-fpm/www-error.log ]; then
        echo "PHP-FPM error log:"
        tail -20 /var/log/php-fpm/www-error.log
    fi
    exit 1
fi

# Test PHP-FPM connection
echo "Testing PHP-FPM connection..."
if nc -z 127.0.0.1 9000; then
    echo "PHP-FPM is listening on port 9000"
else
    echo "Error: PHP-FPM is not listening on port 9000"
    exit 1
fi

# Start nginx
echo "Starting nginx..."
exec "$@"
