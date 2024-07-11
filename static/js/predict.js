function previewImage(event) {
    const input = event.target;
    const preview = document.getElementById('imagePreview');
    const predictButton = document.getElementById('predictButton');
    const clearButton = document.getElementById('clearButton');

    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            predictButton.style.display = 'block';
            clearButton.style.display = 'block';
        }

        reader.readAsDataURL(input.files[0]);
    }
}

async function predictParameters() {
    const form = document.querySelector('form');
    const formData = new FormData(form);
    const fileInput = document.querySelector('input[type="file"]');
    const file = fileInput.files[0];
    const reader = new FileReader();
    const loader = document.querySelector('.loader');

    if (!file) {
        alert('Please upload an image.');
        return;
    }

    // Display loader while waiting for response
    loader.style.display = 'block';

    reader.onload = async function(e) {
        const base64Image = e.target.result.split(',')[1];

        try {
            const response = await fetch('/api/predict/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': '{{ csrf_token }}' // Ensure CSRF token is available
                },
                body: JSON.stringify({ inputImage: base64Image })
            });

            if (!response.ok) {
                throw new Error('Prediction request failed');
            }

            const result = await response.json();
            displayResults(result);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            // Hide loader when request is complete
            loader.style.display = 'none';
        }
    };

    reader.readAsDataURL(file);
}

function displayResults(results) {
    const resultsList = document.getElementById('resultsList');
    const resultsContainer = document.getElementById('resultsContainer');
    const explanation = document.querySelector('.explanation');

    // Clear previous results
    resultsList.innerHTML = '';

    // Add new results to the list
    for (const [key, value] of Object.entries(results)) {
        const listItem = document.createElement('li');
        listItem.textContent = `${key}: ${value}`;
        resultsList.appendChild(listItem);
    }

    // Show the results container
    resultsContainer.style.display = 'block';
    explanation.style.display = 'block';
}

function submitForm() {
    predictParameters();
}

function clearForm() {
    const fileInput = document.querySelector('input[type="file"]');
    const preview = document.getElementById('imagePreview');
    const predictButton = document.getElementById('predictButton');
    const clearButton = document.getElementById('clearButton');
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsList = document.getElementById('resultsList');
    const explanation = document.querySelector('.explanation');

    fileInput.value = '';
    preview.style.display = 'none';
    predictButton.style.display = 'none';
    clearButton.style.display = 'none';
    resultsContainer.style.display = 'none';
    resultsList.innerHTML = '';
    explanation.style.display = 'none';
}