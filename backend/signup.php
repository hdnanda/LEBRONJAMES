<?php
// Use the centralized bootstrap file for all initialization.
require_once __DIR__ . '/bootstrap.php';

// The main logic will be wrapped in a function to keep the global scope clean.
function handle_signup_request() {
    global $conn, $db_config;

    // Get data from the request body
    $data = json_decode(file_get_contents('php://input'), true);

    // Validate input
    if (json_last_error() !== JSON_ERROR_NONE) {
        return send_json_error_response("Invalid JSON payload.", 400);
    }
    if (!isset($data['username']) || !isset($data['email']) || !isset($data['password'])) {
        return send_json_error_response("Missing required fields.", 400);
    }

    $username = $data['username'];
    $email = $data['email'];
    $password = $data['password'];
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    try {
        $sql = "INSERT INTO users (username, email, password_hash) VALUES (:username, :email, :password)";
        if ($db_config['type'] === 'pgsql') {
            $sql .= " RETURNING id";
        }
        
        $stmt = $conn->prepare($sql);
        $stmt->execute(['username' => $username, 'email' => $email, 'password' => $hashedPassword]);

        // Return a success response
        $responseData = ['username' => $username, 'email' => $email];
        return send_json_success_response("Account created successfully", $responseData, 201);

    } catch (Exception $e) {
        if (in_array($e->getCode(), ['23505', '23000'])) {
            return send_json_error_response('Username or email already exists.', 409);
        }
        error_log('Signup Exception: ' . $e->getMessage());
        return send_json_error_response('A server error occurred during signup.', 500);
    }
}

// Execute the handler
handle_signup_request();