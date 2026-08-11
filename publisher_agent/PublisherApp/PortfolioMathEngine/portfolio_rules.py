from PublisherApp.models import Portfolio, PortfolioPosition
from django.utils import timezone
import uuid

class PortfolioRulesEngine:
    """
    Applies business constraints to mathematical results to generate the final portfolio targets.
    Matches Version_2 allocations: If STRONG -> Top 2 sectors (25% each), 50% Cash.
    """
    
    def __init__(self, regime, momentum_rankings):
        self.regime = regime
        self.momentum_rankings = momentum_rankings
        
    def build_and_save_portfolio(self):
        """
        Creates the portfolio in the database based on the regime and momentum.
        Returns the created Portfolio object.
        """
        cash_pct = 100.0
        positions_to_create = []
        
        # Decide Allocation
        if self.regime == "STRONG":
            # Pick top 2 sectors
            top_sectors = self.momentum_rankings[:2]
            
            # Allocation math: 25% to each of the top 2 sectors, rest in cash
            allocation_per_sector = 25.0
            
            for sector in top_sectors:
                positions_to_create.append({
                    'symbol': sector['symbol'],
                    'target_percentage': allocation_per_sector
                })
                cash_pct -= allocation_per_sector
                
            phase = "EARLY" # Hardcoding phase based on Version_2 demo for now
        else:
            # If FRAGILE, 100% Cash, 0 positions
            phase = "EXHAUST"
            
        from PublisherApp.models import StrategyRun
        # Create Strategy Run first
        strategy_run = StrategyRun.objects.create(
            run_date=timezone.now().date(),
            status='IN_PROGRESS'
        )
        
        # Create Portfolio Object in Database
        portfolio = Portfolio.objects.create(
            strategy_run=strategy_run,
            model_id="rotation-core",
            regime=self.regime,
            phase=phase,
            cash_percentage=cash_pct,
            effective_session=timezone.now().date(),
            sequence=Portfolio.objects.count() + 1
        )
        
        # Mark run as success
        strategy_run.status = 'SUCCESS'
        strategy_run.finished_at = timezone.now()
        strategy_run.save()
        
        # Create PortfolioPosition Objects
        for pos in positions_to_create:
            PortfolioPosition.objects.create(
                portfolio=portfolio,
                symbol=pos['symbol'],
                target_percentage=pos['target_percentage']
            )
            
        return portfolio
