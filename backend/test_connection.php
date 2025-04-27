<?php
require_once 'config.php';

function test_query($conn, $query) {
    try {
        $stmt = $conn->prepare($query);
        $stmt->execute();
        return ['success' => true, 'result' => $stmt->fetchAll(PDO::FETCH_ASSOC)];
    } catch (PDOException $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

echo "Testing PostgreSQL connection on Render...\n\n";

try {
    // Get database connection
    $conn = get_db_connection();
    echo "✓ Connection successful!\n\n";
    
    // Test queries
    echo "Running test queries:\n";
    
    $queries = [
        'Check users table' => "SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'users'
        )",
        
        'Get users count' => "SELECT COUNT(*) as count FROM users",
        
        'Check table structure' => "SELECT column_name, data_type, character_maximum_length 
         FROM information_schema.columns 
         WHERE table_name = 'users'",
         
        'Test case-insensitive search' => "SELECT EXISTS (
            SELECT 1 FROM users 
            WHERE LOWER(username) = LOWER('test_user')
        ) as exists"
    ];
    
    foreach ($queries as $description => $query) {
        echo "\n🔍 $description:\n";
        $result = test_query($conn, $query);
        
        if ($result['success']) {
            echo "✓ Query successful\n";
            echo "Result: " . print_r($result['result'], true) . "\n";
        } else {
            echo "✗ Query failed: " . $result['error'] . "\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
} finally {
    if (isset($conn)) {
        $conn = null;
    }
}
?> 