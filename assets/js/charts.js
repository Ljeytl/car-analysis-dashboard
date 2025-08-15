// Charts module for Chart.js functionality
export class ChartsManager {
    constructor() {
        this.personalizedChart = null;
        this.tcoBrandChart = null;
        this.tcoReliabilityChart = null;
        this.depreciationChart = null;
        this.fuelTypeChart = null;
        this.tcoDistributionChart = null;
        this.fuelCostChart = null;
    }

    // Update personalized chart
    updatePersonalizedChart(topCars, chartElementId = 'personalizedChart') {
        const ctx = document.getElementById(chartElementId);
        if (!ctx) return;
        
        // Destroy existing chart
        if (this.personalizedChart) {
            this.personalizedChart.destroy();
        }
        
        this.personalizedChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topCars.map(car => car.name.substring(0, 20) + '...'),
                datasets: [{
                    label: 'Match Score',
                    data: topCars.map(car => car.weightedScore),
                    backgroundColor: 'rgba(49, 130, 206, 0.8)',
                    borderColor: 'rgba(49, 130, 206, 1)',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: function(tooltipItems) {
                                return topCars[tooltipItems[0].dataIndex].name;
                            },
                            label: function(context) {
                                const car = topCars[context.dataIndex];
                                return [
                                    `Match Score: ${car.weightedScore}/10`,
                                    `Price: $${car.price.toLocaleString()}`,
                                    `3-Year TCO: $${car.tco.toLocaleString()}`,
                                    `Reliability: ${car.reliability}/10`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        ticks: { color: 'rgba(255, 255, 255, 0.8)' },
                        grid: { color: 'rgba(255, 255, 255, 0.2)' }
                    },
                    x: {
                        ticks: { 
                            color: 'rgba(255, 255, 255, 0.8)',
                            maxRotation: 45 
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.2)' }
                    }
                }
            }
        });
    }

    // Create TCO comparison chart
    createTCOChart(cars, chartElementId) {
        const ctx = document.getElementById(chartElementId);
        if (!ctx) return;

        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: cars.map(car => car.name.substring(0, 15) + '...'),
                datasets: [
                    {
                        label: 'Purchase Price',
                        data: cars.map(car => car.price),
                        backgroundColor: 'rgba(49, 130, 206, 0.8)',
                        borderColor: 'rgba(49, 130, 206, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Depreciation',
                        data: cars.map(car => car.depreciation),
                        backgroundColor: 'rgba(229, 62, 62, 0.8)',
                        borderColor: 'rgba(229, 62, 62, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Fuel Costs',
                        data: cars.map(car => car.fuelCost),
                        backgroundColor: 'rgba(221, 107, 32, 0.8)',
                        borderColor: 'rgba(221, 107, 32, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Maintenance',
                        data: cars.map(car => car.maintenanceCost),
                        backgroundColor: 'rgba(56, 161, 105, 0.8)',
                        borderColor: 'rgba(56, 161, 105, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        ticks: { 
                            color: 'rgba(255, 255, 255, 0.8)',
                            maxRotation: 45 
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.2)' }
                    },
                    y: {
                        stacked: true,
                        ticks: { 
                            color: 'rgba(255, 255, 255, 0.8)',
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.2)' }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': $' + context.parsed.y.toLocaleString();
                            }
                        }
                    },
                    legend: {
                        labels: {
                            color: 'rgba(255, 255, 255, 0.8)'
                        }
                    }
                }
            }
        });
    }

    // Create fuel efficiency comparison chart
    createFuelEfficiencyChart(cars, chartElementId) {
        const ctx = document.getElementById(chartElementId);
        if (!ctx) return;

        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Electric', 'Hybrid', 'Gas'],
                datasets: [{
                    data: [
                        cars.filter(car => car.fuel === 'Electric').length,
                        cars.filter(car => car.fuel === 'Hybrid').length,
                        cars.filter(car => car.fuel === 'Gas').length
                    ],
                    backgroundColor: [
                        'rgba(56, 161, 105, 0.8)',
                        'rgba(49, 130, 206, 0.8)',
                        'rgba(221, 107, 32, 0.8)'
                    ],
                    borderColor: [
                        'rgba(56, 161, 105, 1)',
                        'rgba(49, 130, 206, 1)',
                        'rgba(221, 107, 32, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: 'rgba(255, 255, 255, 0.8)'
                        }
                    }
                }
            }
        });
    }

    // Destroy chart
    destroyChart(chart) {
        if (chart) {
            chart.destroy();
        }
    }

    // Create TCO by Brand chart
    createTCOBrandChart(cars, chartElementId = 'tcoBrandChart') {
        const ctx = document.getElementById(chartElementId);
        if (!ctx) return;
        
        // Destroy existing chart
        if (this.tcoBrandChart) {
            this.tcoBrandChart.destroy();
        }
        
        // Group cars by brand and calculate average TCO
        const brandData = {};
        cars.forEach(car => {
            const brand = car.name.split(' ')[0];
            if (!brandData[brand]) {
                brandData[brand] = { total: 0, count: 0 };
            }
            brandData[brand].total += car.tco;
            brandData[brand].count++;
        });
        
        const brands = Object.keys(brandData).map(brand => ({
            brand,
            avgTCO: brandData[brand].total / brandData[brand].count,
            count: brandData[brand].count
        })).sort((a, b) => a.avgTCO - b.avgTCO);
        
        this.tcoBrandChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: brands.map(b => b.brand),
                datasets: [{
                    label: 'Average 3-Year TCO',
                    data: brands.map(b => b.avgTCO),
                    backgroundColor: 'rgba(49, 130, 206, 0.8)',
                    borderColor: 'rgba(49, 130, 206, 1)',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const brand = brands[context.dataIndex];
                                return [
                                    `Average TCO: $${brand.avgTCO.toLocaleString()}`,
                                    `Cars in database: ${brand.count}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { 
                            color: 'rgba(255, 255, 255, 0.8)',
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.2)' }
                    },
                    x: {
                        ticks: { 
                            color: 'rgba(255, 255, 255, 0.8)',
                            maxRotation: 45 
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.2)' }
                    }
                }
            }
        });
    }

    // Create TCO vs Reliability scatter chart
    createTCOReliabilityChart(cars, chartElementId = 'tcoReliabilityChart') {
        const ctx = document.getElementById(chartElementId);
        if (!ctx) return;
        
        // Destroy existing chart
        if (this.tcoReliabilityChart) {
            this.tcoReliabilityChart.destroy();
        }
        
        // Color code by fuel type
        const colorMap = {
            'Electric': 'rgba(56, 161, 105, 0.8)',
            'Hybrid': 'rgba(49, 130, 206, 0.8)',
            'Gas': 'rgba(221, 107, 32, 0.8)'
        };
        
        this.tcoReliabilityChart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Cars',
                    data: cars.map(car => ({
                        x: car.reliability,
                        y: car.tco,
                        car: car
                    })),
                    backgroundColor: cars.map(car => colorMap[car.fuel] || 'rgba(128, 128, 128, 0.8)'),
                    borderColor: cars.map(car => colorMap[car.fuel]?.replace('0.8', '1') || 'rgba(128, 128, 128, 1)'),
                    borderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: function(tooltipItems) {
                                return tooltipItems[0].raw.car.name;
                            },
                            label: function(context) {
                                const car = context.raw.car;
                                return [
                                    `Reliability: ${car.reliability}/10`,
                                    `3-Year TCO: $${car.tco.toLocaleString()}`,
                                    `Fuel Type: ${car.fuel}`,
                                    `Price: $${car.price.toLocaleString()}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Reliability Score',
                            color: 'rgba(255, 255, 255, 0.8)'
                        },
                        min: 0,
                        max: 10,
                        ticks: { color: 'rgba(255, 255, 255, 0.8)' },
                        grid: { color: 'rgba(255, 255, 255, 0.2)' }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '3-Year TCO ($)',
                            color: 'rgba(255, 255, 255, 0.8)'
                        },
                        ticks: { 
                            color: 'rgba(255, 255, 255, 0.8)',
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.2)' }
                    }
                }
            }
        });
    }

    // Create Depreciation by Brand chart
    createDepreciationChart(cars, chartElementId = 'depreciationChart') {
        const ctx = document.getElementById(chartElementId);
        if (!ctx) return;
        
        // Destroy existing chart
        if (this.depreciationChart) {
            this.depreciationChart.destroy();
        }
        
        // Group cars by brand and calculate average depreciation
        const brandData = {};
        cars.forEach(car => {
            const brand = car.name.split(' ')[0];
            if (!brandData[brand]) {
                brandData[brand] = { total: 0, count: 0 };
            }
            brandData[brand].total += car.depreciation;
            brandData[brand].count++;
        });
        
        const brands = Object.keys(brandData).map(brand => ({
            brand,
            avgDepreciation: brandData[brand].total / brandData[brand].count,
            count: brandData[brand].count
        })).sort((a, b) => a.avgDepreciation - b.avgDepreciation);
        
        this.depreciationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: brands.map(b => b.brand),
                datasets: [{
                    label: 'Average 3-Year Depreciation',
                    data: brands.map(b => b.avgDepreciation),
                    backgroundColor: 'rgba(229, 62, 62, 0.8)',
                    borderColor: 'rgba(229, 62, 62, 1)',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const brand = brands[context.dataIndex];
                                return [
                                    `Average Depreciation: $${brand.avgDepreciation.toLocaleString()}`,
                                    `Cars analyzed: ${brand.count}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { 
                            color: 'rgba(255, 255, 255, 0.8)',
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.2)' }
                    },
                    x: {
                        ticks: { 
                            color: 'rgba(255, 255, 255, 0.8)',
                            maxRotation: 45 
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.2)' }
                    }
                }
            }
        });
    }

    // Create Fuel Type Distribution chart
    createFuelTypeChart(cars, chartElementId = 'fuelTypeChart') {
        const ctx = document.getElementById(chartElementId);
        if (!ctx) return;
        
        // Destroy existing chart
        if (this.fuelTypeChart) {
            this.fuelTypeChart.destroy();
        }
        
        const fuelCounts = {
            'Electric': cars.filter(car => car.fuel === 'Electric').length,
            'Hybrid': cars.filter(car => car.fuel === 'Hybrid').length,
            'Gas': cars.filter(car => car.fuel === 'Gas').length
        };
        
        this.fuelTypeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(fuelCounts),
                datasets: [{
                    data: Object.values(fuelCounts),
                    backgroundColor: [
                        'rgba(56, 161, 105, 0.8)',
                        'rgba(49, 130, 206, 0.8)',
                        'rgba(221, 107, 32, 0.8)'
                    ],
                    borderColor: [
                        'rgba(56, 161, 105, 1)',
                        'rgba(49, 130, 206, 1)',
                        'rgba(221, 107, 32, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            padding: 20
                        }
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

    // Create TCO Distribution histogram
    createTCODistributionChart(cars, chartElementId = 'tcoDistributionChart') {
        const ctx = document.getElementById(chartElementId);
        if (!ctx) return;
        
        // Destroy existing chart
        if (this.tcoDistributionChart) {
            this.tcoDistributionChart.destroy();
        }
        
        // Create TCO bins
        const tcos = cars.map(car => car.tco);
        const minTCO = Math.min(...tcos);
        const maxTCO = Math.max(...tcos);
        const binCount = 10;
        const binSize = (maxTCO - minTCO) / binCount;
        
        const bins = Array(binCount).fill(0);
        const binLabels = [];
        
        for (let i = 0; i < binCount; i++) {
            const binStart = minTCO + (i * binSize);
            const binEnd = binStart + binSize;
            binLabels.push(`$${Math.round(binStart/1000)}k-${Math.round(binEnd/1000)}k`);
            
            tcos.forEach(tco => {
                if (tco >= binStart && (tco < binEnd || (i === binCount - 1 && tco <= binEnd))) {
                    bins[i]++;
                }
            });
        }
        
        this.tcoDistributionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: binLabels,
                datasets: [{
                    label: 'Number of Cars',
                    data: bins,
                    backgroundColor: 'rgba(147, 51, 234, 0.8)',
                    borderColor: 'rgba(147, 51, 234, 1)',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Cars in range: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Cars',
                            color: 'rgba(255, 255, 255, 0.8)'
                        },
                        ticks: { color: 'rgba(255, 255, 255, 0.8)' },
                        grid: { color: 'rgba(255, 255, 255, 0.2)' }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '3-Year TCO Range',
                            color: 'rgba(255, 255, 255, 0.8)'
                        },
                        ticks: { 
                            color: 'rgba(255, 255, 255, 0.8)',
                            maxRotation: 45 
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.2)' }
                    }
                }
            }
        });
    }

    // Create Fuel Cost vs TCO scatter chart
    createFuelCostChart(cars, chartElementId = 'fuelCostChart') {
        const ctx = document.getElementById(chartElementId);
        if (!ctx) return;
        
        // Destroy existing chart
        if (this.fuelCostChart) {
            this.fuelCostChart.destroy();
        }
        
        // Color code by fuel type
        const colorMap = {
            'Electric': 'rgba(56, 161, 105, 0.8)',
            'Hybrid': 'rgba(49, 130, 206, 0.8)',
            'Gas': 'rgba(221, 107, 32, 0.8)'
        };
        
        this.fuelCostChart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Cars',
                    data: cars.map(car => ({
                        x: car.fuelCost,
                        y: car.tco,
                        car: car
                    })),
                    backgroundColor: cars.map(car => colorMap[car.fuel] || 'rgba(128, 128, 128, 0.8)'),
                    borderColor: cars.map(car => colorMap[car.fuel]?.replace('0.8', '1') || 'rgba(128, 128, 128, 1)'),
                    borderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: function(tooltipItems) {
                                return tooltipItems[0].raw.car.name;
                            },
                            label: function(context) {
                                const car = context.raw.car;
                                return [
                                    `3-Year Fuel Cost: $${car.fuelCost.toLocaleString()}`,
                                    `3-Year TCO: $${car.tco.toLocaleString()}`,
                                    `Fuel Type: ${car.fuel}`,
                                    `Price: $${car.price.toLocaleString()}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: '3-Year Fuel Cost ($)',
                            color: 'rgba(255, 255, 255, 0.8)'
                        },
                        ticks: { 
                            color: 'rgba(255, 255, 255, 0.8)',
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.2)' }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '3-Year TCO ($)',
                            color: 'rgba(255, 255, 255, 0.8)'
                        },
                        ticks: { 
                            color: 'rgba(255, 255, 255, 0.8)',
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.2)' }
                    }
                }
            }
        });
    }

    // Initialize all charts
    initializeAllCharts(cars) {
        this.createTCOBrandChart(cars);
        this.createTCOReliabilityChart(cars);
        this.createDepreciationChart(cars);
        this.createFuelTypeChart(cars);
        this.createTCODistributionChart(cars);
        this.createFuelCostChart(cars);
    }

    // Update all charts with filtered data
    updateAllCharts(cars) {
        this.initializeAllCharts(cars);
    }

    // Destroy all charts
    destroyAllCharts() {
        const charts = [
            'personalizedChart',
            'tcoBrandChart', 
            'tcoReliabilityChart',
            'depreciationChart',
            'fuelTypeChart',
            'tcoDistributionChart',
            'fuelCostChart'
        ];
        
        charts.forEach(chartName => {
            if (this[chartName]) {
                this[chartName].destroy();
                this[chartName] = null;
            }
        });
    }
}