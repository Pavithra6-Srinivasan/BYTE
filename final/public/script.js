document.addEventListener('DOMContentLoaded', () => {
    const signUp = document.getElementById('sign-up-form');
    const loginForm = document.getElementById('login-form');
    // const saveButton = document.getElementById('save-button');
    // const uploadForm = document.getElementById('upload-form');
    // const urlForm = document.getElementById('url-form');
    // const productsForm = document.getElementById('products-form');
    // const imageGallery = document.getElementById('image-gallery');
    // const moodboard = document.getElementById('moodboard');
   
    
    // Account creation
    if (signUp) {
        signUp.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission
            
            // Get the input values
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                // Send a POST request to create an account
                const response = await fetch('/sign-up', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });

                // Parse the response data
                const data = await response.json();

                if (data.success) {
                    console.log('Account Created!');
                    alert('Account created successfully!');
                    // Redirect to login page
                    window.location.href = '/login';
                } else {
                    console.error('Account Creation Failed:', data.message);
                    alert(`Account creation failed: ${data.message}`);
                }
            } catch (error) {
                console.error('Error creating account:', error);
                alert('An error occurred while creating the account.');
            }
        });
    }

    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission
            
            // Get the input values
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            try {
                // Send a POST request to log in
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                // Parse the response data
                const data = await response.json();

                if (data.success) {
                    console.log('Signed in!');
                    alert('Signed in successfully!');
                    localStorage.setItem('username', username);
                    window.location.href = '/saved.html'; // Redirect to saved moodboards page
                    //window.location.href = '/deposit.html';
                } else {
                    console.error('Incorrect username or password:', data.message);
                    alert(`Login failed: ${data.message}`);
                }
            } catch (error) {
                console.error('Error signing in:', error);
                alert('An error occurred while signing in.');
            }
        });
    }
    // script.js

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('moodboard-form');
        const titleInput = document.getElementById('title');
        const errorMessage = document.getElementById('error-message');

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const title = titleInput.value;
            const username = localStorage.getItem('username');

            // Check if moodboard name already exists
            try {
                const response = await fetch(`/check-moodboard-name/${username}/${encodeURIComponent(title)}`);
                const data = await response.json();

                if (data.exists) {
                    errorMessage.textContent = 'Moodboard with this name already exists.';
                } else {
                    errorMessage.textContent = '';
                    // Proceed with saving the new moodboard
                    // Add your logic here to save the new moodboard
                }
            } catch (err) {
                console.error('Error checking moodboard name:', err);
                errorMessage.textContent = 'Error checking moodboard name.';
            }
        });
    });

    

    $(document).ready(function() {
        let zIndexCounter = 1; // For managing stacking order of images
        let imageCounter = 0; // To manage the number of images added
        let cropper; // Current cropper instance
    
        const cropperContainer = document.getElementById('cropper-container');
        const cropperImage = document.getElementById('cropper-image');
    
        function showCropper(imageElement) {
            cropperContainer.style.display = 'flex';
            cropperImage.src = imageElement.src;
            cropper = new Cropper(cropperImage, {
                aspectRatio: 0,
                viewMode: 1,
                movable: true,
                zoomable: true,
                rotatable: true,
                scalable: true
            });
        }
    
        function hideCropper() {
            cropperContainer.style.display = 'none';
            cropper.destroy();
            cropper = null;
        }
    
        document.getElementById('crop-button').addEventListener('click', function() {
            const croppedCanvas = cropper.getCroppedCanvas();
            const croppedImageSrc = croppedCanvas.toDataURL();
    
            // Append the cropped image to the moodboard
            addImageToMoodboard(croppedImageSrc);
            hideCropper();
        });
    
        // Function to add image to moodboard
        function addImageToMoodboard(imagesrc) {
            const moodboard = document.getElementById('moodboard');
            const imageUrl = String(imagesrc);
    
            // Determine if imageUrl needs to be proxied
            const proxyUrl = imageUrl.startsWith('data:') ? imageUrl : `http://localhost:3000/proxy?url=${encodeURIComponent(imageUrl)}`;
    
            // Create image container
            const imageContainer = document.createElement('div');
            imageContainer.classList.add('image-container');
            imageContainer.style.position = 'absolute';
            imageContainer.style.left = (50 + imageCounter * 20) + 'px'; // Example initial position
            imageContainer.style.top = (50 + imageCounter * 20) + 'px'; // Example initial position
            imageContainer.style.zIndex = zIndexCounter++;
    
            // Create image element
            const img = document.createElement('img');
            img.src = proxyUrl;
            img.classList.add('moodboard-image');
            img.style.width = '200px'; // Example initial size
            img.style.height = '200px'; // Example initial size
            img.style.objectFit = 'contain'; // Ensure image fits within container
    
            // Create delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '×'; // Close symbol for delete
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener('click', function() {
                imageContainer.remove(); // Remove image container on delete button click
                removeFromLocalStorage(proxyUrl); // Remove image from localStorage
            });
    
            // Create crop button
            const cropBtn = document.createElement('button');
            cropBtn.innerHTML = 'Crop';
            cropBtn.classList.add('crop-btn');
            cropBtn.addEventListener('click', function() {
                showCropper(img);
            });
    
            // Append image and buttons to container
            imageContainer.appendChild(img);
            imageContainer.appendChild(deleteBtn);
            imageContainer.appendChild(cropBtn);
    
            // Append image container to moodboard
            moodboard.appendChild(imageContainer);
    
            // Make image container draggable using jQuery UI
            $(imageContainer).draggable({
                containment: 'parent',
                scroll: false // Disable scrolling while dragging
            });
            $(img).resizable({
                aspectRatio: true, // Maintain aspect ratio while resizing
                handles: 'n, e, s, w, ne, se, sw, nw' // Show resize handles on all sides
            });
    
            imageCounter++;
        }
    
        // Function to remove image URL from localStorage
        function removeFromLocalStorage(imageUrl) {
            let savedImages = JSON.parse(localStorage.getItem('newMoodboardImages')) || [];
           
            savedImages = savedImages.filter(url => url !== imageUrl); // Filter out the deleted image URL
            //localStorage.removeItem('savedImages');
                //document.getElementById('moodboard').innerHTML = '';
            localStorage.setItem('newMoodboardImages', JSON.stringify(savedImages)); // Update localStorage
        }
    
        // Event listener for form submission (example with file input)
        const uploadForm = document.getElementById('upload-form');
        uploadForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const files = event.target.images.files;
            if (files.length > 0) {
                Array.from(files).forEach(file => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        addImageToMoodboard(e.target.result);
                        addToLocalStorage(e.target.result); // Add uploaded image URL to localStorage
                    };
                    reader.readAsDataURL(file);
                });
            }
        });
    
        // Event listener for URL input (example)
        const urlForm = document.getElementById('url-form');
        urlForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const urlInput = event.target.url;
            const url = urlInput.value.trim();
            if (url) {
                addImageToMoodboard(url);
                addToLocalStorage(url); // Add URL input image to localStorage
                urlInput.value = '';
            }
        });
    
        // Function to add image URL to localStorage
        function addToLocalStorage(imageUrl) {
            let savedImages = JSON.parse(localStorage.getItem('newMoodboardImages')) || [];
            savedImages.push(imageUrl);
            localStorage.setItem('newMoodboardImages', JSON.stringify(savedImages));
        }
    
        // Load existing images from localStorage or another source (example)
        const savedImages = JSON.parse(localStorage.getItem('newMoodboardImages')) || [];
        savedImages.forEach(imageUrl => {
            addImageToMoodboard(imageUrl);
        });
    
        // Save moodboard button click event
        document.getElementById('save-button').addEventListener('click', async () => {
            const username = localStorage.getItem('username');
            if (!username) {
                alert('No username found, please log in.');
                window.location.href = 'login.html'; // Redirect to login if no username found
                return;
            }
    
            const moodboardName = prompt('Enter a name for your moodboard:');
            if (!moodboardName) {
                alert('Moodboard name is required.');
                return;
            }

            try {
                // Check if moodboard name already exists
                const response = await fetch(`/check-moodboard-name/${username}/${encodeURIComponent(moodboardName)}`);
                
                if (!response.ok) {
                    // Handle non-200 responses
                    throw new Error(`Server responded with status ${response.status}`);
                }
    
                const data = await response.json();
    
                if (data.exists) {
                    alert('Moodboard with this name already exists.');
                    return;
                }
    
            const moodboardImages = Array.from(document.querySelectorAll('#moodboard .image-container')).map(container => {
                const img = container.querySelector('img');
                const position = {
                    top: container.style.top, // Capture the top position
                    left: container.style.left, // Capture the left position
                    width: img.style.width, // Capture the width
                    height: img.style.height // Capture the height
                };
    
                return {
                    src: img.src,
                    position: position
                };
            });
    
            fetch('/save-moodboard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    name: moodboardName,
                    images: moodboardImages
                })
            })
            .then(response => response.text())
            .then(message => {
                alert(message);
                // Clear the images from local storage and DOM after saving
                localStorage.removeItem('newMoodboardImages');
                document.getElementById('moodboard').innerHTML = '';
            })
            .catch(err => {
                console.error('Failed to save moodboard:', err);
                alert('Error saving moodboard.');
            });

        } catch (err) {
            console.error('Error checking moodboard name:', err);
            alert('Error checking moodboard name.');
        }
        
        });
    
});

});
