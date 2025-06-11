<?php
// --- FILENAME: backend/signup.php ---
// Advanced Debugging with Output Buffering

// Start capturing all output.
ob_start();

// We will manually include the files to see where the error occurs.
$response = [];
$debug_output = '';

try {
    // --- STAGE 1: Bootstrap ---
    require_once __DIR__ . '/bootstrap.php';

    // --- STAGE 2: Get Input ---
    $data = json_decode(file_get_contents('php://input'), true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON received. Error: " . json_last_error_msg());
    }

    // --- STAGE 3: Process Data ---
    if (!isset($data['username']) || !isset($data['email']) || !isset($data['password'])) {
        throw new Exception("Missing required fields.");
    }

    $username = $data['username'];
    $email = $data['email'];
    $password = $data['password'];
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // --- STAGE 4: Database Insert ---
    $sql = "INSERT INTO users (username, email, password_hash) VALUES (:username, :email, :password)";
    if ($db_config['type'] === 'pgsql') {
        $sql .= " RETURNING id";
    }
    
    $stmt = $conn->prepare($sql);
    $stmt->execute(['username' => $username, 'email' => $email, 'password' => $hashedPassword]);

    // --- STAGE 5: Success ---
    $response['success'] = true;
    $response['message'] = "Signup logic completed successfully.";
    $response['data'] = ['username' => $username];
    
} catch (Exception $e) {
    // If any exception occurs, we catch it here.
    $response['success'] = false;
    $response['message'] = "An exception occurred.";
    $response['error_message'] = $e->getMessage();
    $response['error_trace'] = $e->getTraceAsString();
}

// --- STAGE 6: Final Response Preparation ---
// Get any content that was output unexpectedly.
$debug_output = ob_get_clean();

// We always send a JSON response now.
header("Content-Type: application/json; charset=UTF-8");

// If there was stray output, it means something is wrong.
if (!empty($debug_output)) {
    $response['success'] = false; // Override success if there was junk output
    $response['message'] = "The script produced unexpected output, which indicates a PHP warning or error.";
    $response['unexpected_output'] = $debug_output;
}

// If we are here and the response is still empty, it means the script exited silently.
if (empty($response)) {
     $response['success'] = false;
     $response['message'] = "The script exited silently without success or exception.";
     $response['unexpected_output'] = $debug_output;
}

http_response_code($response['success'] ? 200 : 500);
echo json_encode($response);
exit();
