# Home Ownership Returns Calculator

A comprehensive web-based financial calculator that helps you analyze the true costs and returns of home ownership. This tool calculates your complete financial picture including mortgage payments, taxes, insurance, maintenance, opportunity costs, and visualizes your investment performance over time.

This application is deployed and accessible on GitHub Pages at: https://vpattar.github.io/homeownership-returns/


## What This Application Does

The Home Ownership Returns Calculator provides a detailed financial analysis of home ownership by:

### Core Calculations
- **Mortgage Analysis**: Calculates monthly EMI (Equated Monthly Installment) payments and tracks principal vs interest breakdown over the loan term
- **Cost Analysis**: Aggregates all homeownership costs including:
  - Mortgage payments (principal + interest)
  - Annual property taxes
  - Home insurance premiums
  - Maintenance expenses
  - Opportunity costs of capital invested

### Financial Benefits Tracking
- **Rent Savings**: Calculates the money saved by not paying rent
- **Tax Benefits**: Computes tax savings from:
  - Mortgage interest deduction (up to $750,000 limit)
  - SALT (State and Local Tax) deduction (up to $10,000 limit)
- **Home Appreciation**: Tracks property value growth based on annual appreciation rate

### Investment Analysis
- **Opportunity Cost**: Calculates what your down payment and monthly payments could have earned in alternative investments (e.g., stock market)
- **Net Return**: Computes total benefits minus total costs over the ownership period
- **Annual ROI**: Determines your annual return on investment as a percentage

### Visual Analytics
The application features an interactive yearly bar chart that displays:
- **Cumulative Benefits** (blue bars): Total accumulated benefits including rent saved, tax savings, and appreciation
- **Loss Due to Opportunity Cost** (black bars): Potential earnings lost by investing in the home instead of alternative investments
- **Total Return** (green/red bars): Net cumulative return each year, color-coded green for positive returns and red for negative returns

### Key Outputs
- Final home value after appreciation
- Total equity built (home value minus remaining loan)
- Complete breakdown of all costs and benefits
- Detailed EMI and loan information
- Year-by-year progress visualization

## Features

- **Comprehensive Financial Modeling**: Analyzes all aspects of home ownership costs and benefits
- **Interactive Visualization**: Yearly bar chart showing cumulative benefits, opportunity costs, and total returns
- **Dynamic Color Coding**: Visual indicators for positive (green) and negative (red) returns
- **Tax Optimization**: Incorporates mortgage interest deduction and SALT deduction based on your tax bracket
- **Opportunity Cost Analysis**: Compares home investment against alternative investment returns
- **Real-time Calculations**: Instant updates as you adjust input parameters
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **No Backend Required**: Pure client-side application with no data sent to servers

## How to Use

1. **Enter Your Details**:
   - Home purchase price and down payment amount
   - Mortgage interest rate and loan term
   - Expected annual home appreciation rate
   - Annual property tax, insurance, and maintenance costs
   - Monthly rent you're saving by owning
   - Expected return from alternative investments
   - Your tax bracket percentage
   - Number of years to analyze

2. **Calculate Returns**: Click the "Calculate Returns" button to see your complete financial analysis

3. **Review Results**: Examine the comprehensive breakdown including:
   - Net return on your investment
   - Total costs vs total benefits
   - Equity built over time
   - Annual ROI percentage
   - Interactive yearly progress chart

4. **Adjust Scenarios**: Modify any input and recalculate to see how different assumptions affect your returns

## Project Structure

```
homeownership-returns/
├── index.html              - Main HTML file
├── script.js               - Calculation logic and visualization
├── styles.css              - Styling and responsive design
├── config.js               - Configuration file (local development only)
├── .env.example            - Example environment variables
├── .gitignore              - Git ignore rules
├── README.md               - This file
├── DEVELOPMENT.md          - Development setup and configuration guide
└── .github/
    └── workflows/
        └── deploy.yml      - GitHub Actions CI/CD pipeline
```
## Calculation Methodology

### EMI Calculation
Uses the standard EMI formula:
```
EMI = [P × r × (1 + r)^n] / [(1 + r)^n - 1]
```
Where P = principal, r = monthly interest rate, n = number of months

### Opportunity Cost
Calculates compound growth of invested capital:
```
Opportunity Cost = (Initial Investment + Annual Payments) × (1 + Return Rate)^Years
```

### Total Return
```
Total Return = (Benefits - Costs)
Benefits = Rent Saved + Tax Savings + Home Appreciation
Costs = Mortgage Payments + Taxes + Insurance + Maintenance + Opportunity Cost
```

## License

MIT License - feel free to use and modify as needed.


## Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with gradients and responsive design
- **JavaScript (ES6+)**: Financial calculations and DOM manipulation
- **Chart.js**: Interactive data visualization library
- **Google Analytics**: Usage tracking and analytics


### GitHub Pages Automatic Deployment

1. Configure GitHub Secrets (`GOOGLE_APPS_SCRIPT_URL` and `GA_TRACKING_ID`)
2. Push to `main` branch
3. GitHub Actions automatically builds and deploys

## Security Best Practices

For detailed security information and configuration, see the **[Development Setup Guide - Security Section](./DEVELOPMENT.md#security-best-practices)**.

⚠️ **Important**: Never commit `config.js` with real secrets to version control.

## Quick Links

- 📖 **[Development Setup Guide](./DEVELOPMENT.md)** - Instructions for local development and configuration
- 🚀 **[Deployment Guide](#deployment)** - How to deploy to GitHub Pages
- 🔒 **[Security](#security-best-practices)** - Secrets management and best practices
