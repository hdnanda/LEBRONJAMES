<?php
require_once 'config.php';

try {
    // Connect to database
    $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

    if ($conn->connect_error) {
        throw new Exception('Database connection failed');
    }

    // Get all users
    $result = $conn->query("SELECT id, username, email, created_at FROM users");
    
    echo "<h2>Existing Users:</h2>";
    echo "<table border='1'>";
    echo "<tr><th>ID</th><th>Username</th><th>Email</th><th>Created At</th></tr>";
    
    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . htmlspecialchars($row['id']) . "</td>";
        echo "<td>" . htmlspecialchars($row['username']) . "</td>";
        echo "<td>" . htmlspecialchars($row['email']) . "</td>";
        echo "<td>" . htmlspecialchars($row['created_at']) . "</td>";
        echo "</tr>";
    }
    
    echo "</table>";
    
    $conn->close();
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?> 