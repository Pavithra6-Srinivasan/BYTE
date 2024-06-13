document.addEventListener('DOMContentLoaded', () => {
    const signUp = document.getElementById('sign-up-form');
    const loginForm = document.getElementById('login-form');
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


  if (uploadForm) {
    uploadForm.addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevent default form submission

      const formData = new FormData(event.target);
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      addImageFolder(data.folderId, data.images);
    });
  }

  if (urlForm) {
    urlForm.addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevent default form submission

      const formData = new FormData(event.target);
      const response = await fetch('/add-url-image', {
        method: 'POST',
        body: JSON.stringify({ url: formData.get('url') }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      addImageFolder(data.folderId, [data.imageUrl]);
    });
  }

  function addImageFolder(folderId, images) {
    const imageGallery = document.getElementById('image-gallery');
    const folder = document.createElement('div');
    folder.classList.add('image-folder');
    folder.setAttribute('draggable', true);
    folder.dataset.folderId = folderId;
    folder.addEventListener('dragstart', handleDragStart);
    folder.addEventListener('dragend', handleDragEnd);

    const folderName = document.createElement('div');
    folderName.classList.add('folder-name');
    folderName.textContent = `Folder ${folderId}`;
    folder.appendChild(folderName);

    images.forEach((imageUrl) => {
      const img = document.createElement('img');
      img.src = imageUrl;
      folder.appendChild(img);
    });

    imageGallery.appendChild(folder);
  }

  function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.outerHTML);
    e.dataTransfer.setData('folderId', e.target.dataset.folderId);
    setTimeout(() => {
      e.target.style.display = 'none';
    }, 0);
  }

  function handleDragEnd(e) {
    e.target.style.display = 'block';
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.target.classList.add('over');
  }

  function handleDragLeave(e) {
    e.target.classList.remove('over');
  }

  async function handleDrop(e) {
    e.preventDefault();
    e.target.classList.remove('over');
    const data = e.dataTransfer.getData('text/plain');
    const folderId = e.dataTransfer.getData('folderId');
    const dropTarget = e.target.closest('.moodboard');

    if (dropTarget) {
      dropTarget.insertAdjacentHTML('beforeend', data);
      const newFolder = dropTarget.lastChild;
      newFolder.addEventListener('dragstart', handleDragStart);
      newFolder.addEventListener('dragend', handleDragEnd);

      // Resize images when dropped into a folder
      const images = newFolder.querySelectorAll('img');
      images.forEach(img => {
        img.style.maxWidth = '150px';
        img.style.maxHeight = '150px';
      });

      // Increase folder size to accommodate images
      newFolder.style.minWidth = '200px';
      newFolder.style.minHeight = '200px';

      // Remove the folder from the gallery
      const folderToRemove = document.querySelector(`.image-folder[data-folder-id='${folderId}']`);
      if (folderToRemove) {
        folderToRemove.remove();
      }

      // Delete folder from database
      try {
        const response = await fetch(`/delete-folder/${folderId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete folder');
        }
        console.log('Folder deleted');
      } catch (err) {
        console.error(err);
      }
    }
  }

  function createNewFolder() {
    const moodboard = document.getElementById('moodboard');
    const newFolder = document.createElement('div');
    newFolder.classList.add('image-folder');
    newFolder.setAttribute('draggable', true);
    newFolder.dataset.folderId = `folder-${Date.now()}`;
    newFolder.addEventListener('dragstart', handleDragStart);
    newFolder.addEventListener('dragend', handleDragEnd);

    const folderName = document.createElement('div');
    folderName.classList.add('folder-name');
    folderName.contentEditable = true;
    folderName.textContent = 'New Folder';
    newFolder.appendChild(folderName);

    moodboard.appendChild(newFolder);
  }

  document.querySelector('.add-folder').addEventListener('click', createNewFolder);

  const moodboard = document.getElementById('moodboard');
  moodboard.addEventListener('dragover', handleDragOver);
  moodboard.addEventListener('dragleave', handleDragLeave);
  moodboard.addEventListener('drop', handleDrop);
});

  if (productsForm) {
    // Fetch product data from the server when the page loads
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
}

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

        const price = document.createElement('p');
        price.textContent = `Price: ${product.price}`;

        const availability = document.createElement('p');
        availability.textContent = `Availability: ${product.availability}`;

        productItem.appendChild(title);
        productItem.appendChild(price);
        productItem.appendChild(availability);

        productList.appendChild(productItem);
    });
};