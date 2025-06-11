<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>Debug Started</h1>";

echo "<p>PHP Version: " . phpversion() . "</p>";

echo "<p>Including config.php...</p>";
require_once 'config.php';
echo "<p>config.php included successfully.</p>";

echo "<p>Including functions.php...</p>";
require_once 'functions.php';
echo "<p>functions.php included successfully.</p>";

// Test Database Connection
echo "<h2>Testing Database Connection...</h2>";
try {
    if ($conn) {
        echo "<p style='color: green;'>Database connection object exists.</p>";
        $stmt = $conn->query("SELECT NOW()");
        $time = $stmt->fetchColumn();
        echo "<p style='color: green;'>Database query successful. Current DB time: $time</p>";
    } else {
        echo "<p style='color: red;'>Database connection object is NULL.</p>";
    }
} catch (Exception $e) {
    echo "<p style='color: red;'>Database connection failed: " . $e->getMessage() . "</p>";
}

// Test log_activity function
echo "<h2>Testing log_activity()...</h2>";
try {
    $test_user_id = 9999;
    $result = log_activity($test_user_id, 'debug_test', 'This is a test log from debug.php');
    if ($result === true) {
        echo "<p style='color: green;'>log_activity() returned TRUE as expected.</p>";
    } else {
        echo "<p style='color: red;'>log_activity() returned FALSE.</p>";
    }
} catch (Exception $e) {
    echo "<p style='color: red;'>log_activity() threw an exception: " . $e->getMessage() . "</p>";
}

echo "<h1>Debug Finished</h1>";

?> 