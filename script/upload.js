
document.addEventListener('DOMContentLoaded', () => {
    
    const uploadForm = document.getElementById('upload-form');
    const urlForm = document.getElementById('url-form');
   

    const moodboard = document.getElementById('moodboard');

    if (uploadForm) {
        uploadForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission

            const files = event.target.images.files;
            if (files.length > 0) {
                Array.from(files).forEach(file => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        addImageToMoodboard(e.target.result);
                    };
                    reader.readAsDataURL(file);
                });
            }
        });
    }

    if (urlForm) {
    urlForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission

        const urlInput = event.target.url; // Get the URL input element
        const url = urlInput.value.trim(); // Get and trim the entered URL

        if (url) {
            addImageToMoodboard(url);
            urlInput.value = ''; // Clear the URL input field
        }
    });
    }


    // Function to add an image to the moodboard
    function addImageToMoodboard(imageUrl) {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.classList.add('moodboard-image'); // Add class for styling
        img.setAttribute('draggable', true);
        img.addEventListener('dragstart', handleDragStart);
        img.addEventListener('dragend', handleDragEnd);
        img.style.position = 'absolute'; // Allow positioning within moodboard
        img.addEventListener('mousedown', handleImageMouseDown); // Add event listener for resizing
        moodboard.appendChild(img);
    }

    // Drag and drop functionality
    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', ''); // Set empty data to initiate drag
        e.dataTransfer.setDragImage(e.target, 0, 0); // Set the image itself as drag image
        e.target.classList.add('dragging');
        e.dataTransfer.setData('text/html', e.target.outerHTML); // Set the dragged element's HTML
    }

    function handleDragEnd(e) {
        e.target.style.opacity = ''; // Reset opacity of dragged element
        e.target.classList.remove('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    function handleDrop(e) {
        e.preventDefault();
        const dragging = document.querySelector('.dragging');
        if (dragging && e.target.closest('#moodboard')) {
            const moodboardRect = moodboard.getBoundingClientRect();
            const offsetX = e.clientX - moodboardRect.left - dragging.offsetWidth / 2;
            const offsetY = e.clientY - moodboardRect.top - dragging.offsetHeight / 2;

            dragging.style.left = `${offsetX}px`;
            dragging.style.top = `${offsetY}px`;
        }
    }

    // Resize functionality
    function handleImageMouseDown(e) {
        const image = e.target;
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const imageRect = image.getBoundingClientRect();

        // Calculate positions of corners
        const topLeft = {
            x: imageRect.left,
            y: imageRect.top
        };
        const bottomRight = {
            x: imageRect.right,
            y: imageRect.bottom
        };

        // Check if mouse click is within a resize handle area
        const resizeHandleSize = 10; // Adjust size as needed
        const withinTopLeft = mouseX >= topLeft.x && mouseX <= topLeft.x + resizeHandleSize &&
                            mouseY >= topLeft.y && mouseY <= topLeft.y + resizeHandleSize;
        const withinBottomRight = mouseX >= bottomRight.x - resizeHandleSize && mouseX <= bottomRight.x &&
                                mouseY >= bottomRight.y - resizeHandleSize && mouseY <= bottomRight.y;

        if (withinTopLeft || withinBottomRight) {
            document.addEventListener('mousemove', handleImageResize);
            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', handleImageResize);
            });
        }
    }

    function handleImageResize(event) {
        const image = document.querySelector('.moodboard-image');
        if (!image) return;

        const mouseX = event.clientX;
        const mouseY = event.clientY;
        const imageRect = image.getBoundingClientRect();
        const initialWidth = image.offsetWidth;
        const initialHeight = image.offsetHeight;

        if (mouseX < imageRect.left + image.offsetWidth / 2) {
            // Resize from left/top corner
            const newWidth = initialWidth - (mouseX - imageRect.left);
            const newHeight = initialHeight - (mouseY - imageRect.top);
            image.style.width = `${newWidth}px`;
            image.style.height = `${newHeight}px`;
            image.style.left = `${mouseX}px`;
            image.style.top = `${mouseY}px`;
        } else {
            // Resize from right/bottom corner
            const newWidth = initialWidth + (mouseX - imageRect.right);
            const newHeight = initialHeight + (mouseY - imageRect.bottom);
            image.style.width = `${newWidth}px`;
            image.style.height = `${newHeight}px`;
        }
    }

    // Event listeners for drag and drop
    moodboard.addEventListener('dragover', handleDragOver);
    moodboard.addEventListener('drop', handleDrop);

});
