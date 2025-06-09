<?php
// Include CORS headers
require_once 'cors.php';

// Start a session
session_start();

// Create a dummy user for testing (NEVER do this in production!)
$_SESSION['user_id'] = 1;
$_SESSION['username'] = 'test_user';

// Return success response
echo json_encode([
    'success' => true,
    'message' => 'Dummy test user logged in',
    'user' => [
        'id' => $_SESSION['user_id'],
        'username' => $_SESSION['username']
    ],
    'session_id' => session_id()
]);
?> 