// upload.js - Handle file uploads with preview and compression

class UploadHandler {
    constructor() {
        this.pendingFiles = [];
        this.maxFileSize = 50 * 1024 * 1024; // 50MB
        this.maxImageSize = 10 * 1024 * 1024; // 10MB for images
        this.compressionQuality = 0.8;
    }

    init() {
        this.setupDropzone();
        this.setupTabs();
    }

    setupDropzone() {
        const dropzone = document.getElementById('dropzone');
        const fileInput = document.getElementById('fileInput');

        if (!dropzone || !fileInput) return;

        // Click to open file browser
        dropzone.addEventListener('click', () => fileInput.click());

        // Drag and drop events
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.classList.remove('dragover');
            });
        });

        dropzone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            this.handleFiles(files);
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
    }

    setupTabs() {
        const tabs = document.querySelectorAll('.upload-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const type = tab.dataset.type;
                const fileInput = document.getElementById('fileInput');
                fileInput.accept = type === 'photos' ? 'image/*' : 'video/*';
            });
        });
    }

    async handleFiles(files) {
        const previewGrid = document.getElementById('previewGrid');
        const uploadPreview = document.getElementById('uploadPreview');
        
        uploadPreview.style.display = 'block';

        for (const file of files) {
            if (this.validateFile(file)) {
                const previewItem = await this.createPreview(file);
                previewGrid.appendChild(previewItem);
                this.pendingFiles.push({
                    file,
                    element: previewItem
                });
            }
        }
    }

    validateFile(file) {
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

        if (!validImageTypes.includes(file.type) && !validVideoTypes.includes(file.type)) {
            showToast('Invalid file type. Please upload images or videos.', 'error');
            return false;
        }

        if (file.size > this.maxFileSize) {
            showToast(`File too large. Maximum size is ${this.maxFileSize / 1024 / 1024}MB`, 'error');
            return false;
        }

        return true;
    }

    async createPreview(file) {
        const item = document.createElement('div');
        item.className = 'preview-item';

        const isVideo = file.type.startsWith('video/');
        
        if (isVideo) {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.className = 'preview-media';
            video.muted = true;
            
            video.addEventListener('loadeddata', () => {
                video.currentTime = 1;
            });

            item.innerHTML = `
                <div class="preview-media-container">
                    <video src="${URL.createObjectURL(file)}" class="preview-media" muted></video>
                    <div class="preview-play-icon">▶</div>
                </div>
                <div class="preview-info">
                    <input type="text" class="preview-caption" placeholder="Caption..." value="${file.name.replace(/\.[^/.]+$/, '')}">
                    <input type="date" class="preview-date" value="${new Date().toISOString().split('T')[0]}">
                    <label class="preview-favorite">
                        <input type="checkbox" class="favorite-checkbox"> ❤️ Favorite
                    </label>
                </div>
                <button class="preview-remove" onclick="removePreviewItem(this)">✕</button>
            `;
        } else {
            const img = await this.loadImage(file);
            
            item.innerHTML = `
                <div class="preview-media-container">
                    <img src="${img.src}" class="preview-media" alt="Preview">
                </div>
                <div class="preview-info">
                    <input type="text" class="preview-caption" placeholder="Caption..." value="${file.name.replace(/\.[^/.]+$/, '')}">
                    <input type="date" class="preview-date" value="${new Date().toISOString().split('T')[0]}">
                    <label class="preview-favorite">
                        <input type="checkbox" class="favorite-checkbox"> ❤️ Favorite
                    </label>
                </div>
                <button class="preview-remove" onclick="removePreviewItem(this)">✕</button>
            `;
        }

        return item;
    }

    loadImage(file) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = URL.createObjectURL(file);
        });
    }

    async compressImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Max dimensions
                    const maxWidth = 1920;
                    const maxHeight = 1920;

                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    resolve(canvas.toDataURL('image/jpeg', this.compressionQuality));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    async uploadAll() {
        if (this.pendingFiles.length === 0) {
            showToast('No files to upload', 'warning');
            return;
        }

        const progressModal = this.showProgressModal();
        let uploaded = 0;
        const total = this.pendingFiles.length;

        for (const item of this.pendingFiles) {
            try {
                const { file, element } = item;
                const caption = element.querySelector('.preview-caption').value;
                const date = element.querySelector('.preview-date').value;
                const favorite = element.querySelector('.favorite-checkbox').checked;

                const isVideo = file.type.startsWith('video/');

                if (isVideo) {
                    // Store video as base64
                    const videoData = await this.fileToBase64(file);
                    
                    await LoveStorage.addVideo({
                        data: videoData,
                        caption: caption,
                        date: date,
                        filename: file.name,
                        type: file.type,
                        size: file.size
                    });
                } else {
                    // Compress and store image
                    const compressedImage = await this.compressImage(file);
                    
                    await LoveStorage.addPhoto({
                        data: compressedImage,
                        caption: caption,
                        date: date,
                        favorite: favorite,
                        filename: file.name
                    });
                }

                uploaded++;
                this.updateProgress(progressModal, (uploaded / total) * 100);
                element.classList.add('uploaded');

            } catch (error) {
                console.error('Upload error:', error);
                showToast(`Failed to upload ${item.file.name}`, 'error');
            }
        }

        setTimeout(() => {
            this.hideProgressModal(progressModal);
            this.clearPreview();
            showToast(`Successfully uploaded ${uploaded} files! 💕`, 'success');
            loadDashboard();
        }, 500);
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    showProgressModal() {
        const modal = document.createElement('div');
        modal.className = 'upload-progress-modal';
        modal.innerHTML = `
            <div class="progress-content">
                <div class="progress-icon">📤</div>
                <h3>Uploading Memories...</h3>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <p class="progress-text">0%</p>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    updateProgress(modal, percent) {
        modal.querySelector('.progress-fill').style.width = percent + '%';
        modal.querySelector('.progress-text').textContent = Math.round(percent) + '%';
    }

    hideProgressModal(modal) {
        modal.classList.add('fade-out');
        setTimeout(() => modal.remove(), 300);
    }

    clearPreview() {
        this.pendingFiles = [];
        const previewGrid = document.getElementById('previewGrid');
        const uploadPreview = document.getElementById('uploadPreview');
        if (previewGrid) previewGrid.innerHTML = '';
        if (uploadPreview) uploadPreview.style.display = 'none';
    }
}

// Global instance
const uploadHandler = new UploadHandler();

// Global functions
function removePreviewItem(button) {
    const item = button.closest('.preview-item');
    const index = uploadHandler.pendingFiles.findIndex(p => p.element === item);
    if (index > -1) {
        uploadHandler.pendingFiles.splice(index, 1);
    }
    item.remove();
    
    if (uploadHandler.pendingFiles.length === 0) {
        document.getElementById('uploadPreview').style.display = 'none';
    }
}

function clearUploadPreview() {
    uploadHandler.clearPreview();
}

function uploadAllFiles() {
    uploadHandler.uploadAll();
}

// Toast notification
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('toast-fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}