# ---------- Base Image ----------
FROM nginx:alpine

# Install PHP 8.2 and extensions
RUN apk add --no-cache \
  php82 php82-fpm php82-pdo php82-pdo_pgsql php82-pgsql \
  php82-mbstring php82-exif php82-pcntl php82-bcmath \
  php82-gd php82-zip php82-opcache php82-json \
  php82-curl php82-xml php82-tokenizer php82-fileinfo \
  php82-phar php82-openssl php82-session php82-dom \
  php82-iconv php82-simplexml php82-xmlreader php82-xmlwriter \
  php82-intl php82-ctype gettext nodejs npm netcat-openbsd postgresql-client curl

# Symlink php82 -> php
RUN ln -sf /usr/bin/php82 /usr/bin/php

# ---------- Frontend Build ----------
WORKDIR /usr/share/nginx/html
COPY apps/web/package*.json ./web/
WORKDIR /usr/share/nginx/html/web
RUN npm ci --prefer-offline
COPY apps/web/ .
RUN npm run build
RUN cp -r dist/* /usr/share/nginx/html/ && rm -rf dist node_modules package*.json

# ---------- Backend (Laravel) ----------
WORKDIR /usr/share/nginx/html
COPY apps/api /usr/share/nginx/html/api
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /usr/share/nginx/html/api
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Create storage & cache directories
RUN mkdir -p \
  storage/app \
  storage/framework/cache \
  storage/framework/sessions \
  storage/framework/views \
  storage/logs \
  bootstrap/cache && \
  chown -R nginx:nginx /usr/share/nginx/html/api && \
  chmod -R 775 storage bootstrap/cache

# Ensure Laravel public directory exists and has proper permissions
RUN if [ ! -d "public" ]; then \
  echo "Creating Laravel public directory..."; \
  mkdir -p public; \
  echo "<?php echo 'Laravel not properly installed'; ?>" > public/index.php; \
  fi && \
  chown -R nginx:nginx public && \
  chmod -R 755 public

# ---------- Nginx & PHP-FPM Config ----------
WORKDIR /usr/share/nginx/html
COPY docker/nginx-main.conf /etc/nginx/nginx.conf
COPY docker/nginx.conf.template /etc/nginx/conf.d/default.conf.template
# Remove default PHP-FPM config and use our custom one
RUN rm -f /etc/php82/php-fpm.d/www.conf
COPY docker/php-fpm.conf /etc/php82/php-fpm.d/www.conf

# Copy main PHP-FPM configuration
COPY docker/php-fpm-main.conf /etc/php82/php-fpm.conf
COPY docker/php.ini /etc/php82/conf.d/custom.ini
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# ---------- Logs & Permissions ----------
RUN mkdir -p /var/log/php-fpm /var/log/nginx && \
  chown -R nginx:nginx /var/log/php-fpm /var/log/nginx && \
  chmod -R 755 /var/log/php-fpm /var/log/nginx

# Ensure nginx can write to its directories
RUN mkdir -p /var/cache/nginx /var/run && \
  chown -R nginx:nginx /var/cache/nginx /var/run

# Create PHP-FPM log directory
RUN mkdir -p /var/log/php-fpm && \
  chown -R nginx:nginx /var/log/php-fpm && \
  chmod -R 755 /var/log/php-fpm

EXPOSE 80
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
