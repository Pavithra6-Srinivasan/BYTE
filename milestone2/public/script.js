document.addEventListener('DOMContentLoaded', () => {
    const signUp = document.getElementById('sign-up-form');
    const loginForm = document.getElementById('login-form');
    const saveForm = document.getElementById('save-form');
    const uploadForm = document.getElementById('upload-form');
    const urlForm = document.getElementById('url-form');
    const productsForm = document.getElementById('products-form');
   
    
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
                    window.location.href = '/deposit.html';
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
//----------------------upload script--------------------------------------------------------


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
  function saveMoodboard() {
    const moodboardImages = Array.from(moodboard.querySelectorAll('.moodboard-image')).map(img => img.src);
    localStorage.setItem('newMoodboardImages', JSON.stringify(moodboardImages));
    alert('Moodboard saved');

}
saveButton.addEventListener('click', saveMoodboard);

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
  const newMoodboardImages = JSON.parse(localStorage.getItem('newMoodboardImages')) || [];
  newMoodboardImages.forEach(imageUrl => {
      addImageToMoodboard(imageUrl);
  });

  // Event listeners for drag and drop
  moodboard.addEventListener('dragover', handleDragOver);
  moodboard.addEventListener('drop', handleDrop);


///////////////////////////////----------end copy---------///////////////////////////////////

//------------------------save-all-images-to-database-----------------------------------



if (saveForm) {
  saveForm.addEventListener('submit', (event) => {
      event.preventDefault(); // Prevent default form submission


function extractImagesFromPage() {
  const images = Array.from(document.querySelectorAll('img')).map(img => img.src);
  return images;
}

// Example function to send images to the server
function sendImagesToServer(images) {
  fetch('/save-images', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ images })
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Failed to save images');
      }
      return response.json();
  })
  .then(data => {
      console.log('Images saved successfully:', data);
  })
  .catch(error => {
      console.error('Error saving images:', error);
  });
}
const images = extractImagesFromPage();
sendImagesToServer(images);

  })};

//---------products script--------------------------------------------------------
  

if (productsForm) {
    // Fetch product data from the server when the page loads
    productsForm.addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevent default form submission
    fetch('/products')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Display product data on the page
            displayProducts(data);
        })
        .catch(error => {
            console.error('Error fetching product data:', error);
        });

     fetch('/products2')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Display product data on the page
            displayProducts(data);
        })
        .catch(error => {
            console.error('Error fetching product data:', error);
        });


function displayProducts(products) {
    const productList = document.getElementById('product-list');
    

    // Clear any existing product items
    productList.innerHTML = '';
   

    // Iterate over each product and create HTML elements to display them
    products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.classList.add('product-item');

      

        const title = document.createElement('h3');
        title.textContent = product.title;

        const pricing = document.createElement('p');
        pricing.textContent = `Pricing: ${product.pricing}`;

        const colour= document.createElement('p');
        colour.textContent = `colour: ${product.colour}`;

        productItem.appendChild(title);
        productItem.appendChild(pricing);
        productItem.appendChild(colour);

        productList.appendChild(productItem);
       
    })}

  })};
});