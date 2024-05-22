document.addEventListener('DOMContentLoaded', async () => {
    const profileInfo = document.getElementById('profile-info');
    
    try {
        const response = await fetch('/profile');
        if (response.ok) {
            const data = await response.json();
            profileInfo.innerHTML = `<p>Hello, ${data.name}</p>`;
        } else {
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error fetching profile data:', error);
        window.location.href = '/';
    }
});
