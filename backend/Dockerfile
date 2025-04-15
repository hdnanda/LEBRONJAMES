FROM php:8.1-apache

# Install MySQL extension
RUN docker-php-ext-install mysqli

# Enable Apache modules
RUN a2enmod rewrite headers

# Copy all backend files into the web root
COPY . /var/www/html/

# Set permissions
RUN chown -R www-data:www-data /var/www/html

# Configure Apache for CORS
RUN echo '\n\
<Directory /var/www/html>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
    \n\
    Header set Access-Control-Allow-Origin "https://hdnanda.github.io/LEBRONJAMES"\n\
    Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"\n\
    Header set Access-Control-Allow-Headers "Content-Type, X-CSRF-Token"\n\
    Header set Access-Control-Allow-Credentials "true"\n\
</Directory>' >> /etc/apache2/apache2.conf

# Expose port 80
EXPOSE 80 

# Start Apache in foreground
CMD ["apache2-foreground"]
