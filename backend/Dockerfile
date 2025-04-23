FROM php:8.1-apache

# Install MySQL extension
RUN docker-php-ext-install mysqli

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
RUN echo "Header set Access-Control-Allow-Origin 'https://financial-frontend-3xkp.onrender.com'"> /etc/apache2/conf-available/security-headers.conf \
    && echo "Header set Access-Control-Allow-Methods 'GET, POST, OPTIONS'" >> /etc/apache2/conf-available/security-headers.conf \
    && echo "Header set Access-Control-Allow-Headers 'Content-Type, X-CSRF-Token, Authorization, Origin'" >> /etc/apache2/conf-available/security-headers.conf \
    && echo "Header set Access-Control-Allow-Credentials 'true'" >> /etc/apache2/conf-available/security-headers.conf \
    && echo "Header set X-Content-Type-Options 'nosniff'" >> /etc/apache2/conf-available/security-headers.conf \
    && echo "Header set X-Frame-Options 'DENY'" >> /etc/apache2/conf-available/security-headers.conf \
    && echo "Header set X-XSS-Protection '1; mode=block'" >> /etc/apache2/conf-available/security-headers.conf \
    && a2enconf security-headers

# Expose port 80
EXPOSE 80

# Start Apache in foreground
CMD ["apache2-foreground"]
