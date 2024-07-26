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

    // ACCOUNT CREATION
    if (signUp) {
        signUp.addEventListener('submit', async (event) => {
            event.preventDefault(); 
            
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/sign-up', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await response.json();

                if (data.success) {
                    showToast('Account created successfully!', 'success');
                    window.location.href = '/login';
                } else {
                    showToast('Account Creation Failed', 'error');
                }
            } catch (error) {
                showToast('An error occurred while creating the account.', 'error');
            }
        });
    }

    // LOGIN
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); 
            
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (data.success) {
                    localStorage.setItem('username', username);
                    showToast('Logged in successfully!', 'success');
                    window.location.href = '/graphic-tees';
                } else {
                    showToast('Incorrect credentials', 'error');
                }
            } catch (error) {
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
    
            addImageToMoodboard(croppedImageSrc);
            hideCropper();
        });
    
        function addImageToMoodboard(imagesrc) {
            const moodboard = document.getElementById('moodboard');
            const imageUrl = String(imagesrc);
    
            const proxyUrl = imageUrl.startsWith('data:') ? imageUrl : `http://localhost:3000/proxy?url=${encodeURIComponent(imageUrl)}`;
    
            const imageContainer = document.createElement('div');
            imageContainer.classList.add('image-container');
            imageContainer.style.position = 'absolute';
            imageContainer.style.left = (50 + imageCounter * 20) + 'px'; 
            imageContainer.style.top = (50 + imageCounter * 20) + 'px';
            imageContainer.style.zIndex = zIndexCounter++;
    
            const img = document.createElement('img');
            img.src = proxyUrl;
            img.classList.add('moodboard-image');
            img.style.width = '200px'; 
            img.style.height = '200px'; 
            img.style.objectFit = 'contain';
    
            // DELETE BUTTON
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '×';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener('click', function() {
                
                removeFromLocalStorage(proxyUrl); 
                imageContainer.remove(); 
            });
    
            // CROP BUTTON
            const cropBtn = document.createElement('button');
            cropBtn.innerHTML = 'Crop';
            cropBtn.classList.add('crop-btn');
            cropBtn.addEventListener('click', function() {
                showCropper(img);
            });
    
            imageContainer.appendChild(img);
            imageContainer.appendChild(deleteBtn);
            imageContainer.appendChild(cropBtn);
    
            moodboard.appendChild(imageContainer);
    
            // IMAGE DRAGGING
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
    
        //REMOVING IMAGE FROM LOCAL STORAGE
        function removeFromLocalStorage(imageUrl) {
            let savedImages = JSON.parse(localStorage.getItem('newMoodboardImages')) || [];
            savedImages = savedImages.filter(item => item.src !== imageUrl); 
            localStorage.setItem('newMoodboardImages', JSON.stringify(savedImages)); 
            console.log('LocalStorage after removal:', JSON.parse(localStorage.getItem('newMoodboardImages')));
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
                        addToLocalStorage(e.target.result);
                    };
                    reader.readAsDataURL(file);
                });
            }
        });
    
        const urlForm = document.getElementById('url-form');
        urlForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const urlInput = event.target.url;
            const url = urlInput.value.trim();
            if (url) {
                addImageToMoodboard(url);
                addToLocalStorage(url);
                urlInput.value = '';
            }
        });
    
        function addToLocalStorage(imageUrl) {
            let savedImages = JSON.parse(localStorage.getItem('newMoodboardImages')) || [];
            savedImages.push(imageUrl);
            localStorage.setItem('newMoodboardImages', JSON.stringify(savedImages));
        }
    
        const savedImages = JSON.parse(localStorage.getItem('newMoodboardImages')) || [];
        savedImages.forEach(imageUrl => {
            addImageToMoodboard(imageUrl);
        });
    
        document.getElementById('save-button').addEventListener('click', async () => {
            const username = localStorage.getItem('username');
            if (!username) {
                showToast('No username found, please log in.', 'error');
                window.location.href = 'login.html';
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
                    // Handle non-200 responses
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
                localStorage.removeItem('newMoodboardImages');
                document.getElementById('moodboard').innerHTML = '';
            })
            .catch(err => {
                showToast('Error saving moodboard.', 'error');
            });
        } catch (err) {
            showToast('Error checking moodboard name.', 'error');
        }
        });
    });
});
