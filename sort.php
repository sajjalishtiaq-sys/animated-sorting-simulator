<!-- Current Code -->
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

// Bubble Sort Algorithm
function bubbleSort($data) {
    $n = count($data);
    for ($i = 0; $i < $n - 1; $i++) {
        for ($j = 0; $j < $n - $i - 1; $j++) {
            if ($data[$j] > $data[$j + 1]) {
                // Swap values
                $temp = $data[$j];
                $data[$j] = $data[$j + 1];
                $data[$j + 1] = $temp;
            }
        }
    }
    return $data;
}

// Insertion Sort Algorithm
function insertionSort($data) {
    $n = count($data);
    for ($i = 1; $i < $n; $i++) {
        $key = $data[$i];
        $j = $i - 1;
        while ($j >= 0 && $data[$j] > $key) {
            $data[$j + 1] = $data[$j];
            $j--;
        }
        $data[$j + 1] = $key;
    }
    return $data;
}

// Quick Sort Algorithm
function quickSort($data) {
    if (count($data) <= 1) return $data;
    $pivot = $data[count($data) - 1];
    $left = [];
    $right = [];
    for ($i = 0; $i < count($data) - 1; $i++) {
        if ($data[$i] < $pivot) {
            $left[] = $data[$i];
        } else {
            $right[] = $data[$i];
        }
    }
    return array_merge(quickSort($left), [$pivot], quickSort($right));
}

// Merge Sort Algorithm
function mergeSort($data) {
    if (count($data) <= 1) return $data;

    $mid = floor(count($data) / 2);
    $left = array_slice($data, 0, $mid);
    $right = array_slice($data, $mid);

    return merge(mergeSort($left), mergeSort($right));
}

function merge($left, $right) {
    $result = [];
    $i = 0;
    $j = 0;

    while ($i < count($left) && $j < count($right)) {
        if ($left[$i] <= $right[$j]) {
            $result[] = $left[$i];
            $i++;
        } else {
            $result[] = $right[$j];
            $j++;
        }
    }

    while ($i < count($left)) {
        $result[] = $left[$i];
        $i++;
    }

    while ($j < count($right)) {
        $result[] = $right[$j];
        $j++;
    }

    return $result;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    if (isset($_POST['numbers']) && isset($_POST['algorithm'])) {
        $numbers = explode(',', $_POST['numbers']);
        $numbers = array_map('intval', $numbers);

        // Determine which sorting algorithm to use
        if ($_POST['algorithm'] === "selectionSort") {
            $sortedNumbers = selectionSort($numbers);
            $algorithm = 'Selection Sort';
        } elseif ($_POST['algorithm'] === "bubbleSort") {
            $sortedNumbers = bubbleSort($numbers);
            $algorithm = 'Bubble Sort';
        } elseif ($_POST['algorithm'] === "insertionSort") {
            $sortedNumbers = insertionSort($numbers);
            $algorithm = 'Insertion Sort';
        } elseif ($_POST['algorithm'] === "quickSort") {
            $sortedNumbers = quickSort($numbers);
            $algorithm = 'Quick Sort';
        } elseif ($_POST['algorithm'] === "mergeSort") {
            $sortedNumbers = mergeSort($numbers);
            $algorithm = 'Merge Sort';
        } else {
            echo json_encode(["error" => "Invalid sorting algorithm selected."]);
            exit();
        }

        $numbersString = implode(',', $numbers);
        $sortedNumbersString = implode(',', $sortedNumbers);

        // Check if the algorithm exists in the algorithm table
        $stmt = $conn->prepare("SELECT algorithm_name FROM algorithm WHERE algorithm_name = ?");
        if ($stmt === false) {
            die("Prepare failed: " . $conn->error);
        }

        $stmt->bind_param("s", $algorithm);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            die("Algorithm not found in the database: " . $algorithm);
        }

        $stmt->close();

        // Insert simulation result into the simulations table
        $stmt = $conn->prepare("INSERT INTO simulations (numbers, algorithm_name, sorted_numbers, timestamp) VALUES (?, ?, ?, NOW())");
        if ($stmt === false) {
            echo json_encode(["error" => "Prepare failed: " . $conn->error]);
            error_log("Prepare failed: " . $conn->error); // Log error
            exit();
        }

        $stmt->bind_param("sss", $numbersString, $algorithm, $sortedNumbersString);

        if ($stmt->execute()) {
            echo json_encode(["success" => "Data inserted successfully.", "sortedNumbers" => $sortedNumbers]);
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




