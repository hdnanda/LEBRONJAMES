FROM php:8.1-apache

# Install required extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Enable Apache modules
RUN a2enmod rewrite headers

# Install additional dependencies
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    && docker-php-ext-install zip

# Create web root directory and set ownership
RUN mkdir -p /var/www/html && \
    chown -R www-data:www-data /var/www/html

# Copy all backend files into the web root
COPY . /var/www/html/

# Set permissions (simplified version)
RUN chown -R www-data:www-data /var/www/html && \
    find /var/www/html -type d -exec chmod 755 {} \; && \
    find /var/www/html -type f -exec chmod 644 {} \;

# Enable .htaccess files
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Configure PHP
RUN echo "error_reporting = E_ALL" >> /usr/local/etc/php/conf.d/docker-php-ext-sodium.ini \
    && echo "display_errors = On" >> /usr/local/etc/php/conf.d/docker-php-ext-sodium.ini \
    && echo "log_errors = On" >> /usr/local/etc/php/conf.d/docker-php-ext-sodium.ini \
    && echo "error_log = /var/log/php_errors.log" >> /usr/local/etc/php/conf.d/docker-php-ext-sodium.ini

# Configure PHP session handling
RUN echo "session.save_handler = files" >> /usr/local/etc/php/conf.d/docker-php-ext-sodium.ini \
    && echo "session.save_path = \"/tmp\"" >> /usr/local/etc/php/conf.d/docker-php-ext-sodium.ini \
    && echo "session.cookie_secure = 1" >> /usr/local/etc/php/conf.d/docker-php-ext-sodium.ini \
    && echo "session.cookie_httponly = 1" >> /usr/local/etc/php/conf.d/docker-php-ext-sodium.ini \
    && echo "session.use_only_cookies = 1" >> /usr/local/etc/php/conf.d/docker-php-ext-sodium.ini

# Configure Apache for PHP
RUN echo "AddType application/x-httpd-php .php" >> /etc/apache2/apache2.conf \
    && echo "DirectoryIndex index.php index.html" >> /etc/apache2/apache2.conf

# Create custom Apache configuration
RUN echo '<VirtualHost *:80>\n\
    DocumentRoot /var/www/html\n\
    DirectoryIndex index.php\n\
    <Directory /var/www/html>\n\
        Options Indexes FollowSymLinks\n\
        AllowOverride All\n\
        Require all granted\n\
    </Directory>\n\
    <FilesMatch \.php$>\n\
        SetHandler application/x-httpd-php\n\
    </FilesMatch>\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

# Expose port 80
EXPOSE 80

# Start Apache in foreground
CMD ["apache2-foreground"]
