#!/bin/sh
set -e

echo "🔐 Testing PostgreSQL SSL Connection..."
echo "======================================"

cd /usr/share/nginx/html/api

echo "📁 Laravel directory: $(pwd)"
echo "🔧 Laravel version: $(php artisan --version)"

echo -e "\n📊 Checking database environment variables..."
echo "DB_CONNECTION: $(php artisan tinker --execute='echo config("database.default");')"
echo "DB_HOST: $(php artisan tinker --execute='echo config("database.connections.pgsql.host");')"
echo "DB_PORT: $(php artisan tinker --execute='echo config("database.connections.pgsql.port");')"
echo "DB_DATABASE: $(php artisan tinker --execute='echo config("database.connections.pgsql.database");')"
echo "DB_USERNAME: $(php artisan tinker --execute='echo config("database.connections.pgsql.username");')"
echo "DB_SSLMODE: $(php artisan tinker --execute='echo config("database.connections.pgsql.sslmode");')"

echo -e "\n🔌 Testing database connection with SSL..."
if php artisan tinker --execute='try { $connection = DB::connection(); $pdo = $connection->getPdo(); echo "✅ Database connection successful"; echo "SSL Mode: " . $pdo->getAttribute(PDO::ATTR_DRIVER_NAME); } catch (Exception $e) { echo "❌ Database connection failed: " . $e->getMessage(); }'; then
    echo "✅ Database is accessible with SSL"
else
    echo "❌ Database connection failed"
fi

echo -e "\n🌐 Testing network connectivity to database..."
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

echo -e "\n🔐 Testing PostgreSQL SSL connection directly..."
if command -v psql >/dev/null 2>&1; then
    echo "Testing direct PostgreSQL connection with SSL..."
    PGPASSWORD="$(php artisan tinker --execute='echo config("database.connections.pgsql.password");')" psql \
        -h "$(php artisan tinker --execute='echo config("database.connections.pgsql.host");')" \
        -p "$(php artisan tinker --execute='echo config("database.connections.pgsql.port");')" \
        -U "$(php artisan tinker --execute='echo config("database.connections.pgsql.username");')" \
        -d "$(php artisan tinker --execute='echo config("database.connections.pgsql.database");')" \
        -c "SELECT version();" \
        --set=sslmode=require 2>&1 || echo "Direct psql connection failed"
else
    echo "⚠️ psql not available, skipping direct PostgreSQL test"
fi

echo -e "\n📝 Checking Laravel logs for database errors..."
if [ -f "storage/logs/laravel.log" ]; then
    echo "Recent database-related log entries:"
    grep -i "database\|pgsql\|connection\|ssl" storage/logs/laravel.log | tail -10 || echo "No database-related log entries found"
else
    echo "No Laravel log file found"
fi

echo -e "\n💡 PostgreSQL SSL Issues and Solutions:"
echo "1. SSL Mode: Your database requires SSL (DB_SSLMODE=require)"
echo "2. Network: Database host might not be accessible from Railway container"
echo "3. Credentials: Check username/password combination"
echo "4. Database: Ensure 'postgres' database exists"
echo "5. Firewall: Supabase might block connections from Railway IPs"

echo -e "\n🔧 Troubleshooting Steps:"
echo "1. Verify database server is running and accessible"
echo "2. Check if Railway IP is whitelisted in Supabase"
echo "3. Test connection from a different location"
echo "4. Check Supabase connection logs"
echo "5. Verify database credentials and permissions"

echo -e "\n📋 Environment Variables to Check:"
echo "- DB_CONNECTION=pgsql"
echo "- DB_HOST=db.xexdphhqptoknflxhibs.supabase.co"
echo "- DB_PORT=5432"
echo "- DB_DATABASE=postgres"
echo "- DB_USERNAME=postgres"
echo "- DB_PASSWORD=<your-password>"
echo "- DB_SSLMODE=require"

echo -e "\n🌐 Railway-Specific Issues:"
echo "1. Railway containers might have different IP ranges"
echo "2. Supabase might need to whitelist Railway IPs"
echo "3. Check if database allows external connections"
echo "4. Verify SSL certificate requirements"
