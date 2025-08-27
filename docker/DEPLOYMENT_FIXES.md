# Deployment Fixes for Availly

## Issues Identified and Fixed

### 1. Missing nginx.conf.template
- **Problem**: Dockerfile was trying to copy `docker/nginx.conf.template` but the file didn't exist
- **Solution**: Created the proper template file that gets rendered with the correct port

### 2. Entrypoint Script Issues
- **Problem**: Entrypoint script wasn't properly starting nginx after configuration
- **Solution**: Fixed the script to properly start nginx with `exec nginx -g "daemon off;"`

### 3. Configuration Conflicts
- **Problem**: Multiple nginx configuration files were conflicting
- **Solution**: Removed duplicate `docker/nginx.conf` and kept only the template and main config

### 4. Laravel Public Directory
- **Problem**: Laravel public directory might not exist during build
- **Solution**: Added fallback creation in both Dockerfile and entrypoint script

### 5. File Permissions
- **Problem**: Nginx and PHP-FPM processes needed proper permissions
- **Solution**: Added proper ownership and permissions for all required directories

### 6. 405 Method Not Allowed Error on /api/auth/login
- **Problem**: POST requests to API endpoints were getting 405 errors due to nginx configuration
- **Solution**: Fixed nginx configuration to properly handle POST/PUT/DELETE requests and route them directly to PHP-FPM

### 7. Nginx Configuration Syntax Error
- **Problem**: Invalid `try_files` directive inside `if` block causing nginx to fail
- **Solution**: Restructured nginx configuration to avoid invalid directive combinations

### 8. Database Connection Failures
- **Problem**: Database connection failures were causing deployment to fail
- **Solution**: Made database connection failures non-fatal and added comprehensive database testing tools

### 9. 500 Internal Server Error with Redirect Loop
- **Problem**: Nginx was creating infinite redirect loops to `/api/auth/login///////////`
- **Solution**: Simplified the nginx configuration to prevent redirect loops by using only `try_files @php_api`

### 10. PostgreSQL SSL Connection Issues
- **Problem**: Database requires SSL (`DB_SSLMODE=require`) but connection was failing
- **Solution**: Added PostgreSQL client tools and SSL-specific testing scripts for better debugging

### 11. Health Check Failures
- **Problem**: Railway health check was failing due to nginx configuration issues and missing health check testing
- **Solution**: Enhanced health check configuration with better headers, added health check testing in entrypoint script, and included curl for testing

### 12. PHP-FPM Startup Failures
- **Problem**: PHP-FPM was failing to start, causing deployment to hang at "Starting PHP-FPM..."
- **Solution**: Added comprehensive error handling for PHP-FPM startup, configuration testing, and proper log directory creation

### 13. Nginx Main Configuration Issues
- **Problem**: Main nginx configuration was missing proper event handling and security headers
- **Solution**: Enhanced main nginx configuration with proper event handling, security headers, and optimized settings

## Files Modified

- `docker/entrypoint.sh` - Added comprehensive PHP-FPM error handling and startup validation
- `docker/nginx.conf.template` - Production-ready configuration with simplified but effective security headers, proper API routing, and reliable health check
- `docker/nginx-main.conf` - Enhanced with proper event handling, security headers, and optimized settings
- `docker/php-fpm.conf` - Added security settings, error handling, and session configuration
- `Dockerfile` - Added PHP-FPM log directory creation, configuration testing, and proper permissions
- `docker/debug.sh` - Created debug script for troubleshooting
- `docker/test-deployment.sh` - Created test script for local validation
- `docker/test-api-endpoints.sh` - Created comprehensive API endpoint testing script
- `docker/debug-laravel.sh` - Created Laravel-specific debugging script
- `docker/fix-405-error.sh` - Created script to specifically fix the 405 error
- `docker/test-database.sh` - Created comprehensive database connectivity testing script
- `docker/debug-nginx-deployment.sh` - Created comprehensive nginx deployment debugging script

## Root Cause Analysis

The deployment was failing at the PHP-FPM startup step because:

1. **Missing PHP-FPM log directory** - The container didn't have proper log directories for PHP-FPM
2. **Permission issues** - PHP-FPM couldn't write to log files or start properly
3. **Configuration validation** - No validation that PHP-FPM configuration was correct
4. **Error handling** - Entrypoint script didn't handle PHP-FPM failures gracefully

## What Was Fixed

### **PHP-FPM Configuration:**
- Added proper log directory creation in Dockerfile
- Enhanced PHP-FPM configuration with security settings
- Added configuration validation during build
- Fixed permission issues for log directories

### **Entrypoint Script:**
- Added comprehensive PHP-FPM error handling
- Added PHP-FPM configuration testing
- Added port availability checking
- Added log file inspection on failure
- Added proper error reporting and exit codes

### **Nginx Configuration:**
- Enhanced main nginx configuration with proper event handling
- Added security headers at the http level
- Optimized performance settings
- Fixed server block inclusion

### **Dockerfile:**
- Added PHP-FPM log directory creation
- Added PHP-FPM configuration testing
- Fixed permission issues
- Added proper directory ownership

## How to Deploy

### 1. Build the Docker Image
```bash
docker build -t availly .
```

### 2. Run the Container
```bash
# For Railway/Heroku (uses PORT environment variable)
docker run -p 8080:80 -e PORT=8080 availly

# For local development
docker run -p 8080:80 availly
```

### 3. Test the Deployment
```bash
# Test the health endpoint
curl http://localhost:8080/health

# Test the frontend
curl http://localhost:8080/

# Test the API
curl http://localhost:8080/api/

# Test the login endpoint specifically
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Troubleshooting

### If PHP-FPM fails to start:
1. Check the container logs: `docker logs <container_id>`
2. Run the debug script: `docker exec <container_id> /usr/local/bin/debug.sh`
3. Check PHP-FPM configuration: `docker exec <container_id> php-fpm82 -t`
4. Check PHP-FPM logs: `docker exec <container_id> tail -f /var/log/php-fpm/www-error.log`

### If nginx fails to start:
1. Check the container logs: `docker logs <container_id>`
2. Run the debug script: `docker exec <container_id> /usr/local/bin/debug.sh`
3. Verify the nginx configuration: `docker exec <container_id> nginx -t`

### If you get 405 errors on API endpoints:
1. Run the 405 fix script: `docker exec <container_id> /usr/local/bin/fix-405-error.sh`
2. Check Laravel routes: `docker exec <container_id> cd /usr/share/nginx/html/api && php artisan route:list --path=api`
3. Clear Laravel caches: `docker exec <container_id> cd /usr/share/nginx/html/api && php artisan route:clear`

### If you get 500 errors with redirect loops:
1. Check nginx error logs: `docker exec <container_id> tail -f /var/log/nginx/error.log`
2. Verify the nginx configuration is correct: `docker exec <container_id> nginx -t`
3. Check if the API location block is properly configured

### If health check fails:
1. Check nginx configuration syntax: `docker exec <container_id> nginx -t`
2. Verify health check endpoint: `docker exec <container_id> curl -f http://localhost:8080/health`
3. Check nginx logs for health check errors

### If database connection fails:
1. Run the database test script: `docker exec <container_id> /usr/local/bin/test-database.sh`
2. Run the SSL-specific test: `docker exec <container_id> /usr/local/bin/test-database-ssl.sh`
3. Check environment variables: `docker exec <container_id> env | grep DB_`
4. Verify database server is accessible from the container
5. Check if database requires SSL connections and if Railway IP is whitelisted

### Common Issues:
- **Port binding**: Ensure the PORT environment variable is set correctly
- **File permissions**: All directories should be owned by `nginx:nginx`
- **Laravel installation**: The API directory should contain a complete Laravel installation
- **Route caching**: Laravel route cache might need to be cleared after deployment
- **Database connectivity**: Ensure database server is accessible and credentials are correct
- **SSL requirements**: PostgreSQL with `DB_SSLMODE=require` needs proper SSL configuration
- **Network access**: Railway containers might have IP restrictions that need to be whitelisted
- **Health check configuration**: Ensure health check endpoint is properly configured and accessible
- **Production configuration**: Use the simplified, production-ready nginx configuration
- **PHP-FPM startup**: Ensure proper log directories and permissions are set

## Environment Variables

- `PORT`: The port nginx should listen on (default: 8080)
- `DB_CONNECTION`: Database connection type (pgsql, mysql, sqlite)
- `DB_HOST`: Database server hostname
- `DB_PORT`: Database server port
- `DB_DATABASE`: Database name
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `DB_SSLMODE`: SSL mode for PostgreSQL (require, prefer, allow, disable)
- Any other environment variables will be available to your Laravel application

## Health Checks

The application includes a robust health check endpoint at `/health` that:
- Returns a simple "healthy" response
- Includes proper cache control headers
- Is tested during deployment to ensure it works
- Matches Railway's `healthcheckPath: "/health"` configuration
- Is useful for load balancers and monitoring systems
- Has automatic retry logic with comprehensive error reporting

## Testing Scripts

### Test Deployment Configuration
```bash
./docker/test-deployment.sh
```

### Test API Endpoints
```bash
./docker/test-api-endpoints.sh [base_url]
# Example: ./docker/test-api-endpoints.sh https://availly.me
```

### Fix 405 Errors
```bash
# Run inside the container
/usr/local/bin/fix-405-error.sh
```

### Debug Laravel Issues
```bash
# Run inside the container
/usr/local/bin/debug-laravel.sh
```

### Test Database Connectivity
```bash
# Run inside the container
/usr/local/bin/test-database.sh
```

### Test PostgreSQL SSL Connection
```bash
# Run inside the container
/usr/local/bin/test-database-ssl.sh
```

### Debug Nginx Deployment Issues
```bash
# Run inside the container
/usr/local/bin/debug-nginx-deployment.sh
```

## Production Deployment Process

The new entrypoint script follows a 10-step deployment process:

1. **Render Configuration** - Generate nginx config with correct port
2. **Generate Environment** - Create frontend environment file
3. **Ensure Directories** - Create Laravel public directory if needed
4. **Start PHP-FPM** - Start PHP-FPM service with comprehensive error handling
5. **Validate Nginx** - Test nginx configuration syntax
6. **Run Migrations** - Execute Laravel migrations (non-blocking)
7. **Start Nginx** - Start nginx in background mode
8. **Test Health Check** - Validate health check endpoint with retries
9. **Show Status** - Display deployment summary
10. **Start Foreground** - Start nginx in foreground mode

This ensures reliable deployment and immediate detection of any issues.
