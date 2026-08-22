from abc import ABC, abstractmethod

class LiveTradingRefused(Exception):
    pass

class BaseBroker(ABC):
    """
    Abstract base class for all broker implementations.
    """
    
    def __init__(self, label, live=False, **credentials):
        self.label = label
        self.live = live
        self.credentials = credentials
        
    @abstractmethod
    def snapshot(self, quotes=None):
        pass
        
    @abstractmethod
    def equity(self, quotes=None):
        pass
        
    @abstractmethod
    def submit(self, orders, quotes, session):
        pass
