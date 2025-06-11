<?php
// --- FILENAME: backend/signup.php ---
// This is a temporary, self-contained script for isolation testing.
// It has ZERO dependencies.

// Set headers to ensure a clean JSON response.
header("Access-Control-Allow-Origin: *"); // Allow all origins for this test
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Just return a simple, valid JSON object.
http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'This is a successful JSON response from the test script.',
    'test_id' => 12345
]);
exit();
