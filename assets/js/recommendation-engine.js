// Recommendation engine for car scoring and recommendations
export class RecommendationEngine {
    constructor() {
        this.weights = {
            cost: 3,
            tco: 4,
            reliability: 3,
            style: 2,
            fuel: 3
        };
    }

    // Get weights based on sliders and priority mode
    getWeights(sliderValues, priorityMode) {
        let weights = { ...sliderValues };
        
        // Adjust weights based on priority mode
        switch(priorityMode) {
            case 'budget':
                weights.cost *= 1.5;
                weights.tco *= 1.3;
                weights.style *= 0.7;
                break;
            case 'luxury':
                weights.style *= 1.5;
                weights.reliability *= 1.2;
                weights.cost *= 0.7;
                break;
            case 'efficiency':
                weights.fuel *= 1.5;
                weights.tco *= 1.3;
                weights.style *= 0.8;
                break;
        }
        
        return weights;
    }

    // Calculate weighted scores for cars
    calculateWeightedScores(cars, weights) {
        if (!cars || cars.length === 0) return [];

        return cars.map(car => {
            // Normalize scores to 0-10 scale
            const maxPrice = Math.max(...cars.map(c => c.price));
            const maxTCO = Math.max(...cars.map(c => c.tco));
            const maxFuelCost = Math.max(...cars.map(c => c.fuelCost));
            
            const scores = {
                cost: (1 - (car.price / maxPrice)) * 10, // Lower price = higher score
                tco: (1 - (car.tco / maxTCO)) * 10,      // Lower TCO = higher score
                reliability: car.reliability || 7,        // Already 0-10
                style: car.styleScore || 5,               // Style score 0-10
                fuel: (1 - (car.fuelCost / maxFuelCost)) * 10 // Lower fuel cost = higher score
            };
            
            // Calculate weighted score
            const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
            const weightedScore = (
                scores.cost * weights.cost +
                scores.tco * weights.tco +
                scores.reliability * weights.reliability +
                scores.style * weights.style +
                scores.fuel * weights.fuel
            ) / totalWeight;
            
            return {
                ...car,
                scores,
                weightedScore: Math.round(weightedScore * 100) / 100,
                recommendation: this.getRecommendationReason(scores, weights)
            };
        }).sort((a, b) => b.weightedScore - a.weightedScore);
    }

    // Get recommendation reason based on top factors
    getRecommendationReason(scores, weights) {
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
                    default: return 'overall value';
                }
            });
        
        return `Best for: ${topFactors.join(' + ')}`;
    }

    // Get top recommendations
    getTopRecommendations(cars, weights, count = 5) {
        const scoredCars = this.calculateWeightedScores(cars, weights);
        return scoredCars.slice(0, count);
    }

    // Get top cars for chart display
    getTopCarsForChart(cars, weights, count = 10) {
        const scoredCars = this.calculateWeightedScores(cars, weights);
        return scoredCars.slice(0, count);
    }
}