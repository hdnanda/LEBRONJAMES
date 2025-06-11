<?php
// --- FILENAME: backend/bootstrap.php ---

// 1. Set up strict error reporting for debugging.
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// 2. Start the session. This MUST come before any output.
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 3. Handle CORS headers.
require_once __DIR__ . '/cors.php';

// 4. Load application configuration (database credentials, etc.).
require_once __DIR__ . '/config.php';

// 5. Load common functions.
require_once __DIR__ . '/functions.php'; 