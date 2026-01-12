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
    // Track calculation event in Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'calculate_returns', {
            event_category: 'engagement',
            event_label: 'Calculate Returns Button'
        });
    }
    
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

    // Yearly breakdown - store data for chart
    const chartData = {
        years: [],
        cumulativeBenefits: [],
        opportunityCosts: [],
        totalReturns: []
    };
    
    let remainingLoan = loanAmount;
    let totalPrincipalPaid = 0;
    let totalInterestPaid = 0;
    let cumulativeOpportunityCost = downPayment;
    let cumulativeBenefits = 0;
    let cumulativeReturn = 0;
    let cumulativeCosts = 0;

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
        const saltDeduction = Math.min(propertyTax, 40000);
        const stateTaxDeduction = yearInterest * 10 / 100; // Assuming 10% state tax for SALT calculation

        const taxSavings = (mortgageInterestDeduction + saltDeduction) * (taxBracket / 100) + stateTaxDeduction;

        // Rent saved
        const rentSaved = monthlyRent * 12;
    
        // Home appreciation
        const homeValue = purchasePrice * Math.pow(1 + appreciationRate / 100, year);

        // Cumulative returns from home ownership
        const cumulativeReturnsFromHome = homeValue - remainingLoan;

        // Year totals
        const yearCosts =  propertyTax + insurance + maintenance + annualEMI;
        cumulativeCosts += yearCosts;
        const yearBenefits = rentSaved + taxSavings;
        const yearNetReturn =  yearCosts - yearBenefits;
        console.log(yearCosts, propertyTax, insurance, maintenance, annualEMI);
        console.log(yearBenefits, rentSaved, taxSavings, yearNetReturn);        

        // Update cumulative values
        cumulativeOpportunityCost = (cumulativeOpportunityCost + yearNetReturn)  * (1 + investmentReturn / 100);
    
        cumulativeReturn = cumulativeReturnsFromHome - cumulativeOpportunityCost;

        // Store data for chart
        chartData.years.push(year);
        chartData.cumulativeBenefits.push(cumulativeReturnsFromHome - downPayment);
        chartData.opportunityCosts.push(cumulativeOpportunityCost - downPayment);
        chartData.totalReturns.push(cumulativeReturn);
    }

    // Final calculations
    const finalHomeValue = purchasePrice * Math.pow(1 + appreciationRate / 100, ownershipYears);
    const equityBuilt = finalHomeValue - remainingLoan;
    const netReturn = cumulativeReturn;
    const annualROI = (netReturn / (downPayment + totalPrincipalPaid)) * 100 / ownershipYears;

    // Display results
    document.getElementById('netReturn').textContent = formatCurrency(netReturn);
    document.getElementById('netReturn').style.color = netReturn >= 0 ? '#10b981' : '#ef4444';
    
    document.getElementById('finalHomeValue').textContent = formatCurrency(finalHomeValue);
    document.getElementById('cumulativeCosts').textContent = formatCurrency(cumulativeCosts);
    document.getElementById('cumulativeBenefits').textContent = formatCurrency(cumulativeBenefits);
    document.getElementById('equityBuilt').textContent = formatCurrency(equityBuilt);
    document.getElementById('annualROI').textContent = formatPercent(annualROI);
    document.getElementById('annualROI').style.color = annualROI >= 0 ? '#10b981' : '#ef4444';

    document.getElementById('monthlyEMI').textContent = formatCurrency(monthlyEMI);
    document.getElementById('loanAmount').textContent = formatCurrency(loanAmount);
    document.getElementById('totalInterest').textContent = formatCurrency(totalInterestPaid);
    document.getElementById('totalPrincipal').textContent = formatCurrency(totalPrincipalPaid);

    // Show results section
    document.getElementById('results').style.display = 'block';
    
    // Create chart
    createYearlyChart(chartData);
    
    // Smooth scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Variable to store chart instance
let yearlyChartInstance = null;

// Create yearly bar chart
function createYearlyChart(data) {
    const ctx = document.getElementById('yearlyChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (yearlyChartInstance) {
        yearlyChartInstance.destroy();
    }
    
    yearlyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.years.map(y => `Year ${y}`),
            datasets: [
                {
                    label: 'Cumulative Benefits',
                    data: data.cumulativeBenefits,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Loss Due to Opportunity Cost',
                    data: data.opportunityCosts,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    borderColor: 'rgba(0, 0, 0, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Total Return',
                    data: data.totalReturns,
                    backgroundColor: function(context) {
                        const value = context.parsed.y;
                        return value >= 0 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)';
                    },
                    borderColor: function(context) {
                        const value = context.parsed.y;
                        return value >= 0 ? 'rgba(16, 185, 129, 1)' : 'rgba(239, 68, 68, 1)';
                    },
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Yearly Home Ownership Progress',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += formatCurrency(context.parsed.y);
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Event listener for form submission
document.getElementById('calculatorForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateReturns();
});
