// effects.js - Beautiful visual effects for the romantic website

class VisualEffects {
    constructor() {
        this.init();
    }

    init() {
        this.createParticles();
        this.createFloatingElements();
        this.initCursorEffect();
        this.initScrollEffects();
        this.initParallax();
    }

    createParticles() {
        const container = document.getElementById('particles');
        if (!container) return;

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                animation-delay: ${Math.random() * 5}s;
                animation-duration: ${Math.random() * 10 + 10}s;
            `;
            container.appendChild(particle);
        }
    }

    createFloatingElements() {
        const container = document.getElementById('floatingElements');
        if (!container) return;

        const elements = ['💕', '💖', '💗', '💝', '❤️', '✨', '💫', '🌸'];
        
        for (let i = 0; i < 15; i++) {
            const el = document.createElement('div');
            el.className = 'floating-element';
            el.textContent = elements[Math.floor(Math.random() * elements.length)];
            el.style.cssText = `
                left: ${Math.random() * 100}%;
                animation-delay: ${Math.random() * 20}s;
                animation-duration: ${Math.random() * 15 + 15}s;
                font-size: ${Math.random() * 20 + 15}px;
            `;
            container.appendChild(el);
        }
    }

    initCursorEffect() {
        const cursorHeart = document.getElementById('cursorHeart');
        if (!cursorHeart) return;

        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const animate = () => {
            cursorX += (mouseX - cursorX) * 0.1;
            cursorY += (mouseY - cursorY) * 0.1;
            
            cursorHeart.style.left = cursorX + 'px';
            cursorHeart.style.top = cursorY + 'px';
            
            requestAnimationFrame(animate);
        };
        animate();

        // Create trail effect on click
        document.addEventListener('click', (e) => {
            this.createHeartBurst(e.clientX, e.clientY);
        });
    }

    createHeartBurst(x, y) {
        const hearts = ['💕', '💖', '💗', '❤️', '💝'];
        
        for (let i = 0; i < 8; i++) {
            const heart = document.createElement('div');
            heart.className = 'burst-heart';
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                font-size: ${Math.random() * 15 + 10}px;
                pointer-events: none;
                z-index: 9999;
            `;
            document.body.appendChild(heart);

            const angle = (Math.PI * 2 * i) / 8;
            const velocity = Math.random() * 80 + 40;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;

            heart.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${vx}px, ${vy}px) scale(0)`, opacity: 0 }
            ], {
                duration: 800,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            });

            setTimeout(() => heart.remove(), 800);
        }
    }

    initScrollEffects() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });

        // Navbar scroll effect
        let lastScroll = 0;
        const navbar = document.getElementById('navbar');
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            if (currentScroll > lastScroll && currentScroll > 500) {
                navbar.classList.add('hidden');
            } else {
                navbar.classList.remove('hidden');
            }
            
            lastScroll = currentScroll;
        });
    }

    initParallax() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax');
            
            parallaxElements.forEach(el => {
                const speed = el.dataset.speed || 0.5;
                el.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }
}

// Initialize effects
document.addEventListener('DOMContentLoaded', () => {
    new VisualEffects();
});