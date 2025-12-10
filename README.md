# Homeownership Returns Calculator (Flask App)

This tool calculates annual home ownership returns (including home price appreciation, tax benefits, cost breakdown, and rental savings) versus renting. CSV export is included.

## Features
- Year-by-year table showing home ownership economics versus renting
- Inputs for purchase price, down payment, mortgage rate, appreciation, S&P stock return, initial rent, and more
- Includes US/CA tax assumptions, property tax, insurance, maintenance, selling/buy closing costs
- Built in Flask (single file app.py)

## Usage
1. Install Flask: `pip install -r requirements.txt`
2. Run the app: `python app.py`
3. Visit: [http://127.0.0.1:5000/](http://127.0.0.1:5000/) in your browser
4. Enter scenario inputs and get per-year results

## Files
- `app.py` - main application
- `requirements.txt` - required python package(s)
- `.gitignore` - standard Python ignores
- `LICENSE` - MIT License

## Example usage
```
python app.py
```
Navigate in browser, enter house scenario parameters, analyze output table, download CSV.

## License
MIT
