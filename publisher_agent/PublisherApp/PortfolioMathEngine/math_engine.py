import pandas as pd
from datetime import timedelta
from PublisherApp.models import MarketData
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

class MathEngine:
    """
    Core mathematical engine for technical analysis and momentum calculation.
    """
    
    def __init__(self):
        self.sector_symbols = ['XLK', 'XLE', 'XLV', 'XLF', 'XLI', 'XLB', 'XLY', 'XLP', 'XLU', 'XLRE', 'XLC']
        self.benchmark_symbol = 'SPY'
        
    def _get_dataframe(self, symbol, days=300):
        """Helper to fetch data from database into a Pandas DataFrame."""
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        data = MarketData.objects.filter(
            symbol=symbol,
            trading_date__gte=start_date
        ).order_by('trading_date')
        
        if not data.exists():
            return pd.DataFrame()
            
        df = pd.DataFrame(list(data.values('trading_date', 'close_price')))
        df.set_index('trading_date', inplace=True)
        return df

    def calculate_regime(self):
        """
        Determines the current market Regime.
        If SPY Close > 200-Day Moving Average, return "STRONG".
        Else, return "FRAGILE".
        """
        df = self._get_dataframe(self.benchmark_symbol, days=400) # Need enough calendar days to get 200 trading days
        
        if df.empty or len(df) < 200:
            logger.warning("Not enough data to calculate 200-DMA for SPY. Defaulting to FRAGILE.")
            return "FRAGILE"
            
        # Calculate 200-Day Simple Moving Average
        df['200_DMA'] = df['close_price'].rolling(window=200).mean()
        
        latest_close = df.iloc[-1]['close_price']
        latest_dma = df.iloc[-1]['200_DMA']
        
        if latest_close > latest_dma:
            return "STRONG"
        else:
            return "FRAGILE"

    def calculate_momentum_rankings(self):
        """
        Calculates the blended momentum (90-Day average) for all sectors.
        Returns a sorted list of dictionaries with sector symbols and their momentum scores.
        """
        results = []
        # Approximately 63 trading days in 3 months (90 calendar days)
        # Approximately 126 trading days in 6 months (180 calendar days)
        
        for symbol in self.sector_symbols:
            df = self._get_dataframe(symbol, days=250)
            
            if df.empty or len(df) < 126:
                continue
                
            latest_price = df.iloc[-1]['close_price']
            
            # 3-Month Momentum
            price_3m_ago = df.iloc[-63]['close_price']
            mom_3m = ((latest_price - price_3m_ago) / price_3m_ago) * 100
            
            # 6-Month Momentum
            price_6m_ago = df.iloc[-126]['close_price']
            mom_6m = ((latest_price - price_6m_ago) / price_6m_ago) * 100
            
            # Blended Score
            blended_score = (mom_3m + mom_6m) / 2
            
            results.append({
                'symbol': symbol,
                'momentum_score': round(blended_score, 2)
            })
            
        # Sort by momentum_score descending
        results = sorted(results, key=lambda x: x['momentum_score'], reverse=True)
        return results
