// UI Controls module for sliders, filters, and DOM updates
export class UIControls {
    constructor(dataLoader, recommendationEngine, chartsManager) {
        this.dataLoader = dataLoader;
        this.recommendationEngine = recommendationEngine;
        this.chartsManager = chartsManager;
        this.setupEventListeners();
    }

    // Setup event listeners for all UI controls
    setupEventListeners() {
        // Add event listeners for sliders
        const sliders = ['costWeight', 'tcoWeight', 'reliabilityWeight', 'styleWeight', 'fuelWeight'];
        sliders.forEach(slider => {
            const element = document.getElementById(slider);
            if (element) {
                element.addEventListener('input', () => this.updateRecommendations());
            }
        });

        // Add event listeners for filters
        const brandFilter = document.getElementById('brandFilter');
        const fuelFilter = document.getElementById('fuelFilter');
        const maxPriceFilter = document.getElementById('maxPrice');
        const priorityMode = document.getElementById('priorityMode');

        if (brandFilter) brandFilter.addEventListener('change', () => this.applyFilters());
        if (fuelFilter) fuelFilter.addEventListener('change', () => this.applyFilters());
        if (maxPriceFilter) maxPriceFilter.addEventListener('change', () => this.applyFilters());
        if (priorityMode) priorityMode.addEventListener('change', () => this.updateRecommendations());

        // Refresh data button
        const refreshBtn = document.getElementById('refreshDataBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }
    }

    // Populate brand filter dropdown
    populateBrandFilter() {
        const brandFilter = document.getElementById('brandFilter');
        if (!brandFilter) return;

        const brands = this.dataLoader.getBrands();
        brandFilter.innerHTML = '<option value="">All Brands</option>' + 
            brands.map(brand => `<option value="${brand}">${brand}</option>`).join('');
    }

    // Apply filters to car data
    applyFilters() {
        const brandFilter = document.getElementById('brandFilter')?.value || '';
        const fuelFilter = document.getElementById('fuelFilter')?.value || '';
        const maxPrice = document.getElementById('maxPrice')?.value || '';
        
        const filters = {
            brand: brandFilter,
            fuel: fuelFilter,
            maxPrice: maxPrice
        };

        this.dataLoader.applyFilters(filters);
        this.updateCarTable();
        this.updateRecommendations();
        this.updateAnalysisCharts();
    }

    // Update recommendations based on user preferences
    updateRecommendations() {
        // Update slider value displays
        this.updateSliderDisplays();
        
        // Get current weights and priority mode
        const weights = this.getWeightsFromUI();
        const filteredData = this.dataLoader.getFilteredData();
        
        // Skip if no data loaded yet
        if (!filteredData || filteredData.length === 0) return;
        
        // Get top cars for chart and recommendations
        const topCarsForChart = this.recommendationEngine.getTopCarsForChart(filteredData, weights, 10);
        const topRecommendations = this.recommendationEngine.getTopRecommendations(filteredData, weights, 5);
        
        // Update UI components
        this.chartsManager.updatePersonalizedChart(topCarsForChart);
        this.updateRecommendationsList(topRecommendations);
    }

    // Update slider value displays
    updateSliderDisplays() {
        const sliders = [
            { id: 'costWeight', display: 'costWeightValue' },
            { id: 'tcoWeight', display: 'tcoWeightValue' },
            { id: 'reliabilityWeight', display: 'reliabilityWeightValue' },
            { id: 'styleWeight', display: 'styleWeightValue' },
            { id: 'fuelWeight', display: 'fuelWeightValue' }
        ];

        sliders.forEach(slider => {
            const element = document.getElementById(slider.id);
            const display = document.getElementById(slider.display);
            if (element && display) {
                display.textContent = element.value;
            }
        });
    }

    // Get weights from UI sliders and priority mode
    getWeightsFromUI() {
        const priorityMode = document.getElementById('priorityMode')?.value || 'balanced';
        
        const sliderValues = {
            cost: parseFloat(document.getElementById('costWeight')?.value || 3),
            tco: parseFloat(document.getElementById('tcoWeight')?.value || 4),
            reliability: parseFloat(document.getElementById('reliabilityWeight')?.value || 3),
            style: parseFloat(document.getElementById('styleWeight')?.value || 2),
            fuel: parseFloat(document.getElementById('fuelWeight')?.value || 3)
        };
        
        return this.recommendationEngine.getWeights(sliderValues, priorityMode);
    }

    // Update recommendations list in the DOM
    updateRecommendationsList(topCars) {
        const listElement = document.getElementById('recommendationsList');
        if (!listElement) return;
        
        if (!topCars || topCars.length === 0) {
            listElement.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: var(--spacing-xl);">No cars match your current filters. Try adjusting your preferences.</p>';
            return;
        }
        
        listElement.innerHTML = topCars.map((car, index) => `
            <div class="recommendation-card">
                <div style="display: flex; align-items: center; margin-bottom: var(--spacing-xs);">
                    <span class="recommendation-rank rank-${index + 1}">${index + 1}</span>
                    <div class="car-title">${car.name}</div>
                    <div class="score-badge">${car.weightedScore}/10</div>
                </div>
                <div class="car-metrics">
                    <div class="metric">💰 $${car.price.toLocaleString()}</div>
                    <div class="metric">📊 $${car.tco.toLocaleString()} TCO</div>
                    <div class="metric">🔧 ${car.reliability}/10</div>
                    <div class="metric">⛽ ${car.fuel}</div>
                </div>
                <div class="recommendation-reason">${car.recommendation}</div>
            </div>
        `).join('');
    }

    // Update car data table
    updateCarTable() {
        const tableBody = document.getElementById('carTableBody');
        if (!tableBody) return;

        const filteredData = this.dataLoader.getFilteredData();
        
        if (filteredData.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: var(--spacing-xl); color: var(--text-muted);">No cars match your filters.</td></tr>';
            return;
        }
        
        tableBody.innerHTML = filteredData.map(car => `
            <tr>
                <td><strong>${car.name}</strong></td>
                <td>$${car.price.toLocaleString()}</td>
                <td>$${car.tco.toLocaleString()}</td>
                <td>${car.fuel}</td>
                <td>${car.reliability}/10</td>
                <td>${car.notes || 'N/A'}</td>
            </tr>
        `).join('');
    }

    // Refresh data function
    async refreshData() {
        const refreshBtn = document.getElementById('refreshDataBtn');
        if (refreshBtn) {
            refreshBtn.textContent = '🔄 Refreshing...';
            refreshBtn.disabled = true;
        }

        try {
            await this.dataLoader.refreshData();
            this.populateBrandFilter();
            this.updateCarTable();
            this.updateRecommendations();
            this.updateAnalysisCharts();
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            if (refreshBtn) {
                refreshBtn.textContent = '🔄 Refresh Data';
                refreshBtn.disabled = false;
            }
        }
    }

    // Update analysis charts with current filtered data
    updateAnalysisCharts() {
        const filteredData = this.dataLoader.getFilteredData();
        if (filteredData && filteredData.length > 0) {
            this.chartsManager.updateAllCharts(filteredData);
        }
    }

    // Initialize UI after data is loaded
    async initialize() {
        await this.dataLoader.loadData();
        this.populateBrandFilter();
        this.updateCarTable();
        this.updateRecommendations();
        this.updateAnalysisCharts();
    }
}