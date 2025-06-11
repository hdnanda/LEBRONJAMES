<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set common headers
header('Access-Control-Allow-Origin: *'); // Be more specific in production
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include database configuration
require_once __DIR__ . '/config.php';

// Function to get user ID from username
function get_user_id_by_username($pdo, $username) {
    // Basic validation
    if (empty($username)) {
        return null;
    }
    try {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = :username");
        $stmt->execute([':username' => $username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ? (int)$user['id'] : null;
    } catch (PDOException $e) {
        error_log("Database error in get_user_id_by_username: " . $e->getMessage());
        return null;
    }
}

// Get username from query parameter or POST data
$username = $_GET['username'] ?? $_POST['username'] ?? null;
if (!$username) {
    // Try getting from JSON body
    $input = json_decode(file_get_contents('php://input'), true);
    $username = $input['username'] ?? null;
}

// Sanitize username
$username = $username ? preg_replace('/[^a-zA-Z0-9_-]/', '', $username) : null;

if (!$username) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Username not provided.']);
    exit;
}

// Establish database connection
try {
    $pdo = get_db_connection();
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed.']);
    exit;
}

// Get user ID
$user_id = get_user_id_by_username($pdo, $username);
if (!$user_id) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'User not found.']);
    exit;
}

// Default user progress data
$default_progress = [
    'user_id' => $user_id,
    'total_xp' => 0,
    'current_level' => 1,
    'completed_levels' => '[]',
    'completed_exams' => '[]',
    'learning_progress' => '{}'
];

// Process request based on method
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        try {
            $stmt = $pdo->prepare("SELECT * FROM user_progress WHERE user_id = :user_id");
            $stmt->execute([':user_id' => $user_id]);
            $progress = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$progress) {
                // If no progress, insert default and return it
                $stmt = $pdo->prepare("INSERT INTO user_progress (user_id, total_xp, current_level, completed_levels, completed_exams, learning_progress) VALUES (:user_id, :total_xp, :current_level, :completed_levels, :completed_exams, :learning_progress)");
                $stmt->execute($default_progress);
                $progress = $default_progress;
            }

            // Decode JSON fields for the response
            echo json_encode([
                'success' => true,
                'xp' => (int)$progress['total_xp'],
                'level' => (int)$progress['current_level'],
                'completed_levels' => json_decode($progress['completed_levels'], true),
                'completed_exams' => json_decode($progress['completed_exams'], true),
                'message' => 'User data retrieved successfully.'
            ]);

        } catch (PDOException $e) {
            error_log("GET request failed: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to retrieve user data.']);
        }
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['xp']) || !is_numeric($input['xp'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid or missing XP value.']);
            exit;
        }

        try {
            // Fetch current progress
            $stmt = $pdo->prepare("SELECT * FROM user_progress WHERE user_id = :user_id");
            $stmt->execute([':user_id' => $user_id]);
            $current_progress = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$current_progress) {
                // If no progress record, use defaults
                $current_progress = $default_progress;
            }

            // Update XP and level
            $new_xp = (int)$input['xp'];
            $new_level = $current_progress['current_level'];

            $xpThresholds = [1 => 0, 2 => 100, 3 => 250, 4 => 450, 5 => 700];
            foreach ($xpThresholds as $lvl => $threshold) {
                if ($new_xp >= $threshold) {
                    $new_level = $lvl;
                }
            }

            // Merge completed levels and exams
            $completed_levels = isset($current_progress['completed_levels']) ? json_decode($current_progress['completed_levels'], true) : [];
            $completed_exams = isset($current_progress['completed_exams']) ? json_decode($current_progress['completed_exams'], true) : [];

            if (isset($input['completed_levels']) && is_array($input['completed_levels'])) {
                 $completed_levels = array_values(array_unique(array_merge($completed_levels, $input['completed_levels']), SORT_REGULAR));
            }
            if (isset($input['completed_exams']) && is_array($input['completed_exams'])) {
                $completed_exams = array_values(array_unique(array_merge($completed_exams, $input['completed_exams'])));
            }

            // Prepare for database update/insert
            $sql = "INSERT INTO user_progress (user_id, total_xp, current_level, completed_levels, completed_exams, learning_progress) VALUES (:user_id, :total_xp, :current_level, :completed_levels, :completed_exams, :learning_progress) ON DUPLICATE KEY UPDATE total_xp = VALUES(total_xp), current_level = VALUES(current_level), completed_levels = VALUES(completed_levels), completed_exams = VALUES(completed_exams)";
            
            // Note: ON DUPLICATE KEY UPDATE is MySQL-specific. For PostgreSQL, use ON CONFLICT...DO UPDATE.
            // This example assumes MySQL based on local dev config.
            
            $stmt = $pdo->prepare($sql);
            $params = [
                ':user_id' => $user_id,
                ':total_xp' => $new_xp,
                ':current_level' => $new_level,
                ':completed_levels' => json_encode($completed_levels),
                ':completed_exams' => json_encode($completed_exams),
                ':learning_progress' => $current_progress['learning_progress'] // Not updated in this version
            ];
            $stmt->execute($params);

            echo json_encode([
                'success' => true,
                'xp' => $new_xp,
                'level' => $new_level,
                'completed_levels' => $completed_levels,
                'completed_exams' => $completed_exams,
                'message' => 'User data updated successfully.'
            ]);

        } catch (PDOException $e) {
            error_log("POST request failed: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to update user data.']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
        break;
}
?> 