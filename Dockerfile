# Build stage for web app
FROM node:18-alpine as web-build

WORKDIR /app/web

# Copy web app package files
COPY apps/web/package*.json ./

# Install ALL dependencies (including dev dependencies needed for build)
RUN npm ci

# Copy web app source code
COPY apps/web/ ./

# Build the web application
RUN npm run build

# Build stage for API
FROM php:8.2-fpm-alpine as api-build

WORKDIR /var/www/html

# Install system dependencies in smaller batches
RUN apk add --no-cache \
  git \
  curl \
  libpng-dev \
  oniguruma-dev \
  libxml2-dev \
  zip \
  unzip \
  libzip-dev \
  postgresql-dev \
  autoconf \
  gcc \
  g++ \
  make \
  linux-headers

# Install PHP extensions with memory optimization
RUN docker-php-ext-configure pgsql --with-pgsql=/usr/local/pgsql
RUN docker-php-ext-install -j$(nproc) pdo_pgsql pgsql mbstring exif pcntl bcmath gd zip

# Install Redis extension with proper build dependencies
RUN pecl install redis && docker-php-ext-enable redis

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy API app source code (including composer.json, composer.lock, and artisan)
COPY apps/api/ ./

# Install API dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Final stage for production
FROM nginx:alpine as final

# Install PHP-FPM and required packages
RUN apk add --no-cache \
  php82 \
  php82-fpm \
  php82-pdo \
  php82-pdo_pgsql \
  php82-pgsql \
  php82-mbstring \
  php82-exif \
  php82-pcntl \
  php82-bcmath \
  php82-gd \
  php82-zip \
  php82-redis \
  php82-opcache \
  php82-json \
  php82-curl \
  php82-xml \
  php82-tokenizer \
  php82-fileinfo \
  php82-phar \
  gettext

# Copy web app build artifacts FIRST
COPY --from=web-build /app/web/dist /usr/share/nginx/html

# Copy environment template from web build
COPY --from=web-build /app/web/docker/env.template.js /usr/share/nginx/html/env.template.js

# Copy API app build artifacts
COPY --from=api-build /var/www/html /usr/share/nginx/html/api

# Copy Nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy PHP-FPM configuration
COPY docker/php-fpm.conf /etc/php82/php-fpm.d/www.conf

# Copy PHP configuration
COPY docker/php.ini /etc/php82/conf.d/custom.ini

# Copy entrypoint script
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Create a symbolic link for Laravel's public directory
RUN ln -s /usr/share/nginx/html/api/public /usr/share/nginx/html/public_api

# Create log directory for PHP-FPM
RUN mkdir -p /var/log/php-fpm && chown nginx:nginx /var/log/php-fpm

# Expose port 80
EXPOSE 80

# Start Nginx and PHP-FPM
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
