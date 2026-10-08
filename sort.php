<?php
// Enable error reporting to debug issues
error_reporting(E_ALL);
ini_set('display_errors', 1);

$servername = "localhost";
$username = "root";  // Default XAMPP user
$password = "";      // Default XAMPP password (empty)
$dbname = "sorting_simulator"; // Fixed database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Selection Sort Algorithm
function selectionSort($data) {
    $n = count($data);
    for ($i = 0; $i < $n - 1; $i++) {
        $minIndex = $i;
        for ($j = $i + 1; $j < $n; $j++) {
            if ($data[$j] < $data[$minIndex]) {
                $minIndex = $j;
            }
        }
        // Swap values
        $temp = $data[$minIndex];
        $data[$minIndex] = $data[$i];
        $data[$i] = $temp;
    }
    return $data;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    if (isset($_POST['numbers']) && isset($_POST['algorithm'])) {
        $numbers = explode(',', $_POST['numbers']);
        $numbers = array_map('intval', $numbers);
        
        if ($_POST['algorithm'] === "selectionSort") {
            $sortedNumbers = selectionSort($numbers);
        } else {
            echo json_encode(["error" => "Invalid sorting algorithm selected."]);
            exit();
        }

        $numbersString = implode(',', $numbers);
        $sortedNumbersString = implode(',', $sortedNumbers);
        $algorithm = 'Selection Sort';

        // Log the values being inserted
        error_log("Inserting values: numbersString = $numbersString, algorithm = $algorithm, sortedNumbersString = $sortedNumbersString");

        // Log the SQL query being executed
        $sql = "INSERT INTO simulations (numbers, algorithm, sorted_numbers, timestamp) VALUES ('$numbersString', '$algorithm', '$sortedNumbersString', NOW())";
        error_log("Executing SQL: $sql");

        // Insert simulation result into the database
        $stmt = $conn->prepare("INSERT INTO simulations (numbers, algorithm, sorted_numbers, timestamp) VALUES (?, ?, ?, NOW())");
        if ($stmt === false) {
            echo json_encode(["error" => "Prepare failed: " . $conn->error]);
            error_log("Prepare failed: " . $conn->error); // Log error
            exit();
        }

        $stmt->bind_param("sss", $numbersString, $algorithm, $sortedNumbersString);

        if ($stmt->execute()) {
            echo json_encode($sortedNumbers);
        } else {
            echo json_encode(["error" => "Database insertion failed: " . $stmt->error]);
            error_log("Database insertion failed: " . $stmt->error); // Log error
        }

        $stmt->close();
    } else {
        echo json_encode(["error" => "Invalid input data."]);
        error_log("Invalid input data."); // Log error
    }
}

$conn->close();
?>