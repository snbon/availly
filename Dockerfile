# Simple single-stage Dockerfile for Railway (memory optimized)
FROM nginx:alpine

# Install PHP and required extensions in smaller chunks to avoid memory issues
RUN apk add --no-cache php82 php82-fpm php82-pdo php82-pdo_pgsql php82-pgsql
RUN apk add --no-cache php82-mbstring php82-exif php82-pcntl php82-bcmath
RUN apk add --no-cache php82-gd php82-zip php82-opcache php82-json
RUN apk add --no-cache php82-curl php82-xml php82-tokenizer php82-fileinfo php82-phar php82-openssl gettext

# Install Node.js for web app build
RUN apk add --no-cache nodejs npm

# Ensure PHP is in PATH and create symlink if needed
RUN ln -sf /usr/bin/php82 /usr/bin/php

# Set working directory
WORKDIR /usr/share/nginx/html

# Build web app
COPY apps/web/package*.json ./
RUN npm ci --prefer-offline
COPY apps/web/ ./
RUN npm run build

# Clean up Node.js files to save space
RUN rm -rf node_modules package*.json

# Copy API source code (Laravel backend)
COPY apps/api/ ./api/

# Install Composer and PHP dependencies
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN cd /usr/share/nginx/html/api && \
  php /usr/bin/composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Copy configurations
COPY docker/nginx-main.conf /etc/nginx/nginx.conf
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/php-fpm.conf /etc/php82/php-fpm.d/www.conf
COPY docker/php.ini /etc/php82/conf.d/custom.ini

# Copy entrypoint
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Create necessary directories and set permissions
RUN mkdir -p /var/log/php-fpm /var/log/nginx && \
  chown -R nginx:nginx /var/log/php-fpm /usr/share/nginx/html/api && \
  chown nginx:nginx /var/log/nginx && \
  chmod -R 755 /usr/share/nginx/html/api/storage /usr/share/nginx/html/api/bootstrap/cache

EXPOSE 80
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
