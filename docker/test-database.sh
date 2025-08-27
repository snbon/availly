#!/bin/sh
set -e

echo "🗄️ Testing Database Connectivity..."
echo "=================================="

cd /usr/share/nginx/html/api

echo "📁 Laravel directory: $(pwd)"
echo "🔧 Laravel version: $(php artisan --version)"

echo -e "\n📊 Checking environment variables..."
echo "APP_ENV: $(php artisan tinker --execute='echo config("app.env");')"
echo "APP_DEBUG: $(php artisan tinker --execute='echo config("app.debug");')"
echo "DB_CONNECTION: $(php artisan tinker --execute='echo config("database.default");')"
echo "DB_HOST: $(php artisan tinker --execute='echo config("database.connections.pgsql.host");')"
echo "DB_PORT: $(php artisan tinker --execute='echo config("database.connections.pgsql.port");')"
echo "DB_DATABASE: $(php artisan tinker --execute='echo config("database.connections.pgsql.database");')"

echo -e "\n🔌 Testing database connection..."
if php artisan tinker --execute='try { DB::connection()->getPdo(); echo "✅ Database connection successful"; } catch (Exception $e) { echo "❌ Database connection failed: " . $e->getMessage(); }'; then
    echo "✅ Database is accessible"
else
    echo "❌ Database connection failed"
fi

echo -e "\n🌐 Testing network connectivity..."
DB_HOST=$(php artisan tinker --execute='echo config("database.connections.pgsql.host");')
DB_PORT=$(php artisan tinker --execute='echo config("database.connections.pgsql.port");')

echo "Testing connection to ${DB_HOST}:${DB_PORT}..."

# Test if we can reach the database host
if command -v nc >/dev/null 2>&1; then
    if nc -z -w5 "${DB_HOST}" "${DB_PORT}" 2>/dev/null; then
        echo "✅ Network connection to ${DB_HOST}:${DB_PORT} successful"
    else
        echo "❌ Network connection to ${DB_HOST}:${DB_PORT} failed"
    fi
else
    echo "⚠️ netcat not available, skipping network test"
fi

echo -e "\n📝 Checking Laravel logs for database errors..."
if [ -f "storage/logs/laravel.log" ]; then
    echo "Recent database-related log entries:"
    grep -i "database\|pgsql\|connection" storage/logs/laravel.log | tail -10 || echo "No database-related log entries found"
else
    echo "No Laravel log file found"
fi

echo -e "\n💡 Common Database Issues:"
echo "1. Database host is not accessible from the container"
echo "2. Database credentials are incorrect"
echo "3. Database server is not running"
echo "4. Firewall blocking the connection"
echo "5. Database server is not configured to accept connections from this IP"

echo -e "\n🔧 Troubleshooting Steps:"
echo "1. Verify database server is running and accessible"
echo "2. Check database credentials in environment variables"
echo "3. Ensure database server accepts connections from the container IP"
echo "4. Check if database server requires SSL connections"
echo "5. Verify the database exists and is accessible"

echo -e "\n📋 Environment Variables to Check:"
echo "- DB_CONNECTION=pgsql"
echo "- DB_HOST=<your-db-host>"
echo "- DB_PORT=5432"
echo "- DB_DATABASE=<your-db-name>"
echo "- DB_USERNAME=<your-db-user>"
echo "- DB_PASSWORD=<your-db-password>"
