FROM php:8.1-apache

# Install required system libraries for PostgreSQL
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install both MySQL and PostgreSQL extensions for PDO
RUN docker-php-ext-install mysqli pdo pdo_mysql pdo_pgsql

# Enable Apache modules
RUN a2enmod rewrite headers

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . /var/www/html/

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Enable .htaccess files
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Add security headers
RUN echo "Header set Access-Control-Allow-Origin '*'"> /etc/apache2/conf-available/security-headers.conf \
    && echo "Header set Access-Control-Allow-Methods 'GET, POST, OPTIONS'" >> /etc/apache2/conf-available/security-headers.conf \
    && echo "Header set Access-Control-Allow-Headers 'Content-Type, X-CSRF-Token'" >> /etc/apache2/conf-available/security-headers.conf \
    && echo "Header set X-Content-Type-Options 'nosniff'" >> /etc/apache2/conf-available/security-headers.conf \
    && echo "Header set X-Frame-Options 'DENY'" >> /etc/apache2/conf-available/security-headers.conf \
    && echo "Header set X-XSS-Protection '1; mode=block'" >> /etc/apache2/conf-available/security-headers.conf \
    && a2enconf security-headers

# Expose port 80
EXPOSE 80

# Start Apache in foreground
CMD ["apache2-foreground"]
