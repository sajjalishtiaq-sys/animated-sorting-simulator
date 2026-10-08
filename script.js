document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("startButton").addEventListener("click", startSorting);
    document.getElementById("pauseButton").addEventListener("click", togglePause);
    document.getElementById("resetButton").addEventListener("click", resetAnimation);
    document.getElementById("speedControl").addEventListener("input", function () {
        updateSpeed(this.value);
    });
});
// Help Button Show/Hide
document.getElementById('helpButton').addEventListener('click', function () {
    const helpSection = document.getElementById('helpSection');
    if (helpSection.style.display === 'none') {
        helpSection.style.display = 'block';
    } else {
        helpSection.style.display = 'none';
    }
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

    // Check if the array size exceeds the maximum limit
    if (numbers.length > MAX_ARRAY_SIZE) {
        alert(`Please enter no more than ${MAX_ARRAY_SIZE} numbers.`);
        return;
    }

    // Display the unsorted list immediately
    document.getElementById('unsortedList').textContent = numbers.join(', ');

    // Update algorithm details immediately
    updateAlgorithmDetails(algorithm);

    // Sort the array in the background (without animation) and display the sorted list
    const sortedNumbers = sortArrayWithoutAnimation([...numbers], algorithm);
    document.getElementById('sortedList').textContent = sortedNumbers.join(', ');

    // Save the sorting result to the database
    saveSortingResult(numbers.join(','), algorithm, sortedNumbers.join(','));

    // Start animation
    visualizeSorting(numbers, algorithm);
}

// Function to save the sorting result to the database using AJAX
function saveSortingResult(numbers, algorithm, sortedNumbers) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "sort.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    
    xhr.onreadystatechange = function() {
        if (this.readyState === 4) {
            if (this.status === 200) {
                try {
                    const response = JSON.parse(this.responseText);
                    if (response.error) {
                        console.error("Database error:", response.error);
                    } else {
                        console.log("Data saved successfully:", response.success);
                    }
                } catch (e) {
                    console.error("Error parsing response:", e, this.responseText);
                }
            } else {
                console.error("HTTP error:", this.status);
            }
        }
    };
    
    const data = `numbers=${encodeURIComponent(numbers)}&algorithm=${encodeURIComponent(algorithm)}`;
    xhr.send(data);
}

// Function to sort the array without animation
function sortArrayWithoutAnimation(arr, algorithm) {
    switch (algorithm) {
        case "selectionSort":
            return selectionSort(arr);
        case "insertionSort":
            return insertionSort(arr);
        case "bubbleSort":
            return bubbleSort(arr);
        case "quickSort":
            return quickSort(arr);
        case "mergeSort":
            return mergeSort(arr);
        default:
            alert("Invalid algorithm selected.");
            return arr;
    }
}

// Sorting algorithms (non-animated versions)
function selectionSort(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        if (minIdx !== i) {
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        }
    }
    return arr;
}

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

function quickSort(arr) {
    if (arr.length <= 1) return arr;
    const pivot = arr[arr.length - 1];
    const left = arr.filter((el, idx) => el <= pivot && idx !== arr.length - 1);
    const right = arr.filter(el => el > pivot);
    return [...quickSort(left), pivot, ...quickSort(right)];
}

function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    return merge(left, right);
}

function merge(left, right) {
    const result = [];
    while (left.length && right.length) {
        if (left[0] <= right[0]) {
            result.push(left.shift());
        } else {
            result.push(right.shift());
        }
    }
    return [...result, ...left, ...right];
}

// Function to update the algorithm details
function updateAlgorithmDetails(algorithm) {
    switch (algorithm) {
        case "selectionSort":
            updateAlgorithmInfo(
                "Selection Sort: It finds the smallest element and swaps it with the first unsorted element, repeating until sorted.",
                "O(n²)", "O(n²)", "O(n²)"
            );
            break;
        case "insertionSort":
            updateAlgorithmInfo(
                "Insertion Sort: It inserts each element into its correct position, shifting larger elements as needed.",
                "O(n)", "O(n²)", "O(n²)"
            );
            break;
        case "bubbleSort":
            updateAlgorithmInfo(
                "Bubble Sort: Repeatedly swaps adjacent elements if they are in the wrong order, moving larger ones to the end.",
                "O(n)", "O(n²)", "O(n²)"
            );
            break;
        case "quickSort":
            updateAlgorithmInfo(
                "Quick Sort: Divides the array into smaller subarrays around a pivot and recursively sorts them.",
                "O(n log n)", "O(n²)", "O(n log n)"
            );
            break;
        case "mergeSort":
            updateAlgorithmInfo(
                "Merge Sort: Recursively divides the array into halves and merges them back in sorted order.",
                "O(n log n)", "O(n log n)", "O(n log n)"
            );
            break;
        default:
            alert("Invalid algorithm selected.");
            return;
    }
}

// Function to update the algorithm details in the UI
function updateAlgorithmInfo(name, best, worst, avg) {
    document.getElementById('algorithmInfo').innerHTML = `
        <h3>${name}</h3>
        <p><strong>Best Case:</strong> ${best}</p>
        <p><strong>Worst Case:</strong> ${worst}</p>
        <p><strong>Average Case:</strong> ${avg}</p>
    `;
}

// Function to visualize sorting animation
function visualizeSorting(arr, algorithm) {
    const visualization = document.getElementById('visualization');
    visualization.innerHTML = '';

    const maxValue = Math.max(...arr);
    const containerHeight = 400; // Height of the container in pixels

    // Create bars for visualization
    arr.forEach(value => {
        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.height = `${(value / maxValue) * containerHeight}px`; // Scale height based on the maximum value
        bar.textContent = value;
        visualization.appendChild(bar);
    });

    // Start animation based on selected algorithm
    if (algorithm === "selectionSort") {
        return animateSelectionSort(arr);
    } else if (algorithm === "insertionSort") {
        return animateInsertionSort(arr);
    } else if (algorithm === "bubbleSort") {
        return animateBubbleSort(arr);
    } else if (algorithm === "quickSort") {
        return animateQuickSort(arr);
    } else if (algorithm === "mergeSort") {
        return animateMergeSort(arr);
    } else {
        return Promise.reject("Invalid algorithm selected.");
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

// Quick Sort Animation
async function animateQuickSort(arr) {
    const bars = document.querySelectorAll('.bar');
    const maxValue = Math.max(...arr);
    const containerHeight = 400; // Height of the container in pixels

    async function quickSortHelper(arr, left, right) {
        if (left >= right) return;

        const pivotIndex = await partition(arr, left, right);
        await quickSortHelper(arr, left, pivotIndex - 1);
        await quickSortHelper(arr, pivotIndex + 1, right);
    }

    async function partition(arr, left, right) {
        const pivot = arr[right];
        let i = left;

        for (let j = left; j < right; j++) {
            if (isPaused) await pause();
            if (isReset) return reset();

            bars[j].classList.add("comparing");
            bars[i].classList.add("comparing");
            await new Promise(resolve => setTimeout(resolve, animationSpeed));
            bars[j].classList.remove("comparing");
            bars[i].classList.remove("comparing");

            if (arr[j] < pivot) {
                [arr[i], arr[j]] = [arr[j], arr[i]];

                bars[i].classList.add("swapping");
                bars[j].classList.add("swapping");
                await new Promise(resolve => setTimeout(resolve, animationSpeed));
                bars[i].classList.remove("swapping");
                bars[j].classList.remove("swapping");

                bars[i].style.height = `${(arr[i] / maxValue) * containerHeight}px`;
                bars[j].style.height = `${(arr[j] / maxValue) * containerHeight}px`;
                bars[i].textContent = arr[i];
                bars[j].textContent = arr[j];

                i++;
            }
        }

        [arr[i], arr[right]] = [arr[right], arr[i]];
        bars[i].classList.add("swapping");
        bars[right].classList.add("swapping");
        await new Promise(resolve => setTimeout(resolve, animationSpeed));
        bars[i].classList.remove("swapping");
        bars[right].classList.remove("swapping");

        bars[i].style.height = `${(arr[i] / maxValue) * containerHeight}px`;
        bars[right].style.height = `${(arr[right] / maxValue) * containerHeight}px`;
        bars[i].textContent = arr[i];
        bars[right].textContent = arr[right];

        return i;
    }

    await quickSortHelper(arr, 0, arr.length - 1);
}

// Merge Sort Animation
async function animateMergeSort(arr) {
    const bars = document.querySelectorAll('.bar');
    const maxValue = Math.max(...arr);
    const containerHeight = 400; // Height of the container in pixels

    async function merge(arr, start, mid, end) {
        const left = arr.slice(start, mid + 1);
        const right = arr.slice(mid + 1, end + 1);

        let i = 0, j = 0, k = start;

        while (i < left.length && j < right.length) {
            if (isPaused) await pause();
            if (isReset) return reset();

            bars[k].classList.add("comparing");
            await new Promise(resolve => setTimeout(resolve, animationSpeed));
            bars[k].classList.remove("comparing");

            if (left[i] <= right[j]) {
                arr[k] = left[i];
                bars[k].style.height = `${(left[i] / maxValue) * containerHeight}px`;
                bars[k].textContent = left[i];
                i++;
            } else {
                arr[k] = right[j];
                bars[k].style.height = `${(right[j] / maxValue) * containerHeight}px`;
                bars[k].textContent = right[j];
                j++;
            }
            k++;
        }

        while (i < left.length) {
            if (isPaused) await pause();
            if (isReset) return reset();

            arr[k] = left[i];
            bars[k].style.height = `${(left[i] / maxValue) * containerHeight}px`;
            bars[k].textContent = left[i];
            i++;
            k++;
        }

        while (j < right.length) {
            if (isPaused) await pause();
            if (isReset) return reset();

            arr[k] = right[j];
            bars[k].style.height = `${(right[j] / maxValue) * containerHeight}px`;
            bars[k].textContent = right[j];
            j++;
            k++;
        }
    }

    async function mergeSortHelper(arr, start, end) {
        if (start >= end) return;

        const mid = Math.floor((start + end) / 2);

        await mergeSortHelper(arr, start, mid);
        await mergeSortHelper(arr, mid + 1, end);
        await merge(arr, start, mid, end);
    }

    await mergeSortHelper(arr, 0, arr.length - 1);
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

// Pause Function
function pause() {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            if (!isPaused) {
                clearInterval(interval);
                resolve();
            }
        }, 100);
    });
}

// Reset Function
function reset() {
    isReset = false;
    document.getElementById('visualization').innerHTML = '';
}







