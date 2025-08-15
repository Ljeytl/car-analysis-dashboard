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
            },
            {
                name: "2021 Tesla Model Y",
                brand: "Tesla",
                make: "Tesla",
                model: "Model Y",
                year: 2021,
                price: 42000,
                fuel: "Electric",
                fuelCost: 500,
                maintenanceCost: 350,
                insuranceCost: 1600,
                depreciation: 14700,
                tco: 59150,
                reliability: 8,
                styleScore: 9,
                notes: "Premium electric SUV"
            },
            {
                name: "2020 BMW i4",
                brand: "BMW",
                make: "BMW",
                model: "i4",
                year: 2020,
                price: 48000,
                fuel: "Electric",
                fuelCost: 425,
                maintenanceCost: 450,
                insuranceCost: 1700,
                depreciation: 15840,
                tco: 66415,
                reliability: 8,
                styleScore: 9,
                notes: "German luxury EV"
            },
            {
                name: "2022 Toyota RAV4 Hybrid",
                brand: "Toyota",
                make: "Toyota",
                model: "RAV4",
                year: 2022,
                price: 31000,
                fuel: "Hybrid",
                fuelCost: 850,
                maintenanceCost: 550,
                insuranceCost: 1350,
                depreciation: 9300,
                tco: 43050,
                reliability: 9,
                styleScore: 6,
                notes: "Reliable hybrid SUV"
            },
            {
                name: "2021 Audi A4",
                brand: "Audi",
                make: "Audi",
                model: "A4",
                year: 2021,
                price: 39000,
                fuel: "Gas",
                fuelCost: 1650,
                maintenanceCost: 1100,
                insuranceCost: 1450,
                depreciation: 13650,
                tco: 56850,
                reliability: 7,
                styleScore: 8,
                notes: "European luxury sedan"
            },
            {
                name: "2020 Honda Accord",
                brand: "Honda",
                make: "Honda",
                model: "Accord",
                year: 2020,
                price: 26000,
                fuel: "Gas",
                fuelCost: 1500,
                maintenanceCost: 600,
                insuranceCost: 1200,
                depreciation: 7800,
                tco: 37100,
                reliability: 8,
                styleScore: 6,
                notes: "Reliable midsize sedan"
            },
            {
                name: "2022 Genesis G70",
                brand: "Genesis",
                make: "Genesis",
                model: "G70",
                year: 2022,
                price: 37000,
                fuel: "Gas",
                fuelCost: 1750,
                maintenanceCost: 900,
                insuranceCost: 1550,
                depreciation: 12950,
                tco: 54150,
                reliability: 8,
                styleScore: 9,
                notes: "Luxury value proposition"
            },
            {
                name: "2021 Mercedes C300",
                brand: "Mercedes",
                make: "Mercedes",
                model: "C300",
                year: 2021,
                price: 43000,
                fuel: "Gas",
                fuelCost: 1800,
                maintenanceCost: 1300,
                insuranceCost: 1650,
                depreciation: 15050,
                tco: 62800,
                reliability: 6,
                styleScore: 9,
                notes: "German luxury with prestige"
            },
            {
                name: "2020 BMW 330e",
                brand: "BMW",
                make: "BMW",
                model: "330e",
                year: 2020,
                price: 25000,
                fuel: "Hybrid",
                fuelCost: 600,
                maintenanceCost: 950,
                insuranceCost: 1400,
                depreciation: 9500,
                tco: 37450,
                reliability: 7,
                styleScore: 8,
                notes: "Plug-in hybrid luxury"
            },
            {
                name: "2022 Nissan Leaf",
                brand: "Nissan",
                make: "Nissan",
                model: "Leaf",
                year: 2022,
                price: 23000,
                fuel: "Electric",
                fuelCost: 400,
                maintenanceCost: 300,
                insuranceCost: 1100,
                depreciation: 8050,
                tco: 32850,
                reliability: 7,
                styleScore: 5,
                notes: "Affordable electric option"
            },
            {
                name: "2021 Porsche Taycan",
                brand: "Porsche",
                make: "Porsche",
                model: "Taycan",
                year: 2021,
                price: 85000,
                fuel: "Electric",
                fuelCost: 650,
                maintenanceCost: 1200,
                insuranceCost: 2500,
                depreciation: 29750,
                tco: 119100,
                reliability: 7,
                styleScore: 10,
                notes: "Ultimate luxury EV performance"
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