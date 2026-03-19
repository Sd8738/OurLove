// security.js - Screenshot & Recording Deterrents

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Disable Right-Click Context Menu
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showLoveMessage("This is just for us, my love 💕");
    });
    
    // 2. Disable Common Keyboard Shortcuts
    document.addEventListener('keydown', function(e) {
        // PrintScreen key
        if (e.key === 'PrintScreen') {
            e.preventDefault();
            showLoveMessage("Let's keep these memories in our hearts 💕");
        }
        
        // Ctrl+S (Save), Ctrl+P (Print), Ctrl+Shift+I (DevTools)
        // Cmd+S, Cmd+P, Cmd+Option+I for Mac
        if ((e.ctrlKey || e.metaKey) && (
            e.key === 's' || 
            e.key === 'p' || 
            (e.shiftKey && e.key === 'I') // Ctrl+Shift+I / Cmd+Option+I
        )) {
            e.preventDefault();
            showLoveMessage("Please enjoy our moments here directly, my love.");
        }
        
        // F12 Developer Tools
        if (e.key === 'F12') {
            e.preventDefault();
            showLoveMessage("No peeking behind the scenes! 😉");
        }

        // Cmd+Shift+4 (Mac screenshot to clipboard) - not reliably preventable via JS
        // Cmd+Shift+3 (Mac screenshot to file) - not reliably preventable via JS
    });
    
    // 3. CSS-based Image Protection
    // This is handled by CSS in style.css and responsive.css (.protected-content, img user-drag, etc.)
    // No JS needed to apply these once classes are in HTML/CSS.

    // 4. Detect Developer Tools opening (some basic methods)
    // This is less reliable and can be easily bypassed. The F12 keydown is more direct.
    /*
    const devtools = /./;
    devtools.toString = function() {
        this.opened = true;
        showLoveMessage("Our story is best viewed as intended, my love.");
    };
    setInterval(function() {
        console.log(devtools);
        if (devtools.opened) {
            // Take action if devtools opened (e.g., redirect, blur content)
            // window.location.href = 'about:blank'; // Extreme
            devtools.opened = false;
        }
    }, 1000);
    */
});

// Function to show a temporary love message
function showLoveMessage(message) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(192, 77, 110, 0.95);
        color: white;
        padding: 30px 50px;
        border-radius: 20px;
        font-family: 'Playfair Display', serif;
        font-size: 18px;
        z-index: 10000;
        animation: fadeInOut 2s ease forwards; /* Defined in animations.css */
        text-align: center;
        max-width: 90%;
    `;
    overlay.textContent = message;
    document.body.appendChild(overlay);
    
    setTimeout(() => overlay.remove(), 2000); // Remove after animation
}