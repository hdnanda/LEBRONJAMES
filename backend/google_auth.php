<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Autoload Composer dependencies
require_once __DIR__ . '/vendor/autoload.php';

// Set CORS headers
header('Access-Control-Allow-Origin: *'); // IMPORTANT: Restrict this in production!
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// --- Configuration ---
$GOOGLE_CLIENT_ID = '249981168777-andnjndtnj05p20e87gmo3oejos7pskd.apps.googleusercontent.com'; // <--- REPLACE THIS
$userDataDir = __DIR__ . '/user_data';

// --- Helper function to sanitize username ---
function sanitize_username($username) {
    return preg_replace('/[^a-zA-Z0-9_-]/', '', $username);
}

// --- Helper function to get or create user data (adapted from xp_handler.php) ---
function getOrCreateUser($username, $email, $googleUserId, $googleUserName) {
    global $userDataDir;
    $sanitizedUsername = sanitize_username($username);
    $userDataFile = $userDataDir . '/' . $sanitizedUsername . '.json';

    if (!file_exists($userDataDir)) {
        if (!mkdir($userDataDir, 0755, true)) {
            return ['success' => false, 'message' => 'Failed to create user data directory.', 'http_code' => 500];
        }
    }

    if (file_exists($userDataFile)) {
        $fileContents = file_get_contents($userDataFile);
        $userData = json_decode($fileContents, true);
        if (!is_array($userData)) { // Handle corrupted or empty file
            // Fallback to creating a new user structure
            $userData = null;
        }
    } else {
        $userData = null;
    }

    if (!$userData) {
        // New user or corrupted data, create default structure
        $userData = [
            'username' => $sanitizedUsername, // Use the sanitized username passed to the function
            'email' => $email, // Store email from Google
            'google_id' => $googleUserId, // Store Google User ID
            'google_name' => $googleUserName, // Store name from Google
            'xp' => 0,
            'level' => 1,
            'completed_levels' => [],
            'completed_exams' => [],
            'last_updated' => date('Y-m-d H:i:s'),
            'created_at' => date('Y-m-d H:i:s'),
            'login_method' => 'google'
        ];
        // Save the new user data
        if (file_put_contents($userDataFile, json_encode($userData, JSON_PRETTY_PRINT)) === false) {
            return ['success' => false, 'message' => 'Failed to create new user file.', 'http_code' => 500];
        }
    } else {
        // User exists, update login method and last_updated, ensure Google ID is present
        $userData['last_updated'] = date('Y-m-d H:i:s');
        $userData['login_method'] = 'google';
        if (empty($userData['google_id'])) {
            $userData['google_id'] = $googleUserId;
        }
        if (empty($userData['email'])) { // If email was missing, add it
            $userData['email'] = $email;
        }
        if (file_put_contents($userDataFile, json_encode($userData, JSON_PRETTY_PRINT)) === false) {
            // Non-critical error, log it maybe, but proceed
            error_log("Failed to update existing user file for {$sanitizedUsername} during Google login.");
        }
    }

    return [
        'success' => true,
        'username' => $sanitizedUsername, // Return the internal username
        'email' => $userData['email'] // Return the stored email
    ];
}

// --- Main script logic ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);
    $idToken = $input['token'] ?? null;

    if (empty($idToken)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID token not provided.']);
        exit;
    }

    $client = new Google_Client(['client_id' => $GOOGLE_CLIENT_ID]);
    try {
        $payload = $client->verifyIdToken($idToken);
        if ($payload) {
            $googleUserId = $payload['sub'];
            $email = $payload['email'] ?? null;
            $emailVerified = $payload['email_verified'] ?? false;
            $name = $payload['name'] ?? ($payload['given_name'] ?? 'User');

            if (!$email || !$emailVerified) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Email not provided by Google or not verified.']);
                exit;
            }

            // Use email prefix as a candidate for username, then sanitize it.
            // You might want a more robust username generation/check strategy here.
            $usernameCandidate = explode('@', $email)[0];
            
            // Get or create user in your system
            $userResult = getOrCreateUser($usernameCandidate, $email, $googleUserId, $name);

            if ($userResult['success']) {
                // Successfully authenticated and user record handled
                echo json_encode([
                    'success' => true,
                    'message' => 'Successfully authenticated with Google.',
                    'username' => $userResult['username'], // This is your app's internal username
                    'email' => $userResult['email']
                ]);
            } else {
                http_response_code($userResult['http_code'] ?? 500);
                echo json_encode(['success' => false, 'message' => $userResult['message']]);
            }

        } else {
            // Invalid token
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Invalid Google ID token.']);
        }
    } catch (Exception $e) {
        // General error during token verification
        error_log('Google Sign-In Error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'An error occurred during Google authentication: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
}

?> 
