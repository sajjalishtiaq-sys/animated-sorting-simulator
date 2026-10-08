let animationId;
let animationSpeed = 5;
let isPaused = false;
let sortingData = [];

function startSorting() {
    const numberInput = document.getElementById('numberInput').value;
    const algorithm = document.getElementById('algorithm').value;

    if (!numberInput.match(/^\d+(,\d+)*$/)) {
        alert('Please enter a valid list of numbers separated by commas.');
        return;
    }

    fetch('sort.php', { // Ensure the correct path to sort.php
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `numbers=${numberInput}&algorithm=${algorithm}`
    })
    .then(response => response.json())
    .then(data => {
        sortingData = data;
        visualizeSorting(data);
    })
    .catch(error => console.error('Error:', error));
}

function visualizeSorting(data) {
    const visualization = document.getElementById('visualization');
    visualization.innerHTML = '';

    data.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.style.height = `${value * 10}px`;
        bar.classList.add('bar');
        bar.dataset.index = index;
        visualization.appendChild(bar);
    });

    animateSorting(data);
}

function animateSorting(data) {
    const bars = document.querySelectorAll('.bar');
    let i = 0, j = 0;

    function swapBars(idx1, idx2) {
        const bar1 = bars[idx1];
        const bar2 = bars[idx2];
        const tempHeight = bar1.style.height;
        bar1.style.height = bar2.style.height;
        bar2.style.height = tempHeight;
    }

    function step() {
        if (isPaused) {
            return;
        }

        if (i < data.length - 1) {
            if (j < data.length - 1 - i) {
                if (data[j] > data[j + 1]) {
                    [data[j], data[j + 1]] = [data[j + 1], data[j]];
                    swapBars(j, j + 1);
                }
                j++;
            } else {
                j = 0;
                i++;
            }
            animationId = setTimeout(step, 1000 / animationSpeed);
        }
    }

    animationId = setTimeout(step, 1000 / animationSpeed);
}

function startAnimation() {
    isPaused = false;
    animateSorting(sortingData);
}

function pauseAnimation() {
    isPaused = true;
    clearTimeout(animationId);
}

function resetAnimation() {
    isPaused = true;
    clearTimeout(animationId);
    document.getElementById('visualization').innerHTML = '';
}

function updateSpeed(value) {
    animationSpeed = value;
}
