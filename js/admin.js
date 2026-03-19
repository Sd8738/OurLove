// admin.js - Admin panel functionality

document.addEventListener('DOMContentLoaded', () => {
    initAdmin();
});

async function initAdmin() {
    // Initialize upload handler
    uploadHandler.init();
    
    // Setup navigation
    setupNavigation();
    
    // Load dashboard data
    await loadDashboard();
    
    // Load settings
    await loadSettings();
    
    // Hide loading
    setTimeout(() => {
        document.getElementById('adminLoading').classList.add('hidden');
    }, 500);
}

function setupNavigation() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update active state
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show corresponding section
            const sectionId = link.dataset.section + '-section';
            document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
            
            // Load section data
            switch(link.dataset.section) {
                case 'dashboard':
                    loadDashboard();
                    break;
                case 'photos':
                    loadPhotosGrid();
                    break;
                case 'videos':
                    loadVideosGrid();
                    break;
                case 'timeline':
                    loadTimelineList();
                    break;
                case 'settings':
                    loadSettings();
                    break;
            }
        });
    });
}

async function loadDashboard() {
    const stats = await LoveStorage.getStats();
    
    document.getElementById('statPhotos').textContent = stats.photos;
    document.getElementById('statVideos').textContent = stats.videos;
    document.getElementById('statFavorites').textContent = stats.favorites;
    document.getElementById('statDays').textContent = stats.days;
    
    // Load recent uploads
    const photos = await LoveStorage.getAllPhotos();
    const recentGrid = document.getElementById('recentGrid');
    
    if (photos.length > 0) {
        const recent = photos.slice(0, 6);
        recentGrid.innerHTML = recent.map(photo => `
            <div class="recent-item">
                <img src="${photo.data}" alt="${photo.caption}">
            </div>
        `).join('');
    } else {
        recentGrid.innerHTML = '<p class="empty-message">No uploads yet. Start adding memories!</p>';
    }
}

async function loadPhotosGrid() {
    const photos = await LoveStorage.getAllPhotos();
    const grid = document.getElementById('adminPhotosGrid');
    
    if (photos.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📷</div>
                <h3>No Photos Yet</h3>
                <p>Upload some beautiful memories!</p>
                <button class="btn btn-primary" onclick="switchToUpload()">Upload Photos</button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = photos.map(photo => `
        <div class="admin-media-item" data-id="${photo.id}">
            <div class="media-checkbox">
                <input type="checkbox" onchange="updateDeleteButton()">
            </div>
            <img src="${photo.data}" alt="${photo.caption}">
            <div class="media-overlay">
                <span class="media-caption">${photo.caption || 'No caption'}</span>
                <span class="media-date">${formatDate(photo.date)}</span>
            </div>
            <div class="media-actions">
                <button class="action-btn favorite ${photo.favorite ? 'active' : ''}" 
                        onclick="togglePhotoFavorite(${photo.id})">
                    ${photo.favorite ? '❤️' : '🤍'}
                </button>
                <button class="action-btn delete" onclick="deletePhoto(${photo.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

async function loadVideosGrid() {
    const videos = await LoveStorage.getAllVideos();
    const grid = document.getElementById('adminVideosGrid');
    
    if (videos.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎬</div>
                <h3>No Videos Yet</h3>
                <p>Upload some memorable videos!</p>
                <button class="btn btn-primary" onclick="switchToUpload()">Upload Videos</button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = videos.map(video => `
        <div class="admin-media-item video-item" data-id="${video.id}">
            <video src="${video.data}" class="video-preview"></video>
            <div class="video-play-overlay">▶</div>
            <div class="media-overlay">
                <span class="media-caption">${video.caption || 'No caption'}</span>
                <span class="media-date">${formatDate(video.date)}</span>
            </div>
            <div class="media-actions">
                <button class="action-btn delete" onclick="deleteVideo(${video.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

async function loadTimelineList() {
    const events = await LoveStorage.getAllTimelineEvents();
    const list = document.getElementById('timelineList');
    
    if (events.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📅</div>
                <h3>No Timeline Events</h3>
                <p>Add special moments to your story!</p>
            </div>
        `;
        return;
    }
    
    list.innerHTML = events.map(event => `
        <div class="timeline-list-item" data-id="${event.id}">
            <div class="timeline-icon">${event.icon || '💕'}</div>
            <div class="timeline-info">
                <h4>${event.title}</h4>
                <p>${event.description || ''}</p>
                <span class="timeline-date">${formatDate(event.date)}</span>
            </div>
            <button class="action-btn delete" onclick="deleteTimelineEvent(${event.id})">🗑️</button>
        </div>
    `).join('');
}

async function loadSettings() {
    const config = await LoveStorage.getConfig();
    
    document.getElementById('settingYourName').value = config.yourName || '';
    document.getElementById('settingPartnerName').value = config.partnerName || '';
    document.getElementById('settingStartDate').value = config.startDate || '';
    document.getElementById('settingPassword').value = config.password || '';
    document.getElementById('settingQuote').value = config.quote || '';
    document.getElementById('settingLetter').value = config.letter || '';
    
    // Load special dates
    loadSpecialDates(config.specialDates || []);
}

function loadSpecialDates(dates) {
    const container = document.getElementById('specialDatesSettings');
    
    container.innerHTML = dates.map((date, index) => `
        <div class="special-date-row" data-index="${index}">
            <input type="text" value="${date.title}" placeholder="Event title" class="sd-title">
            <input type="date" value="${date.date}" class="sd-date">
            <input type="text" value="${date.icon || '🎉'}" placeholder="🎉" class="sd-icon" maxlength="2">
            <button class="btn btn-icon" onclick="removeSpecialDate(${index})">✕</button>
        </div>
    `).join('');
}

function addSpecialDate() {
    const container = document.getElementById('specialDatesSettings');
    const index = container.children.length;
    
    const row = document.createElement('div');
    row.className = 'special-date-row';
    row.dataset.index = index;
    row.innerHTML = `
        <input type="text" placeholder="Event title" class="sd-title">
        <input type="date" class="sd-date">
        <input type="text" placeholder="🎉" class="sd-icon" maxlength="2">
        <button class="btn btn-icon" onclick="removeSpecialDate(${index})">✕</button>
    `;
    
    container.appendChild(row);
}

function removeSpecialDate(index) {
    const row = document.querySelector(`.special-date-row[data-index="${index}"]`);
    if (row) row.remove();
}

async function saveSettings() {
    const specialDateRows = document.querySelectorAll('.special-date-row');
    const specialDates = Array.from(specialDateRows).map(row => ({
        title: row.querySelector('.sd-title').value,
        date: row.querySelector('.sd-date').value,
        icon: row.querySelector('.sd-icon').value || '🎉'
    })).filter(d => d.title && d.date);

    const config = {
        yourName: document.getElementById('settingYourName').value,
        partnerName: document.getElementById('settingPartnerName').value,
        startDate: document.getElementById('settingStartDate').value,
        password: document.getElementById('settingPassword').value,
        quote: document.getElementById('settingQuote').value,
        letter: document.getElementById('settingLetter').value,
        specialDates: specialDates
    };
    
    await LoveStorage.saveConfig(config);
    showToast('Settings saved successfully! 💕', 'success');
}

async function togglePhotoFavorite(id) {
    await LoveStorage.toggleFavorite(id);
    loadPhotosGrid();
    showToast('Updated favorite status', 'success');
}

async function deletePhoto(id) {
    if (confirm('Are you sure you want to delete this photo?')) {
        await LoveStorage.deletePhoto(id);
        loadPhotosGrid();
        loadDashboard();
        showToast('Photo deleted', 'success');
    }
}

async function deleteVideo(id) {
    if (confirm('Are you sure you want to delete this video?')) {
        await LoveStorage.deleteVideo(id);
        loadVideosGrid();
        loadDashboard();
        showToast('Video deleted', 'success');
    }
}

async function deleteTimelineEvent(id) {
    if (confirm('Are you sure you want to delete this event?')) {
        await LoveStorage.deleteTimelineEvent(id);
        loadTimelineList();
        showToast('Event deleted', 'success');
    }
}

function showAddEventModal() {
    document.getElementById('addEventModal').classList.add('active');
    document.getElementById('eventDate').value = new Date().toISOString().split('T')[0];
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

async function saveTimelineEvent() {
    const event = {
        title: document.getElementById('eventTitle').value,
        date: document.getElementById('eventDate').value,
        description: document.getElementById('eventDescription').value,
        icon: document.getElementById('eventIcon').value || '💕'
    };
    
    if (!event.title || !event.date) {
        showToast('Please fill in title and date', 'warning');
        return;
    }
    
    await LoveStorage.addTimelineEvent(event);
    closeModal('addEventModal');
    loadTimelineList();
    showToast('Event added! 💕', 'success');
    
    // Clear form
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventDescription').value = '';
    document.getElementById('eventIcon').value = '';
}

function switchToUpload() {
    document.querySelector('[data-section="upload"]').click();
}

function updateDeleteButton() {
    const selected = document.querySelectorAll('.admin-media-item input[type="checkbox"]:checked');
    document.getElementById('deleteSelectedPhotos').disabled = selected.length === 0;
}

async function confirmClearAll() {
    if (confirm('⚠️ Are you absolutely sure? This will delete ALL photos, videos, and settings. This cannot be undone!')) {
        if (confirm('Really? Last chance to cancel...')) {
            await LoveStorage.clearAllData();
            showToast('All data cleared', 'success');
            loadDashboard();
        }
    }
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}