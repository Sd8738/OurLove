// password.js

// Set your password here
// For better security, consider server-side authentication if hosting allows (e.g., Netlify's password protection)
const correctPassword = "14062022"; // Customize: DDMMYYYY (e.g., June 14, 2022)

function checkPassword() {
    const input = document.getElementById('passwordInput').value;
    const errorMsg = document.getElementById('errorMsg');
    const passwordContainer = document.querySelector('.password-container');
    
    if (input === correctPassword) {
        // Success animation
        document.body.style.transition = 'opacity 0.5s ease-out';
        document.body.style.opacity = '0';
        
        setTimeout(() => {
            window.location.href = 'home.html'; // Redirect to your main site
        }, 500); // Wait for the fade-out animation to complete
    } else {
        errorMsg.style.display = 'block';
        // Trigger shake animation for incorrect password
        passwordContainer.style.animation = 'none'; // Reset animation
        void passwordContainer.offsetWidth; // Trigger reflow
        passwordContainer.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            passwordContainer.style.animation = ''; // Remove animation after it finishes
        }, 500);
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        checkPassword();
    }
}