#!/bin/sh
set -e

echo "=== Debug Information ==="
echo "Current directory: $(pwd)"
echo "PORT: ${PORT:-8080}"
echo "User: $(whoami)"
echo "Nginx version: $(nginx -v 2>&1)"
echo "PHP version: $(php -v | head -1)"

echo -e "\n=== File Permissions ==="
ls -la /etc/nginx/
ls -la /etc/nginx/conf.d/
ls -la /var/log/nginx/

echo -e "\n=== Nginx Configuration ==="
cat /etc/nginx/nginx.conf
echo -e "\n--- Server Config ---"
cat /etc/nginx/conf.d/default.conf

echo -e "\n=== PHP-FPM Status ==="
ps aux | grep php-fpm || echo "PHP-FPM not running"

echo -e "\n=== Nginx Status ==="
ps aux | grep nginx || echo "Nginx not running"

echo -e "\n=== Port Binding ==="
netstat -tlnp | grep :${PORT:-8080} || echo "No process bound to port ${PORT:-8080}"

echo -e "\n=== Directory Contents ==="
ls -la /usr/share/nginx/html/
ls -la /usr/share/nginx/html/api/public/ || echo "API public directory not found"
