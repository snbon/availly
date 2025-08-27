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

## Files Modified

- `docker/entrypoint.sh` - Fixed nginx startup and added better error handling
- `docker/nginx.conf.template` - Added error logging and FastCGI timeouts
- `docker/nginx-main.conf` - Added basic nginx settings
- `Dockerfile` - Added Laravel public directory fallback and better permissions
- `docker/debug.sh` - Created debug script for troubleshooting
- `docker/test-deployment.sh` - Created test script for local validation

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
```

## Troubleshooting

### If nginx fails to start:
1. Check the container logs: `docker logs <container_id>`
2. Run the debug script: `docker exec <container_id> /usr/local/bin/debug.sh`
3. Verify the nginx configuration: `docker exec <container_id> nginx -t`

### If PHP-FPM fails:
1. Check PHP-FPM logs: `docker exec <container_id> tail -f /var/log/php-fpm/www-error.log`
2. Verify PHP-FPM is running: `docker exec <container_id> ps aux | grep php-fpm`

### Common Issues:
- **Port binding**: Ensure the PORT environment variable is set correctly
- **File permissions**: All directories should be owned by `nginx:nginx`
- **Laravel installation**: The API directory should contain a complete Laravel installation

## Environment Variables

- `PORT`: The port nginx should listen on (default: 8080)
- Any other environment variables will be available to your Laravel application

## Health Checks

The application includes a health check endpoint at `/health` that returns a simple "healthy" response. This is useful for load balancers and monitoring systems.
