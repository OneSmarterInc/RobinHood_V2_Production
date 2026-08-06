from django.db import models

class StrategyRun(models.Model):
    STATUS_CHOICES = [
        ('IN_PROGRESS', 'In Progress'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
    ]
    
    run_date = models.DateField(db_index=True)
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='IN_PROGRESS')
    error_message = models.TextField(null=True, blank=True)
    execution_time_ms = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"Run {self.id} on {self.run_date} ({self.status})"


class SystemConstraint(models.Model):
    TYPE_CHOICES = [
        ('FLOAT', 'Float'),
        ('INT', 'Integer'),
        ('STRING', 'String'),
        ('JSON', 'JSON'),
    ]
    
    key_name = models.CharField(max_length=100, unique=True)
    value_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    value = models.TextField()
    description = models.CharField(max_length=255, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.key_name} = {self.value}"


class MarketData(models.Model):
    symbol = models.CharField(max_length=20)
    trading_date = models.DateField()
    open_price = models.FloatField()
    high_price = models.FloatField()
    low_price = models.FloatField()
    close_price = models.FloatField()
    adjusted_close = models.FloatField()
    volume = models.BigIntegerField()
    source = models.CharField(max_length=50)
    fetched_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('symbol', 'trading_date')

    def __str__(self):
        return f"{self.symbol} on {self.trading_date}"


class TechnicalFeature(models.Model):
    symbol = models.CharField(max_length=20)
    trading_date = models.DateField()
    momentum = models.FloatField(null=True, blank=True)
    moving_average = models.FloatField(null=True, blank=True)
    relative_strength = models.FloatField(null=True, blank=True)
    volatility = models.FloatField(null=True, blank=True)
    breadth_score = models.FloatField(null=True, blank=True)
    sector_rank = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('symbol', 'trading_date')


class Portfolio(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PUBLISHED', 'Published'),
        ('FAILED', 'Failed'),
    ]

    strategy_run = models.ForeignKey(StrategyRun, on_delete=models.CASCADE, related_name='portfolios')
    sequence = models.IntegerField()
    effective_session = models.DateField()
    model_id = models.CharField(max_length=50, default='rotation-core')
    portfolio_id = models.CharField(max_length=50, default='core')
    sleeve_allocation_pct = models.FloatField(default=100.0)
    regime = models.CharField(max_length=50)
    phase = models.CharField(max_length=50)
    cash_percentage = models.FloatField()
    rationale = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('effective_session', 'sequence')

    def __str__(self):
        return f"Seq {self.sequence} ({self.effective_session})"


class PortfolioPosition(models.Model):
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name='positions')
    symbol = models.CharField(max_length=20)
    target_percentage = models.FloatField()

    class Meta:
        unique_together = ('portfolio', 'symbol')


class PublishedJson(models.Model):
    portfolio = models.OneToOneField(Portfolio, on_delete=models.CASCADE, related_name='published_json')
    json_path = models.CharField(max_length=255)
    canonicalization = models.CharField(max_length=100, default="json.dumps(sort_keys=True, separators=(',',':'))")
    signature_alg = models.CharField(max_length=50, default="Ed25519")
    sha256_hash = models.CharField(max_length=64)
    signature = models.TextField()
    key_id = models.CharField(max_length=50)
    published_at = models.DateTimeField(auto_now_add=True)
    url = models.URLField(max_length=500, null=True, blank=True)

    def __str__(self):
        return f"Published JSON for {self.portfolio}"


class PublishingLog(models.Model):
    STATUS_CHOICES = [
        ('SUCCESS', 'Success'),
        ('ERROR', 'Error'),
        ('INFO', 'Info'),
    ]

    strategy_run = models.ForeignKey(StrategyRun, on_delete=models.CASCADE, related_name='logs')
    portfolio = models.ForeignKey(Portfolio, on_delete=models.SET_NULL, null=True, blank=True, related_name='logs')
    step_name = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.status}] {self.step_name} at {self.created_at}"
