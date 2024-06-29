document.addEventListener('DOMContentLoaded', () => {
    const signUp = document.getElementById('sign-up-form');
    const loginForm = document.getElementById('login-form');
    const saveButton = document.getElementById('save-button');
    const uploadForm = document.getElementById('upload-form');
    const urlForm = document.getElementById('url-form');
    const productsForm = document.getElementById('products-form');
    const imageGallery = document.getElementById('image-gallery');
    const moodboard = document.getElementById('moodboard');
   
    
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
//----------------------upload script--------------------------------------------------------

// function addImageToMoodboard(imageUrl) {
//     const imgContainer = document.createElement('div');
//     imgContainer.classList.add('moodboard-image-container');

//     const img = document.createElement('img');
//     img.src = imageUrl;
//     img.classList.add('moodboard-image');
//     $(imgContainer).append(img);

//     const deleteBtn = document.createElement('button');
//     deleteBtn.classList.add('delete-btn');
//     deleteBtn.addEventListener('click', () => {
//         imgContainer.remove(); // Remove the entire container when delete button is clicked
//         saveMoodboard(); // Update localStorage after deletion
//     });
//     imgContainer.appendChild(deleteBtn);

//     $(imgContainer).draggable({
//         containment: 'parent',
//         scroll: false
//     });

//     document.getElementById('moodboard').appendChild(imgContainer);
// }


// // // Add image to moodboard
// // function addImageToMoodboard(imageUrl) {
// //     const img = document.createElement('img');
// //     img.src = imageUrl;
// //     img.classList.add('moodboard-image');
// //     img.style.left = '0px';
// //     img.style.top = '0px';
// //     img.style.width = '100px';
// //     img.style.height = '100px';
// //     $(img).resizable();
// //     $(img).draggable({ containment: "parent" });
   
    

// //     moodboard.appendChild(img);
// // }



// // Save moodboard to localStorage
// function saveMoodboard() {
//     const moodboardImages = Array.from(moodboard.querySelectorAll('.moodboard-image')).map(img => img.src);
//     localStorage.setItem('newMoodboardImages', JSON.stringify(moodboardImages));
//     alert('Moodboard saved');
// }

// if (uploadForm) {
//     uploadForm.addEventListener('submit', (event) => {
//         event.preventDefault();
//         const files = event.target.images.files;
//         if (files.length > 0) {
//             Array.from(files).forEach(file => {
//                 const reader = new FileReader();
//                 reader.onload = function(e) {
//                     addImageToMoodboard(e.target.result);
//                 };
//                 reader.readAsDataURL(file);
//             });
//         }
//     });
// }

// if (urlForm) {
//     urlForm.addEventListener('submit', (event) => {
//         event.preventDefault();
//         const urlInput = event.target.url;
//         const url = urlInput.value.trim();
//         if (url) {
//             addImageToMoodboard(url);
//             urlInput.value = '';
//         }
//     });
// }

// const newMoodboardImages = JSON.parse(localStorage.getItem('newMoodboardImages')) || [];
// newMoodboardImages.forEach(imageUrl => {
//     addImageToMoodboard(imageUrl);
// });

// saveButton.addEventListener('click', saveMoodboard);

$(document).ready(function() {
    let zIndexCounter = 1; // For managing stacking order of images

    // Function to add image to moodboard
    function addImageToMoodboard(imageUrl) {
        const moodboard = document.getElementById('moodboard');

        // Create image container
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('image-container');
        imageContainer.style.position = 'absolute';
        imageContainer.style.left = '50px'; // Example initial position
        imageContainer.style.top = '50px'; // Example initial position
        imageContainer.style.zIndex = zIndexCounter++;

        // Create image element
        const img = document.createElement('img');
        img.src = imageUrl;
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
            removeFromLocalStorage(imageUrl); // Remove image from localStorage
        });

        // Append image and delete button to container
        imageContainer.appendChild(img);
        imageContainer.appendChild(deleteBtn);

        // Append image container to moodboard
        moodboard.appendChild(imageContainer);

        // Make image container draggable using jQuery UI
        $(imageContainer).draggable({
            containment: 'parent',
            scroll: false // Disable scrolling while dragging
        });
        $(img).resizable({
            aspectRatio: true, // Maintain aspect ratio while resizing
            // minWidth: 50, // Minimum width allowed
            // minHeight: 50, // Minimum height allowed
            handles: 'n, e, s, w, ne, se, sw, nw' // Show resize handles on all sides
        });
        // deleteBtn.style.top = '5px'; // Adjust as needed
        // deleteBtn.style.right = '5px'; // Adjust as needed
    }

    // Function to remove image URL from localStorage
    function removeFromLocalStorage(imageUrl) {
        let savedImages = JSON.parse(localStorage.getItem('newMoodboardImages')) || [];
        savedImages = savedImages.filter(url => url !== imageUrl); // Filter out the deleted image URL
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
});


///////////////////////////////----------end copy---------///////////////////////////////////

//------------------------save-all-images-to-database-----------------------------------

// function saveMoodboard() {
//     const moodboardImages = Array.from(moodboard.querySelectorAll('.moodboard-image')).map(img => img.src);
//     const name = prompt('Enter a name for your moodboard:');
//     if (!name) return alert('Moodboard name is required.');

//     fetch('/save-moodboard', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ name, images: moodboardImages })
//     })
//     .then(response => response.text())
//     .then(data => {
//         alert(data);
//     })
//     .catch(error => {
//         console.error('Error saving moodboard:', error);
//         alert('Failed to save moodboard.');
//     });
// }
//---------get personalised moodboards-------------------------------------------------------
  
document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    if (!username) {
        alert('No username found, please log in.');
        window.location.href = 'login.html'; // Redirect to login if no username found
        return;
    }

    fetch(`/list-moodboards/${username}`)
        .then(response => response.json())
        .then(moodboards => {
            const savedMoodboardsContainer = document.getElementById('saved-moodboards');
            moodboards.forEach(name => {
                const moodboardBox = document.createElement('div');
                moodboardBox.classList.add('moodboard-box');
                moodboardBox.innerHTML = `<h3>${name}</h3>`;
                savedMoodboardsContainer.appendChild(moodboardBox);

                fetch(`/moodboard/${username}/${name}`)
                    .then(response => response.json())
                    .then(data => {
                        data.images.forEach(imageUrl => {
                            const img = document.createElement('img');
                            img.src = imageUrl;
                            moodboardBox.appendChild(img);
                        });
                    })
                    .catch(err => {
                        console.error(`Failed to load moodboard ${name}:`, err);
                        moodboardBox.innerHTML += '<p>Error loading moodboard.</p>';
                    });
            });
        })
        .catch(err => {
            console.error('Failed to fetch moodboards:', err);
            document.getElementById('saved-moodboards').innerHTML = '<p>Error fetching saved moodboards.</p>';
        });
});

document.getElementById('save-button').addEventListener('click', () => {
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

    const moodboardImages = Array.from(document.querySelectorAll('#moodboard .moodboard-image')).map(img => img.src);

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
    })
    .catch(err => {
        console.error('Failed to save moodboard:', err);
        alert('Error saving moodboard.');
    });
});


//---------------------products script-------------------------------------

// if (productsForm) {
//     // Fetch product data from the server when the page loads
//     productsForm.addEventListener('submit', async (event) => {
//       event.preventDefault(); // Prevent default form submission
//     fetch('/products')
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
//             return response.json();
//         })
//         .then(data => {
//             // Display product data on the page
//             displayProducts(data);
//         })
//         .catch(error => {
//             console.error('Error fetching product data:', error);
//         });

//      fetch('/products2')
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
//             return response.json();
//         })
//         .then(data => {
//             // Display product data on the page
//             displayProducts(data);
//         })
//         .catch(error => {
//             console.error('Error fetching product data:', error);
//         });


// function displayProducts(products) {
//     const productList = document.getElementById('product-list');
    

//     // Clear any existing product items
//     productList.innerHTML = '';
   

//     // Iterate over each product and create HTML elements to display them
//     products.forEach(product => {
//         const productItem = document.createElement('div');
//         productItem.classList.add('product-item');

      

//         const title = document.createElement('h3');
//         title.textContent = product.title;

//         const pricing = document.createElement('p');
//         pricing.textContent = `Pricing: ${product.pricing}`;

//         const colour= document.createElement('p');
//         colour.textContent = `colour: ${product.colour}`;

//         productItem.appendChild(title);
//         productItem.appendChild(pricing);
//         productItem.appendChild(colour);

//         productList.appendChild(productItem);
       
//     })}

//   })};
// });
});