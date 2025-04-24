<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include necessary files
require_once 'config.php';
require_once 'functions.php';

// Start session
session_start();

// Set a test user ID if not logged in
if (!isset($_SESSION['user_id'])) {
    $_SESSION['user_id'] = 16; // Use a known user ID from your database
    echo "Using test user ID: " . $_SESSION['user_id'] . "<br>";
}

// Get database connection
$conn = get_db_connection();
if (!$conn) {
    die("Database connection failed");
}

// Test GET request (fetch XP)
echo "<h2>Testing GET Request (Fetch XP)</h2>";
$stmt = $conn->prepare("SELECT total_xp, current_level FROM user_progress WHERE user_id = ?");
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo "Current XP: " . $row['total_xp'] . "<br>";
    echo "Current Level: " . $row['current_level'] . "<br>";
} else {
    echo "No XP record found for user ID: " . $_SESSION['user_id'] . "<br>";
}

// Test POST request (update XP)
echo "<h2>Testing POST Request (Update XP)</h2>";
$newXP = 250; // Set a new XP value
$level = 1; // Default level

// Calculate level based on XP
$xpThresholds = [
    1 => 0,
    2 => 100,
    3 => 250,
    4 => 450,
    5 => 700
];

foreach ($xpThresholds as $lvl => $threshold) {
    if ($newXP >= $threshold) {
        $level = $lvl;
    }
}

echo "Updating XP to: " . $newXP . " (Level: " . $level . ")<br>";

// Check if user_progress record exists
$check_stmt = $conn->prepare("SELECT id FROM user_progress WHERE user_id = ?");
$check_stmt->bind_param("i", $_SESSION['user_id']);
$check_stmt->execute();
$check_result = $check_stmt->get_result();

if ($check_result->num_rows === 0) {
    echo "Creating new user_progress record<br>";
    // Insert new record
    $insert_stmt = $conn->prepare("INSERT INTO user_progress 
        (user_id, total_xp, current_level, completed_levels, completed_exams, learning_progress) 
        VALUES (?, ?, ?, '[]', '[]', '{}')");
    $insert_stmt->bind_param("iii", 
        $_SESSION['user_id'], 
        $newXP, 
        $level
    );
    
    if ($insert_stmt->execute()) {
        echo "New user_progress record created successfully<br>";
    } else {
        echo "Failed to create user_progress record: " . $insert_stmt->error . "<br>";
    }
} else {
    echo "Updating existing user_progress record<br>";
    // Update existing record
    $update_stmt = $conn->prepare("UPDATE user_progress 
        SET total_xp = ?, current_level = ?
        WHERE user_id = ?");
    $update_stmt->bind_param("iii", 
        $newXP, 
        $level,
        $_SESSION['user_id']
    );
    
    if ($update_stmt->execute()) {
        echo "User_progress record updated successfully. Affected rows: " . $update_stmt->affected_rows . "<br>";
    } else {
        echo "Failed to update user_progress record: " . $update_stmt->error . "<br>";
    }
}

// Verify the update
echo "<h2>Verifying Update</h2>";
$verify_stmt = $conn->prepare("SELECT total_xp, current_level FROM user_progress WHERE user_id = ?");
$verify_stmt->bind_param("i", $_SESSION['user_id']);
$verify_stmt->execute();
$verify_result = $verify_stmt->get_result();

if ($row = $verify_result->fetch_assoc()) {
    echo "Updated XP: " . $row['total_xp'] . "<br>";
    echo "Updated Level: " . $row['current_level'] . "<br>";
    
    if ($row['total_xp'] == $newXP && $row['current_level'] == $level) {
        echo "<span style='color: green;'>✅ XP update successful!</span><br>";
    } else {
        echo "<span style='color: red;'>❌ XP update failed!</span><br>";
    }
} else {
    echo "<span style='color: red;'>❌ No record found after update!</span><br>";
}

// Close connection
$conn->close();
?> 