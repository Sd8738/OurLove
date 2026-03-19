// gallery.js - Photo gallery and lightbox functionality

class Gallery {
    constructor() {
        this.photos = [];
        this.currentIndex = 0;
        this.lightbox = null;
    }

    async init() {
        await this.loadPhotos();
        this.setupLightbox();
        this.setupFilters();
    }

    async loadPhotos() {
        this.photos = await LoveStorage.getAllPhotos();
        this.renderGallery(this.photos);
    }

    renderGallery(photos) {
        const grid = document.getElementById('galleryGrid');
        if (!grid) return;

        if (photos.length === 0) {
            grid.innerHTML = `
                <div class="gallery-placeholder">
                    <div class="placeholder-icon">📷</div>
                    <p>No photos yet!</p>
                    <a href="admin.html" class="placeholder-btn">Upload Photos</a>
                </div>
            `;
            return;
        }

        grid.innerHTML = photos.map((photo, index) => `
            <div class="gallery-item animate-on-scroll" data-index="${index}" data-id="${photo.id}">
                <div class="gallery-item-inner">
                    <img src="${photo.data}" alt="${photo.caption}" loading="lazy">
                    <div class="gallery-item-overlay">
                        <p class="gallery-item-caption">${photo.caption || ''}</p>
                        ${photo.favorite ? '<span class="gallery-item-favorite">❤️</span>' : ''}
                    </div>
                </div>
            </div>
        `).join('');

        // Add click handlers
        grid.querySelectorAll('.gallery-item').forEach((item, index) => {
            item.addEventListener('click', () => this.openLightbox(index));
        });

        // Trigger animations
        setTimeout(() => {
            grid.querySelectorAll('.gallery-item').forEach((item, i) => {
                setTimeout(() => {
                    item.classList.add('animate-in');
                }, i * 100);
            });
        }, 100);
    }

    setupFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.dataset.filter;
                let filteredPhotos = this.photos;
                
                switch(filter) {
                    case 'favorites':
                        filteredPhotos = this.photos.filter(p => p.favorite);
                        break;
                    case 'recent':
                        filteredPhotos = this.photos.slice(0, 12);
                        break;
                }
                
                this.renderGallery(filteredPhotos);
            });
        });
    }

    setupLightbox() {
        this.lightbox = document.getElementById('lightbox');
        if (!this.lightbox) return;

        // Event listeners
        this.lightbox.querySelector('.lightbox-overlay').addEventListener('click', () => this.closeLightbox());
        this.lightbox.querySelector('.lightbox-close').addEventListener('click', () => this.closeLightbox());
        this.lightbox.querySelector('.lightbox-prev').addEventListener('click', () => this.prevImage());
        this.lightbox.querySelector('.lightbox-next').addEventListener('click', () => this.nextImage());
        this.lightbox.querySelector('.lightbox-favorite').addEventListener('click', () => this.toggleFavorite());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') this.closeLightbox();
            if (e.key === 'ArrowLeft') this.prevImage();
            if (e.key === 'ArrowRight') this.nextImage();
        });

        // Touch swipe
        let touchStartX = 0;
        this.lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });

        this.lightbox.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) this.nextImage();
                else this.prevImage();
            }
        });
    }

    openLightbox(index) {
        this.currentIndex = index;
        this.updateLightbox();
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeLightbox() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    updateLightbox() {
        const photo = this.photos[this.currentIndex];
        
        document.getElementById('lightboxImage').src = photo.data;
        document.getElementById('lightboxCaption').textContent = photo.caption || '';
        document.getElementById('lightboxDate').textContent = this.formatDate(photo.date);
        document.getElementById('lightboxFavorite').textContent = photo.favorite ? '❤️' : '🤍';
        document.getElementById('lightboxCounter').textContent = `${this.currentIndex + 1} / ${this.photos.length}`;
    }

    prevImage() {
        this.currentIndex = (this.currentIndex - 1 + this.photos.length) % this.photos.length;
        this.updateLightbox();
    }

    nextImage() {
        this.currentIndex = (this.currentIndex + 1) % this.photos.length;
        this.updateLightbox();
    }

    async toggleFavorite() {
        const photo = this.photos[this.currentIndex];
        await LoveStorage.toggleFavorite(photo.id);
        this.photos = await LoveStorage.getAllPhotos();
        this.updateLightbox();
    }

    formatDate(dateString) {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// Video Gallery
class VideoGallery {
    constructor() {
        this.videos = [];
        this.modal = null;
    }

    async init() {
        await this.loadVideos();
        this.setupModal();
    }

    async loadVideos() {
        this.videos = await LoveStorage.getAllVideos();
        this.renderVideos();
    }

    renderVideos() {
        const grid = document.getElementById('videosGrid');
        if (!grid) return;

        if (this.videos.length === 0) {
            grid.innerHTML = `
                <div class="video-placeholder">
                    <div class="placeholder-icon">🎥</div>
                    <p>No videos yet!</p>
                    <a href="admin.html" class="placeholder-btn">Upload Videos</a>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.videos.map((video, index) => `
            <div class="video-card animate-on-scroll" data-index="${index}">
                <div class="video-thumbnail">
                    <video src="${video.data}" muted preload="metadata"></video>
                    <div class="video-play-btn">▶</div>
                </div>
                <div class="video-info">
                    <h4>${video.caption || 'Untitled'}</h4>
                    <p>${this.formatDate(video.date)}</p>
                </div>
            </div>
        `).join('');

        // Add click handlers
        grid.querySelectorAll('.video-card').forEach((card, index) => {
            card.addEventListener('click', () => this.openVideo(index));
        });
    }

    setupModal() {
        this.modal = document.getElementById('videoModal');
        if (!this.modal) return;

        this.modal.querySelector('.video-modal-close').addEventListener('click', () => this.closeVideo());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeVideo();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeVideo();
            }
        });
    }

    openVideo(index) {
        const video = this.videos[index];
        const player = document.getElementById('videoPlayer');
        
        document.getElementById('videoModalTitle').textContent = video.caption || 'Video';
        player.src = video.data;
        
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        player.play().catch(() => {});
    }

    closeVideo() {
        const player = document.getElementById('videoPlayer');
        player.pause();
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    formatDate(dateString) {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// Export instances
const gallery = new Gallery();
const videoGallery = new VideoGallery();