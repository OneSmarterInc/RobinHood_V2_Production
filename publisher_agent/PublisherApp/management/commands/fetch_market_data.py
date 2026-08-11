import yfinance as yf
import pandas as pd
from django.core.management.base import BaseCommand
from PublisherApp.models import MarketData
from django.utils import timezone

class Command(BaseCommand):
    help = 'Fetches daily market data for predefined Sector ETFs and SPY using Yahoo Finance.'

    def handle(self, *args, **options):
        self.stdout.write("Starting Market Data Fetcher...")

        # These are the standard SPDR Sector ETFs used in institutional rotation strategies
        
        symbols = [
            'XLK', 'XLE', 'XLV', 'XLF', 'XLI', 
            'XLB', 'XLY', 'XLP', 'XLU', 'XLRE', 'XLC', 'SPY'
        ]

        # Fetch 2 years of data to ensure we can calculate 200-day moving averages later
        period = "2y"
        
        records_added = 0
        records_updated = 0

        for symbol in symbols:
            self.stdout.write(f"Fetching data for {symbol}...")
            
            try:
                # Download data
                ticker = yf.Ticker(symbol)
                df = ticker.history(period=period)
                
                if df.empty:
                    self.stdout.write(self.style.WARNING(f"No data found for {symbol}."))
                    continue
                
                # Iterate through rows and save to DB
                for date, row in df.iterrows():
                    # Yahoo finance returns timezone-aware timestamps. Convert to simple date.
                    trading_date = date.date()
                    
                    # Create or update the record in the database
                    obj, created = MarketData.objects.update_or_create(
                        symbol=symbol,
                        trading_date=trading_date,
                        defaults={
                            'open_price': float(row['Open']),
                            'high_price': float(row['High']),
                            'low_price': float(row['Low']),
                            'close_price': float(row['Close']),
                            'adjusted_close': float(row['Close']), # yfinance 'Close' is already adjusted for splits
                            'volume': int(row['Volume']),
                            'source': 'yfinance',
                        }
                    )
                    
                    if created:
                        records_added += 1
                    else:
                        records_updated += 1
                        
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error fetching {symbol}: {str(e)}"))

        self.stdout.write(self.style.SUCCESS(
            f"Successfully finished data fetch. Added {records_added} new daily records. Updated {records_updated} records."
        ))
