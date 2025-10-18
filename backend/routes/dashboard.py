from fastapi import APIRouter, Query
from models.dashboard import DashboardStats, DailyTotal
from models.order import Order
from utils.db import db
from typing import List, Optional
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    date_range: Optional[str] = Query('week', description="Date range: today, week, month")
):
    # Set date range
    now = datetime.utcnow()
    if date_range == 'today':
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        days = 1
    elif date_range == 'month':
        start_date = (now.replace(day=1, hour=0, minute=0, second=0, microsecond=0))
        days = (now - start_date).days + 1
    else:  # default to week
        start_date = now - timedelta(days=6)
        start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        days = 7

    # Fetch orders in range
    orders_cursor = db.orders.find({
        "timestamp": {"$gte": start_date.isoformat(), "$lte": now.isoformat()}
    })
    orders = await orders_cursor.to_list(1000)

    # Aggregate stats
    revenue_by_day = [0.0 for _ in range(days)]
    daily_totals = []
    total_revenue = 0.0
    total_orders = 0
    total_order_value = 0.0
    refunds_by_day = [0.0 for _ in range(days)]
    order_counts_by_day = [0 for _ in range(days)]

    for order in orders:
        # Parse order date
        order_date = datetime.fromisoformat(order.get("timestamp", now.isoformat())[:10])
        day_index = (order_date.date() - start_date.date()).days
        if 0 <= day_index < days:
            gross = sum(item.get("price", 0) * item.get("qty", 1) for item in order.get("items", []))
            refund = float(order.get("refund", 0)) if "refund" in order else 0.0
            revenue_by_day[day_index] += gross
            refunds_by_day[day_index] += refund
            order_counts_by_day[day_index] += 1
            total_revenue += gross
            total_orders += 1
            total_order_value += gross

    for i in range(days):
        date_str = (start_date + timedelta(days=i)).strftime('%b %d, %Y')
        daily_totals.append(DailyTotal(
            date=date_str,
            orders=order_counts_by_day[i],
            gross=revenue_by_day[i],
            refunds=refunds_by_day[i],
            net=revenue_by_day[i] - refunds_by_day[i]
        ))

    todaysRevenue = revenue_by_day[-1] if revenue_by_day else 0.0
    ordersToday = order_counts_by_day[-1] if order_counts_by_day else 0
    avgOrderValue = (total_order_value / total_orders) if total_orders > 0 else 0.0

    # Dummy growth calculations (replace with real logic as needed)
    revenueGrowth = 0.0
    ordersGrowth = 0.0
    avgOrderGrowth = 0.0

    return DashboardStats(
        todaysRevenue=todaysRevenue,
        ordersToday=ordersToday,
        avgOrderValue=avgOrderValue,
        revenueGrowth=revenueGrowth,
        ordersGrowth=ordersGrowth,
        avgOrderGrowth=avgOrderGrowth,
        revenueByDay=revenue_by_day,
        dailyTotals=daily_totals
    )
