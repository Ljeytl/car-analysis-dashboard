# 🚗 Dynamic Car Analysis Dashboard

## Overview

A comprehensive car buying analysis dashboard that combines static market data with real-time pricing scraped from multiple sources. Perfect for data-driven car purchase decisions with automatic updates via GitHub Actions.

## Features

### 📊 Comprehensive Analysis
- **3-Year TCO Calculations**: Total Cost of Ownership including depreciation, fuel, maintenance, and insurance
- **130+ Car Models**: Massive database covering budget to luxury vehicles with year-by-year analysis
- **Granular Year Filtering**: 2018-2024 model years with smart filtering (New/Recent/Value categories)
- **Multiple Data Sources**: KBB, Edmunds, and live market pricing

### 🔴 Live Data Integration
- **Real-time Pricing**: Automated scraping from Autotrader, CarGurus, and Cars.com
- **Daily Updates**: GitHub Actions workflow runs daily at 2 AM PST
- **Smart Fallbacks**: Uses static data when live sources are unavailable
- **Market Indicators**: Price trends, market status, and deal alerts

### 🎯 Interactive Dashboard
- **Dynamic Charts**: 11 interactive charts with click-for-details functionality
- **Smart Filtering**: Filter by brand, fuel type, price range, and TCO
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Live Refresh**: Manual refresh button for immediate price updates

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Python        │    │   GitHub         │    │   Dashboard     │
│   Scraper       │───▶│   Actions        │───▶│   (GitHub       │
│   (Playwright)  │    │   (Daily Cron)   │    │   Pages)        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                        │
        ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Multiple        │    │ live_prices.json │    │ Enhanced        │
│ Car Websites    │    │ (Updated daily)  │    │ User Experience │
│ (Rate Limited)  │    │                  │    │ with Live Data  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Data Sources

### Static Data (CSV)
- Purchase prices and ranges
- Depreciation percentages  
- Maintenance costs
- Insurance estimates
- Reliability scores
- Founder credibility ratings

### Live Data (JSON)
- Current market prices
- Price trends (up/down/stable)
- Market status (active/stable/volatile)
- Listing counts
- Deal availability

## Setup & Deployment

### 1. Local Development
```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Playwright browsers
playwright install chromium

# Run scraper manually
python car_scraper.py
```

### 2. GitHub Actions Automation
The workflow automatically:
- Runs daily at 2 AM PST
- Scrapes live prices from multiple sources
- Updates `live_prices.json`
- Commits and pushes changes
- Deploys to GitHub Pages

### 3. Manual Refresh
Use the "🔄 Refresh Live Prices" button in the dashboard for immediate updates.

## Configuration

### Scraper Settings
- **Rate Limiting**: 1-3 second delays between requests
- **User Agents**: Rotating browser identities
- **Error Handling**: Graceful fallbacks to cached data
- **Logging**: Comprehensive scraping logs

### Target Cars for Live Scraping
Currently tracking 18 high-priority vehicles with live price data:

**EVs & PHEVs:**
- Tesla Model 3 (2020-2024)
- BMW 330e (2020-2022)
- Hyundai Ioniq 5 (2022-2024)

**Popular Mainstream:**
- Toyota RAV4 Hybrid, Camry (2021-2023)
- Honda Civic, Accord, CR-V (2020-2024)

**Luxury & Sports:**
- Genesis G70 (2020-2022)
- Porsche Cayman (2019-2023)  
- Lexus ES Hybrid (2020-2024)

**SUVs & Trucks:**
- Mazda CX-5, Subaru Outback (2020-2024)
- Toyota Highlander, Ford F-150 (2021-2023)

**Budget Options:**
- Nissan Altima, Chevrolet Equinox, Ford Escape (2022-2023)

## File Structure

```
car-analysis-dashboard/
├── car_scraper.py              # Main scraping script
├── requirements.txt            # Python dependencies
├── .github/workflows/scrape.yml # GitHub Actions workflow
├── index.html                  # Main dashboard (from car_dashboard_ultimate.html)
├── comprehensive_car_analysis.csv # Static car data
├── live_prices.json           # Live pricing data (auto-generated)
├── live_prices_sample.json    # Sample data for testing
└── README.md                  # This file
```

## Legal & Ethical Considerations

- **Respectful Scraping**: Rate limiting and robots.txt compliance
- **Public Data Only**: Only scrapes publicly available listing information  
- **Terms of Service**: Carefully reviewed for each target website
- **Fair Use**: Data used for personal car buying analysis only

## Monitoring & Logs

### GitHub Actions
- **Workflow Status**: View in Actions tab
- **Scraping Summary**: Detailed results in workflow summary
- **Error Logs**: Automatic artifact upload for debugging

### Dashboard Logs
- Browser console shows data loading status
- Live vs. static data indicators
- Refresh operation feedback

## Future Enhancements

- [ ] Historical price trend charts
- [ ] Email alerts for price drops
- [ ] More granular geographic filtering
- [ ] VIN-specific tracking
- [ ] Machine learning price predictions
- [ ] Mobile app version

## Contributing

This is a personal project for car buying analysis. Feel free to fork and adapt for your own use case.

## License

MIT License - See individual data source terms of service for scraping limitations.

---

**Live Dashboard**: https://ljeytl.github.io/car-analysis-dashboard/

Last updated with dynamic pricing capabilities: January 2025