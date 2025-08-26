# Ultra-optimized multi-stage build for Railway memory constraints

# Stage 1: Web app build (minimal)
FROM node:18-alpine as web-build
WORKDIR /app/web
COPY apps/web/package*.json ./
RUN npm ci --only=production --prefer-offline
COPY apps/web/ ./
RUN npm run build

# Stage 2: PHP extensions build (minimal dependencies only)
FROM php:8.2-fpm-alpine as php-extensions
RUN apk add --no-cache \
  postgresql-dev \
  libpng-dev \
  oniguruma-dev \
  libxml2-dev \
  libzip-dev
RUN docker-php-ext-install pdo_pgsql pgsql mbstring exif pcntl bcmath gd zip

# Stage 3: Composer dependencies (with memory optimization)
FROM composer:latest as composer
WORKDIR /app
# Copy only composer files first
COPY apps/api/composer.json apps/api/composer.lock ./
# Install with aggressive memory optimization
RUN composer install \
  --no-dev \
  --optimize-autoloader \
  --no-interaction \
  --no-scripts \
  --prefer-dist \
  --no-progress \
  --no-ansi \
  --memory-limit=-1

# Stage 4: Final production image (ultra-lightweight)
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Install only runtime PHP packages (no build tools)
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
  php82-opcache \
  php82-json \
  php82-curl \
  php82-xml \
  php82-tokenizer \
  php82-fileinfo \
  php82-phar \
  gettext

# Use existing nginx user instead of creating www-data
# The nginx:alpine image already has the nginx user

# Copy built web app
COPY --from=web-build /app/web/dist ./

# Copy environment template
COPY apps/web/docker/env.template.js ./env.template.js

# Copy PHP extensions from build stage
COPY --from=php-extensions /usr/local/lib/php/extensions/ /usr/local/lib/php/extensions/

# Copy Composer dependencies (pre-installed)
COPY --from=composer /app/vendor/ ./api/vendor/

# Copy API source code (without vendor)
COPY apps/api/ ./api/

# Copy configurations
COPY docker/nginx-main.conf /etc/nginx/nginx.conf
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/php-fpm.conf /etc/php82/php-fpm.d/www.conf
COPY docker/php.ini /etc/php82/conf.d/custom.ini

# Copy entrypoint
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Create symlinks and directories (using nginx user)
RUN ln -s /usr/share/nginx/html/api/public /usr/share/nginx/html/public_api && \
  mkdir -p /var/log/php-fpm /var/log/nginx && \
  chown -R nginx:nginx /var/log/php-fpm /usr/share/nginx/html/api && \
  chown nginx:nginx /var/log/nginx && \
  chmod -R 755 /usr/share/nginx/html/api/storage /usr/share/nginx/html/api/bootstrap/cache

EXPOSE 80
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
