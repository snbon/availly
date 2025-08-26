# Simple single-stage Dockerfile for Railway (memory optimized)
FROM nginx:alpine

# Install PHP, Node.js, Composer, and netcat
RUN apk add --no-cache \
  php82 php82-fpm php82-pdo php82-pdo_pgsql php82-pgsql \
  php82-mbstring php82-exif php82-pcntl php82-bcmath \
  php82-gd php82-zip php82-opcache php82-json \
  php82-curl php82-xml php82-tokenizer php82-fileinfo php82-phar \
  php82-openssl php82-session php82-dom php82-iconv php82-simplexml \
  php82-xmlreader php82-xmlwriter php82-intl php82-ctype gettext \
  busybox-extras nodejs npm

RUN ln -sf /usr/bin/php82 /usr/bin/php

# Set working directory
WORKDIR /usr/share/nginx/html

# Build frontend
COPY apps/web/package*.json ./
RUN npm ci --prefer-offline
COPY apps/web/ ./
RUN npm run build
RUN cp -r dist/* /usr/share/nginx/html/ && rm -rf dist node_modules package*.json

# Copy backend
COPY apps/api/ ./api/
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /usr/share/nginx/html/api
RUN php /usr/bin/composer install --no-dev --optimize-autoloader --no-interaction --no-scripts
WORKDIR /usr/share/nginx/html

# Copy configs
COPY docker/nginx-main.conf /etc/nginx/nginx.conf
COPY docker/nginx.conf.template /etc/nginx/conf.d/default.conf.template
COPY docker/php-fpm.conf /etc/php82/php-fpm.d/www.conf
COPY docker/php.ini /etc/php82/conf.d/custom.ini
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Fix Laravel storage & permissions
RUN mkdir -p \
  /usr/share/nginx/html/api/storage/app \
  /usr/share/nginx/html/api/storage/framework/cache \
  /usr/share/nginx/html/api/storage/framework/sessions \
  /usr/share/nginx/html/api/storage/framework/views \
  /usr/share/nginx/html/api/storage/logs \
  /usr/share/nginx/html/api/bootstrap/cache && \
  chown -R nginx:nginx /usr/share/nginx/html/api && \
  chmod -R 775 /usr/share/nginx/html/api/storage /usr/share/nginx/html/api/bootstrap/cache


EXPOSE 80
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
