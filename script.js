// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Format percentage
function formatPercent(value) {
    return `${value.toFixed(2)}%`;
}

// Calculate EMI (Equated Monthly Installment)
function calculateEMI(principal, annualRate, years) {
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;
    if (monthlyRate === 0) {
        return principal / numPayments;
    }
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
           (Math.pow(1 + monthlyRate, numPayments) - 1);
}

// Main calculation function
function calculateReturns() {
    // Get input values
    const purchasePrice = parseFloat(document.getElementById('purchasePrice').value) || 0;
    const downPayment = parseFloat(document.getElementById('downPayment').value) || 0;
    const interestRate = parseFloat(document.getElementById('interestRate').value) || 0;
    const loanTerm = parseFloat(document.getElementById('loanTerm').value) || 30;
    const appreciationRate = parseFloat(document.getElementById('appreciationRate').value) || 0;
    const propertyTax = parseFloat(document.getElementById('propertyTax').value) || 0;
    const insurance = parseFloat(document.getElementById('insurance').value) || 0;
    const maintenance = parseFloat(document.getElementById('maintenance').value) || 0;
    const monthlyRent = parseFloat(document.getElementById('monthlyRent').value) || 0;
    const investmentReturn = parseFloat(document.getElementById('investmentReturn').value) || 0;
    const taxBracket = parseFloat(document.getElementById('taxBracket').value) || 0;
    const ownershipYears = parseFloat(document.getElementById('ownershipYears').value) || 10;

    // Basic calculations
    const loanAmount = purchasePrice - downPayment;
    const monthlyEMI = calculateEMI(loanAmount, interestRate, loanTerm);
    const annualEMI = monthlyEMI * 12;

    // Yearly breakdown
    let remainingLoan = loanAmount;
    let totalPrincipalPaid = 0;
    let totalInterestPaid = 0;
    let cumulativeOpportunityCost = downPayment;
    let cumulativeCosts = 0;
    let cumulativeBenefits = 0;
    let cumulativeReturn = -downPayment;

    for (let year = 1; year <= ownershipYears; year++) {
        // Calculate mortgage payments breakdown
        let yearPrincipal = 0;
        let yearInterest = 0;

        for (let month = 1; month <= 12; month++) {
            const monthlyInterest = remainingLoan * (interestRate / 100 / 12);
            const monthlyPrincipal = monthlyEMI - monthlyInterest;
            yearInterest += monthlyInterest;
            yearPrincipal += monthlyPrincipal;
            remainingLoan = Math.max(0, remainingLoan - monthlyPrincipal);
        }

        totalPrincipalPaid += yearPrincipal;
        totalInterestPaid += yearInterest;

        // Tax savings
        const mortgageInterestDeduction = Math.min(yearInterest, 750000 * interestRate / 100);
        const saltDeduction = Math.min(propertyTax, 10000);
        const taxSavings = (mortgageInterestDeduction + saltDeduction) * (taxBracket / 100);

        // Rent saved
        const rentSaved = monthlyRent * 12;

        // Opportunity cost calculation
        cumulativeOpportunityCost = (cumulativeOpportunityCost + annualEMI) * (1 + investmentReturn / 100);
        const opportunityCost = cumulativeOpportunityCost - downPayment - (annualEMI * year);

        // Home appreciation
        const homeValue = purchasePrice * Math.pow(1 + appreciationRate / 100, year);
        const appreciation = homeValue - purchasePrice;

        // Year totals
        const yearCosts = yearPrincipal + yearInterest + propertyTax + insurance + maintenance + opportunityCost;
        const yearBenefits = rentSaved + taxSavings + appreciation;
        const yearNetReturn = yearBenefits - yearCosts;

        cumulativeCosts += yearCosts;
        cumulativeBenefits += yearBenefits;
        cumulativeReturn += yearNetReturn;
    }

    // Final calculations
    const finalYear = ownershipYears;
    const finalHomeValue = purchasePrice * Math.pow(1 + appreciationRate / 100, finalYear);
    const equityBuilt = finalHomeValue - remainingLoan;
    const totalCosts = cumulativeCosts;
    const totalBenefits = cumulativeBenefits;
    const netReturn = cumulativeReturn;
    const annualROI = (netReturn / (downPayment + totalPrincipalPaid)) * 100 / ownershipYears;

    // Display results
    document.getElementById('netReturn').textContent = formatCurrency(netReturn);
    document.getElementById('netReturn').style.color = netReturn >= 0 ? '#10b981' : '#ef4444';
    
    document.getElementById('finalHomeValue').textContent = formatCurrency(finalHomeValue);
    document.getElementById('totalCosts').textContent = formatCurrency(totalCosts);
    document.getElementById('totalBenefits').textContent = formatCurrency(totalBenefits);
    document.getElementById('equityBuilt').textContent = formatCurrency(equityBuilt);
    document.getElementById('annualROI').textContent = formatPercent(annualROI);
    document.getElementById('annualROI').style.color = annualROI >= 0 ? '#10b981' : '#ef4444';

    document.getElementById('monthlyEMI').textContent = formatCurrency(monthlyEMI);
    document.getElementById('loanAmount').textContent = formatCurrency(loanAmount);
    document.getElementById('totalInterest').textContent = formatCurrency(totalInterestPaid);
    document.getElementById('totalPrincipal').textContent = formatCurrency(totalPrincipalPaid);

    // Show results section
    document.getElementById('results').style.display = 'block';
    
    // Smooth scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Event listener for form submission
document.getElementById('calculatorForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateReturns();
});
