// storage.js - IndexedDB Storage for Photos, Videos, and Settings

const DB_NAME = 'LoveStoryDB';
const DB_VERSION = 1;

const STORES = {
    PHOTOS: 'photos',
    VIDEOS: 'videos',
    CONFIG: 'config',
    TIMELINE: 'timeline',
    NOTES: 'notes'
};

class LoveStorageClass {
    constructor() {
        this.db = null;
        this.initPromise = this.init();
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Photos store
                if (!db.objectStoreNames.contains(STORES.PHOTOS)) {
                    const photosStore = db.createObjectStore(STORES.PHOTOS, { keyPath: 'id', autoIncrement: true });
                    photosStore.createIndex('date', 'date', { unique: false });
                    photosStore.createIndex('favorite', 'favorite', { unique: false });
                }

                // Videos store
                if (!db.objectStoreNames.contains(STORES.VIDEOS)) {
                    const videosStore = db.createObjectStore(STORES.VIDEOS, { keyPath: 'id', autoIncrement: true });
                    videosStore.createIndex('date', 'date', { unique: false });
                }

                // Config store
                if (!db.objectStoreNames.contains(STORES.CONFIG)) {
                    db.createObjectStore(STORES.CONFIG, { keyPath: 'key' });
                }

                // Timeline store
                if (!db.objectStoreNames.contains(STORES.TIMELINE)) {
                    const timelineStore = db.createObjectStore(STORES.TIMELINE, { keyPath: 'id', autoIncrement: true });
                    timelineStore.createIndex('date', 'date', { unique: false });
                }

                // Love notes store
                if (!db.objectStoreNames.contains(STORES.NOTES)) {
                    db.createObjectStore(STORES.NOTES, { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    async ensureDB() {
        if (!this.db) {
            await this.initPromise;
        }
        return this.db;
    }

    // ==================== PHOTOS ====================

    async addPhoto(photoData) {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.PHOTOS], 'readwrite');
            const store = transaction.objectStore(STORES.PHOTOS);

            const photo = {
                ...photoData,
                createdAt: new Date().toISOString(),
                favorite: photoData.favorite || false
            };

            const request = store.add(photo);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllPhotos() {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.PHOTOS], 'readonly');
            const store = transaction.objectStore(STORES.PHOTOS);
            const request = store.getAll();

            request.onsuccess = () => {
                const photos = request.result.sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                resolve(photos);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getPhoto(id) {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.PHOTOS], 'readonly');
            const store = transaction.objectStore(STORES.PHOTOS);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updatePhoto(id, updates) {
        const db = await this.ensureDB();
        const photo = await this.getPhoto(id);
        if (!photo) throw new Error('Photo not found');

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.PHOTOS], 'readwrite');
            const store = transaction.objectStore(STORES.PHOTOS);

            const updatedPhoto = { ...photo, ...updates };
            const request = store.put(updatedPhoto);

            request.onsuccess = () => resolve(updatedPhoto);
            request.onerror = () => reject(request.error);
        });
    }

    async deletePhoto(id) {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.PHOTOS], 'readwrite');
            const store = transaction.objectStore(STORES.PHOTOS);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async toggleFavorite(id) {
        const photo = await this.getPhoto(id);
        if (photo) {
            return this.updatePhoto(id, { favorite: !photo.favorite });
        }
    }

    async getFavoritePhotos() {
        const photos = await this.getAllPhotos();
        return photos.filter(p => p.favorite);
    }

    // ==================== VIDEOS ====================

    async addVideo(videoData) {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.VIDEOS], 'readwrite');
            const store = transaction.objectStore(STORES.VIDEOS);

            const video = {
                ...videoData,
                createdAt: new Date().toISOString()
            };

            const request = store.add(video);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllVideos() {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.VIDEOS], 'readonly');
            const store = transaction.objectStore(STORES.VIDEOS);
            const request = store.getAll();

            request.onsuccess = () => {
                const videos = request.result.sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                resolve(videos);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async deleteVideo(id) {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.VIDEOS], 'readwrite');
            const store = transaction.objectStore(STORES.VIDEOS);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // ==================== CONFIG ====================

    async getConfig() {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.CONFIG], 'readonly');
            const store = transaction.objectStore(STORES.CONFIG);
            const request = store.get('main');

            request.onsuccess = () => {
                const defaultConfig = {
                    yourName: 'Sumant',
                    partnerName: 'Akshaya',
                    startDate: '2024-05-05',
                    password: '17042024',
                    quote: '"Every love story is beautiful, but ours is my favorite"',
                    letter: 'Every moment with you feels like a beautiful dream...',
                    specialDates: []
                };
                resolve(request.result?.value || defaultConfig);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async saveConfig(config) {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.CONFIG], 'readwrite');
            const store = transaction.objectStore(STORES.CONFIG);
            const request = store.put({ key: 'main', value: config });

            request.onsuccess = () => resolve(config);
            request.onerror = () => reject(request.error);
        });
    }

    // ==================== TIMELINE ====================

    async addTimelineEvent(event) {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.TIMELINE], 'readwrite');
            const store = transaction.objectStore(STORES.TIMELINE);

            const timelineEvent = {
                ...event,
                createdAt: new Date().toISOString()
            };

            const request = store.add(timelineEvent);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllTimelineEvents() {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.TIMELINE], 'readonly');
            const store = transaction.objectStore(STORES.TIMELINE);
            const request = store.getAll();

            request.onsuccess = () => {
                const events = request.result.sort((a, b) => 
                    new Date(a.date) - new Date(b.date)
                );
                resolve(events);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async deleteTimelineEvent(id) {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.TIMELINE], 'readwrite');
            const store = transaction.objectStore(STORES.TIMELINE);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // ==================== UTILITIES ====================

    async getStats() {
        const photos = await this.getAllPhotos();
        const videos = await this.getAllVideos();
        const favorites = photos.filter(p => p.favorite);
        const config = await this.getConfig();

        const startDate = new Date(config.startDate);
        const today = new Date();
        const days = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

        return {
            photos: photos.length,
            videos: videos.length,
            favorites: favorites.length,
            days: days
        };
    }

    async clearAllData() {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const storeNames = [STORES.PHOTOS, STORES.VIDEOS, STORES.TIMELINE];
            const transaction = db.transaction(storeNames, 'readwrite');

            storeNames.forEach(storeName => {
                transaction.objectStore(storeName).clear();
            });

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    async exportData() {
        const photos = await this.getAllPhotos();
        const videos = await this.getAllVideos();
        const config = await this.getConfig();
        const timeline = await this.getAllTimelineEvents();

        return {
            photos,
            videos,
            config,
            timeline,
            exportedAt: new Date().toISOString()
        };
    }
}

// Create global instance
const LoveStorage = new LoveStorageClass();