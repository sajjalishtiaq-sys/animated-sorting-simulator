document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("startButton").addEventListener("click", startSorting);
    document.getElementById("pauseButton").addEventListener("click", togglePause);
    document.getElementById("resetButton").addEventListener("click", resetAnimation);
    document.getElementById("speedControl").addEventListener("input", function() {
        updateSpeed(this.value);
    });
});

let animationSpeed = 500; // Default animation speed in milliseconds
let isPaused = false;
let isReset = false;
const MAX_ARRAY_SIZE = 20; // Maximum allowed array size

// Function to start sorting based on selected algorithm
function startSorting() {
    const numberInput = document.getElementById('numberInput').value;
    const algorithm = document.getElementById('algorithm').value;

    // Input validation
    if (!numberInput.match(/^\d+(,\d+)*$/)) {
        alert('Please enter a valid list of numbers separated by commas.');
        return;
    }

    const numbers = numberInput.split(',').map(Number);

    // to Check if the array size doen not exceeds the maximum limit
    if (numbers.length > MAX_ARRAY_SIZE) {
        alert(`Please enter no more than ${MAX_ARRAY_SIZE} numbers.`);
        return;
    }

    document.getElementById('unsortedList').textContent = numbers.join(', ');

    let sortedNumbers;
    switch (algorithm) {
        case "selectionSort":
            sortedNumbers = selectionSort([...numbers]);
            updateAlgorithmInfo("Selection Sort: It finds the smallest element and swaps it with the first unsorted element, repeating until sorted ", "O(n²)", "O(n²)", "O(n²)");
            break;
        case "insertionSort":
            sortedNumbers = insertionSort([...numbers]);
            updateAlgorithmInfo("Insertion Sort: It inserts each element into its correct position, shifting larger elements as needed ", "O(n)", "O(n²)", "O(n²)");
            break;
        case "bubbleSort":
            sortedNumbers = bubbleSort([...numbers]);
            updateAlgorithmInfo("Bubble Sort: repeatedly swaps adjacent elements if they are in the wrong order, moving larger ones to the end ", "O(n)", "O(n²)", "O(n²)");
            break;
        default:
            alert("Invalid algorithm selected.");
            return;
    }

    document.getElementById('sortedList').textContent = sortedNumbers.join(', ');

    // Sending data to PHP script
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "sort.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log(xhr.responseText);
        }
    };
    xhr.send(`numbers=${numberInput}&algorithm=${algorithm}`);

    visualizeSorting(numbers, algorithm);
}

// Function to update the algorithm details
function updateAlgorithmInfo(name, best, worst, avg) {
    document.getElementById('algorithmInfo').innerHTML = `
        <h3>${name}</h3>
        <p><strong>Best Case:</strong> ${best}</p>
        <p><strong>Worst Case:</strong> ${worst}</p>
        <p><strong>Average Case:</strong> ${avg}</p>
    `;
}

// Selection Sort Implementation
function selectionSort(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
    return arr;
}

// Insertion Sort Implementation
function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        let key = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
    return arr;
}

// Bubble Sort Implementation
function bubbleSort(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}

// Function to visualize sorting animation
function visualizeSorting(arr, algorithm) {
    const visualization = document.getElementById('visualization');
    visualization.innerHTML = '';

    const maxValue = Math.max(...arr); 
    const containerHeight = 400; // Height of the container in pixels

    // Creating bars for visualization
    arr.forEach(value => {
        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.height = `${(value / maxValue) * containerHeight}px`; // Scale height based on the maximum value
        bar.textContent = value;
        visualization.appendChild(bar);
    });

    //to Start animation based on selected algorithm
    if (algorithm === "selectionSort") {
        animateSelectionSort(arr);
    } else if (algorithm === "insertionSort") {
        animateInsertionSort(arr);
    } else if (algorithm === "bubbleSort") {
        animateBubbleSort(arr);
    }
}

// Selection Sort Animation
async function animateSelectionSort(arr) {
    const bars = document.querySelectorAll('.bar');
    const maxValue = Math.max(...arr); 
    const containerHeight = 400; // Height of the container in pixels

    for (let i = 0; i < arr.length - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < arr.length; j++) {
            if (isPaused) await pause();
            if (isReset) return reset();

            bars[j].classList.add("comparing");
            await new Promise(resolve => setTimeout(resolve, animationSpeed));
            bars[j].classList.remove("comparing");

            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        if (minIdx !== i) {
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
            bars[i].classList.add("swapping");
            bars[minIdx].classList.add("swapping");
            await new Promise(resolve => setTimeout(resolve, animationSpeed));
            bars[i].classList.remove("swapping");
            bars[minIdx].classList.remove("swapping");

            bars[i].style.height = `${(arr[i] / maxValue) * containerHeight}px`;
            bars[minIdx].style.height = `${(arr[minIdx] / maxValue) * containerHeight}px`;
            bars[i].textContent = arr[i];
            bars[minIdx].textContent = arr[minIdx];
        }
    }
}

// Insertion Sort Animation
async function animateInsertionSort(arr) {
    const bars = document.querySelectorAll('.bar');
    const maxValue = Math.max(...arr); 
    const containerHeight = 400; // Height of the container in pixels

    for (let i = 1; i < arr.length; i++) {
        let key = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j] > key) {
            if (isPaused) await pause();
            if (isReset) return reset();

            bars[j + 1].classList.add("swapping");
            await new Promise(resolve => setTimeout(resolve, animationSpeed));
            bars[j + 1].classList.remove("swapping");

            arr[j + 1] = arr[j];
            bars[j + 1].style.height = `${(arr[j] / maxValue) * containerHeight}px`;
            bars[j + 1].textContent = arr[j];
            j--;
        }
        arr[j + 1] = key;
        bars[j + 1].style.height = `${(key / maxValue) * containerHeight}px`;
        bars[j + 1].textContent = key;
    }
}

// Bubble Sort Animation
async function animateBubbleSort(arr) {
    const bars = document.querySelectorAll('.bar');
    const maxValue = Math.max(...arr); 
    const containerHeight = 400; // Height of the container in pixels

    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
            if (isPaused) await pause();
            if (isReset) return reset();

            bars[j].classList.add("comparing");
            bars[j + 1].classList.add("comparing");
            await new Promise(resolve => setTimeout(resolve, animationSpeed));
            bars[j].classList.remove("comparing");
            bars[j + 1].classList.remove("comparing");

            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                bars[j].classList.add("swapping");
                bars[j + 1].classList.add("swapping");
                await new Promise(resolve => setTimeout(resolve, animationSpeed));
                bars[j].classList.remove("swapping");
                bars[j + 1].classList.remove("swapping");

                bars[j].style.height = `${(arr[j] / maxValue) * containerHeight}px`;
                bars[j + 1].style.height = `${(arr[j + 1] / maxValue) * containerHeight}px`;
                bars[j].textContent = arr[j];
                bars[j + 1].textContent = arr[j + 1];
            }
        }
    }
}

// Pause & Resume Button Functionality
function togglePause() {
    isPaused = !isPaused;
    document.getElementById("pauseButton").textContent = isPaused ? "Resume" : "Pause";
}

// Reset Animation
function resetAnimation() {
    isReset = true;
    isPaused = false;
    document.getElementById("visualization").innerHTML = '';
    document.getElementById("pauseButton").textContent = "Pause";
}

// Update Speed
function updateSpeed(value) {
    animationSpeed = 1000 / value;
}








