# Use Linux with PHP 8.3-fpm
FROM php:8.3-fpm

# Install OS dependencies (Nginx, Supervisor, and database extensions)
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libpq-dev \
    nodejs \
    npm

# Install PHP extensions for Postgres database
RUN docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy project files into Docker
COPY . .

# Install PHP packages
RUN composer install --optimize-autoloader --no-dev

# Install React packages and build frontend files
RUN npm install

# Inject Vite variables to prevent Pusher crash
RUN echo "VITE_REVERB_APP_KEY=my-reverb-key" > .env
RUN echo "VITE_REVERB_HOST=supportflow-ai-vfqy.onrender.com" >> .env
RUN echo "VITE_REVERB_PORT=443" >> .env
RUN echo "VITE_REVERB_SCHEME=https" >> .env

RUN npm run build

# Copy Nginx and Supervisor configs
COPY docker/nginx.conf /etc/nginx/sites-available/default
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Set file permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Expose port 80 for the outside world
EXPOSE 80

# Final execution command when server starts
CMD sh -c "php artisan migrate:force && php artisan db:seed --force && /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf"