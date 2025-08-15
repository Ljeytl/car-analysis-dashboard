// Chart management and creation functions
window.charts = window.charts || {};
let localFilteredData = [];

// Chart color utilities
function getCarColor(car) {
    const founderScore = car.founderCredibility || car.founder_credibility_score || 5;
    if (founderScore >= 8) return 'rgba(255, 215, 0, 0.8)'; // Gold for high credibility
    if (founderScore >= 6) return 'rgba(99, 179, 237, 0.8)'; // Blue for medium
    return 'rgba(220, 53, 69, 0.8)'; // Red for low
}

// TCO vs Reliability Scatter Chart
function createTCOReliabilityChart() {
    const ctx = document.getElementById('reliabilityChart').getContext('2d');
    if (charts.tcoReliability) charts.tcoReliability.destroy();
    
    charts.tcoReliability = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Cars',
                data: localFilteredData.map((car, index) => ({
                    x: car.reliability,
                    y: car.tco,
                    label: car.name,
                    carIndex: index
                })),
                backgroundColor: localFilteredData.map(car => getCarColor(car)),
                pointRadius: 10,
                pointHoverRadius: 12
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const dataIndex = elements[0].index;
                    showCarDetails(localFilteredData[dataIndex]);
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const car = localFilteredData[context.dataIndex];
                            return `${car.name}: $${car.tco.toLocaleString()} TCO, ${car.reliability}/10 reliability (Click for details)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Reliability Score (1-10)', color: 'rgba(255,255,255,0.8)' },
                    min: 4, max: 10,
                    ticks: { color: 'rgba(255,255,255,0.8)' },
                    grid: { color: 'rgba(255,255,255,0.2)' }
                },
                y: {
                    title: { display: true, text: 'True 3-Year TCO ($)', color: 'rgba(255,255,255,0.8)' },
                    ticks: {
                        color: 'rgba(255,255,255,0.8)',
                        callback: function(value) {
                            return '$' + (value / 1000).toFixed(0) + 'k';
                        }
                    },
                    grid: { color: 'rgba(255,255,255,0.2)' }
                }
            }
        }
    });
}

// Depreciation Analysis Chart
function createDepreciationChart() {
    const ctx = document.getElementById('depreciationChart').getContext('2d');
    if (charts.depreciation) charts.depreciation.destroy();
    
    const depreciationData = localFilteredData
        .sort((a, b) => b.depreciation_3yr_percent - a.depreciation_3yr_percent)
        .slice(0, 15);
    
    charts.depreciation = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: depreciationData.map(car => car.name.substring(0, 15) + '...'),
            datasets: [{
                label: '3-Year Depreciation %',
                data: depreciationData.map(car => car.depreciation_3yr_percent),
                backgroundColor: depreciationData.map(car => 
                    car.depreciation_3yr_percent > 40 ? 'rgba(220, 53, 69, 0.8)' : 
                    car.depreciation_3yr_percent > 25 ? 'rgba(255, 193, 7, 0.8)' : 
                    'rgba(40, 167, 69, 0.8)'
                ),
                borderColor: 'rgba(255,255,255,0.3)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const dataIndex = elements[0].index;
                    showCarDetails(depreciationData[dataIndex]);
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const car = depreciationData[context.dataIndex];
                            const depreciationAmount = car.price * (car.depreciation_3yr_percent / 100);
                            return [
                                `${car.name}`,
                                `Depreciation: ${car.depreciation_3yr_percent}%`,
                                `Value Loss: $${depreciationAmount.toLocaleString()}`,
                                `(Click for details)`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { 
                        color: 'rgba(255,255,255,0.8)',
                        maxRotation: 45
                    },
                    grid: { color: 'rgba(255,255,255,0.2)' }
                },
                y: {
                    title: { display: true, text: 'Depreciation %', color: 'rgba(255,255,255,0.8)' },
                    ticks: { 
                        color: 'rgba(255,255,255,0.8)',
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: { color: 'rgba(255,255,255,0.2)' }
                }
            }
        }
    });
}

// Fuel Type Distribution Chart
function createFuelTypeChart() {
    const ctx = document.getElementById('fuelChart').getContext('2d');
    if (charts.fuelType) charts.fuelType.destroy();
    
    const fuelCounts = {};
    localFilteredData.forEach(car => {
        const fuel = car.fuel_type || car.fuel || 'Unknown';
        fuelCounts[fuel] = (fuelCounts[fuel] || 0) + 1;
    });
    
    charts.fuelType = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(fuelCounts),
            datasets: [{
                data: Object.values(fuelCounts),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                ],
                borderColor: 'rgba(255,255,255,0.3)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: 'rgba(255,255,255,0.8)' }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = Object.values(fuelCounts).reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} cars (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Make Distribution Chart
function createMakeChart() {
    const ctx = document.getElementById('makeChart').getContext('2d');
    if (charts.make) charts.make.destroy();
    
    const makeCounts = {};
    localFilteredData.forEach(car => {
        const make = car.make || car.brand || 'Unknown';
        makeCounts[make] = (makeCounts[make] || 0) + 1;
    });
    
    const sortedMakes = Object.entries(makeCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
    
    charts.make = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedMakes.map(([make]) => make),
            datasets: [{
                label: 'Number of Cars',
                data: sortedMakes.map(([,count]) => count),
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgba(255,255,255,0.3)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.parsed.y} cars`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { 
                        color: 'rgba(255,255,255,0.8)',
                        maxRotation: 45
                    },
                    grid: { color: 'rgba(255,255,255,0.2)' }
                },
                y: {
                    title: { display: true, text: 'Number of Cars', color: 'rgba(255,255,255,0.8)' },
                    ticks: { color: 'rgba(255,255,255,0.8)' },
                    grid: { color: 'rgba(255,255,255,0.2)' }
                }
            }
        }
    });
}

// Price Distribution Chart
function createPriceChart() {
    const ctx = document.getElementById('priceChart').getContext('2d');
    if (charts.price) charts.price.destroy();
    
    const priceRanges = {
        'Under $20k': localFilteredData.filter(car => car.price < 20000).length,
        '$20k-$30k': localFilteredData.filter(car => car.price >= 20000 && car.price < 30000).length,
        '$30k-$40k': localFilteredData.filter(car => car.price >= 30000 && car.price < 40000).length,
        '$40k-$50k': localFilteredData.filter(car => car.price >= 40000 && car.price < 50000).length,
        '$50k+': localFilteredData.filter(car => car.price >= 50000).length
    };
    
    charts.price = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(priceRanges),
            datasets: [{
                label: 'Number of Cars',
                data: Object.values(priceRanges),
                backgroundColor: [
                    'rgba(40, 167, 69, 0.8)',
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(153, 102, 255, 0.8)'
                ],
                borderColor: 'rgba(255,255,255,0.3)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = Object.values(priceRanges).reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed.y / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed.y} cars (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: 'rgba(255,255,255,0.8)' },
                    grid: { color: 'rgba(255,255,255,0.2)' }
                },
                y: {
                    title: { display: true, text: 'Number of Cars', color: 'rgba(255,255,255,0.8)' },
                    ticks: { color: 'rgba(255,255,255,0.8)' },
                    grid: { color: 'rgba(255,255,255,0.2)' }
                }
            }
        }
    });
}

// TCO Comparison Chart
function createTCOChart() {
    const ctx = document.getElementById('tcoChart').getContext('2d');
    if (charts.tco) charts.tco.destroy();
    
    const tcoData = localFilteredData
        .sort((a, b) => a.tco - b.tco)
        .slice(0, 15);
    
    charts.tco = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: tcoData.map(car => car.name.substring(0, 15) + '...'),
            datasets: [{
                label: '3-Year TCO',
                data: tcoData.map(car => car.tco),
                backgroundColor: tcoData.map(car => 
                    car.tco < 20000 ? 'rgba(40, 167, 69, 0.8)' : 
                    car.tco < 30000 ? 'rgba(255, 193, 7, 0.8)' : 
                    'rgba(220, 53, 69, 0.8)'
                ),
                borderColor: 'rgba(255,255,255,0.3)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const dataIndex = elements[0].index;
                    showCarDetails(tcoData[dataIndex]);
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const car = tcoData[context.dataIndex];
                            return [
                                `${car.name}`,
                                `3-Year TCO: $${car.tco.toLocaleString()}`,
                                `Purchase: $${car.price.toLocaleString()}`,
                                `(Click for details)`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { 
                        color: 'rgba(255,255,255,0.8)',
                        maxRotation: 45
                    },
                    grid: { color: 'rgba(255,255,255,0.2)' }
                },
                y: {
                    title: { display: true, text: '3-Year TCO ($)', color: 'rgba(255,255,255,0.8)' },
                    ticks: { 
                        color: 'rgba(255,255,255,0.8)',
                        callback: function(value) {
                            return '$' + (value / 1000).toFixed(0) + 'k';
                        }
                    },
                    grid: { color: 'rgba(255,255,255,0.2)' }
                }
            }
        }
    });
}

// MPG vs Price Chart
function createMPGChart() {
    const ctx = document.getElementById('mpgChart').getContext('2d');
    if (charts.mpg) charts.mpg.destroy();
    
    charts.mpg = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Cars',
                data: localFilteredData.map((car, index) => ({
                    x: car.price,
                    y: car.mpg_combined || car.mpg || 25,
                    label: car.name,
                    carIndex: index
                })),
                backgroundColor: localFilteredData.map(car => {
                    const mpg = car.mpg_combined || car.mpg || 25;
                    return mpg > 35 ? 'rgba(40, 167, 69, 0.8)' :
                           mpg > 25 ? 'rgba(255, 193, 7, 0.8)' :
                           'rgba(220, 53, 69, 0.8)';
                }),
                pointRadius: 8,
                pointHoverRadius: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const dataIndex = elements[0].index;
                    showCarDetails(localFilteredData[dataIndex]);
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const car = localFilteredData[context.dataIndex];
                            const mpg = car.mpg_combined || car.mpg || 25;
                            return `${car.name}: $${car.price.toLocaleString()}, ${mpg} MPG (Click for details)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Price ($)', color: 'rgba(255,255,255,0.8)' },
                    ticks: { 
                        color: 'rgba(255,255,255,0.8)',
                        callback: function(value) {
                            return '$' + (value / 1000).toFixed(0) + 'k';
                        }
                    },
                    grid: { color: 'rgba(255,255,255,0.2)' }
                },
                y: {
                    title: { display: true, text: 'MPG Combined', color: 'rgba(255,255,255,0.8)' },
                    ticks: { color: 'rgba(255,255,255,0.8)' },
                    grid: { color: 'rgba(255,255,255,0.2)' }
                }
            }
        }
    });
}

// Safety vs Price Chart
function createSafetyChart() {
    const ctx = document.getElementById('safetyChart').getContext('2d');
    if (charts.safety) charts.safety.destroy();
    
    charts.safety = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Cars',
                data: localFilteredData.map((car, index) => ({
                    x: car.price,
                    y: car.safety_rating || car.safety || 4,
                    label: car.name,
                    carIndex: index
                })),
                backgroundColor: localFilteredData.map(car => {
                    const safety = car.safety_rating || car.safety || 4;
                    return safety >= 4.5 ? 'rgba(40, 167, 69, 0.8)' :
                           safety >= 4.0 ? 'rgba(255, 193, 7, 0.8)' :
                           'rgba(220, 53, 69, 0.8)';
                }),
                pointRadius: 8,
                pointHoverRadius: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const dataIndex = elements[0].index;
                    showCarDetails(localFilteredData[dataIndex]);
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const car = localFilteredData[context.dataIndex];
                            const safety = car.safety_rating || car.safety || 4;
                            return `${car.name}: $${car.price.toLocaleString()}, ${safety}/5 safety (Click for details)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Price ($)', color: 'rgba(255,255,255,0.8)' },
                    ticks: { 
                        color: 'rgba(255,255,255,0.8)',
                        callback: function(value) {
                            return '$' + (value / 1000).toFixed(0) + 'k';
                        }
                    },
                    grid: { color: 'rgba(255,255,255,0.2)' }
                },
                y: {
                    title: { display: true, text: 'Safety Rating (1-5)', color: 'rgba(255,255,255,0.8)' },
                    min: 3, max: 5,
                    ticks: { color: 'rgba(255,255,255,0.8)' },
                    grid: { color: 'rgba(255,255,255,0.2)' }
                }
            }
        }
    });
}

// Insurance Cost Chart
function createInsuranceChart() {
    const ctx = document.getElementById('insuranceChart').getContext('2d');
    if (charts.insurance) charts.insurance.destroy();
    
    const insuranceData = localFilteredData
        .sort((a, b) => (b.insurance_annual || 1200) - (a.insurance_annual || 1200))
        .slice(0, 15);
    
    charts.insurance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: insuranceData.map(car => car.name.substring(0, 15) + '...'),
            datasets: [{
                label: 'Annual Insurance Cost',
                data: insuranceData.map(car => car.insurance_annual || 1200),
                backgroundColor: insuranceData.map(car => {
                    const cost = car.insurance_annual || 1200;
                    return cost > 2000 ? 'rgba(220, 53, 69, 0.8)' :
                           cost > 1500 ? 'rgba(255, 193, 7, 0.8)' :
                           'rgba(40, 167, 69, 0.8)';
                }),
                borderColor: 'rgba(255,255,255,0.3)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const dataIndex = elements[0].index;
                    showCarDetails(insuranceData[dataIndex]);
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const car = insuranceData[context.dataIndex];
                            return [
                                `${car.name}`,
                                `Annual Insurance: $${context.parsed.y.toLocaleString()}`,
                                `(Click for details)`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { 
                        color: 'rgba(255,255,255,0.8)',
                        maxRotation: 45
                    },
                    grid: { color: 'rgba(255,255,255,0.2)' }
                },
                y: {
                    title: { display: true, text: 'Annual Insurance Cost ($)', color: 'rgba(255,255,255,0.8)' },
                    ticks: { 
                        color: 'rgba(255,255,255,0.8)',
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    },
                    grid: { color: 'rgba(255,255,255,0.2)' }
                }
            }
        }
    });
}

// Maintenance Cost Chart
function createMaintenanceChart() {
    const ctx = document.getElementById('maintenanceChart').getContext('2d');
    if (charts.maintenance) charts.maintenance.destroy();
    
    const maintenanceData = localFilteredData
        .sort((a, b) => (b.maintenance_annual || 800) - (a.maintenance_annual || 800))
        .slice(0, 15);
    
    charts.maintenance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: maintenanceData.map(car => car.name.substring(0, 15) + '...'),
            datasets: [{
                label: '5-Year Maintenance Cost',
                data: maintenanceData.map(car => (car.maintenance_annual || 800) * 5),
                backgroundColor: maintenanceData.map(car => {
                    const cost = (car.maintenance_annual || 800) * 5;
                    return cost > 5000 ? 'rgba(220, 53, 69, 0.8)' :
                           cost > 3000 ? 'rgba(255, 193, 7, 0.8)' :
                           'rgba(40, 167, 69, 0.8)';
                }),
                borderColor: 'rgba(255,255,255,0.3)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const dataIndex = elements[0].index;
                    showCarDetails(maintenanceData[dataIndex]);
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const car = maintenanceData[context.dataIndex];
                            const annual = car.maintenance_annual || 800;
                            return [
                                `${car.name}`,
                                `5-Year Maintenance: $${context.parsed.y.toLocaleString()}`,
                                `Annual: $${annual.toLocaleString()}`,
                                `(Click for details)`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { 
                        color: 'rgba(255,255,255,0.8)',
                        maxRotation: 45
                    },
                    grid: { color: 'rgba(255,255,255,0.2)' }
                },
                y: {
                    title: { display: true, text: '5-Year Maintenance Cost ($)', color: 'rgba(255,255,255,0.8)' },
                    ticks: { 
                        color: 'rgba(255,255,255,0.8)',
                        callback: function(value) {
                            return '$' + (value / 1000).toFixed(0) + 'k';
                        }
                    },
                    grid: { color: 'rgba(255,255,255,0.2)' }
                }
            }
        }
    });
}

// TCO Breakdown Chart
function createTCOBreakdownChart() {
    const ctx = document.getElementById('tcoBreakdownChart').getContext('2d');
    if (charts.tcoBreakdown) charts.tcoBreakdown.destroy();
    
    // Calculate average TCO components
    const avgPrice = localFilteredData.reduce((sum, car) => sum + car.price, 0) / localFilteredData.length;
    const avgDepreciation = localFilteredData.reduce((sum, car) => sum + (car.price * (car.depreciation_3yr_percent || 35) / 100), 0) / localFilteredData.length;
    const avgFuel = localFilteredData.reduce((sum, car) => sum + ((car.annual_fuel_cost || 2000) * 3), 0) / localFilteredData.length;
    const avgMaintenance = localFilteredData.reduce((sum, car) => sum + ((car.maintenance_annual || 800) * 3), 0) / localFilteredData.length;
    const avgInsurance = localFilteredData.reduce((sum, car) => sum + ((car.insurance_annual || 1200) * 3), 0) / localFilteredData.length;
    const avgRegistration = 500 * 3; // CA registration
    
    charts.tcoBreakdown = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Purchase Price', 'Depreciation Loss', 'Fuel (3yr)', 'Maintenance (3yr)', 'Insurance (3yr)', 'Registration (3yr)'],
            datasets: [{
                data: [avgPrice, avgDepreciation, avgFuel, avgMaintenance, avgInsurance, avgRegistration],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(220, 53, 69, 0.8)',
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                ],
                borderColor: 'rgba(255,255,255,0.3)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { 
                        color: 'rgba(255,255,255,0.8)',
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: $${context.parsed.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Main function to create all charts
function createAllCharts() {
    console.log('Creating all charts...');
    createPriceChart();
    createTCOChart();
    createMakeChart();
    createFuelTypeChart();
    createDepreciationChart();
    createTCOReliabilityChart();
    createMPGChart();
    createSafetyChart();
    createInsuranceChart();
    createMaintenanceChart();
    createTCOBreakdownChart();
    if (typeof updatePersonalizedChart === 'function') {
        updatePersonalizedChart(localFilteredData.slice(0, 10));
    }
    console.log('All charts created successfully');
}

// Update filtered data and recreate charts
function updateCharts(newFilteredData) {
    localFilteredData = newFilteredData;
    createAllCharts();
}

// Export functions for use in other modules
window.createAllCharts = createAllCharts;
window.updateCharts = updateCharts;
window.getCarColor = getCarColor;