-- Add the shameless $50k Porsche Taycan to the family_cars table
-- Run this in your Supabase SQL Editor

INSERT INTO family_cars (make, model, year, price, fuel_type, depreciation_3yr_percent, reliability_score, coolness_score, annual_fuel_cost, maintenance_annual, insurance_annual, notes, added_by) 
VALUES ('Porsche', 'Taycan', 2021, 50000, 'Electric', 25, 8, 10, 275, 1200, 800, '🏎️ SHAMELESS FLEX: $50k Porsche EV - Originally $100k+, massive depreciation = your gain! 2021 base/4S with 30k miles. Ultimate founding engineer credibility for Tesla Model 3 money.', 'Founding Engineer');

-- Verify it was added
SELECT make, model, year, price, coolness_score, notes FROM family_cars WHERE make = 'Porsche';