# Home Ownership Returns Calculator

A comprehensive web-based financial calculator that helps you analyze the true costs and returns of home ownership. This tool calculates your complete financial picture including mortgage payments, taxes, insurance, maintenance, opportunity costs, and visualizes your investment performance over time.

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

4. **Adjust Scenarios**: Modify any  and form inputs
- `styles.css` - Styling, layout, and responsive design
- `script.js` - Calculation logic and Chart.js visualization
- `README.md` - This documentation file

## Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with gradients and responsive design
- **JavaScript (ES6+)**: Financial calculations and DOM manipulation
- **Chart.js**: Interactive data visualization library
- **Google Analytics**: Usage tracking and analytics

## Google Analytics Setup

The application includes Google Analytics to track usage statistics. To set up:

1. Create a Google Analytics 4 property at [analytics.google.com](https://analytics.google.com)
2. Get your Measurement ID (format: G-XXXXXXXXXX)
3. Replace `G-XXXXXXXXXX` in [index.html](index.html) (line 13 and 18) with your actual Measurement ID

**Tracked Events:**
- **Page Views**: Automatic tracking of how many users visit the application
- **Calculate Returns**: Custom event triggered each time the "Calculate Returns" button is clicked
- **Feedback Sentiment**: Tracks positive/negative feedback button clicks
- **Feedback Submitted**: Tracks when users submit text feedback

**Privacy Note**: Google Analytics is configured with standard privacy settings. No personally identifiable information (PII) is collected. Only aggregate usage statistics are tracked.

## Google Drive Feedback Storage Setup

User feedback (including text comments) is automatically saved to a Google Doc. To set up:

### 1. Create the Google Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Click **New Project**
3. Copy and paste the following code:

```javascript
function doPost(e) {
  try {
    // Your Google Doc ID - REPLACE THIS
    const DOC_ID = 'YOUR_GOOGLE_DOC_ID_HERE';
    
    const doc = DocumentApp.openById(DOC_ID);
    const body = doc.getBody();
    
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Format the feedback entry
    const timestamp = new Date().toLocaleString();
    const separator = '\n' + '='.repeat(50) + '\n';
    
    const entry = `${separator}Feedback Received: ${timestamp}\n` +
                  `Sentiment: ${data.sentiment}\n` +
                  `Feedback Text: ${data.feedbackText || 'No text provided'}\n` +
                  `Purchase Price: $${data.purchasePrice}\n` +
                  `Down Payment: $${data.downPayment}\n` +
                  `Net Return: $${data.netReturn}\n` +
                  `Interest Rate: ${data.interestRate}%\n` +
                  `Ownership Years: ${data.ownershipYears}\n` +
                  `Final Home Value: $${data.finalHomeValue}\n` +
                  `Monthly EMI: $${data.monthlyEMI}\n` +
                  `Annual ROI: ${data.annualROI}%\n` +
                  separator;
    
    body.appendParagraph(entry);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Save the project (name it "Feedback Collector" or similar)

### 2. Create a Google Doc for Feedback

1. Create a new Google Doc (this will store all feedback)
2. Name it "Homeownership Calculator Feedback"
3. Copy the Document ID from the URL: `https://docs.google.com/document/d/DOCUMENT_ID_HERE/edit`
4. Go back to your Apps Script and replace `YOUR_GOOGLE_DOC_ID_HERE` with the actual Document ID

### 3. Deploy the Apps Script

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type" and choose **Web app**
3. Configure:
   - **Description**: "Feedback webhook"
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy**
5. **Authorize** the script when prompted
6. Copy the **Web app URL** (it looks like: `https://script.google.com/macros/s/AKfycby.../exec`)

### 4. Update Your Application

1. Open [script.js](script.js)
2. Find line 2: `const GOOGLE_APPS_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';`
3. Replace `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` with your actual Web app URL

### 5. Test It

1. Run your application
2. Calculate returns
3. Submit feedback
4. Check your Google Doc - the feedback should appear!

**What Gets Stored:**
- Timestamp
- Sentiment (positive/negative)
- User's feedback text
- All calculation inputs and results
- This helps you understand the context of each feedback

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
This application is deployed on GitHub Pages at: https://vpattar.github.io/homeownership-returns/

## Local Development

Simply open `index.html` in your web browser, or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000` in your browser.

## Files

- `index.html` - Main HTML structure
- `styles.css` - Styling and layout
- `script.js` - Calculation logic
- `README.md` - This file

## License

MIT License - feel free to use and modify as needed.
