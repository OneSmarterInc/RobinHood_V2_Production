from django.core.management.base import BaseCommand
from PublisherApp.PortfolioMathEngine.json_publisher import JSONPublisher
import logging

class Command(BaseCommand):
    help = 'Executes the full Portfolio Math Engine and generates a new Signed JSON target.'

    def handle(self, *args, **options):
        self.stdout.write("Starting the Publisher Agent Brain...")
        
        try:
            publisher = JSONPublisher()
            final_json = publisher.run_publisher_cycle()
            
            self.stdout.write(self.style.SUCCESS("\n[SUCCESS] New JSON Target Generated!"))
            self.stdout.write("-" * 50)
            self.stdout.write(final_json)
            self.stdout.write("-" * 50)
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Critical Error running Publisher: {str(e)}"))
