// Charts module for Chart.js functionality
export class ChartsManager {
    constructor() {
        this.personalizedChart = null;
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

    // Destroy all charts
    destroyAllCharts() {
        if (this.personalizedChart) {
            this.personalizedChart.destroy();
            this.personalizedChart = null;
        }
    }
}