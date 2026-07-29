<?php
try {
    $dsn = "pgsql:host=aws-1-us-west-2.pooler.supabase.com;port=6543;dbname=postgres;sslmode=prefer";
    $user = "postgres.nsnjjcnzdhxmqvkwewdy";
    $pass = "aanxFCYJoyFCa3Ci";

    echo "Connecting to $dsn...\n";
    $pdo = new PDO($dsn, $user, $pass);
    echo "Connected successfully!\n";

    $stmt = $pdo->query("SELECT VERSION()");
    $version = $stmt->fetch();
    echo "PostgreSQL version: " . $version[0] . "\n";

} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
}
