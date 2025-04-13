# Financial Literacy App - Backend Setup

This directory contains the backend files for the Financial Literacy App.

## Database Setup

To set up the database, follow these steps:

1. Make sure you have MySQL installed and running on your system.
2. Configure the database connection in `config.php` if needed (default settings are for a local MySQL server).
3. Run the database setup script:

```bash
php setup_database.php
```

This will:
- Create the `financial_literacy_db` database if it doesn't exist
- Create all necessary tables (users, login_logs, password_resets, activity_logs)
- Insert a test user with the following credentials:
  - Username: `test_user`
  - Password: `Test@123`

## Login System

The login system is secure and includes:
- Password hashing using PHP's `password_hash()` function
- CSRF protection
- Brute force protection (limits login attempts)
- Session management
- Activity logging

## API Endpoints

- `login.php`: Handles user login
- `signup.php`: Handles user registration
- `get_csrf_token.php`: Generates CSRF tokens for form submission

## Security Features

- Input sanitization
- Prepared statements to prevent SQL injection
- Password hashing
- CSRF protection
- Session security
- Activity logging
- Brute force protection 