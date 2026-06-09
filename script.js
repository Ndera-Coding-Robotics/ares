// ==================== LOCAL STORAGE MANAGEMENT ====================
const LocalStorageManager = {
    // Initialize storage with default data
    init() {
        if (!localStorage.getItem('learnOfflineData')) {
            const defaultData = {
                coursesDownloaded: 12,
                lessonsCompleted: 45,
                overallProgress: 68,
                quizzesCompleted: 28,
                videoWatchTime: 875, // in seconds
                bookmarks: ['photosynthesis', 'quadratic', 'javascript', 'shakespeare'],
                downloads: [
                    { id: 1, title: 'Advanced Biology', size: '850 MB', status: 'completed' },
                    { id: 2, title: 'Chemistry Essentials', size: '520 MB', status: 'completed' },
                    { id: 3, title: 'World Geography', size: '1.2 GB', status: 'downloading' },
                    { id: 4, title: 'History & Culture', size: '780 MB', status: 'completed' }
                ],
                storageUsed: 0.5, // in GB
                notes: [],
                settings: {
                    offlineMode: true,
                    notifications: true
                },
                lastVideoTime: 945 // in seconds
            };
            localStorage.setItem('learnOfflineData', JSON.stringify(defaultData));
        }
    },

    // Get data from storage
    getData() {
        return JSON.parse(localStorage.getItem('learnOfflineData')) || {};
    },

    // Save data to storage
    saveData(data) {
        localStorage.setItem('learnOfflineData', JSON.stringify(data));
    },

    // Update specific field
    updateField(field, value) {
        const data = this.getData();
        data[field] = value;
        this.saveData(data);
    }
};

// ==================== ANIMATED COUNTER ====================
class AnimatedCounter {
    constructor(element, targetValue, duration = 1500) {
        this.element = element;
        this.targetValue = targetValue;
        this.duration = duration;
        this.currentValue = 0;
        this.startTime = null;
    }

    animate(timestamp) {
        if (!this.startTime) {
            this.startTime = timestamp;
        }

        const progress = (timestamp - this.startTime) / this.duration;
        const value = Math.floor(progress * this.targetValue);

        this.currentValue = Math.min(value, this.targetValue);
        this.element.textContent = this.currentValue;

        if (progress < 1) {
            requestAnimationFrame((ts) => this.animate(ts));
        } else {
            this.element.textContent = this.targetValue;
        }
    }

    start() {
        requestAnimationFrame((ts) => this.animate(ts));
    }
}

// ==================== STATISTICS ANIMATION ====================
function initializeStatistics() {
    const data = LocalStorageManager.getData();
    
    const statElements = [
        { selector: '.stat-card:nth-child(1) .stat-value', value: data.coursesDownloaded },
        { selector: '.stat-card:nth-child(2) .stat-value', value: data.lessonsCompleted },
        { selector: '.stat-card:nth-child(3) .stat-value', value: data.overallProgress },
        { selector: '.stat-card:nth-child(4) .stat-value', value: data.quizzesCompleted }
    ];

    statElements.forEach(stat => {
        const element = document.querySelector(stat.selector);
        if (element) {
            const counter = new AnimatedCounter(element, stat.value, 1800);
            // Delay animation for better effect
            setTimeout(() => counter.start(), 200);
        }
    });
}

// ==================== NAVIGATION ====================
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            link.classList.add('active');
            
            // Smooth scroll to section
            const sectionId = link.dataset.section;
            const section = document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ==================== VIDEO PLAYER ====================
class VideoPlayer {
    constructor() {
        this.video = document.getElementById('videoPlayer');
        this.resumeBtn = document.getElementById('resumeBtn');
        this.resumeText = document.getElementById('resumeText');
        
        if (this.video && this.resumeBtn) {
            this.init();
        }
    }

    init() {
        const data = LocalStorageManager.getData();
        
        // Set last known time
        this.video.currentTime = data.lastVideoTime || 0;
        
        // Update resume button text
        this.updateResumeText();
        
        // Save video progress on timeupdate
        this.video.addEventListener('timeupdate', () => {
            LocalStorageManager.updateField('lastVideoTime', Math.floor(this.video.currentTime));
        });

        // Resume button click
        this.resumeBtn.addEventListener('click', () => {
            this.video.currentTime = data.lastVideoTime || 0;
            this.video.play();
        });
    }

    updateResumeText() {
        const data = LocalStorageManager.getData();
        const minutes = Math.floor(data.lastVideoTime / 60);
        const seconds = data.lastVideoTime % 60;
        this.resumeText.textContent = `Resume from ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// ==================== STORAGE MANAGEMENT ====================
function updateStorageDisplay() {
    const data = LocalStorageManager.getData();
    const storageUsed = document.getElementById('storageUsed');
    const storageProgress = document.getElementById('storageProgress');
    
    if (storageUsed) {
        storageUsed.textContent = `${data.storageUsed} GB`;
    }
    if (storageProgress) {
        const percentage = (data.storageUsed / 10) * 100;
        storageProgress.style.width = percentage + '%';
    }
}

// ==================== SMOOTH ANIMATIONS ON SCROLL ====================
function observeElements() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 0.6s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all cards and sections
    document.querySelectorAll('.course-card, .stat-card, .download-item, .analytics-card, .bookmark-item').forEach(element => {
        element.style.opacity = '0';
        observer.observe(element);
    });
}

// ==================== MOBILE MENU TOGGLE ====================
function initializeMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.style.display = sidebar.style.display === 'none' ? 'flex' : 'none';
        });

        // Close menu on link click
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebar.style.display = 'none';
                }
            });
        });
    }
}

// ==================== SEARCH FUNCTIONALITY ====================
function initializeSearch() {
    const searchInput = document.querySelector('.search-bar input');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            
            if (query.length === 0) {
                // Show all items
                document.querySelectorAll('.course-card').forEach(card => {
                    card.style.display = '';
                });
            } else {
                // Filter items based on title
                document.querySelectorAll('.course-card').forEach(card => {
                    const title = card.querySelector('.course-title').textContent.toLowerCase();
                    card.style.display = title.includes(query) ? '' : 'none';
                });
            }
        });
    }
}

// ==================== NOTIFICATION BADGE ====================
function initializeNotifications() {
    const notificationIcon = document.querySelector('.notification-icon');
    
    if (notificationIcon) {
        notificationIcon.addEventListener('click', () => {
            showNotificationToast('You have 3 new notifications!');
        });
    }
}

// ==================== PROFILE MENU ====================
function initializeProfileMenu() {
    const profileSection = document.querySelector('.profile-section');
    
    if (profileSection) {
        profileSection.addEventListener('click', () => {
            showNotificationToast('Profile menu clicked');
        });
    }
}

// ==================== TOAST NOTIFICATION ====================
function showNotificationToast(message) {
    const data = LocalStorageManager.getData();
    if (!data.settings || !data.settings.notifications) {
        return;
    }
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #2C5AA0;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==================== NOTES FUNCTIONALITY ====================
function renderNotes() {
    const notesList = document.getElementById('notesList');
    if (!notesList) return;

    const data = LocalStorageManager.getData();
    const notes = data.notes || [];
    notesList.innerHTML = '';

    if (notes.length === 0) {
        notesList.innerHTML = '<div class="empty-state">No notes yet. Add your first offline note.</div>';
        return;
    }

    notes.slice().reverse().forEach(note => {
        const noteCard = document.createElement('article');
        noteCard.className = 'note-card';
        noteCard.innerHTML = `
            <div class="note-card-header">
                <div>
                    <h3>${note.title}</h3>
                    <span>${new Date(note.createdAt).toLocaleString()}</span>
                </div>
                <button class="delete-note" data-id="${note.id}" aria-label="Delete note"><i class="fas fa-trash"></i></button>
            </div>
            <p>${note.body}</p>
        `;
        notesList.appendChild(noteCard);
    });
}

function saveNote() {
    const titleInput = document.getElementById('noteTitle');
    const bodyInput = document.getElementById('noteBody');
    if (!titleInput || !bodyInput) return;

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();
    if (!title || !body) {
        showNotificationToast('Please enter a title and note body.');
        return;
    }

    const data = LocalStorageManager.getData();
    const notes = data.notes || [];
    notes.push({
        id: Date.now(),
        title,
        body,
        createdAt: new Date().toISOString()
    });
    LocalStorageManager.updateField('notes', notes);
    titleInput.value = '';
    bodyInput.value = '';
    renderNotes();
    showNotificationToast('Note saved successfully.');
}

function deleteNote(noteId) {
    const data = LocalStorageManager.getData();
    const notes = (data.notes || []).filter(note => note.id !== Number(noteId));
    LocalStorageManager.updateField('notes', notes);
    renderNotes();
    showNotificationToast('Note removed.');
}

function initializeNotes() {
    renderNotes();
    const saveNoteBtn = document.getElementById('saveNoteBtn');
    const newNoteBtn = document.getElementById('newNoteBtn');
    const notesList = document.getElementById('notesList');

    if (saveNoteBtn) {
        saveNoteBtn.addEventListener('click', saveNote);
    }
    if (newNoteBtn) {
        newNoteBtn.addEventListener('click', () => {
            const titleInput = document.getElementById('noteTitle');
            if (titleInput) titleInput.focus();
        });
    }
    if (notesList) {
        notesList.addEventListener('click', (event) => {
            const button = event.target.closest('.delete-note');
            if (button) {
                const noteId = button.dataset.id;
                deleteNote(noteId);
            }
        });
    }
}

// ==================== SETTINGS FUNCTIONALITY ====================
function applySettings() {
    const data = LocalStorageManager.getData();
    const offlineIndicator = document.querySelector('.offline-indicator');
    const offlineToggle = document.getElementById('offlineToggle');
    if (!offlineIndicator || !data.settings) return;

    offlineIndicator.querySelector('span').textContent = data.settings.offlineMode ? 'You are Offline' : 'Offline mode off';
    offlineIndicator.style.background = data.settings.offlineMode ? '#FEF3C7' : '#E8F6FF';
    offlineIndicator.style.color = data.settings.offlineMode ? '#B45309' : '#0B5394';
    if (offlineToggle) {
        offlineToggle.checked = data.settings.offlineMode;
    }
}

function updateSetting(key, value) {
    const data = LocalStorageManager.getData();
    data.settings = data.settings || {};
    data.settings[key] = value;
    LocalStorageManager.saveData(data);
    applySettings();
    showNotificationToast(`${key === 'notifications' ? 'Notifications' : 'Offline mode'} ${value ? 'enabled' : 'disabled'}`);
}

function initializeSettings() {
    const offlineToggle = document.getElementById('offlineToggle');
    const notificationsToggle = document.getElementById('notificationsToggle');
    const data = LocalStorageManager.getData();
    if (offlineToggle) {
        offlineToggle.checked = data.settings?.offlineMode ?? true;
        offlineToggle.addEventListener('change', () => updateSetting('offlineMode', offlineToggle.checked));
    }
    if (notificationsToggle) {
        notificationsToggle.checked = data.settings?.notifications ?? true;
        notificationsToggle.addEventListener('change', () => updateSetting('notifications', notificationsToggle.checked));
    }
    applySettings();
}

// ==================== DOWNLOAD PROGRESS SIMULATION ====================
function simulateDownloads() {
    const downloadItems = document.querySelectorAll('.download-item');
    
    downloadItems.forEach((item, index) => {
        const progressBar = item.querySelector('.progress-bar-small');
        if (progressBar) {
            const status = item.querySelector('.download-status');
            
            if (status && status.textContent === 'Completed') {
                const fillDiv = progressBar.querySelector('.progress-fill');
                if (fillDiv) {
                    fillDiv.style.width = '100%';
                }
            }
        }
    });
}

// ==================== COURSE CONTINUE LEARNING BUTTONS ====================
function initializeCourseButtons() {
    const continueButtons = document.querySelectorAll('.btn-secondary');
    
    continueButtons.forEach(button => {
        button.addEventListener('click', () => {
            const courseTitle = button.closest('.course-card').querySelector('.course-title').textContent;
            showNotificationToast(`Starting: ${courseTitle}`);
            
            // Simulate course loading
            setTimeout(() => {
                showNotificationToast(`Loaded: ${courseTitle}`);
            }, 1000);
        });
    });
}

// ==================== MANAGE STORAGE BUTTON ====================
function initializeStorageManagement() {
    const manageStorageBtn = document.querySelector('.btn-manage-storage');
    
    if (manageStorageBtn) {
        manageStorageBtn.addEventListener('click', () => {
            showNotificationToast('Opening Storage Manager...');
            // Simulate storage management interface
            setTimeout(() => {
                showNotificationToast('Storage Manager loaded');
            }, 500);
        });
    }
}

// ==================== DOWNLOAD MORE COURSES BUTTON ====================
function initializeDownloadButton() {
    const downloadBtn = document.querySelector('.btn-primary');
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            showNotificationToast('Opening course library...');
            setTimeout(() => {
                showNotificationToast('Browse and download new courses');
            }, 500);
        });
    }
}

// ==================== BOOKMARK FUNCTIONALITY ====================
function initializeBookmarks() {
    const bookmarkItems = document.querySelectorAll('.bookmark-item');
    
    bookmarkItems.forEach(item => {
        item.addEventListener('click', () => {
            const bookmarkTitle = item.querySelector('h4').textContent;
            const isBookmarked = item.style.opacity === '0.5';
            
            if (isBookmarked) {
                item.style.opacity = '1';
                showNotificationToast(`Removed: ${bookmarkTitle}`);
            } else {
                item.style.opacity = '0.5';
                showNotificationToast(`Bookmarked: ${bookmarkTitle}`);
            }
        });
    });
}

// ==================== CIRCULAR PROGRESS ANIMATION ====================
function animateCircularProgress() {
    const circles = document.querySelectorAll('.progress-circle-fill');
    
    circles.forEach(circle => {
        // Trigger animation by resetting and applying
        const offset = circle.style.strokeDashoffset;
        circle.style.strokeDashoffset = '339.29';
        
        setTimeout(() => {
            circle.style.transition = 'stroke-dashoffset 1.5s ease';
            circle.style.strokeDashoffset = offset;
        }, 100);
    });
}

// ==================== WINDOW RESIZE HANDLER ====================
function handleWindowResize() {
    window.addEventListener('resize', () => {
        const sidebar = document.querySelector('.sidebar');
        
        if (window.innerWidth > 768) {
            if (sidebar) sidebar.style.display = 'flex';
        }
    });
}

// ==================== KEYBOARD SHORTCUTS ====================
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('.search-bar input');
            if (searchInput) {
                searchInput.focus();
            }
        }
    });
}

// ==================== INITIALIZE ALL ====================
function initializeApp() {
    // Initialize local storage
    LocalStorageManager.init();
    
    // Initialize components
    initializeNavigation();
    initializeStatistics();
    initializeMobileMenu();
    initializeSearch();
    initializeNotifications();
    initializeProfileMenu();
    initializeNotes();
    initializeSettings();
    simulateDownloads();
    initializeCourseButtons();
    initializeStorageManagement();
    initializeDownloadButton();
    initializeBookmarks();
    handleWindowResize();
    initializeKeyboardShortcuts();
    updateStorageDisplay();
    
    // Initialize video player
    new VideoPlayer();
    
    // Start animations
    observeElements();
    
    // Animate circular progress after a delay
    setTimeout(() => {
        animateCircularProgress();
    }, 500);
    
    // Log initialization complete
    console.log('LearnOffline Dashboard initialized successfully!');
}

// ==================== DOM READY ====================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// ==================== ADD GRADIENT DEFINITION FOR SVG ====================
// This ensures SVG gradients work properly
document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('svg defs')) {
        const svgs = document.querySelectorAll('.circular-progress');
        svgs.forEach(svg => {
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            gradient.id = 'gradient';
            gradient.setAttribute('x1', '0%');
            gradient.setAttribute('y1', '0%');
            gradient.setAttribute('x2', '100%');
            gradient.setAttribute('y2', '100%');
            
            const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop1.setAttribute('offset', '0%');
            stop1.setAttribute('stop-color', '#667eea');
            
            const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop2.setAttribute('offset', '100%');
            stop2.setAttribute('stop-color', '#764ba2');
            
            gradient.appendChild(stop1);
            gradient.appendChild(stop2);
            defs.appendChild(gradient);
            svg.insertBefore(defs, svg.firstChild);
        });
    }
});
