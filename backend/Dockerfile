FROM php:8.1-apache

# Install required extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Enable Apache modules
RUN a2enmod rewrite headers

# Copy all backend files into the web root
COPY . /var/www/html/

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Enable .htaccess files
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Configure PHP
RUN echo "error_reporting = E_ALL" >> /usr/local/etc/php/conf.d/docker-php-ext-sodium.ini \
    && echo "display_errors = On" >> /usr/local/etc/php/conf.d/docker-php-ext-sodium.ini \
    && echo "log_errors = On" >> /usr/local/etc/php/conf.d/docker-php-ext-sodium.ini \
    && echo "error_log = /var/log/php_errors.log" >> /usr/local/etc/php/conf.d/docker-php-ext-sodium.ini

# Expose port 80
EXPOSE 80

# Start Apache in foreground
CMD ["apache2-foreground"]
