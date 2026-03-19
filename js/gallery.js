// gallery.js - Beautiful Lightbox Gallery

class RomanticGallery {
    constructor() {
        this.currentIndex = 0;
        this.images = [];
        this.lightbox = null;
        this.lightboxImage = null;
        this.lightboxCaption = null;
        this.lightboxCounter = null;
        this.init();
    }

    init() {
        this.setupGalleryItems();
        if (this.images.length > 0) {
            this.lightbox = document.getElementById('romantic-lightbox'); // Assuming it exists in home.html
            this.lightboxImage = this.lightbox.querySelector('.lightbox-image');
            this.lightboxCaption = this.lightbox.querySelector('.lightbox-caption');
            this.lightboxCounter = this.lightbox.querySelector('.lightbox-counter');
            this.setupLightboxEvents();
        }
    }

    setupGalleryItems() {
        const items = document.querySelectorAll('.gallery-item');
        items.forEach((item, index) => {
            const img = item.querySelector('img');
            const captionElement = item.querySelector('.gallery-overlay p');
            
            this.images.push({
                src: img.src,
                caption: captionElement ? captionElement.textContent : ''
            });

            item.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default link behavior if any
                this.open(index);
            });
        });
    }

    setupLightboxEvents() {
        this.lightbox.querySelector('.lightbox-overlay').addEventListener('click', () => this.close());
        this.lightbox.querySelector('.lightbox-close').addEventListener('click', () => this.close());
        this.lightbox.querySelector('.lightbox-prev').addEventListener('click', (e) => { e.stopPropagation(); this.prev(); });
        this.lightbox.querySelector('.lightbox-next').addEventListener('click', (e) => { e.stopPropagation(); this.next(); });
        
        this.setupKeyboardNav();
        this.setupTouchGestures();
    }

    setupKeyboardNav() {
        document.addEventListener('keydown', (e) => {
            if (!this.lightbox.classList.contains('active')) return;
            
            if (e.key === 'Escape') this.close();
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });
    }

    setupTouchGestures() {
        let touchStartX = 0;
        let touchStartY = 0;
        let isSwiping = false;

        this.lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            isSwiping = false; // Reset swipe state
        }, { passive: true });

        this.lightbox.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) { // Only consider single touch for swipe
                const touchEndX = e.touches[0].clientX;
                const touchEndY = e.touches[0].clientY;
                const diffX = touchStartX - touchEndX;
                const diffY = touchStartY - touchEndY;

                // Determine if it's a horizontal swipe
                if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) { // Threshold for horizontal swipe
                    isSwiping = true;
                    e.preventDefault(); // Prevent vertical scrolling while swiping horizontally
                }
            }
        }, { passive: false }); // Use passive: false to allow preventDefault

        this.lightbox.addEventListener('touchend', (e) => {
            if (!isSwiping) return; // Only process if a swipe was detected

            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;

            if (diff > 50) { // Swiped left
                this.next();
            } else if (diff < -50) { // Swiped right
                this.prev();
            }
            isSwiping = false; // Reset for next interaction
        });
    }

    open(index) {
        this.currentIndex = index;
        this.lightbox.classList.add('active');
        
        setTimeout(() => {
            this.lightbox.classList.add('visible');
        }, 10);

        this.updateImage();
        document.body.style.overflow = 'hidden'; // Prevent body scroll
    }

    close() {
        this.lightbox.classList.remove('visible');
        
        setTimeout(() => {
            this.lightbox.classList.remove('active');
            this.lightboxImage.src = ''; // Clear image src
        }, 400); // Match CSS transition duration

        document.body.style.overflow = ''; // Restore body scroll
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateImage();
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateImage();
    }

    updateImage() {
        const image = this.images[this.currentIndex];
        
        this.lightboxImage.src = image.src;
        // Trigger imageReveal animation
        this.lightboxImage.style.animation = 'none'; // Reset animation
        void this.lightboxImage.offsetWidth; // Trigger reflow
        this.lightboxImage.style.animation = 'imageReveal 0.5s ease';

        this.lightboxCaption.textContent = image.caption;
        this.lightboxCounter.textContent = 
            `${this.currentIndex + 1} / ${this.images.length} 💕`;
    }
}

// Initialize the gallery when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new RomanticGallery();
});