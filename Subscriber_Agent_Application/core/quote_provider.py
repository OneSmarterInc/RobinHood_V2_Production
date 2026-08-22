import urllib.error
import requests.exceptions

class QuoteUnavailableError(Exception):
    pass

def fetch_previous_close_quotes(symbols):
    """
    Fetches previous close price using yfinance (unofficial, for demonstration only).
    Will raise QuoteUnavailableError if any symbol cannot be priced.
    """
    import yfinance as yf
    quotes = {}
    for sym in symbols:
        try:
            ticker = yf.Ticker(sym)
            df = ticker.history(period="1d")
            if not df.empty:
                quotes[sym] = float(df['Close'].iloc[-1])
            else:
                raise QuoteUnavailableError(f"quote unavailable for {sym}")
        except (urllib.error.URLError, requests.exceptions.RequestException) as e:
            raise QuoteUnavailableError(f"quote unavailable for {sym} (network error)")
        # Do not catch all exceptions; let logic bugs surface.
    return quotes
