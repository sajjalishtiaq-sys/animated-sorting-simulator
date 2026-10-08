<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "sort_simulator";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

function selectionSort($data) {
    $n = count($data);
    for ($i = 0; $i < $n - 1; $i++) {
        $minIndex = $i;
        for ($j = $i + 1; $j < $n; $j++) {
            if ($data[$j] < $data[$minIndex]) {
                $minIndex = $j;
            }
        }
        $temp = $data[$minIndex];
        $data[$minIndex] = $data[$i];
        $data[$i] = $temp;
    }
    return $data;
}

if (isset($_POST['numbers']) && isset($_POST['algorithm'])) {
    $numbers = explode(',', $_POST['numbers']);
    $numbers = array_map('intval', $numbers);
    $sortedNumbers = selectionSort($numbers);

    $numbersString = implode(',', $numbers);
    $sortedNumbersString = implode(',', $sortedNumbers);
    $algorithm = 'Selection Sort';

    $stmt = $conn->prepare("INSERT INTO simulations (numbers, algorithm, sorted_numbers, timestamp) VALUES (?, ?, ?, NOW())");
    $stmt->bind_param("sss", $numbersString, $algorithm, $sortedNumbersString);
    $stmt->execute();

    echo json_encode($sortedNumbers);
    $stmt->close();
}
$conn->close();
?>
