from celery import shared_task
from django.core.management import call_command
import logging

logger = logging.getLogger(__name__)

# @shared_task
# def run_daily_data_fetch():
#     """
#     Celery task that runs the fully automated End-to-End Pipeline.
#     1. Fetches Market Data
#     2. Runs the Publisher Math Engine to generate new JSON target
#     """
#     logger.info("Starting daily market data fetch via Celery...")
#     try:
#         # Step 1: Get the fresh data
#         call_command('fetch_market_data')
#         logger.info("Successfully completed daily market data fetch.")
#         
#         # Step 2: Trigger the Math Engine and JSON Generation
#         logger.info("Triggering Publisher Math Engine...")
#         call_command('run_publisher')
#         logger.info("Successfully generated and published the latest JSON Target.")
#         
#     except Exception as e:
#         logger.error(f"Error fetching market data: {str(e)}")
#         raise e

from django.utils import timezone
from PublisherApp.models import PublishedJson

@shared_task
def run_daily_data_fetch():
    """
    NEW WATCHDOG TASK: Runs every 15 minutes between 6:00 AM and 9:00 AM.
    Checks if today's JSON is already generated to survive server crashes.
    """
    logger.info("Watchdog Triggered: Checking if today's Portfolio JSON exists...")
    
    # Check if a PublishedJson record exists for today
    today = timezone.now().date()
    is_already_published = PublishedJson.objects.filter(created_at__date=today).exists()
    
    if is_already_published:
        logger.info(f"Skipping: The portfolio JSON for {today} has already been published.")
        return
        
    logger.info(f"Missing: No JSON found for {today}. Starting End-to-End Pipeline now!")
    
    try:
        # Step 1: Get the fresh data
        call_command('fetch_market_data')
        logger.info("Successfully completed daily market data fetch.")
        
        # Step 2: Trigger the Math Engine and JSON Generation
        logger.info("Triggering Publisher Math Engine...")
        call_command('run_publisher')
        logger.info("Successfully generated and published the latest JSON Target.")
        
    except Exception as e:
        logger.error(f"Error fetching market data: {str(e)}")
        raise e
