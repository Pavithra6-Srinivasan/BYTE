
const createAccountForm = document.getElementById('create-account-form');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email'); // Added for email input
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('login-btn');

// const createAccountForm = document.getElementById('create-account-form');
// const loginButton = document.getElementById('login-btn');


// if (createAccountForm) {
//   const usernameInput = document.getElementById('username');
//   const emailInput = document.getElementById('email');
//   const passwordInput = document.getElementById('password');

//   createAccountForm.addEventListener('submit', async (event) => {
//     event.preventDefault();

//     const username = usernameInput.value.trim();
//     const email = emailInput.value.trim();
//     const password = passwordInput.value;

//     // Basic validation (optional, improve based on your needs)
//     if (!username || !email || !password) {
//       alert('Please fill in all fields');
//       return;
//     }

//     const data = {
//       username,
//       email,
//       password
//     };

//     try {
//       const response = await fetch('http://localhost:3000/submit', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(data)
//       });

//       if (response.ok) {
//         const responseData = await response.json();
//         if (responseData.success) {
//           alert('Account created successfully!');
//           // Optionally redirect to login page after successful creation
//           // window.location.href = '/login';
//         } else {
//           alert('Failed to create account: ' + responseData.error);
//         }
//       } else {
//         console.error('Error sending create account request:', response.statusText);
//         alert('Error creating account. Please try again later.');
//       }
//     } catch (error) {
//       console.error('Error creating account:', error);
//       alert('Error creating account. Please try again later.');
//     }
//   });
  const username = usernameInput.value;
  const email = emailInput.value; // Added for email input
  const password = passwordInput.value;

  createAccountForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission
  
  try {
    const response = await fetch('/create-account3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }) // Updated to include email
    });

    const data = await response.json();

    if (data.success) {
      console.log('Account Created!');
      // Replace with your success message and potentially redirect to login page
      alert('Account created successfully!');
      // window.location.href = '/login'; // Uncomment to redirect on success
    } else {
      console.error('Account Creation Failed:', data.error);
      // Display error message to the user (e.g., alert(data.error))
    }
  } catch (error) {
    console.error('Error creating account:', error);
    // Display an error message to the user (e.g., alert('An error occurred...'))
  }
})

// });
// } else if (loginButton) {
// const usernameInput = document.getElementById('username');
// const passwordInput = document.getElementById('password');

// loginButton.addEventListener('click', async (event) => {
//   event.preventDefault();
  
//   const username = usernameInput.value.trim();
//   const password = passwordInput.value.trim();

//   if (!username || !password) {
//     alert('Please enter username and password');
//     return;
//   }

//   const data = {
//     username,
//     password
//   };

//   try {
//     const response = await fetch('login', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(data)
//     });

//     if (response.ok) {
//       const responseData = await response.json();
//       if (responseData.success) {
//         alert('Login successful!');
//         // Perform actions after successful login (e.g., redirect)
//       } else {
//         alert('Login failed: ' + responseData.error);
//       }
//     } else {
//       console.error('Error sending login request:', response.statusText);
//       alert('Login failed. Please try again later.');
//     }
//   } catch (error) {
//     console.error('Error during login:', error);
//     alert('Login failed. Please try again later.');
//   }
// });
// } else {
// console.error('Script.js: No create account form or login button found');
// }

