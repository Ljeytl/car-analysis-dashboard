// Main application initialization and coordination
import { DataLoader } from './data-loader.js';
import { RecommendationEngine } from './recommendation-engine.js';
import { ChartsManager } from './charts.js';
import { UIControls } from './ui-controls.js';

// Main Application class
class SmartCarBuyerApp {
    constructor() {
        this.dataLoader = new DataLoader();
        this.recommendationEngine = new RecommendationEngine();
        this.chartsManager = new ChartsManager();
        this.uiControls = new UIControls(
            this.dataLoader, 
            this.recommendationEngine, 
            this.chartsManager
        );
    }

    // Initialize the application
    async init() {
        try {
            console.log('Initializing Smart Car Buyer App...');
            
            // Initialize UI and load data
            await this.uiControls.initialize();
            
            console.log('App initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showErrorMessage('Failed to load application. Please refresh the page.');
        }
    }

    // Show error message to user
    showErrorMessage(message) {
        const recommendationsList = document.getElementById('recommendationsList');
        if (recommendationsList) {
            recommendationsList.innerHTML = `
                <div style="text-align: center; color: var(--accent-red); padding: var(--spacing-xl);">
                    <h4>⚠️ Error</h4>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    // Get application instances for debugging
    getInstances() {
        return {
            dataLoader: this.dataLoader,
            recommendationEngine: this.recommendationEngine,
            chartsManager: this.chartsManager,
            uiControls: this.uiControls
        };
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    window.app = new SmartCarBuyerApp();
    await window.app.init();
});

// Export for potential use in other modules or debugging
export { SmartCarBuyerApp };