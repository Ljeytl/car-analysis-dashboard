// Data loader module for car data management
export class DataLoader {
    constructor() {
        this.carData = [];
        this.filteredData = [];
    }

    // Car data with sample entries
    getDefaultCarData() {
        return [
            {
                name: "2022 Toyota Camry Hybrid",
                brand: "Toyota",
                make: "Toyota",
                model: "Camry",
                year: 2022,
                price: 28000,
                fuel: "Hybrid",
                fuelCost: 800,
                maintenanceCost: 500,
                insuranceCost: 1200,
                depreciation: 8400,
                tco: 38900,
                reliability: 9,
                styleScore: 6,
                notes: "Excellent reliability and fuel economy"
            },
            {
                name: "2021 BMW 330i",
                brand: "BMW",
                make: "BMW", 
                model: "330i",
                year: 2021,
                price: 35000,
                fuel: "Gas",
                fuelCost: 1800,
                maintenanceCost: 1200,
                insuranceCost: 1500,
                depreciation: 12250,
                tco: 51750,
                reliability: 7,
                styleScore: 8,
                notes: "Premium luxury sedan with great performance"
            },
            {
                name: "2020 Tesla Model 3",
                brand: "Tesla",
                make: "Tesla",
                model: "Model 3", 
                year: 2020,
                price: 32000,
                fuel: "Electric",
                fuelCost: 450,
                maintenanceCost: 300,
                insuranceCost: 1400,
                depreciation: 11200,
                tco: 45350,
                reliability: 8,
                styleScore: 9,
                notes: "Cutting-edge EV technology"
            },
            {
                name: "2022 Honda CR-V Hybrid",
                brand: "Honda", 
                make: "Honda",
                model: "CR-V",
                year: 2022,
                price: 33000,
                fuel: "Hybrid", 
                fuelCost: 900,
                maintenanceCost: 600,
                insuranceCost: 1300,
                depreciation: 9900,
                tco: 45700,
                reliability: 9,
                styleScore: 6,
                notes: "Practical hybrid SUV with excellent space"
            },
            {
                name: "2021 Lexus ES 300h",
                brand: "Lexus",
                make: "Lexus", 
                model: "ES",
                year: 2021,
                price: 38000,
                fuel: "Hybrid",
                fuelCost: 750,
                maintenanceCost: 800,
                insuranceCost: 1400,
                depreciation: 11400,
                tco: 52350,
                reliability: 9,
                styleScore: 8,
                notes: "Luxury hybrid with premium comfort"
            }
        ];
    }

    // Initialize data
    async loadData() {
        try {
            // In a real application, this would fetch from CSV or API
            // For now, use default data
            this.carData = [...this.getDefaultCarData()];
            this.filteredData = [...this.carData];
            return this.carData;
        } catch (error) {
            console.error('Error loading car data:', error);
            // Fallback to default data
            this.carData = [...this.getDefaultCarData()];
            this.filteredData = [...this.carData];
            return this.carData;
        }
    }

    // Get unique brands for filter dropdown
    getBrands() {
        return [...new Set(this.carData.map(car => car.brand))].sort();
    }

    // Apply filters to data
    applyFilters(filters) {
        const { brand, fuel, maxPrice } = filters;
        
        this.filteredData = this.carData.filter(car => {
            const brandMatch = !brand || car.brand === brand;
            const fuelMatch = !fuel || car.fuel === fuel;
            const priceMatch = !maxPrice || car.price <= parseInt(maxPrice);
            
            return brandMatch && fuelMatch && priceMatch;
        });
        
        return this.filteredData;
    }

    // Get filtered data
    getFilteredData() {
        return this.filteredData;
    }

    // Get all data
    getAllData() {
        return this.carData;
    }

    // Refresh data (placeholder for API calls)
    async refreshData() {
        // In a real application, this would fetch fresh data from an API
        console.log('Refreshing data...');
        return await this.loadData();
    }
}