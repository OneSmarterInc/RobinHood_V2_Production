import pandas_market_calendars as mcal
from django.utils import timezone
from datetime import timedelta
import pytz

def get_effective_session(current_time=None):
    if current_time is None:
        current_time = timezone.now()
        
    eastern = pytz.timezone("US/Eastern")
    current_time_est = current_time.astimezone(eastern)
    
    nyse = mcal.get_calendar("NYSE")
    start_date = current_time_est - timedelta(days=5)
    end_date = current_time_est + timedelta(days=15)
    
    schedule = nyse.schedule(start_date=start_date, end_date=end_date)
    
    for dt in schedule.index:
        market_close = schedule.loc[dt, "market_close"]
        if current_time_est < market_close:
            return dt.date()
            
    return current_time_est.date()

def get_next_trading_day(current_session_date):
    nyse = mcal.get_calendar("NYSE")
    start_date = current_session_date
    end_date = current_session_date + timedelta(days=15)
    
    schedule = nyse.schedule(start_date=start_date, end_date=end_date)
    
    future_days = schedule[schedule.index > str(current_session_date)]
    if len(future_days) > 0:
        return future_days.index[0].date()
        
    return current_session_date + timedelta(days=1)
