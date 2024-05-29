// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get references to the form elements
    const signUp = document.getElementById('sign-up-form');
    const loginForm = document.getElementById('login-form');
    
    // Handle the create account form submission
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
                    // Redirect to login page if needed
                    // window.location.href = '/login';
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

    // Handle the login form submission
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
                    // Redirect to a different page if needed
                    // window.location.href = '/dashboard';
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
});
