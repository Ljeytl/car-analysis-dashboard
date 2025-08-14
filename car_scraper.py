#!/usr/bin/env python3
"""
Dynamic Car Price Scraper for Car Analysis Dashboard
Scrapes live pricing data from multiple sources and outputs to JSON
"""

import asyncio
import json
import logging
import random
import re
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple
from urllib.parse import quote_plus

import aiohttp
from playwright.async_api import Browser, Page, Playwright, async_playwright

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class CarScraper:
    def __init__(self):
        self.user_agents = [
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
        
        # Target cars for scraping (prioritized list from expanded dataset)
        self.target_cars = [
            # High Priority EVs & PHEVs
            {'make': 'Tesla', 'model': 'Model 3', 'years': '2020-2024'},
            {'make': 'BMW', 'model': '330e', 'years': '2020-2022'},
            {'make': 'Hyundai', 'model': 'Ioniq 5', 'years': '2022-2024'},
            
            # Popular Mainstream Vehicles
            {'make': 'Toyota', 'model': 'RAV4 Hybrid', 'years': '2021-2023'},
            {'make': 'Toyota', 'model': 'Camry', 'years': '2021-2023'},
            {'make': 'Honda', 'model': 'Civic', 'years': '2020-2024'},
            {'make': 'Honda', 'model': 'Accord', 'years': '2021-2023'},
            {'make': 'Honda', 'model': 'CR-V', 'years': '2021-2023'},
            
            # Luxury & Sports
            {'make': 'Genesis', 'model': 'G70', 'years': '2020-2022'},
            {'make': 'Porsche', 'model': 'Cayman', 'years': '2019-2023'},
            {'make': 'Lexus', 'model': 'ES Hybrid', 'years': '2020-2024'},
            
            # SUVs & Trucks
            {'make': 'Mazda', 'model': 'CX-5', 'years': '2020-2024'},
            {'make': 'Subaru', 'model': 'Outback', 'years': '2020-2024'},
            {'make': 'Toyota', 'model': 'Highlander', 'years': '2021-2023'},
            {'make': 'Ford', 'model': 'F-150', 'years': '2021-2023'},
            
            # Budget Options
            {'make': 'Nissan', 'model': 'Altima', 'years': '2022-2023'},
            {'make': 'Chevrolet', 'model': 'Equinox', 'years': '2022-2023'},
            {'make': 'Ford', 'model': 'Escape', 'years': '2022-2023'}
        ]

    async def get_random_user_agent(self) -> str:
        """Get a random user agent to avoid detection"""
        return random.choice(self.user_agents)

    async def random_delay(self, min_seconds: float = 1.0, max_seconds: float = 3.0):
        """Random delay between requests"""
        delay = random.uniform(min_seconds, max_seconds)
        await asyncio.sleep(delay)

    async def scrape_autotrader(self, page: Page, make: str, model: str) -> List[Dict]:
        """Scrape Autotrader for car prices"""
        results = []
        try:
            # Construct Autotrader search URL
            search_term = f"{make} {model}".replace(' ', '%20')
            url = f"https://www.autotrader.com/cars-for-sale/all-cars/{search_term}"
            
            logger.info(f"Scraping Autotrader for {make} {model}")
            
            # Navigate with timeout
            await page.goto(url, wait_until='networkidle', timeout=30000)
            await self.random_delay(2, 4)
            
            # Look for price elements
            price_selectors = [
                '[data-cmp="pricing"] .text-bold',
                '.pricing-detail .text-bold', 
                '.price-section .text-bold',
                '[data-cmp="inventoryListing"] .text-bold'
            ]
            
            for selector in price_selectors:
                try:
                    price_elements = await page.query_selector_all(selector)
                    if price_elements:
                        for element in price_elements[:10]:  # Limit to first 10
                            try:
                                text = await element.inner_text()
                                price_match = re.search(r'\$([0-9,]+)', text)
                                if price_match:
                                    price = int(price_match.group(1).replace(',', ''))
                                    if 5000 <= price <= 200000:  # Reasonable price range
                                        results.append({
                                            'price': price,
                                            'source': 'autotrader',
                                            'url': url
                                        })
                            except Exception:
                                continue
                        break
                except Exception:
                    continue
            
            logger.info(f"Found {len(results)} prices on Autotrader for {make} {model}")
            
        except Exception as e:
            logger.error(f"Error scraping Autotrader for {make} {model}: {e}")
        
        return results

    async def scrape_cargurus(self, page: Page, make: str, model: str) -> List[Dict]:
        """Scrape CarGurus for car prices"""
        results = []
        try:
            # Construct CarGurus search URL
            make_clean = make.lower().replace(' ', '-')
            model_clean = model.lower().replace(' ', '-')
            url = f"https://www.cargurus.com/Cars/inventorylisting/viewDetailsFilterViewInventoryListing.action?sourceContext=carGurusHomePage_false_0&entitySelectingHelper.selectedEntity=d{make_clean}&entitySelectingHelper.selectedEntity2=c{model_clean}"
            
            logger.info(f"Scraping CarGurus for {make} {model}")
            
            await page.goto(url, wait_until='networkidle', timeout=30000)
            await self.random_delay(2, 4)
            
            # Look for price elements
            price_selectors = [
                '.srpPrice',
                '[data-testid="srpPrice"]',
                '.price-section',
                '.listing-price'
            ]
            
            for selector in price_selectors:
                try:
                    price_elements = await page.query_selector_all(selector)
                    if price_elements:
                        for element in price_elements[:10]:  # Limit to first 10
                            try:
                                text = await element.inner_text()
                                price_match = re.search(r'\$([0-9,]+)', text)
                                if price_match:
                                    price = int(price_match.group(1).replace(',', ''))
                                    if 5000 <= price <= 200000:
                                        results.append({
                                            'price': price,
                                            'source': 'cargurus', 
                                            'url': url
                                        })
                            except Exception:
                                continue
                        break
                except Exception:
                    continue
            
            logger.info(f"Found {len(results)} prices on CarGurus for {make} {model}")
            
        except Exception as e:
            logger.error(f"Error scraping CarGurus for {make} {model}: {e}")
        
        return results

    async def scrape_cars_com(self, page: Page, make: str, model: str) -> List[Dict]:
        """Scrape Cars.com for car prices"""
        results = []
        try:
            # Construct Cars.com search URL
            make_clean = make.lower().replace(' ', '_')
            model_clean = model.lower().replace(' ', '_')
            url = f"https://www.cars.com/shopping/results/?stock_type=used&makes[]={make_clean}&models[]={make_clean}-{model_clean}&list_price_max=&maximum_distance=all&zip="
            
            logger.info(f"Scraping Cars.com for {make} {model}")
            
            await page.goto(url, wait_until='networkidle', timeout=30000)
            await self.random_delay(2, 4)
            
            # Look for price elements
            price_selectors = [
                '.primary-price',
                '[data-testid="price"]',
                '.price-section .price',
                '.listing-row .price'
            ]
            
            for selector in price_selectors:
                try:
                    price_elements = await page.query_selector_all(selector)
                    if price_elements:
                        for element in price_elements[:10]:  # Limit to first 10
                            try:
                                text = await element.inner_text()
                                price_match = re.search(r'\$([0-9,]+)', text)
                                if price_match:
                                    price = int(price_match.group(1).replace(',', ''))
                                    if 5000 <= price <= 200000:
                                        results.append({
                                            'price': price,
                                            'source': 'cars.com',
                                            'url': url
                                        })
                            except Exception:
                                continue
                        break
                except Exception:
                    continue
            
            logger.info(f"Found {len(results)} prices on Cars.com for {make} {model}")
            
        except Exception as e:
            logger.error(f"Error scraping Cars.com for {make} {model}: {e}")
        
        return results

    async def scrape_car_prices(self, make: str, model: str) -> Dict:
        """Scrape prices for a specific car from multiple sources"""
        all_prices = []
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent=await self.get_random_user_agent(),
                viewport={'width': 1920, 'height': 1080}
            )
            page = await context.new_page()
            
            # Set extra headers to appear more human
            await page.set_extra_http_headers({
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'DNT': '1',
                'Upgrade-Insecure-Requests': '1'
            })
            
            # Try each source
            sources = [
                self.scrape_autotrader,
                self.scrape_cargurus, 
                self.scrape_cars_com
            ]
            
            for scrape_func in sources:
                try:
                    prices = await scrape_func(page, make, model)
                    all_prices.extend(prices)
                    await self.random_delay(3, 6)  # Longer delay between sites
                except Exception as e:
                    logger.error(f"Error in {scrape_func.__name__}: {e}")
                    continue
            
            await browser.close()
        
        # Process results
        if not all_prices:
            return self.get_fallback_price(make, model)
        
        prices_only = [p['price'] for p in all_prices]
        
        return {
            'make': make,
            'model': model,
            'current_price': int(sum(prices_only) / len(prices_only)),
            'min_price': min(prices_only),
            'max_price': max(prices_only),
            'listings_count': len(all_prices),
            'price_sources': list(set([p['source'] for p in all_prices])),
            'last_updated': datetime.now(timezone.utc).isoformat(),
            'market_status': self.determine_market_status(prices_only)
        }

    def get_fallback_price(self, make: str, model: str) -> Dict:
        """Fallback prices based on our existing data"""
        fallback_prices = {
            # EVs & PHEVs
            'Tesla Model 3': {'min': 18000, 'max': 44000, 'avg': 26000},
            'BMW 330e': {'min': 21000, 'max': 30000, 'avg': 25000},
            'Hyundai Ioniq 5': {'min': 25000, 'max': 45000, 'avg': 33000},
            
            # Popular Mainstream
            'Toyota RAV4 Hybrid': {'min': 28000, 'max': 38000, 'avg': 32000},
            'Toyota Camry': {'min': 21000, 'max': 32000, 'avg': 26000},
            'Honda Civic': {'min': 16000, 'max': 32000, 'avg': 22000},
            'Honda Accord': {'min': 22000, 'max': 33000, 'avg': 27000},
            'Honda CR-V': {'min': 24000, 'max': 34000, 'avg': 29000},
            
            # Luxury & Sports
            'Genesis G70': {'min': 20000, 'max': 29000, 'avg': 23000},
            'Porsche Cayman': {'min': 38000, 'max': 75000, 'avg': 52000},
            'Lexus ES Hybrid': {'min': 25000, 'max': 45000, 'avg': 36000},
            
            # SUVs & Trucks
            'Mazda CX-5': {'min': 19000, 'max': 35000, 'avg': 26000},
            'Subaru Outback': {'min': 22000, 'max': 36000, 'avg': 28000},
            'Toyota Highlander': {'min': 33000, 'max': 45000, 'avg': 38000},
            'Ford F-150': {'min': 28000, 'max': 55000, 'avg': 40000},
            
            # Budget Options
            'Nissan Altima': {'min': 21000, 'max': 30000, 'avg': 25000},
            'Chevrolet Equinox': {'min': 23000, 'max': 32000, 'avg': 27000},
            'Ford Escape': {'min': 23000, 'max': 32000, 'avg': 27000}
        }
        
        key = f"{make} {model}"
        fallback = fallback_prices.get(key, {'min': 20000, 'max': 35000, 'avg': 27500})
        
        return {
            'make': make,
            'model': model,
            'current_price': fallback['avg'],
            'min_price': fallback['min'],
            'max_price': fallback['max'],
            'listings_count': 0,
            'price_sources': ['fallback'],
            'last_updated': datetime.now(timezone.utc).isoformat(),
            'market_status': 'unknown'
        }

    def determine_market_status(self, prices: List[int]) -> str:
        """Determine if market is hot, normal, or buyer's market"""
        if not prices:
            return 'unknown'
        
        price_range = max(prices) - min(prices)
        avg_price = sum(prices) / len(prices)
        range_percentage = (price_range / avg_price) * 100
        
        if range_percentage > 30:
            return 'volatile'
        elif range_percentage > 20:
            return 'active'
        else:
            return 'stable'

    async def scrape_all_cars(self) -> List[Dict]:
        """Scrape prices for all target cars"""
        results = []
        
        logger.info(f"Starting to scrape {len(self.target_cars)} priority cars from expanded 130+ car dataset")
        
        for i, car in enumerate(self.target_cars):
            try:
                logger.info(f"Progress: {i+1}/{len(self.target_cars)} - Scraping {car['make']} {car['model']}")
                
                car_data = await self.scrape_car_prices(car['make'], car['model'])
                results.append(car_data)
                
                # Rate limiting between cars
                if i < len(self.target_cars) - 1:
                    await self.random_delay(5, 10)
                    
            except Exception as e:
                logger.error(f"Failed to scrape {car['make']} {car['model']}: {e}")
                # Add fallback data
                fallback = self.get_fallback_price(car['make'], car['model'])
                results.append(fallback)
        
        logger.info(f"Completed scraping. Found data for {len(results)} cars")
        return results

    def save_results(self, data: List[Dict], filename: str = 'live_prices.json'):
        """Save scraping results to JSON file"""
        output = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'total_cars': len(data),
            'successful_scrapes': len([d for d in data if d['listings_count'] > 0]),
            'cars': data
        }
        
        try:
            with open(filename, 'w') as f:
                json.dump(output, f, indent=2)
            logger.info(f"Results saved to {filename}")
        except Exception as e:
            logger.error(f"Failed to save results: {e}")

async def main():
    """Main execution function"""
    scraper = CarScraper()
    
    logger.info("=== Car Price Scraper Started ===")
    start_time = time.time()
    
    try:
        # Scrape all cars
        results = await scraper.scrape_all_cars()
        
        # Save results
        scraper.save_results(results)
        
        # Print summary
        successful = len([r for r in results if r['listings_count'] > 0])
        total_time = time.time() - start_time
        
        logger.info(f"=== Scraping Complete ===")
        logger.info(f"Total cars processed: {len(results)}")
        logger.info(f"Successful scrapes: {successful}")
        logger.info(f"Fallback data used: {len(results) - successful}")
        logger.info(f"Total time: {total_time:.1f} seconds")
        
        # Print sample results
        if results:
            logger.info("Sample results:")
            for car in results[:3]:
                logger.info(f"  {car['make']} {car['model']}: ${car['current_price']:,} ({car['listings_count']} listings)")
    
    except Exception as e:
        logger.error(f"Scraper failed: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main())