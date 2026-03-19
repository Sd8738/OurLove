// animations.js - Hidden romantic elements and dynamic effects

class RomanticSurprises {
    constructor() {
        this.init();
    }

    init() {
        this.createSecretMessage();
        this.createHeartExplosion();
        this.createKonamiCode();
        this.createClickCounter();
    }

    // Secret message when clicking a specific element 3 times
    createSecretMessage() {
        let clickCount = 0;
        const trigger = document.querySelector('.couple-names'); // Example trigger
        
        if (trigger) {
            trigger.style.cursor = 'pointer'; // Indicate it's clickable
            trigger.addEventListener('click', () => {
                clickCount++;
                if (clickCount === 3) {
                    this.showSecretPopup();
                    clickCount = 0; // Reset count after showing
                }
            });
        }
    }

    showSecretPopup() {
        const popup = document.createElement('div');
        popup.className = 'secret-popup';
        popup.innerHTML = `
            <div class="secret-content">
                <span class="secret-heart">💕</span>
                <h2>You Found a Secret!</h2>
                <p>I love you more than words can express. 
                   Every moment with you is a treasure.</p>
                <button onclick="this.parentElement.parentElement.remove()">
                    I Love You Too 💕
                </button>
            </div>
        `;
        document.body.appendChild(popup);
    }

    // Heart explosion on double click anywhere
    createHeartExplosion() {
        document.addEventListener('dblclick', (e) => {
            for (let i = 0; i < 20; i++) {
                this.createDynamicHeart(e.clientX, e.clientY);
            }
        });
    }

    createDynamicHeart(x, y) {
        const heart = document.createElement('span');
        heart.innerHTML = ['❤️', '💕', '💖', '💗', '💝'][Math.floor(Math.random() * 5)];
        heart.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            font-size: ${Math.random() * 20 + 15}px;
            pointer-events: none;
            z-index: 10000;
        `;
        document.body.appendChild(heart);

        // Random direction for explosion
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 100 + 50;
        const endX = Math.cos(angle) * velocity;
        const endY = Math.sin(angle) * velocity;

        heart.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${endX}px, ${endY}px) scale(0)`, opacity: 0 }
        ], {
            duration: 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });

        setTimeout(() => heart.remove(), 1000);
    }

    // Konami Code Easter Egg (↑↑↓↓←→←→BA)
    createKonamiCode() {
        const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 
                      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 
                      'b', 'a'];
        let index = 0;

        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === code[index]) { // Case-insensitive for letters
                index++;
                if (index === code.length) {
                    this.triggerKonami();
                    index = 0; // Reset after trigger
                }
            } else {
                index = 0; // Reset if incorrect key
            }
        });
    }

    triggerKonami() {
        // Special surprise - fireworks of hearts
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 10000;
        `;
        document.body.appendChild(container);

        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                const heart = document.createElement('span');
                heart.innerHTML = '💕';
                heart.style.cssText = `
                    position: absolute;
                    left: ${Math.random() * 100}%;
                    bottom: -50px;
                    font-size: ${Math.random() * 30 + 20}px;
                    animation: fireworkHeart ${Math.random() * 2 + 2}s ease forwards;
                    animation-delay: ${i * 0.05}s; /* Stagger effect */
                `;
                container.appendChild(heart);
            }, i * 50);
        }

        setTimeout(() => container.remove(), 5000 + (100 * 50)); // Clear after all hearts finish
    }

    // I Love You counter
    createClickCounter() {
        let loveCount = parseInt(localStorage.getItem('loveClicks')) || 0;
        
        const counter = document.createElement('div');
        counter.id = 'love-counter-widget'; // Renamed to avoid conflict if any other 'love-counter' exists
        counter.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 30px;
            background: white;
            padding: 15px 25px;
            border-radius: 50px;
            box-shadow: 0 5px 20px rgba(192, 77, 110, 0.2);
            cursor: pointer;
            z-index: 100;
            transition: transform 0.3s ease;
            display: flex;
            align-items: center;
            gap: 5px;
        `;
        counter.innerHTML = `
            <span style="font-size: 20px;">❤️</span>
            <span id="love-count-display" style="color: var(--deep-rose); font-weight: bold;">${loveCount}</span>
            <span style="color: var(--text-medium); font-size: 12px;"> love taps</span>
        `;
        document.body.appendChild(counter);

        counter.addEventListener('click', () => {
            loveCount++;
            localStorage.setItem('loveClicks', loveCount);
            document.getElementById('love-count-display').textContent = loveCount;
            counter.style.transform = 'scale(1.1)';
            setTimeout(() => counter.style.transform = 'scale(1)', 200);
            
            // Create mini heart animation
            const miniHeart = document.createElement('span');
            miniHeart.textContent = '💕';
            miniHeart.style.cssText = `
                position: absolute; /* Position relative to the counter */
                left: 10px; /* Adjust as needed */
                top: -20px; /* Start above the counter */
                font-size: 16px;
                pointer-events: none;
                animation: floatAway 1s ease forwards;
                z-index: 101; /* Above counter */
            `;
            counter.appendChild(miniHeart);
            setTimeout(() => miniHeart.remove(), 1000);
        });
    }
}

// Initialize surprises when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new RomanticSurprises();
});