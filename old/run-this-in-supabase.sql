-- INSTRUCTIONS: Copy this entire file and paste it into your Supabase SQL Editor
-- Then click RUN to create the main_cars table and populate it with all 133 cars

-- Step 1: Create the main_cars table for CSV data
CREATE TABLE IF NOT EXISTS main_cars (
    id SERIAL PRIMARY KEY,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year_range TEXT,
    year INTEGER,
    price_range_low INTEGER,
    price_range_high INTEGER,
    price INTEGER,
    category TEXT,
    drivetrain TEXT,
    fuel_type TEXT,
    mpg_city INTEGER,
    mpg_highway INTEGER,
    mpg_combined INTEGER,
    annual_fuel_cost INTEGER,
    maintenance_annual INTEGER,
    insurance_annual INTEGER,
    depreciation_3yr_percent INTEGER,
    federal_tax_credit INTEGER,
    ca_rebate INTEGER,
    manufacturer_incentive INTEGER,
    final_price_low INTEGER,
    final_price_high INTEGER,
    tco_3yr_low INTEGER,
    tco_3yr_high INTEGER,
    founder_credibility_score INTEGER,
    reliability_score INTEGER,
    coolness_score INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable Row Level Security
ALTER TABLE main_cars ENABLE ROW LEVEL SECURITY;

-- Step 3: Create policy to allow all operations
CREATE POLICY "Allow all operations for main_cars" ON main_cars
    FOR ALL USING (true);

-- Step 4: Insert the first 20 cars as a test
-- After this works, I'll provide the full 133 car dataset

INSERT INTO main_cars (make, model, year_range, year, price_range_low, price_range_high, price, category, drivetrain, fuel_type, mpg_city, mpg_highway, mpg_combined, annual_fuel_cost, maintenance_annual, insurance_annual, depreciation_3yr_percent, federal_tax_credit, ca_rebate, manufacturer_incentive, final_price_low, final_price_high, tco_3yr_low, tco_3yr_high, founder_credibility_score, reliability_score, coolness_score, notes) VALUES
('Tesla', 'Model 3', '2019-2024', 2022, 18000, 33000, 25500, 'Premium EV', 'RWD/AWD', 'Electric', 120, 112, 116, 275, 300, 400, 45, 7500, 2000, 0, 8500, 23500, 6575, 16075, 5, 8, 6, '2024: $26k-$44k new, 2023: $22k-$34k used, 2022: $19k-$28k used - massive depreciation'),
('Tesla', 'Model Y', '2020-2024', 2022, 30000, 45000, 37500, 'Premium EV SUV', 'RWD/AWD', 'Electric', 129, 120, 125, 275, 300, 450, 32, 7500, 2000, 0, 20500, 35500, 14750, 22600, 6, 8, 7, 'Popular SUV option in tech circles'),
('Tesla', 'Model S', '2018-2024', 2021, 35000, 65000, 50000, 'Luxury EV Sedan', 'AWD', 'Electric', 120, 115, 118, 275, 400, 500, 35, 0, 0, 0, 35000, 65000, 24275, 42775, 8, 7, 9, 'OG luxury EV - actual status symbol'),
('BMW', 'i4', '2022-2024', 2023, 40000, 55000, 47500, 'Luxury EV', 'RWD/AWD', 'Electric', 120, 108, 114, 275, 500, 450, 28, 7500, 2000, 0, 30500, 45500, 20075, 29325, 9, 8, 8, 'German luxury EV credibility'),
('BMW', '330e', '2020-2022', 2021, 23000, 27500, 25250, 'Luxury PHEV', 'RWD/AWD', 'PHEV', 75, 85, 80, 400, 800, 350, 38, 0, 0, 0, 23000, 27500, 17050, 20350, 8, 7, 7, '2022: $27k resale, 2021: $21k resale - 38-39% depreciation per KBB/Edmunds'),
('BMW', '330i', '2018-2022', 2020, 20000, 32000, 26000, 'Luxury Sedan', 'RWD/AWD', 'Gas', 26, 35, 30, 1200, 800, 350, 28, 0, 0, 0, 20000, 32000, 16100, 24600, 8, 7, 7, 'Classic luxury sedan'),
('BMW', 'M240i', '2018-2023', 2021, 30000, 42000, 36000, 'Sports Luxury', 'RWD/AWD', 'Gas', 22, 32, 25, 1400, 900, 500, 30, 0, 0, 0, 30000, 42000, 22300, 30900, 9, 7, 8, 'Performance credibility'),
('BMW', 'M2', '2018-2023', 2021, 35000, 50000, 42500, 'Sports Car', 'RWD', 'Gas', 20, 28, 22, 1600, 1000, 600, 25, 0, 0, 0, 35000, 50000, 26400, 35900, 9, 7, 9, 'True enthusiast car'),
('Audi', 'A4', '2018-2022', 2020, 22000, 32000, 27000, 'Luxury Sedan', 'AWD', 'Gas', 27, 34, 30, 1200, 900, 400, 30, 0, 0, 0, 22000, 32000, 17700, 25700, 8, 7, 7, 'European sophistication'),
('Audi', 'S4', '2018-2022', 2020, 28000, 40000, 34000, 'Sports Luxury', 'AWD', 'Gas', 21, 30, 24, 1500, 1000, 500, 32, 0, 0, 0, 28000, 40000, 22100, 30500, 9, 7, 8, 'Understated performance'),
('Genesis', 'G70', '2020-2022', 2021, 20000, 29000, 24500, 'Luxury Sedan', 'RWD/AWD', 'Gas', 22, 31, 25, 1400, 600, 300, 43, 0, 0, 2000, 18000, 27000, 14700, 20900, 8, 8, 7, '2022: $21k-$24k resale per KBB/Edmunds, 43% depreciation but excellent warranty'),
('Genesis', 'G80', '2021-2024', 2023, 28000, 42000, 35000, 'Luxury Sedan', 'RWD/AWD', 'Gas', 22, 32, 25, 1400, 700, 350, 33, 0, 0, 2000, 26000, 40000, 19700, 28750, 8, 8, 8, 'Executive presence'),
('Genesis', 'GV70', '2022-2024', 2023, 35000, 48000, 41500, 'Luxury SUV', 'AWD', 'Gas', 22, 28, 24, 1500, 700, 400, 30, 0, 0, 2000, 33000, 46000, 25200, 33400, 8, 8, 7, 'Luxury SUV with value story'),
('Genesis', 'GV60', '2022-2024', 2023, 45000, 60000, 52500, 'Luxury EV SUV', 'AWD', 'Electric', 112, 112, 112, 275, 500, 450, 35, 7500, 2000, 0, 35500, 50500, 22675, 31325, 9, 8, 8, 'Cutting-edge luxury EV'),
('Mercedes', 'C300', '2018-2022', 2020, 25000, 35000, 30000, 'Luxury Sedan', 'RWD/AWD', 'Gas', 23, 32, 26, 1300, 1000, 400, 32, 0, 0, 0, 25000, 35000, 20300, 28300, 8, 6, 8, 'Classic luxury badge'),
('Mercedes', 'CLA250', '2019-2024', 2022, 22000, 32000, 27000, 'Luxury Sedan', 'FWD/AWD', 'Gas', 24, 35, 28, 1200, 900, 400, 35, 0, 0, 0, 22000, 32000, 18500, 26500, 7, 6, 7, 'Entry luxury - compact'),
('Porsche', 'Cayman', '2017-2023', 2020, 32000, 57000, 44500, 'Sports Car', 'RWD', 'Gas', 20, 28, 22, 1600, 1200, 700, 22, 0, 0, 0, 32000, 57000, 26700, 40200, 10, 9, 10, '2019: $29k-$54k, 2021: $32k-$57k per Edmunds - excellent retention'),
('Porsche', 'Boxster', '2017-2023', 2020, 30000, 50000, 40000, 'Sports Convertible', 'RWD', 'Gas', 20, 28, 22, 1600, 1200, 700, 22, 0, 0, 0, 30000, 50000, 24700, 35700, 10, 9, 10, 'Convertible sports luxury'),
('Porsche', 'Macan', '2018-2023', 2021, 35000, 50000, 42500, 'Luxury SUV', 'AWD', 'Gas', 19, 25, 21, 1700, 1200, 600, 25, 0, 0, 0, 35000, 50000, 27900, 37400, 10, 8, 9, 'Luxury SUV pinnacle'),
('Lexus', 'IS', '2018-2024', 2021, 22000, 32000, 27000, 'Luxury Sedan', 'RWD/AWD', 'Gas', 21, 31, 24, 1500, 400, 300, 25, 0, 0, 0, 22000, 32000, 16900, 24400, 7, 9, 6, 'Reliable luxury');

-- Check if data was inserted
SELECT COUNT(*) as total_cars FROM main_cars;
SELECT make, model, price FROM main_cars LIMIT 5;