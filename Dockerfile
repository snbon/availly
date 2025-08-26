# Build stage for web app
FROM node:18-alpine as web-build

WORKDIR /app/web

# Copy web app package files
COPY apps/web/package*.json ./

# Install dependencies
RUN npm ci --only=production

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
    postgresql-dev

# Install PHP extensions one by one to avoid memory issues
RUN docker-php-ext-install pdo_pgsql
RUN docker-php-ext-install pgsql
RUN docker-php-ext-install mbstring
RUN docker-php-ext-install exif
RUN docker-php-ext-install pcntl
RUN docker-php-ext-install bcmath
RUN docker-php-ext-install gd
RUN docker-php-ext-install zip

# Install Redis extension
RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy API composer files
COPY apps/api/composer.json apps/api/composer.lock ./

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Copy API application code
COPY apps/api/ ./

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Production stage
FROM nginx:alpine

# Install PHP-FPM
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
    php82-phar

# Copy built web app
COPY --from=web-build /app/web/dist /usr/share/nginx/html

# Copy API app
COPY --from=api-build /var/www/html /var/www/api

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Copy environment template
COPY apps/web/docker/env.template.js /usr/share/nginx/html/env.template.js
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create PHP-FPM configuration
RUN mkdir -p /etc/php82/php-fpm.d
COPY docker/php-fpm.conf /etc/php82/php-fpm.d/www.conf

# Create PHP configuration
COPY docker/php.ini /etc/php82/php.ini

# Expose port 80
EXPOSE 80

# Start nginx and PHP-FPM
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
