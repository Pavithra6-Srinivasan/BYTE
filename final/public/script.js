document.addEventListener('DOMContentLoaded', () => {
    const signUp = document.getElementById('sign-up-form');
    const loginForm = document.getElementById('login-form');
  
    function showToast(message, type) {
        let toastContainer = document.getElementById('toast-container');

        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = message;
        toastContainer.appendChild(toast);
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
 
    // Account creation
    if (signUp) {
        signUp.addEventListener('submit', async (event) => {
            event.preventDefault(); 
            
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
                    showToast('Account created successfully!', 'success');
                    window.location.href = '/login';
                } else {
                    console.error('Account Creation Failed:', data.message);
                    showToast('Account Creation Failed', 'error');
                }
            } catch (error) {
                console.error('Error creating account:', error);
                showToast('An error occurred while creating the account.', 'error');
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
                    showToast('Logged in successfully!', 'success');
                    sessionStorage.setItem('username', username);
                    window.location.href = '/graphic-tees';
                    
                } else {
                    console.error('Incorrect username or password:', data.message);
                    showToast('Incorrect credentials', 'error');
                }
            } catch (error) {
                console.error('Error signing in:', error);
                showToast('Error signing in. Please try again.', 'error');
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('moodboard-form');
        const titleInput = document.getElementById('title');
        const errorMessage = document.getElementById('error-message');

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const title = titleInput.value;
            const username = sessionStorage.getItem('username');

            // Check if moodboard name already exists
            try {
                const response = await fetch(`/check-moodboard-name/${username}/${encodeURIComponent(title)}`);
                const data = await response.json();

                if (data.exists) {
                    errorMessage.textContent = 'Moodboard with this name already exists.';
                } else {
                    errorMessage.textContent = '';
                    
                }
            } catch (err) {
                console.error('Error checking moodboard name:', err);
                errorMessage.textContent = 'Error checking moodboard name.';
            }
        });
    });

    $(document).ready(function() {
        let zIndexCounter = 1; 
        let imageCounter = 0; 
        let cropper; 
    
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
            saveCroppedImage(croppedImageSrc);
            
            hideCropper();
        });

        function saveCroppedImage(croppedImageSrc) {
            // Create an image object
            const imageObject = { src: croppedImageSrc };
            
            // Retrieve existing images from sessionStorage, or initialize an empty array
            let newMoodboardImages = JSON.parse(sessionStorage.getItem('newMoodboardImages')) || [];
            
            // Add the new cropped image object to the array
            newMoodboardImages.push(imageObject);
            
            // Save the updated array back to sessionStorage
            sessionStorage.setItem('newMoodboardImages', JSON.stringify(newMoodboardImages));
        }
           
        // Function to add image to moodboard
        function addImageToMoodboard(imagesrc, position = {}) {
            console.log('imagesrc:', imagesrc);
            const moodboard = document.getElementById('moodboard');
            const imageUrl = String(imagesrc);
    
            // Determine if imageUrl needs to be proxied
            const proxyUrl = imageUrl.startsWith('data:') ? imageUrl : `https://glacial-coast-30522-eb4abac1d785.herokuapp.com/proxy?url=${encodeURIComponent(imageUrl)}`;
            console.log('Proxy URL:', proxyUrl);
            // Create image container
            const imageContainer = document.createElement('div');
            imageContainer.classList.add('image-container');
            imageContainer.style.position = 'absolute';
           
            imageContainer.style.left = position.left || (50 + imageCounter * 20) + 'px'; 
            imageContainer.style.top = position.top || (50 + imageCounter * 20) + 'px'; 
            imageContainer.style.width = position.width || '200px';
            imageContainer.style.height = position.height || '200px'; 
            imageContainer.style.zIndex = zIndexCounter++;
        
            // Create image element
            const img = document.createElement('img');
            img.src = proxyUrl;
            img.classList.add('moodboard-image');
            img.style.width = '200px'; 
            img.style.height = '200px'; 
            img.style.objectFit = 'contain'; 
    
            // Create delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '×';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener('click', function() {
                 // Remove image container on delete button click
                removeFromsessionStorage(imageUrl) ;
                removeFromsessionStorage(proxyUrl) ;
                imageContainer.remove();
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
                scroll: false
            });
            $(img).resizable({
                aspectRatio: true,
                handles: 'n, e, s, w, ne, se, sw, nw' 
            });  
            imageCounter++;
        }
    
        // Function to remove image URL from sessionStorage
        function removeFromsessionStorage(imageUrl) {
            let savedImages = JSON.parse(sessionStorage.getItem('newMoodboardImages')) || [];
            console.log('URL to remove:', imageUrl);
            console.log('sessionStorage before removal:', savedImages);
            
            savedImages = savedImages.filter(item => item.src !== imageUrl); // Check if item.src is used
        
            console.log('Filtered images:', savedImages);
            sessionStorage.setItem('newMoodboardImages', JSON.stringify(savedImages));
            console.log('sessionStorage after removal:', JSON.parse(sessionStorage.getItem('newMoodboardImages')));
        }
               
        const uploadForm = document.getElementById('upload-form');
        uploadForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const files = event.target.images.files;
            if (files.length > 0) {
                Array.from(files).forEach(file => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        addImageToMoodboard(e.target.result);
                        addTosessionStorage(e.target.result); 
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
                addTosessionStorage(url); 
                urlInput.value = '';
            }
        });

        // Function to add image URL to sessionStorage
        function addTosessionStorage(imageUrl) {
            let savedImages = JSON.parse(sessionStorage.getItem('newMoodboardImages')) || [];
            savedImages.push({ src: imageUrl });
            sessionStorage.setItem('newMoodboardImages', JSON.stringify(savedImages));
        }

        // Load existing images from sessionStorage or another source (example)
        const savedImages = JSON.parse(sessionStorage.getItem('newMoodboardImages'));
        savedImages.forEach(imageData => {
            addImageToMoodboard(imageData.src, imageData.position);
        
        });
    
        // Save moodboard button click event
        document.getElementById('save-button').addEventListener('click', async () => {
            const username = sessionStorage.getItem('username');
            if (!username) {
                showToast('No username found, please log in.', 'error');
                window.location.href = 'login.html'; // Redirect to login if no username found
                return;
            }
    
            const moodboardName = prompt('Enter a name for your moodboard:');
            if (!moodboardName) {
                showToast('Moodboard name is required.', 'error');
                return;
            }

            try {
                // Check if moodboard name already exists
                const response = await fetch(`/check-moodboard-name/${username}/${encodeURIComponent(moodboardName)}`);
                
                if (!response.ok) {
                    throw new Error(`Server responded with status ${response.status}`);
                }
    
                const data = await response.json();
    
                if (data.exists) {
                    showToast('Moodboard with this name already exists.', 'error');
                    return;
                }
    
            const moodboardImages = Array.from(document.querySelectorAll('#moodboard .image-container')).map(container => {
                const img = container.querySelector('img');
                const position = {
                    top: container.style.top, 
                    left: container.style.left, 
                    width: img.style.width, 
                    height: img.style.height 
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
                sessionStorage.removeItem('newMoodboardImages');
                document.getElementById('moodboard').innerHTML = '';
            })
            .catch(err => {
                console.error('Failed to save moodboard:', err);
                showToast('Error saving moodboard.', 'error');

            });

        } catch (err) {
            console.error('Error checking moodboard name:', err);
            showToast('Error checking moodboard name.', 'error');
        }       
        });
});
});

document.addEventListener('DOMContentLoaded', (event) => {
    const button = document.querySelector('.tiny-button');
    const hoverMessage = document.getElementById('hoverMessage');

    button.addEventListener('mouseover', () => {
        hoverMessage.style.display = 'block';
    });

    button.addEventListener('mouseout', () => {
        hoverMessage.style.display = 'none';
    });
});
