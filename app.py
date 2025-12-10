from flask import Flask, request, render_template_string, send_file, redirect, url_for
import io
import csv
import math
from datetime import datetime

app = Flask(__name__)

INDEX_HTML = """
<!doctype html>
<title>Home Ownership Returns Calculator</title>
<h2>Home Ownership Returns Calculator</h2>
<form method="post" action="/results">
  <label>Total cost of the house (USD): <input required name="price" type="number" step="0.01" value="600000"></label><br>
  <label>Down payment (USD): <input required name="down_payment" type="number" step="0.01" value="120000"></label><br>
  <label>Mortgage interest rate (annual %, e.g. 3.5): <input required name="mortgage_rate" type="number" step="0.01" value="3.5"></label><br>
  <label>Home price appreciation per year (%): <input required name="appreciation" type="number" step="0.01" value="3"></label><br>
  <label>Percentage return every year if invested in stocks (annual %, S&P): <input required name="stock_return" type="number" step="0.01" value="7"></label><br>
  <label>Initial monthly rent (USD): <input required name="initial_rent" type="number" step="0.01" value="2500"></label><br>
  <label>Rent increase per year (%): <input required name="rent_growth" type="number" step="0.01" value="3"></label><br>
  <label>Loan tenure (years): <input required name="loan_years" type="number" step="1" value="30"></label><br>
  <hr>
  <h3>Other assumptions (change if desired)</h3>
  <label>Property tax (annual % of home price): <input name="property_tax" type="number" step="0.01" value="1.1"></label><br>
  <label>Home insurance (annual % of home price): <input name="insurance" type="number" step="0.01" value="0.5"></label><br>
  <label>Maintenance (annual % of home price): <input name="maintenance" type="number" step="0.01" value="1.0"></label><br>
  <label>Buy closing cost (% of purchase price): <input name="buy_closing" type="number" step="0.01" value="2.0"></label><br>
  <label>Sell cost (broker+closing) (% of sale price): <input name="sell_cost" type="number" step="0.01" value="6.0"></label><br>
  <label>Federal long-term cap gains rate (default 15): <input name="cap_gains_fed" type="number" step="0.01" value="15.0"></label><br>
  <label>Net investment income tax (NIIT %) (default 3.8): <input name="niit" type="number" step="0.01" value="3.8"></label><br>
  <label>California capital gains / state income rate (%) (approx): <input name="state_rate" type="number" step="0.01" value="9.3"></label><br>
  <label>Combined marginal income tax rate (federal+state) for mortgage interest deduction (%): <input name="marginal_tax" type="number" step="0.01" value="41.3"></label><br>
  <hr>
  <button type="submit">Calculate</button>
</form>
<p>Notes:
<ul>
<li>Mortgage amortization is monthly; results are aggregated yearly.</li>
<li>Saved rent: when owning you avoid paying rent — that avoided rent is treated as a benefit (could be invested).</li>
<li>Capital gains tax is applied on sale gain (simple model: sale_price - purchase_price).</li>
<li>You can change tax assumptions above; defaults approximate a married filing jointly CA household with $400k income.</li>
</ul>
</p>
"""

RESULTS_HTML = """
<!doctype html>
<title>Results - Home Ownership Returns</title>
<h2>Results</h2>
<p>Inputs summary:
<ul>
  <li>Purchase price: ${{price:,.2f}}</li>
  <li>Down payment: ${{down:,.2f}}</li>
  <li>Loan years: {{loan_years}}</li>
  <li>Mortgage rate (annual): {{mort_rate}}%</li>
  <li>Annual home appreciation: {{appreciation}}%</li>
  <li>Stock return (annual): {{stock_return}}%</li>
  <li>Initial monthly rent: ${{initial_rent:,.2f}}, rent growth {{rent_growth}}%/yr</li>
  <li>Marginal tax used for interest deduction: {{marginal_tax}}%</li>
  <li>Capital gains tax total assumed: {{cap_gains_total}}%</li>
</ul>
</p>

<p><a href="{{ csv_url }}">Download CSV</a></p>

<table border="1" cellpadding="4" cellspacing="0">
  <thead>
    <tr>
      <th>Year</th>
      <th>Home Price</th>
      <th>Mortgage Balance</th>
      <th>Equity</th>
      <th>Interest Paid (yr)</th>
      <th>Principal Paid (yr)</th>
      <th>Annual Mortgage Payment</th>
      <th>Property Tax</th>
      <th>Insurance</th>
      <th>Maintenance</th>
      <th>Tax Savings (interest * marginal)</th>
      <th>Saved Rent (yr)</th>
      <th>Net Cashflow This Year (owning)</th>
      <th>If sold this year: Net Proceeds after sale & cap gains</th>
    </tr>
  </thead>
  <tbody>
  {% for r in rows %}
    <tr>
      <td>{{r.year}}</td>
      <td>${{r.home_price:,.2f}}</td>
      <td>${{r.mort_balance:,.2f}}</td>
      <td>${{r.equity:,.2f}}</td>
      <td>${{r.interest_paid:,.2f}}</td>
      <td>${{r.principal_paid:,.2f}}</td>
      <td>${{r.mortgage_payment:,.2f}}</td>
      <td>${{r.property_tax:,.2f}}</td>
      <td>${{r.insurance:,.2f}}</td>
      <td>${{r.maintenance:,.2f}}</td>
      <td>${{r.tax_savings:,.2f}}</td>
      <td>${{r.saved_rent:,.2f}}</td>
      <td>${{r.net_cashflow:,.2f}}</td>
      <td>${{r.net_proceeds:,.2f}}</td>
    </tr>
  {% endfor %}
  </tbody>
</table>

<p><a href="/">Start over / new inputs</a></p>
"""

# Calculation utilities

def monthly_payment(principal, annual_rate_pct, months):
    if months == 0:
        return 0.0
    r = annual_rate_pct / 100.0 / 12.0
    if r == 0:
        return principal / months
    payment = principal * r / (1 - (1 + r) ** (-months))
    return payment

def build_yearly_schedule(
    price,
    down_payment,
    mortgage_rate,
    appreciation,
    stock_return,
    initial_rent,
    rent_growth,
    loan_years,
    property_tax_pct,
    insurance_pct,
    maintenance_pct,
    buy_closing_pct,
    sell_cost_pct,
    cap_gains_fed,
    niit_pct,
    state_capital_pct,
    marginal_tax_pct
):
    months = loan_years * 12
    loan_amount = price - down_payment
    monthly_pay = monthly_payment(loan_amount, mortgage_rate, months)
    monthly_rate = mortgage_rate / 100.0 / 12.0

    # Build month-by-month amortization but aggregate per year
    balance = loan_amount
    rows = []
    current_rent = initial_rent * 12.0
    home_price = price

    # Precompute combined cap gains rate
    cap_gains_total = cap_gains_fed + niit_pct + state_capital_pct

    # Running trackers
    cumulative_saved_rent_investment = 0.0  # if saved rent were invested each year into stocks
    cumulative_down_paid_investment = down_payment  # if down payment were invested instead of buying
    # But we will not double-count; we present as separate metrics
    # For monthly amortization we simulate months per year
    month_index = 0
    for year in range(1, loan_years + 1):
        year_interest = 0.0
        year_principal = 0.0
        for m in range(12):
            if balance <= 0:
                break
            month_index += 1
            interest = balance * monthly_rate
            principal = monthly_pay - interest
            # Guard final payment if small negative due to rounding
            if principal > balance:
                principal = balance
                monthly = interest + principal
            else:
                monthly = monthly_pay
            balance -= principal
            year_interest += interest
            year_principal += principal
        # End months in this year

        # Home price at end of this year (apply appreciation)
        home_price = price * ((1 + appreciation / 100.0) ** year)

        # annual recurring costs
        property_tax = home_price * (property_tax_pct / 100.0)
        insurance = home_price * (insurance_pct / 100.0)
        maintenance = home_price * (maintenance_pct / 100.0)

        tax_savings = year_interest * (marginal_tax_pct / 100.0)
        saved_rent = current_rent
        # The idea: owning avoids paying rent (compared to renting) — that avoided rent is a benefit
        # The "net cashflow this year" counts payments for owning minus benefits like tax savings and saved rent.
        annual_mortgage_payment = (year_interest + year_principal)
        net_cashflow = annual_mortgage_payment + property_tax + insurance + maintenance - tax_savings - saved_rent

        # If sold at end of this year compute net proceeds:
        sale_price = home_price
        selling_costs = sale_price * (sell_cost_pct / 100.0)
        capital_gain = sale_price - price  # simple model, no basis adjustments
        capital_gain_tax = 0.0
        if capital_gain > 0:
            capital_gain_tax = capital_gain * (cap_gains_total / 100.0)
        net_proceeds = sale_price - selling_costs - balance - capital_gain_tax

        # Append row
        rows.append({
            "year": year,
            "home_price": home_price,
            "mort_balance": max(balance, 0.0),
            "equity": home_price - max(balance, 0.0),
            "interest_paid": year_interest,
            "principal_paid": year_principal,
            "mortgage_payment": annual_mortgage_payment,
            "property_tax": property_tax,
            "insurance": insurance,
            "maintenance": maintenance,
            "tax_savings": tax_savings,
            "saved_rent": saved_rent,
            "net_cashflow": net_cashflow,
            "net_proceeds": net_proceeds,
        })

        # update rent for next year
        current_rent *= (1 + rent_growth / 100.0)

    return rows, cap_gains_total

@app.route("/", methods=["GET"])
def index():
    return render_template_string(INDEX_HTML)

@app.route("/results", methods=["POST"])
def results():
    form = request.form
    # parse inputs
    price = float(form.get("price", 0))
    down = float(form.get("down_payment", 0))
    mort_rate = float(form.get("mortgage_rate", 0))
    appreciation = float(form.get("appreciation", 0))
    stock_return = float(form.get("stock_return", 0))
    initial_rent = float(form.get("initial_rent", 0))
    rent_growth = float(form.get("rent_growth", 3))
    loan_years = int(float(form.get("loan_years", 30)))

    property_tax = float(form.get("property_tax", 1.1))
    insurance = float(form.get("insurance", 0.5))
    maintenance = float(form.get("maintenance", 1.0))
    buy_closing = float(form.get("buy_closing", 2.0))
    sell_cost = float(form.get("sell_cost", 6.0))
    cap_gains_fed = float(form.get("cap_gains_fed", 15.0))
    niit = float(form.get("niit", 3.8))
    state_rate = float(form.get("state_rate", 9.3))
    marginal_tax = float(form.get("marginal_tax", 41.3))

    rows, cap_gains_total = build_yearly_schedule(
        price=price,
        down_payment=down,
        mortgage_rate=mort_rate,
        appreciation=appreciation,
        stock_return=stock_return,
        initial_rent=initial_rent,
        rent_growth=rent_growth,
        loan_years=loan_years,
        property_tax_pct=property_tax,
        insurance_pct=insurance,
        maintenance_pct=maintenance,
        buy_closing_pct=buy_closing,
        sell_cost_pct=sell_cost,
        cap_gains_fed=cap_gains_fed,
        niit_pct=niit,
        state_capital_pct=state_rate,
        marginal_tax_pct=marginal_tax
    )

    # Build link for CSV download: include form fields in query string so /download can regenerate
    query_params = "&".join(f"{k}={v}" for k, v in request.form.items())
    csv_url = url_for("download_csv") + "?" + query_params

    return render_template_string(RESULTS_HTML,
                                  price=price,
                                  down=down,
                                  loan_years=loan_years,
                                  mort_rate=mort_rate,
                                  appreciation=appreciation,
                                  stock_return=stock_return,
                                  initial_rent=initial_rent,
                                  rent_growth=rent_growth,
                                  marginal_tax=marginal_tax,
                                  cap_gains_total=cap_gains_total,
                                  rows=rows,
                                  csv_url=csv_url)

@app.route("/download.csv", methods=["GET"])
def download_csv():
    # Accept same params as form; regenerate rows and return CSV
    q = request.args
    try:
        price = float(q.get("price", 0))
        down = float(q.get("down_payment", 0))
        mort_rate = float(q.get("mortgage_rate", 0))
        appreciation = float(q.get("appreciation", 0))
        stock_return = float(q.get("stock_return", 0))
        initial_rent = float(q.get("initial_rent", 0))
        rent_growth = float(q.get("rent_growth", 3))
        loan_years = int(float(q.get("loan_years", 30)))
        property_tax = float(q.get("property_tax", 1.1))
        insurance = float(q.get("insurance", 0.5))
        maintenance = float(q.get("maintenance", 1.0))
        buy_closing = float(q.get("buy_closing", 2.0))
        sell_cost = float(q.get("sell_cost", 6.0))
        cap_gains_fed = float(q.get("cap_gains_fed", 15.0))
        niit = float(q.get("niit", 3.8))
        state_rate = float(q.get("state_rate", 9.3))
        marginal_tax = float(q.get("marginal_tax", 41.3))
    except Exception:
        return redirect(url_for("index"))

    rows, cap_gains_total = build_yearly_schedule(
        price=price,
        down_payment=down,
        mortgage_rate=mort_rate,
        appreciation=appreciation,
        stock_return=stock_return,
        initial_rent=initial_rent,
        rent_growth=rent_growth,
        loan_years=loan_years,
        property_tax_pct=property_tax,
        insurance_pct=insurance,
        maintenance_pct=maintenance,
        buy_closing_pct=buy_closing,
        sell_cost_pct=sell_cost,
        cap_gains_fed=cap_gains_fed,
        niit_pct=niit,
        state_capital_pct=state_rate,
        marginal_tax_pct=marginal_tax
    )

    # Create CSV in memory
    si = io.StringIO()
    cw = csv.writer(si)
    header = ["year", "home_price", "mort_balance", "equity", "interest_paid", "principal_paid",
              "mortgage_payment", "property_tax", "insurance", "maintenance", "tax_savings",
              "saved_rent", "net_cashflow", "net_proceeds"]
    cw.writerow(header)
    for r in rows:
        cw.writerow([
            r["year"],
            f"{r['home_price']:.2f}",
            f"{r['mort_balance']:.2f}",
            f"{r['equity']:.2f}",
            f"{r['interest_paid']:.2f}",
            f"{r['principal_paid']:.2f}",
            f"{r['mortgage_payment']:.2f}",
            f"{r['property_tax']:.2f}",
            f"{r['insurance']:.2f}",
            f"{r['maintenance']:.2f}",
            f"{r['tax_savings']:.2f}",
            f"{r['saved_rent']:.2f}",
            f"{r['net_cashflow']:.2f}",
            f"{r['net_proceeds']:.2f}"
        ])

    mem = io.BytesIO()
    mem.write(si.getvalue().encode("utf-8"))
    mem.seek(0)
    ts = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    return send_file(mem,
                     mimetype="text/csv",
                     as_attachment=True,
                     download_name=f"homeownership_{ts}.csv")


if __name__ == "__main__":
    app.run(debug=True, port=5000)
