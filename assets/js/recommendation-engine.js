// Personalized recommendation system
let personalizedChart = null;

// Category enable/disable state
let categoryEnabled = {
    cost: true,
    tco: true,
    reliability: true,
    style: true,
    fuel: true
};

function toggleCategory(category) {
    // Map category names to checkbox IDs
    const checkboxIds = {
        cost: 'enableCost',
        tco: 'enableTCO', 
        reliability: 'enableReliability',
        style: 'enableStyle',
        fuel: 'enableFuel'
    };
    
    const checkbox = document.getElementById(checkboxIds[category]);
    if (!checkbox) return;
    
    // Update the categoryEnabled state
    categoryEnabled[category] = checkbox.checked;
    
    // Map category names to weight input IDs and find parent slider containers
    const weightInputIds = {
        cost: 'costWeight',
        tco: 'tcoWeight',
        reliability: 'reliabilityWeight',
        style: 'styleWeight',
        fuel: 'fuelWeight'
    };
    
    const weightInput = document.getElementById(weightInputIds[category]);
    if (weightInput) {
        // Find the parent preference-slider div
        const sliderContainer = weightInput.closest('.preference-slider');
        if (sliderContainer) {
            if (categoryEnabled[category]) {
                sliderContainer.style.display = 'flex';
                sliderContainer.style.opacity = '1';
            } else {
                sliderContainer.style.display = 'none';
            }
        }
    }
    
    console.log(`Toggled ${category}: ${categoryEnabled[category]}`);
}

function updateRecommendations() {
    // Update slider value displays
    document.getElementById('costWeightValue').textContent = document.getElementById('costWeight').value;
    document.getElementById('tcoWeightValue').textContent = document.getElementById('tcoWeight').value;
    document.getElementById('reliabilityWeightValue').textContent = document.getElementById('reliabilityWeight').value;
    document.getElementById('styleWeightValue').textContent = document.getElementById('styleWeight').value;
    document.getElementById('fuelWeightValue').textContent = document.getElementById('fuelWeight').value;
    
    // Sync categoryEnabled with actual checkbox states
    categoryEnabled.cost = document.getElementById('enableCost').checked;
    categoryEnabled.tco = document.getElementById('enableTCO').checked;
    categoryEnabled.reliability = document.getElementById('enableReliability').checked;
    categoryEnabled.style = document.getElementById('enableStyle').checked;
    categoryEnabled.fuel = document.getElementById('enableFuel').checked;
    
    // Debug: Log current category states
    console.log('Category states:', categoryEnabled);
    
    // Get weights, applying 0 for disabled categories
    const weights = {
        cost: categoryEnabled.cost ? parseFloat(document.getElementById('costWeight').value) : 0,
        tco: categoryEnabled.tco ? parseFloat(document.getElementById('tcoWeight').value) : 0,
        reliability: categoryEnabled.reliability ? parseFloat(document.getElementById('reliabilityWeight').value) : 0,
        style: categoryEnabled.style ? parseFloat(document.getElementById('styleWeight').value) : 0,
        fuel: categoryEnabled.fuel ? parseFloat(document.getElementById('fuelWeight').value) : 0
    };
    
    // Debug: Log calculated weights
    console.log('Calculated weights:', weights);
    
    // Update weights display
    const activeWeights = Object.entries(weights)
        .filter(([_, weight]) => weight > 0)
        .map(([category, weight]) => {
            const categoryNames = {cost: 'Price', tco: 'TCO', reliability: 'Reliability', style: 'Credibility', fuel: 'Fuel'};
            return `${categoryNames[category]}: ${weight}`;
        });
    
    const weightsDisplay = document.getElementById('weightsDisplay');
    if (weightsDisplay) {
        weightsDisplay.textContent = activeWeights.length > 0 ? activeWeights.join(', ') : 'None selected';
    }
    
    // Skip if no data loaded yet
    if (!carData || carData.length === 0) return;
    
    const scoredCars = calculateWeightedScores(carData, weights);
    updatePersonalizedChart(scoredCars.slice(0, 10));
    updateRecommendationsList(scoredCars.slice(0, 5));
}

function calculateWeightedScores(cars, weights) {
    // Calculate min/max values for proper scaling
    const priceValues = cars.map(c => c.price || c.final_price_low || 25000);
    const tcoValues = cars.map(c => c.tco_3yr_low || c.tco || 20000);
    const fuelValues = cars.map(c => c.annual_fuel_cost || c.fuelCost || 1000);
    
    const minPrice = Math.min(...priceValues);
    const maxPrice = Math.max(...priceValues);
    const minTCO = Math.min(...tcoValues);
    const maxTCO = Math.max(...tcoValues);
    const minFuel = Math.min(...fuelValues);
    const maxFuel = Math.max(...fuelValues);
    
    return cars.map(car => {
        const carPrice = car.price || car.final_price_low || 25000;
        const carTCO = car.tco_3yr_low || car.tco || 20000;
        const carFuel = car.annual_fuel_cost || car.fuelCost || 1000;
        
        // Properly scaled scores (0-10, lower cost = higher score)
        const scores = {
            cost: maxPrice > minPrice ? 10 * (1 - (carPrice - minPrice) / (maxPrice - minPrice)) : 5,
            tco: maxTCO > minTCO ? 10 * (1 - (carTCO - minTCO) / (maxTCO - minTCO)) : 5,
            reliability: car.reliability_score || car.reliability || 7,
            style: car.founder_credibility_score || car.founderCredibility || car.coolness_score || 5,
            fuel: maxFuel > minFuel ? 10 * (1 - (carFuel - minFuel) / (maxFuel - minFuel)) : 5
        };
        
        // Calculate weighted score only for enabled categories
        const activeWeights = Object.entries(weights).filter(([_, weight]) => weight > 0);
        const totalWeight = activeWeights.reduce((sum, [_, weight]) => sum + weight, 0);
        
        if (totalWeight === 0) {
            return {
                ...car,
                scores,
                weightedScore: 0,
                recommendation: "No categories enabled"
            };
        }
        
        // Only use scores for enabled categories
        const weightedScore = activeWeights.reduce((sum, [category, weight]) => {
            const categoryScore = scores[category] || 0;
            return sum + (categoryScore * weight);
        }, 0) / totalWeight;
        
        return {
            ...car,
            scores,
            weightedScore: Math.round(weightedScore * 100) / 100,
            recommendation: getRecommendationReason(scores, weights)
        };
    }).sort((a, b) => b.weightedScore - a.weightedScore);
}

function getRecommendationReason(scores, weights) {
    const topFactors = Object.entries(weights)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2)
        .map(([factor]) => {
            switch(factor) {
                case 'cost': return 'affordable price';
                case 'tco': return 'low total cost';
                case 'reliability': return 'proven reliability';
                case 'style': return 'great style';
                case 'fuel': return 'excellent fuel economy';
            }
        });
    
    return `Perfect for: ${topFactors.join(' + ')}`;
}

function updatePersonalizedChart(topCars) {
    const ctx = document.getElementById('personalizedChart').getContext('2d');
    
    if (personalizedChart) {
        personalizedChart.destroy();
    }
    
    personalizedChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topCars.map(car => car.name.substring(0, 15) + '...'),
            datasets: [{
                label: 'Weighted Score',
                data: topCars.map(car => car.weightedScore),
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderColor: 'rgba(255, 255, 255, 1)',
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
                                `Weighted Score: ${car.weightedScore}/10`,
                                `Price: $${car.price.toLocaleString()}`,
                                `TCO: $${car.tco || car.tco_3yr_low || 'N/A'}`,
                                `Category Scores:`,
                                `💰 Price: ${car.scores?.cost?.toFixed(1) || 'N/A'}/10`,
                                `📊 TCO: ${car.scores?.tco?.toFixed(1) || 'N/A'}/10`,
                                `🔧 Reliability: ${car.scores?.reliability?.toFixed(1) || 'N/A'}/10`,
                                `✨ Credibility: ${car.scores?.style?.toFixed(1) || 'N/A'}/10`,
                                `⛽ Fuel: ${car.scores?.fuel?.toFixed(1) || 'N/A'}/10`
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

function updateRecommendationsList(topCars) {
    const listElement = document.getElementById('recommendationsList');
    
    if (topCars.length === 0) {
        listElement.innerHTML = '<p style="text-align: center; opacity: 0.7;">Loading recommendations...</p>';
        return;
    }
    
    listElement.innerHTML = topCars.map((car, index) => `
        <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 15px; margin-bottom: 15px; border-left: 4px solid ${index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'rgba(255,255,255,0.3)'};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <strong style="font-size: 1.1em;">${index + 1}. ${car.name}</strong>
                <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 12px; font-weight: bold;">
                    ${car.weightedScore}/10
                </span>
            </div>
            <div style="font-size: 0.9em; opacity: 0.9; margin-bottom: 8px;">
                💰 $${car.price.toLocaleString()} | 📊 $${car.tco || car.tco_3yr_low || 'N/A'} TCO | 🔧 ${car.reliability}/10
            </div>
            <div style="font-size: 0.8em; opacity: 0.8; margin-bottom: 8px; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 4px;">
                <strong>Category Scores:</strong><br>
                💰 Price: <strong>${car.scores?.cost?.toFixed(1) || 'N/A'}/10</strong> | 
                📊 TCO: <strong>${car.scores?.tco?.toFixed(1) || 'N/A'}/10</strong> | 
                🔧 Reliability: <strong>${car.scores?.reliability?.toFixed(1) || 'N/A'}/10</strong><br>
                ✨ Credibility: <strong>${car.scores?.style?.toFixed(1) || 'N/A'}/10</strong> | 
                ⛽ Fuel: <strong>${car.scores?.fuel?.toFixed(1) || 'N/A'}/10</strong>
            </div>
            <div style="font-size: 0.85em; opacity: 0.8; font-style: italic;">
                ${car.recommendation}
            </div>
        </div>
    `).join('');
}

// Advanced Car Recommendation Engine with Sophisticated Scoring
class CarRecommendationEngine {
    constructor() {
        this.userProfile = {
            yearsOwned: 3,
            milesPerWeek: 210,
            income: 175000,
            role: 'founder',
            priorityWeights: {
                tco: 0.30,
                founderCredibility: 0.25,
                reliability: 0.20,
                marketPosition: 0.15,
                opportunityCost: 0.10
            },
            enableFuelEfficiencyFactor: true
        };
        this.brandPrestigeData = {
            'Tesla': { prestige: 95, depreciationCurve: 'steep', founderCredibility: 95 },
            'BMW': { prestige: 85, depreciationCurve: 'moderate', founderCredibility: 80 },
            'Mercedes': { prestige: 88, depreciationCurve: 'moderate', founderCredibility: 85 },
            'Audi': { prestige: 82, depreciationCurve: 'moderate', founderCredibility: 78 },
            'Lexus': { prestige: 80, depreciationCurve: 'gentle', founderCredibility: 75 },
            'Toyota': { prestige: 65, depreciationCurve: 'gentle', founderCredibility: 60 },
            'Honda': { prestige: 62, depreciationCurve: 'gentle', founderCredibility: 58 },
            'Genesis': { prestige: 78, depreciationCurve: 'moderate', founderCredibility: 72 },
            'Porsche': { prestige: 95, depreciationCurve: 'gentle', founderCredibility: 90 },
            'Lucid': { prestige: 88, depreciationCurve: 'unknown', founderCredibility: 85 },
            'Rivian': { prestige: 75, depreciationCurve: 'steep', founderCredibility: 80 },
            'Polestar': { prestige: 72, depreciationCurve: 'moderate', founderCredibility: 70 }
        };
        this.percentileCache = new Map();
    }

    calculatePercentileScore(value, allValues, higherIsBetter = true) {
        const cacheKey = `${value}_${allValues.length}_${higherIsBetter}`;
        if (this.percentileCache.has(cacheKey)) {
            return this.percentileCache.get(cacheKey);
        }
        
        const sorted = [...allValues].sort((a, b) => higherIsBetter ? a - b : b - a);
        const rank = sorted.indexOf(value);
        const percentile = (rank / (sorted.length - 1)) * 100;
        
        this.percentileCache.set(cacheKey, percentile);
        return percentile;
    }

    calculateAdvancedTCO(car) {
        const years = this.userProfile.yearsOwned;
        const annualMiles = this.userProfile.milesPerWeek * 52;
        
        // Base TCO calculation
        const purchasePrice = car.price || 0;
        const depreciationLoss = purchasePrice * (car.depreciation_3yr_percent || 35) / 100 * (years / 3);
        const fuelCosts = (car.annual_fuel_cost || 2000) * years;
        const maintenanceCosts = (car.maintenance_annual || 800) * years;
        const insuranceCosts = (car.insurance_annual || 1200) * years;
        const registrationCosts = 500 * years; // CA registration
        
        let tco = purchasePrice + depreciationLoss + fuelCosts + maintenanceCosts + insuranceCosts + registrationCosts;
        
        // High mileage penalty
        if (annualMiles > 15000) {
            const excessMiles = annualMiles - 15000;
            const mileagePenalty = excessMiles * 0.15 * years; // $0.15 per excess mile per year
            tco += mileagePenalty;
        }
        
        return tco;
    }

    calculateFounderCredibilityScore(car) {
        const brandData = this.brandPrestigeData[car.brand] || this.brandPrestigeData[car.make] || { prestige: 50, founderCredibility: 50 };
        let score = brandData.founderCredibility;
        
        // Price perception adjustments
        if (car.price < 15000) {
            score -= 25; // Too cheap penalty for founders
        } else if (car.price > 50000) {
            score += 10; // Luxury premium
        }
        
        // EV bonus for tech credibility
        if (car.fuel_type === 'Electric' || car.fuel === 'Electric') {
            score += 15;
        }
        
        // Age penalty
        const currentYear = new Date().getFullYear();
        const carAge = currentYear - (car.year || 2020);
        if (carAge > 5) {
            score -= carAge * 3;
        }
        
        return Math.max(0, Math.min(100, score));
    }

    calculateReliabilityPenalty(car) {
        const reliability = car.reliability_score || car.reliability || 5;
        if (reliability < 6) {
            return 5000; // Harsh penalty for unreliable cars
        } else if (reliability < 7) {
            return 2000; // Moderate penalty
        }
        return 0;
    }

    calculateMarketOpportunityCost(car) {
        // Opportunity cost of capital tied up in the car
        const capitalTiedUp = car.price || 0;
        const opportunityRate = 0.08; // 8% annual return assumption
        const years = this.userProfile.yearsOwned;
        return capitalTiedUp * opportunityRate * years;
    }

    generateSmartExplanation(car, scores) {
        const tco = scores.tco;
        const credibility = scores.founderCredibility;
        const reliability = car.reliability_score || car.reliability || 5;
        const price = car.price || 0;
        
        if (tco < 20000 && credibility > 70 && reliability > 7) {
            return "Stealth wealth play - looks expensive, actually smart TCO";
        } else if (credibility > 85 && price > 40000) {
            return "Statement piece - justifiable for fundraising ROI";
        } else if (tco < 15000 && reliability > 8) {
            return "Bootstrap mode - maximize capital efficiency";
        } else if (credibility > 80 && car.fuel_type === 'Electric') {
            return "Tech founder flex - sustainable + premium image";
        } else if (reliability > 8.5 && tco < 25000) {
            return "Reliable workhorse - focus on business, not car issues";
        } else if (credibility < 60) {
            return "Budget mode - may hurt founder credibility";
        } else if (reliability < 6) {
            return "Risk play - potential reliability issues ahead";
        } else {
            return "Balanced choice - reasonable across all factors";
        }
    }

    scoreAllCars(cars) {
        if (!cars || cars.length === 0) return [];
        
        // Calculate raw scores for all cars
        const carScores = cars.map(car => {
            const tco = this.calculateAdvancedTCO(car);
            const founderCredibility = this.calculateFounderCredibilityScore(car);
            const reliabilityPenalty = this.calculateReliabilityPenalty(car);
            const opportunityCost = this.calculateMarketOpportunityCost(car);
            
            return {
                car,
                tco,
                founderCredibility,
                reliabilityPenalty,
                opportunityCost,
                totalCost: tco + reliabilityPenalty + opportunityCost
            };
        });
        
        // Calculate percentile scores
        const tcoValues = carScores.map(s => s.totalCost);
        const credibilityValues = carScores.map(s => s.founderCredibility);
        
        return carScores.map(score => {
            const tcoPercentile = this.calculatePercentileScore(score.totalCost, tcoValues, false); // Lower cost is better
            const credibilityPercentile = this.calculatePercentileScore(score.founderCredibility, credibilityValues, true);
            
            // Calculate weighted composite score
            const weights = this.userProfile.priorityWeights;
            const compositeScore = (
                tcoPercentile * weights.tco +
                credibilityPercentile * weights.founderCredibility +
                85 * weights.reliability + // Reliability baseline
                credibilityPercentile * weights.marketPosition +
                (100 - this.calculatePercentileScore(score.opportunityCost, carScores.map(s => s.opportunityCost), false)) * weights.opportunityCost
            );
            
            return {
                ...score,
                tcoPercentile,
                credibilityPercentile,
                compositeScore,
                smartExplanation: this.generateSmartExplanation(score.car, score),
                marketPosition: this.getMarketPosition(score.car)
            };
        }).sort((a, b) => b.compositeScore - a.compositeScore);
    }

    getMarketPosition(car) {
        const price = car.price || 0;
        if (price < 20000) return 'Budget';
        if (price < 35000) return 'Mid-Market';
        if (price < 50000) return 'Premium';
        return 'Luxury';
    }

    updateParameters(params) {
        Object.assign(this.userProfile, params);
        this.percentileCache.clear(); // Clear cache when parameters change
    }
}

// Initialize the recommendation engine
const recommendationEngine = new CarRecommendationEngine();

// Removed duplicate function - using the main one above

function displayRecommendations(recommendations) {
    const container = document.getElementById('recommendations-container');
    if (!container) return;
    
    container.innerHTML = recommendations.map((rec, index) => {
        const car = rec.car;
        const badge = index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
        const credibilityBadge = rec.founderCredibility > 80 ? '💼' : rec.founderCredibility > 60 ? '📊' : '💰';
        
        return `
            <div class="recommendation-card rank-${index + 1}">
                <div class="rec-header">
                    <span class="rank-badge">${badge}</span>
                    <h3>${car.make || car.brand} ${car.model}</h3>
                    <span class="credibility-badge">${credibilityBadge}</span>
                </div>
                <div class="rec-scores">
                    <div class="score-item">
                        <span class="score-label">Composite Score</span>
                        <span class="score-value">${rec.compositeScore.toFixed(1)}/100</span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">3-Year TCO</span>
                        <span class="score-value">$${rec.totalCost.toLocaleString()}</span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">Founder Cred</span>
                        <span class="score-value">${rec.founderCredibility.toFixed(0)}/100</span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">Market Position</span>
                        <span class="score-value">${rec.marketPosition}</span>
                    </div>
                </div>
                <div class="rec-explanation">
                    <strong>${rec.smartExplanation}</strong>
                </div>
                <div class="rec-details">
                    <span class="price">$${(car.price || 0).toLocaleString()}</span>
                    <span class="year">${car.year}</span>
                    <span class="fuel">${car.fuel_type || car.fuel}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Setup TCO parameter event listeners
function setupTCOParameterListeners() {
    const yearsOwned = document.getElementById('yearsOwned');
    const milesPerWeek = document.getElementById('milesPerWeek');
    const enableFuelEfficiency = document.getElementById('enableFuelEfficiency');
    const founderMode = document.getElementById('founderMode');
    
    if (yearsOwned) {
        yearsOwned.addEventListener('input', function() {
            document.getElementById('yearsOwnedValue').textContent = this.value + ' years';
            recommendationEngine.updateParameters({ yearsOwned: parseInt(this.value) });
            updateRecommendations();
        });
    }
    
    if (milesPerWeek) {
        milesPerWeek.addEventListener('input', function() {
            document.getElementById('milesPerWeekValue').textContent = this.value + ' miles/week';
            recommendationEngine.updateParameters({ milesPerWeek: parseInt(this.value) });
            updateRecommendations();
        });
    }
    
    if (enableFuelEfficiency) {
        enableFuelEfficiency.addEventListener('change', function() {
            document.querySelector('.toggle-label').textContent = this.checked ? 'Enabled' : 'Disabled';
            recommendationEngine.updateParameters({ enableFuelEfficiencyFactor: this.checked });
            updateRecommendations();
        });
    }
    
    if (founderMode) {
        founderMode.addEventListener('change', function() {
            const mode = this.value;
            let weights;
            
            switch(mode) {
                case 'bootstrap':
                    weights = { tco: 0.50, founderCredibility: 0.15, reliability: 0.25, marketPosition: 0.05, opportunityCost: 0.05 };
                    break;
                case 'fundraising':
                    weights = { tco: 0.20, founderCredibility: 0.40, reliability: 0.15, marketPosition: 0.20, opportunityCost: 0.05 };
                    break;
                case 'stealth':
                    weights = { tco: 0.35, founderCredibility: 0.30, reliability: 0.20, marketPosition: 0.10, opportunityCost: 0.05 };
                    break;
                default: // balanced
                    weights = { tco: 0.30, founderCredibility: 0.25, reliability: 0.20, marketPosition: 0.15, opportunityCost: 0.10 };
            }
            
            recommendationEngine.updateParameters({ priorityWeights: weights });
            updateRecommendations();
        });
    }
}

// Initialize recommendations when data loads
function initializePersonalizedRecommendations() {
    if (carData && carData.length > 0) {
        updateRecommendations();
    }
}