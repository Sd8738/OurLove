// app.js - Main application logic

class LoveStoryApp {
    constructor() {
        this.config = null;
    }

    async init() {
        // Load configuration
        this.config = await LoveStorage.getConfig();
        
        // Apply configuration
        this.applyConfig();
        
        // Initialize components
        await gallery.init();
        await videoGallery.init();
        
        // Load timeline
        await this.loadTimeline();
        
        // Load special dates
        await this.loadSpecialDates();
        
        // Setup love counter
        this.startLoveCounter();
        
        // Setup letter
        this.setupLetter();
        
        // Setup music
        this.setupMusic();
        
        // Setup navigation
        this.setupNavigation();
        
        // Hide loading
        this.hideLoading();
        
        // Setup footer stats
        this.updateFooterStats();
    }

    applyConfig() {
        // Couple names
        const coupleNames = document.getElementById('coupleNames');
        if (coupleNames) {
            coupleNames.textContent = `${this.config.yourName} & ${this.config.partnerName}`;
        }

        // Nav logo
        const navLogo = document.getElementById('navLogoText');
        if (navLogo) {
            const initials = (this.config.yourName[0] || 'Y') + ' & ' + (this.config.partnerName[0] || 'P');
            navLogo.textContent = initials;
        }

        // Quote
        const quote = document.getElementById('heroQuote');
        if (quote && this.config.quote) {
            quote.textContent = this.config.quote;
        }

        // Letter
        const letterBody = document.getElementById('letterBody');
        if (letterBody && this.config.letter) {
            letterBody.innerHTML = this.config.letter.split('\n').map(p => `<p>${p}</p>`).join('');
        }

        const letterSignature = document.getElementById('letterSignature');
        if (letterSignature) {
            letterSignature.textContent = `Your ${this.config.yourName}`;
        }
    }

    startLoveCounter() {
        const startDate = new Date(this.config.startDate + 'T00:00:00');
        
        const update = () => {
            const now = new Date();
            const diff = now - startDate;
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            
            document.getElementById('counterDays').textContent = days.toLocaleString();
            document.getElementById('counterHours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('counterMinutes').textContent = minutes.toString().padStart(2, '0');
        };
        
        update();
        setInterval(update, 60000); // Update every minute
    }

    async loadTimeline() {
        const events = await LoveStorage.getAllTimelineEvents();
        const timeline = document.getElementById('timeline');
        
        if (!timeline) return;

        if (events.length === 0) {
            timeline.innerHTML = `
                <div class="timeline-placeholder">
                    <div class="placeholder-icon">📅</div>
                    <p>Your beautiful timeline will appear here</p>
                    <small>Add events in the admin panel</small>
                </div>
            `;
            return;
        }

        // Add start date as first event
        const allEvents = [
            {
                icon: '💕',
                title: 'Our Story Began',
                date: this.config.startDate,
                description: 'The day our beautiful journey started'
            },
            ...events
        ];

        timeline.innerHTML = `
            <div class="timeline-line"></div>
            ${allEvents.map((event, index) => `
                <div class="timeline-item ${index % 2 === 0 ? 'left' : 'right'} animate-on-scroll">
                    <div class="timeline-dot">${event.icon || '💕'}</div>
                    <div class="timeline-content">
                        <span class="timeline-date">${this.formatDate(event.date)}</span>
                        <h3 class="timeline-title">${event.title}</h3>
                        <p class="timeline-description">${event.description || ''}</p>
                    </div>
                </div>
            `).join('')}
        `;
    }

    async loadSpecialDates() {
        const dates = this.config.specialDates || [];
        const grid = document.getElementById('datesGrid');
        
        if (!grid || dates.length === 0) {
            if (grid) grid.style.display = 'none';
            return;
        }

        const now = new Date();

        grid.innerHTML = dates.map(date => {
            const eventDate = new Date(date.date);
            const thisYear = new Date(now.getFullYear(), eventDate.getMonth(), eventDate.getDate());
            
            if (thisYear < now) {
                thisYear.setFullYear(thisYear.getFullYear() + 1);
            }
            
            const daysUntil = Math.ceil((thisYear - now) / (1000 * 60 * 60 * 24));

            return `
                <div class="date-card animate-on-scroll">
                    <div class="date-icon">${date.icon || '🎉'}</div>
                    <h4 class="date-title">${date.title}</h4>
                    <p class="date-countdown">
                        ${daysUntil === 0 ? '🎉 Today!' : `${daysUntil} days`}
                    </p>
                    <p class="date-actual">${this.formatDate(date.date)}</p>
                </div>
            `;
        }).join('');
    }

    setupLetter() {
        const envelope = document.getElementById('letterEnvelope');
        const paper = document.getElementById('letterPaper');
        
        if (envelope && paper) {
            envelope.addEventListener('click', () => {
                envelope.classList.add('opened');
                setTimeout(() => {
                    paper.classList.add('visible');
                }, 600);
            });
        }
    }

    setupMusic() {
        const musicBtn = document.getElementById('musicBtn');
        const audio = document.getElementById('bgMusic');
        const visualizer = document.getElementById('musicVisualizer');
        
        if (!musicBtn || !audio) return;

        let isPlaying = false;

        musicBtn.addEventListener('click', () => {
            if (isPlaying) {
                audio.pause();
                visualizer.classList.remove('playing');
                musicBtn.querySelector('.music-icon').textContent = '🎵';
            } else {
                audio.play().catch(() => {});
                visualizer.classList.add('playing');
                musicBtn.querySelector('.music-icon').textContent = '⏸️';
            }
            isPlaying = !isPlaying;
        });
    }

    setupNavigation() {
        const navToggle = document.getElementById('navToggle');
        const navLinks = document.getElementById('navLinks');
        
        if (navToggle && navLinks) {
            navToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                navToggle.classList.toggle('active');
            });

            // Close menu on link click
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('active');
                    navToggle.classList.remove('active');
                });
            });
        }

        // Smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Active nav link on scroll
        const sections = document.querySelectorAll('section[id]');
        
        window.addEventListener('scroll', () => {
            const scrollPos = window.pageYOffset + 200;
            
            sections.forEach(section => {
                const top = section.offsetTop;
                const height = section.offsetHeight;
                const id = section.getAttribute('id');
                
                if (scrollPos >= top && scrollPos < top + height) {
                    document.querySelectorAll('.nav-link').forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        });
    }

    async updateFooterStats() {
        const stats = await LoveStorage.getStats();
        const footer = document.getElementById('footerStats');
        
        if (footer) {
            footer.textContent = `${stats.photos} photos • ${stats.videos} videos • ${stats.days} days of love`;
        }
    }

    hideLoading() {
        const loading = document.getElementById('loadingScreen');
        if (loading) {
            setTimeout(() => {
                loading.classList.add('hidden');
            }, 1500);
        }
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

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    const app = new LoveStoryApp();
    app.init();
});