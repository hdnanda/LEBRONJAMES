<?php
session_start();
header('Content-Type: application/json');

// For debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo json_encode([
    'session_status' => session_status(),
    'session_id' => session_id(),
    'user_id' => isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null,
    'session_data' => $_SESSION,
    'request_path' => $_SERVER['REQUEST_URI'],
    'script_path' => __FILE__
]);
?> 