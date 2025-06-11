<?php
// --- FILENAME: backend/bootstrap.php ---
// This is the single entry point for all API scripts.
// It handles error reporting, output buffering, sessions, and all includes.

// 1. Capture all output to prevent unexpected errors from breaking JSON.
ob_start();

// 2. Set up strict error reporting.
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// 3. Start the session.
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 4. Handle CORS headers.
require_once __DIR__ . '/cors.php';

// 5. Load application configuration and functions.
try {
    require_once __DIR__ . '/config.php';
    require_once __DIR__ . '/functions.php';
} catch (Exception $e) {
    // If config or functions fail, we must stop and report it.
    $output = ob_get_clean();
    header("Content-Type: application/json; charset=UTF-8");
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Critical file inclusion failed.',
        'error_message' => $e->getMessage(),
        'unexpected_output' => $output
    ]);
    exit();
} 