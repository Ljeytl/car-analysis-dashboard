-- Create family_cars table
CREATE TABLE family_cars (
    id SERIAL PRIMARY KEY,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    price INTEGER NOT NULL,
    fuel_type TEXT NOT NULL,
    depreciation_3yr_percent INTEGER,
    reliability_score INTEGER,
    coolness_score INTEGER,
    annual_fuel_cost INTEGER,
    maintenance_annual INTEGER,
    insurance_annual INTEGER,
    notes TEXT,
    added_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE family_cars ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for everyone (since it's family data)
CREATE POLICY "Allow all operations for family_cars" ON family_cars
    FOR ALL USING (true);

-- Insert some sample data to test
INSERT INTO family_cars (make, model, year, price, fuel_type, depreciation_3yr_percent, reliability_score, coolness_score, annual_fuel_cost, maintenance_annual, insurance_annual, notes, added_by) 
VALUES ('Toyota', 'Camry', 2023, 28000, 'Gas', 25, 9, 6, 1200, 500, 800, 'Reliable family car', 'Setup');