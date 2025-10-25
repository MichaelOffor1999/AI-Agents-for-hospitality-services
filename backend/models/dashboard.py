from pydantic import BaseModel
from typing import List

class DailyTotal(BaseModel):
    date: str
    orders: int
    gross: float
    refunds: float
    net: float

class DashboardStats(BaseModel):
    user_id: str  # ID of the account (owner/staff) that owns this dashboard
    restaurant_id: str  # ID of the restaurant for which these stats apply
    todaysRevenue: float
    ordersToday: int
    avgOrderValue: float
    revenueGrowth: float
    ordersGrowth: float
    avgOrderGrowth: float
    revenueByDay: List[float]
    dailyTotals: List[DailyTotal]
