<?php
try {
    // Direct connection usually uses port 5432 and just the username 'postgres'
    $dsn = "pgsql:host=db.nsnjjcnzdhxmqvkwewdy.supabase.co;port=5432;dbname=postgres;sslmode=prefer";
    $user = "postgres";
    $pass = "aanxFCYJoyFCa3Ci";

    echo "Connecting to direct host $dsn...\n";
    $pdo = new PDO($dsn, $user, $pass);
    echo "Connected successfully!\n";

    $stmt = $pdo->query("SELECT VERSION()");
    $version = $stmt->fetch();
    echo "PostgreSQL version: " . $version[0] . "\n";

} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
}
