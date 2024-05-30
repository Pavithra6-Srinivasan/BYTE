document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.content .page');

    const loadContent = async (url, targetId) => {
        try {
            const response = await fetch(url);
            const content = await response.text();
            document.getElementById(targetId).innerHTML = content;
        } catch (error) {
            console.error('Error loading content:', error);
        }
    };

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all pages
            pages.forEach(page => {
                page.classList.remove('active');
                page.style.display = 'none';
            });

            // Get the target page id from the button id
            const targetId = this.id.replace('btn-', '');
            const targetPage = document.getElementById(targetId);

            // Add active class to the target page
            targetPage.classList.add('active');
            targetPage.style.display = 'block';

            // Load content for new-moodboard and saved-moodboard
            if (targetId === 'new-moodboard' || targetId === 'saved-moodboard') {
                const url = targetId === 'new-moodboard' ? 'new_m.html' : 'saved_m.html';
                loadContent(url, targetId);
            }
        });
    });

    // Default to showing the first page
    document.getElementById('deposit').classList.add('active');
    document.getElementById('deposit').style.display = 'block';
});
