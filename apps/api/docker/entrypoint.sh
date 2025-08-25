#!/bin/bash
set -e

# Wait for database to be ready
echo "Waiting for database..."
while ! php artisan migrate:status > /dev/null 2>&1; do
    echo "Database not ready, waiting..."
    sleep 2
done

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Clear and cache config for production
echo "Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Create storage link if it doesn't exist
if [ ! -L /var/www/html/public/storage ]; then
    php artisan storage:link
fi

# Start the main process
exec "$@"
