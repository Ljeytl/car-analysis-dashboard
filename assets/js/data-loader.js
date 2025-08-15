// Data loading and processing module
window.carData = window.carData || [];
window.filteredData = window.filteredData || [];
let livePrices = {};

// Parse CSV data and convert to dashboard format
function parseCSVData(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    const cars = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const car = {};
        
        headers.forEach((header, index) => {
            car[header.trim()] = values[index] ? values[index].trim().replace(/"/g, '') : '';
        });
        
        // Convert to our dashboard format
        const dashboardCar = {
            name: `${car.make} ${car.model} (${car.year_range})`,
            make: car.make,
            model: car.model,
            year: car.year_range.includes('-') ? car.year_range.split('-')[1] : car.year_range,
            price: Math.round((parseInt(car.price_range_low) + parseInt(car.price_range_high)) / 2),
            depreciation_3yr_percent: parseInt(car.depreciation_3yr_percent),
            fuel_type: car.fuel_type,
            fuel: car.fuel_type,
            brand: car.make,
            category: car.category,
            reliability: parseInt(car.reliability_score),
            annual_fuel_cost: parseInt(car.annual_fuel_cost),
            fuelCost: parseInt(car.annual_fuel_cost),
            maintenance_annual: parseInt(car.maintenance_annual),
            maintenanceCost: parseInt(car.maintenance_annual),
            insurance_annual: parseInt(car.insurance_annual),
            insuranceCost: parseInt(car.insurance_annual),
            founder_credibility_score: parseInt(car.founder_credibility_score || car.coolness_score),
            founderCredibility: parseInt(car.founder_credibility_score || car.coolness_score),
            mpg_combined: parseInt(car.mpg_combined || 25),
            mpg: parseInt(car.mpg_combined || 25),
            safety_rating: parseFloat(car.safety_rating || 4),
            safety: parseFloat(car.safety_rating || 4),
            body_type: car.body_type,
            notes: car.notes,
            staticPrice: Math.round((parseInt(car.price_range_low) + parseInt(car.price_range_high)) / 2)
        };
        
        // Check for live price data and update if available
        const liveData = getLivePriceData(car.make, car.model);
        if (liveData && liveData.listings_count > 0) {
            dashboardCar.price = liveData.current_price;
            dashboardCar.livePriceData = {
                current: liveData.current_price,
                min: liveData.min_price,
                max: liveData.max_price,
                listings: liveData.listings_count,
                sources: liveData.price_sources,
                trend: liveData.price_trend || 'stable',
                marketStatus: liveData.market_status || 'unknown',
                isLive: true
            };
            dashboardCar.notes += ` | 🔴 LIVE: $${liveData.current_price.toLocaleString()} (${liveData.listings_count} listings)`;
        }
        
        // Calculate financing cost (assuming 60-month loan, 750 credit score)
        const estimatedAPR = getEstimatedAPR(car.make, car.year_range.split('-')[0], false, 750);
        const financingCost = calculateFinancingCost(dashboardCar.price, estimatedAPR, 60);
        
        // Calculate TCO: (price * depreciation%) + (annual costs * 3 years) + financing cost
        dashboardCar.tco = Math.round(
            dashboardCar.price * (dashboardCar.depreciation_3yr_percent / 100) + 
            (dashboardCar.fuelCost + dashboardCar.maintenanceCost + dashboardCar.insuranceCost) * 3 +
            financingCost
        );
        
        // Store APR and financing info for display
        dashboardCar.estimatedAPR = estimatedAPR;
        dashboardCar.financingCost = financingCost;
        
        cars.push(dashboardCar);
    }
    
    return cars;
}

// Load live pricing data
async function loadLivePrices() {
    try {
        const response = await fetch('./live_prices.json');
        livePrices = await response.json();
        console.log('Live prices loaded successfully');
    } catch (error) {
        console.warn('Could not load live prices:', error);
        livePrices = {};
    }
}

// Get live price data for a specific car
function getLivePriceData(make, model) {
    const key = `${make} ${model}`.toLowerCase().replace(/\s+/g, '_');
    return livePrices[key];
}

// Estimate APR based on car details and credit score
function getEstimatedAPR(make, year, isUsed = true, creditScore = 750) {
    let baseAPR = isUsed ? 5.5 : 4.5; // Used cars typically have higher rates
    
    // Adjust for vehicle age
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - parseInt(year);
    if (vehicleAge > 5) baseAPR += 1.0;
    if (vehicleAge > 10) baseAPR += 2.0;
    
    // Adjust for credit score
    if (creditScore < 650) baseAPR += 3.0;
    else if (creditScore < 700) baseAPR += 1.5;
    else if (creditScore > 800) baseAPR -= 0.5;
    
    // Luxury brand adjustment
    const luxuryBrands = ['BMW', 'Mercedes', 'Audi', 'Lexus', 'Infiniti', 'Acura'];
    if (luxuryBrands.includes(make)) {
        baseAPR += 0.5; // Luxury cars may have special financing rates
    }
    
    return Math.max(2.9, Math.min(15.0, baseAPR)); // Cap between 2.9% and 15%
}

// Calculate total financing cost over loan term
function calculateFinancingCost(principal, annualRate, months) {
    if (annualRate === 0) return 0;
    
    const monthlyRate = annualRate / 100 / 12;
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalPaid = monthlyPayment * months;
    return Math.round(totalPaid - principal);
}

// Load cars from Supabase (placeholder - would need actual implementation)
async function loadCarsFromSupabase() {
    // Placeholder for Supabase integration
    return [];
}

// Load manual cars from local storage
function loadManualCarsFromStorage() {
    try {
        const stored = localStorage.getItem('manualCars');
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.warn('Could not load manual cars from storage:', error);
        return [];
    }
}

// Save manual cars to local storage
function saveManualCarsToStorage(cars) {
    try {
        localStorage.setItem('manualCars', JSON.stringify(cars));
    } catch (error) {
        console.warn('Could not save manual cars to storage:', error);
    }
}

// Load all data (CSV + live prices + manual cars)
async function loadAllData() {
    console.log('Loading all data...');
    
    // Try to load live prices first
    await loadLivePrices();
    
    // Then load CSV data
    try {
        const response = await fetch('./comprehensive_car_analysis.csv');
        const csvText = await response.text();
        window.carData = parseCSVData(csvText);
        console.log(`Loaded ${window.carData.length} cars from CSV`);
        
        // Load manual cars from Supabase database first, then local storage as backup
        const supabaseCars = await loadCarsFromSupabase();
        const localCars = loadManualCarsFromStorage();
        
        // Merge cars from both sources, preferring Supabase over local
        const allManualCars = [...supabaseCars];
        localCars.forEach(localCar => {
            const exists = supabaseCars.some(supabaseCar => 
                supabaseCar.make === localCar.make && 
                supabaseCar.model === localCar.model && 
                supabaseCar.year === localCar.year
            );
            if (!exists) {
                allManualCars.push(localCar);
            }
        });
        
        if (allManualCars.length > 0) {
            window.carData.push(...allManualCars);
            console.log(`Added ${allManualCars.length} family cars (${supabaseCars.length} from Supabase, ${localCars.length} from local storage)`);
        }
        
        // Count how many have live data
        const liveDataCount = window.carData.filter(car => car.livePriceData?.isLive).length;
        console.log(`${liveDataCount} cars have live pricing data`);
        
        return true;
    } catch (error) {
        console.error('Error loading CSV:', error);
        // Fallback to basic data if CSV fails
        window.carData = [
            {
                name: 'Tesla Model 3', 
                price: 25500, 
                depreciation_3yr_percent: 45, 
                fuel: 'Electric', 
                fuel_type: 'Electric',
                brand: 'Tesla', 
                make: 'Tesla',
                model: 'Model 3',
                category: 'Electric', 
                reliability: 8, 
                fuelCost: 825, 
                annual_fuel_cost: 825,
                maintenanceCost: 900, 
                maintenance_annual: 900,
                insuranceCost: 1200,
                insurance_annual: 1200,
                founderCredibility: 5,
                founder_credibility_score: 5,
                mpg: 120,
                mpg_combined: 120,
                safety: 5,
                safety_rating: 5,
                tco: 25500 * 0.45 + 825 * 3 + 900 * 3 + 1200 * 3,
                notes: "Fallback data - CSV failed to load"
            }
        ];
        return false;
    }
}

// Initialize filtered data
function initializeFilteredData() {
    window.filteredData = [...window.carData];
    return window.filteredData;
}

// Update statistics based on current filtered data
function updateStatistics() {
    if (window.filteredData.length === 0) return;
    
    const avgPrice = Math.round(window.filteredData.reduce((sum, car) => sum + car.price, 0) / window.filteredData.length);
    const avgTCO = Math.round(window.filteredData.reduce((sum, car) => sum + car.tco, 0) / window.filteredData.length);
    const bestValueCar = window.filteredData.reduce((best, car) => 
        (car.tco / car.price) < (best.tco / best.price) ? car : best
    );
    
    // Update DOM elements
    document.getElementById('totalCars').textContent = window.filteredData.length;
    document.getElementById('avgPrice').textContent = '$' + avgPrice.toLocaleString();
    document.getElementById('avgTCO').textContent = '$' + avgTCO.toLocaleString();
    document.getElementById('bestValue').textContent = bestValueCar.make + ' ' + bestValueCar.model;
}

// Refresh data function for button
async function refreshData() {
    const success = await loadAllData();
    if (success) {
        initializeFilteredData();
        updateStatistics();
        if (typeof updateCharts === 'function') {
            updateCharts(window.filteredData);
        }
        if (typeof updateRecommendations === 'function') {
            updateRecommendations();
        }
        console.log('Data refreshed successfully');
    }
}

// Export data and functions for use in other modules
window.loadAllData = loadAllData;
window.initializeFilteredData = initializeFilteredData;
window.updateStatistics = updateStatistics;
window.refreshData = refreshData;
window.parseCSVData = parseCSVData;
window.getLivePriceData = getLivePriceData;
window.getEstimatedAPR = getEstimatedAPR;
window.calculateFinancingCost = calculateFinancingCost;