document.addEventListener('DOMContentLoaded', function() {
    const addImageButton = document.getElementById('addImageButton');
    const imageInputsContainer = document.getElementById('imageInputs');
    let imageInputCount = 0;

    addImageButton.addEventListener('click', function() {
        if (imageInputCount < 3) { // Limit to 3 images
            imageInputCount++;

            // pop up a new div for an image upload input 
            const newImageInput = document.createElement('div');
            newImageInput.innerHTML = `
                <label for="image${imageInputCount}">Upload Image ${imageInputCount}:</label>
                <input type="file" id="image${imageInputCount}" name="images" required>
            `;
            imageInputsContainer.appendChild(newImageInput); // put the image input into the container
        } else {
            alert('Maximum 3 images allowed per article.'); // max 3 images
        }
    });

    const addArticleForm = document.getElementById('addArticleForm');
    addArticleForm.addEventListener('submit', function(event) {
        event.preventDefault(); 

        const formData = new FormData(this); // get data from the submitted form 

        // send the form data to the db using fetch post
        fetch('/addArticle', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Error: ' + data.error);
            } else {
                alert('Article added successfully!');
                addArticleForm.reset();
                imageInputsContainer.innerHTML = ''; // Clear added image inputs
                imageInputCount = 0; // Reset image input count
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while adding the article. Please try again.');
        });
    });
});
