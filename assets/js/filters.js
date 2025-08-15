// Filter functionality module

// Debounce function for performance
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Populate filter options from data
function populateFilters() {
    populateMakeFilter();
}

// Populate make/brand filter
function populateMakeFilter() {
    const makeFilter = document.getElementById('makeFilter');
    if (!makeFilter || !window.carData) return;
    
    // Clear existing options except "All Makes"
    makeFilter.innerHTML = '<option value="">All Makes</option>';
    
    const makes = [...new Set(window.carData.map(car => car.make || car.brand))].sort();
    
    makes.forEach(make => {
        if (make) {
            const option = document.createElement('option');
            option.value = make;
            option.textContent = make;
            makeFilter.appendChild(option);
        }
    });
}

// Apply all filters to the data
function applyFilters() {
    const makeFilter = document.getElementById('makeFilter')?.value || '';
    const typeFilter = document.getElementById('typeFilter')?.value || '';
    const fuelFilter = document.getElementById('fuelFilter')?.value || '';
    const priceFilter = document.getElementById('priceFilter')?.value || '';

    window.filteredData = window.carData.filter(car => {
        // Make filter
        if (makeFilter !== '' && (car.make !== makeFilter && car.brand !== makeFilter)) {
            return false;
        }

        // Type filter
        if (typeFilter !== '' && car.body_type !== typeFilter && car.category !== typeFilter) {
            return false;
        }

        // Fuel filter
        if (fuelFilter !== '' && car.fuel_type !== fuelFilter && car.fuel !== fuelFilter) {
            return false;
        }

        // Price range filter
        if (priceFilter !== '') {
            const [minPrice, maxPrice] = priceFilter.split('-').map(p => parseInt(p));
            if (maxPrice && (car.price < minPrice || car.price >= maxPrice)) {
                return false;
            }
            if (!maxPrice && car.price < minPrice) {
                return false;
            }
        }

        return true;
    });

    updateDashboard();
}

// Debounced version of applyFilters for performance
const debouncedApplyFilters = debounce(applyFilters, 150);

// Update the dashboard with filtered data
function updateDashboard() {
    // Update statistics
    updateStatistics();
    
    // Update charts
    if (typeof updateCharts === 'function') {
        updateCharts(window.filteredData);
    }
    
    // Update recommendations
    if (typeof updateRecommendations === 'function') {
        updateRecommendations();
    }
    
    // Update data table
    updateDataTable();
    
    console.log(`Dashboard updated with ${window.filteredData.length} cars`);
}

// Update the data table with filtered cars
function updateDataTable() {
    const tableBody = document.getElementById('carTableBody');
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Sort filtered data by TCO (best value first)
    const sortedData = [...window.filteredData].sort((a, b) => a.tco - b.tco);
    
    sortedData.forEach(car => {
        const row = document.createElement('tr');
        row.onclick = () => showCarDetails(car);
        
        // Calculate a simple score based on TCO efficiency
        const score = Math.round(((50000 - car.tco) / 50000) * 10);
        const displayScore = Math.max(1, Math.min(10, score));
        
        row.innerHTML = `
            <td><strong>${car.name}</strong></td>
            <td>$${car.price.toLocaleString()}</td>
            <td>$${car.tco.toLocaleString()}</td>
            <td>${car.reliability}/10</td>
            <td>${car.mpg || car.mpg_combined || 'N/A'}</td>
            <td>${car.safety || car.safety_rating || 'N/A'}/5</td>
            <td>${car.body_type || car.category || 'N/A'}</td>
            <td>${car.fuel_type || car.fuel || 'N/A'}</td>
            <td><span style="color: ${displayScore >= 8 ? '#38a169' : displayScore >= 6 ? '#dd6b20' : '#e53e3e'}">${displayScore}/10</span></td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Show detailed information modal for a car
function showCarDetails(car) {
    const modal = document.getElementById('carModal');
    const modalContent = document.getElementById('modalContent');
    
    if (!modal || !modalContent) return;
    
    // Calculate detailed TCO breakdown
    const purchasePrice = car.price;
    const depreciationLoss = car.price * ((car.depreciation_3yr_percent || 35) / 100);
    const fuelCost3yr = (car.annual_fuel_cost || car.fuelCost || 2000) * 3;
    const maintenance3yr = (car.maintenance_annual || car.maintenanceCost || 800) * 3;
    const insurance3yr = (car.insurance_annual || car.insuranceCost || 1200) * 3;
    const registration3yr = 500 * 3; // CA registration estimate
    const financingCost = car.financingCost || 0;
    
    modalContent.innerHTML = `
        <h2>${car.name}</h2>
        
        <div class="car-detail-grid">
            <div class="detail-card">
                <div class="detail-title">💰 Purchase & Value</div>
                <div class="detail-value">$${purchasePrice.toLocaleString()}</div>
                <div class="detail-breakdown">
                    Purchase Price: $${purchasePrice.toLocaleString()}<br>
                    3-Year Depreciation: ${car.depreciation_3yr_percent || 35}% ($${depreciationLoss.toLocaleString()})<br>
                    Estimated Resale: $${(purchasePrice - depreciationLoss).toLocaleString()}
                </div>
            </div>
            
            <div class="detail-card">
                <div class="detail-title">📊 3-Year Total Cost</div>
                <div class="detail-value">$${car.tco.toLocaleString()}</div>
                <div class="detail-breakdown">
                    Depreciation: $${depreciationLoss.toLocaleString()}<br>
                    Fuel (3yr): $${fuelCost3yr.toLocaleString()}<br>
                    Maintenance (3yr): $${maintenance3yr.toLocaleString()}<br>
                    Insurance (3yr): $${insurance3yr.toLocaleString()}<br>
                    Registration (3yr): $${registration3yr.toLocaleString()}<br>
                    ${financingCost > 0 ? `Financing: $${financingCost.toLocaleString()}<br>` : ''}
                </div>
            </div>
            
            <div class="detail-card">
                <div class="detail-title">🔧 Reliability & Safety</div>
                <div class="detail-value">${car.reliability}/10 Reliability</div>
                <div class="detail-breakdown">
                    Reliability Score: ${car.reliability}/10<br>
                    Safety Rating: ${car.safety || car.safety_rating || 'N/A'}/5<br>
                    Fuel Economy: ${car.mpg || car.mpg_combined || 'N/A'} MPG
                </div>
            </div>
            
            <div class="detail-card">
                <div class="detail-title">📈 Annual Costs</div>
                <div class="detail-value">$${((car.annual_fuel_cost || 2000) + (car.maintenance_annual || 800) + (car.insurance_annual || 1200)).toLocaleString()}/year</div>
                <div class="detail-breakdown">
                    Fuel: $${(car.annual_fuel_cost || car.fuelCost || 2000).toLocaleString()}/year<br>
                    Maintenance: $${(car.maintenance_annual || car.maintenanceCost || 800).toLocaleString()}/year<br>
                    Insurance: $${(car.insurance_annual || car.insuranceCost || 1200).toLocaleString()}/year
                </div>
            </div>
            
            <div class="detail-card">
                <div class="detail-title">🎯 Style Score</div>
                <div class="detail-value">${car.founder_credibility_score || car.founderCredibility || 5}/10</div>
                <div class="detail-breakdown">
                    Brand: ${car.make || car.brand}<br>
                    Type: ${car.body_type || car.category || 'N/A'}<br>
                    Fuel: ${car.fuel_type || car.fuel || 'N/A'}<br>
                    Year: ${car.year || 'N/A'}
                </div>
            </div>
            
            ${car.livePriceData ? `
            <div class="detail-card">
                <div class="detail-title">🔴 Live Market Data</div>
                <div class="detail-value">$${car.livePriceData.current.toLocaleString()}</div>
                <div class="detail-breakdown">
                    Current Price: $${car.livePriceData.current.toLocaleString()}<br>
                    Range: $${car.livePriceData.min.toLocaleString()} - $${car.livePriceData.max.toLocaleString()}<br>
                    Listings: ${car.livePriceData.listings}<br>
                    Trend: ${car.livePriceData.trend}
                </div>
            </div>
            ` : ''}
        </div>
        
        ${car.notes ? `
        <div class="warning">
            <div class="warning-title">📝 Notes</div>
            ${car.notes}
        </div>
        ` : ''}
        
        ${car.tco > 30000 ? `
        <div class="warning">
            <div class="warning-title">⚠️ High TCO Warning</div>
            This car has a high 3-year total cost of ownership. Consider if the benefits justify the cost.
        </div>
        ` : ''}
        
        ${(car.reliability || 7) < 6 ? `
        <div class="warning">
            <div class="warning-title">🔧 Reliability Concern</div>
            This car has below-average reliability ratings. Budget extra for potential repairs.
        </div>
        ` : ''}
    `;
    
    modal.style.display = 'block';
}

// Setup filter event listeners
function setupFilterListeners() {
    // Filter change listeners
    const makeFilter = document.getElementById('makeFilter');
    const typeFilter = document.getElementById('typeFilter');
    const fuelFilter = document.getElementById('fuelFilter');
    const priceFilter = document.getElementById('priceFilter');
    
    if (makeFilter) makeFilter.addEventListener('change', debouncedApplyFilters);
    if (typeFilter) typeFilter.addEventListener('change', debouncedApplyFilters);
    if (fuelFilter) fuelFilter.addEventListener('change', debouncedApplyFilters);
    if (priceFilter) priceFilter.addEventListener('change', debouncedApplyFilters);
    
    // Modal close listeners
    const modal = document.getElementById('carModal');
    const closeBtn = document.querySelector('.close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    if (modal) {
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

// Reset all filters
function resetFilters() {
    document.getElementById('makeFilter').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('fuelFilter').value = '';
    document.getElementById('priceFilter').value = '';
    
    applyFilters();
}

// Export functions for use in other modules
window.applyFilters = applyFilters;
window.debouncedApplyFilters = debouncedApplyFilters;
window.updateDashboard = updateDashboard;
window.updateDataTable = updateDataTable;
window.showCarDetails = showCarDetails;
window.populateFilters = populateFilters;
window.populateMakeFilter = populateMakeFilter;
window.setupFilterListeners = setupFilterListeners;
window.resetFilters = resetFilters;