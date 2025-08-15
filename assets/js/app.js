// Main application initialization and coordination
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Car Analysis Dashboard starting...');
    
    // Initialize the application
    await initializeApp();
});

// Update loading progress
function updateLoadingProgress(message, percentage) {
    const progressText = document.getElementById('loadingProgress');
    const progressBar = document.getElementById('loadingBar');
    
    if (progressText) progressText.textContent = message;
    if (progressBar) progressBar.style.width = percentage + '%';
}

// Main application initialization
async function initializeApp() {
    try {
        updateLoadingProgress('Loading data...', 10);
        
        // Show loading state
        document.body.classList.remove('loaded');
        
        // Load all data first
        console.log('Loading data...');
        const dataLoaded = await loadAllData();
        updateLoadingProgress('Data loaded, setting up filters...', 30);
        
        if (!dataLoaded) {
            console.warn('Using fallback data due to loading issues');
        }
        
        // Initialize filtered data
        initializeFilteredData();
        
        // Setup filters and populate options
        populateFilters();
        
        // Setup event listeners
        setupEventListeners();
        
        updateLoadingProgress('Creating charts...', 50);
        
        // Initial dashboard update
        updateDashboard();
        
        updateLoadingProgress('Setting up recommendations...', 70);
        
        // Initialize personalized recommendations
        initializePersonalizedRecommendations();
        
        updateLoadingProgress('Complete!', 100);
        
        // Hide loading screen and show dashboard
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
            document.body.classList.add('loaded');
        }, 500);
        
        console.log('Dashboard initialized successfully');
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showErrorMessage('Failed to initialize dashboard. Please refresh the page.');
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Filter listeners
    setupFilterListeners();
    
    // Recommendation slider listeners
    setupRecommendationListeners();
    
    // Refresh button
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            refreshBtn.disabled = true;
            refreshBtn.textContent = '🔄 Refreshing...';
            
            try {
                await refreshData();
                populateFilters();
                updateDashboard();
                updateRecommendations();
            } catch (error) {
                console.error('Error refreshing data:', error);
                showErrorMessage('Failed to refresh data. Please try again.');
            } finally {
                refreshBtn.disabled = false;
                refreshBtn.textContent = '🔄 Refresh Data';
            }
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Window resize handler for chart responsiveness
    window.addEventListener('resize', debounce(() => {
        if (typeof createAllCharts === 'function') {
            createAllCharts();
        }
    }, 250));
}

// Setup recommendation slider listeners
function setupRecommendationListeners() {
    const sliders = ['costWeight', 'tcoWeight', 'reliabilityWeight', 'styleWeight'];
    
    sliders.forEach(sliderId => {
        const slider = document.getElementById(sliderId);
        const valueDisplay = document.getElementById(sliderId + 'Value');
        
        if (slider && valueDisplay) {
            slider.addEventListener('input', () => {
                valueDisplay.textContent = slider.value;
                
                // Debounced update of recommendations
                if (typeof updateRecommendations === 'function') {
                    debouncedUpdateRecommendations();
                }
            });
        }
    });
}

// Debounced recommendation updates
const debouncedUpdateRecommendations = debounce(() => {
    if (typeof updateRecommendations === 'function') {
        updateRecommendations();
    }
}, 300);

// Handle keyboard shortcuts
function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + R: Refresh data
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        const refreshBtn = document.querySelector('.refresh-btn');
        if (refreshBtn) refreshBtn.click();
    }
    
    // Escape: Close modal
    if (event.key === 'Escape') {
        const modal = document.getElementById('carModal');
        if (modal && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    }
    
    // Ctrl/Cmd + F: Focus on make filter
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        const makeFilter = document.getElementById('makeFilter');
        if (makeFilter) makeFilter.focus();
    }
}

// Initialize personalized recommendations
function initializePersonalizedRecommendations() {
    if (carData && carData.length > 0) {
        if (typeof updateRecommendations === 'function') {
            updateRecommendations();
        }
    }
}

// Show error message to user
function showErrorMessage(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e53e3e;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

// Performance monitoring
function monitorPerformance() {
    // Monitor chart render performance
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.name.includes('chart') || entry.name.includes('dashboard')) {
                console.log(`Performance: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
            }
        }
    });
    
    try {
        observer.observe({ entryTypes: ['measure'] });
    } catch (e) {
        // Performance Observer not supported
        console.log('Performance monitoring not available');
    }
}

// Accessibility enhancements
function enhanceAccessibility() {
    // Add ARIA labels to charts
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach((container, index) => {
        const canvas = container.querySelector('canvas');
        const title = container.querySelector('.chart-title');
        
        if (canvas && title) {
            canvas.setAttribute('aria-label', `Chart: ${title.textContent}`);
            canvas.setAttribute('role', 'img');
        }
    });
    
    // Add skip link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        z-index: 1000;
    `;
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content landmark
    const container = document.querySelector('.container');
    if (container) {
        container.id = 'main-content';
        container.setAttribute('role', 'main');
    }
}

// Debounce utility (if not already defined)
if (typeof debounce === 'undefined') {
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
    window.debounce = debounce;
}

// Export functions for console access and debugging
window.initializeApp = initializeApp;
window.monitorPerformance = monitorPerformance;
window.enhanceAccessibility = enhanceAccessibility;

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Add global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showErrorMessage('An unexpected error occurred. Some features may not work properly.');
});

// Add unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showErrorMessage('A data loading error occurred. Please try refreshing the page.');
});

console.log('App.js loaded successfully');