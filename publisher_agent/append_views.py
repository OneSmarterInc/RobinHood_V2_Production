import os

views_path = r'e:\NEW_PROJECTS_ONESMARTER\Project1V\Version_3\publisher_agent\AccessApp\api\views.py'
with open(views_path, 'a') as f:
    f.write('''
from django.utils import timezone
from datetime import timedelta
import pandas_market_calendars as mcal
from PublisherApp.models import PublishedJson

class AdminPublishingHistoryAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsManagerOrSuperAdmin]

    def get(self, request, *args, **kwargs):
        history = []
        today = timezone.now().date()
        
        # Look back 30 days
        start_date = today - timedelta(days=30)
        end_date = today
        
        # Get market schedule to know valid trading days
        nyse = mcal.get_calendar("NYSE")
        # Extend slightly to be safe with timezone checks
        schedule = nyse.schedule(start_date=start_date - timedelta(days=5), end_date=end_date + timedelta(days=5))
        valid_trading_days = [dt.date() for dt in schedule.index]
        
        # Get all publications in the last 30 days
        published_records = PublishedJson.objects.filter(portfolio__effective_session__gte=start_date).select_related('portfolio')
        published_dict = {record.portfolio.effective_session: record for record in published_records}

        for i in range(31):
            current_date = today - timedelta(days=i)
            record = published_dict.get(current_date)
            
            if record:
                history.append({
                    "date": current_date.isoformat(),
                    "status": "PUBLISHED",
                    "reason": "Target generated successfully",
                    "sequence": record.portfolio.sequence,
                    "url": record.url
                })
            else:
                # No record exists for this date. Determine why.
                if current_date.weekday() >= 5:
                    history.append({
                        "date": current_date.isoformat(),
                        "status": "SKIPPED",
                        "reason": "Weekend",
                        "sequence": None,
                        "url": None
                    })
                elif current_date not in valid_trading_days:
                    history.append({
                        "date": current_date.isoformat(),
                        "status": "SKIPPED",
                        "reason": "Market Holiday (NYSE Closed)",
                        "sequence": None,
                        "url": None
                    })
                else:
                    # It was a valid trading day but no JSON was published
                    if current_date == today and timezone.now().hour < 9:
                        # Before market open
                        history.append({
                            "date": current_date.isoformat(),
                            "status": "PENDING",
                            "reason": "Awaiting generation window",
                            "sequence": None,
                            "url": None
                        })
                    else:
                        history.append({
                            "date": current_date.isoformat(),
                            "status": "ERROR",
                            "reason": "System Error / Missed Publication",
                            "sequence": None,
                            "url": None
                        })
                        
        return Response(history, status=status.HTTP_200_OK)
''')
