document.addEventListener('DOMContentLoaded', () => {
    const signUp = document.getElementById('sign-up-form');


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
});

