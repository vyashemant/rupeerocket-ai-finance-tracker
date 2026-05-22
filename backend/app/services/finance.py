from datetime import date
from decimal import Decimal

from sqlalchemy import func

from app.extensions import db
from app.models import Category, Transaction


DEFAULT_CATEGORIES = [
    ("Food", "#f59e0b"),
    ("Travel", "#14b8a6"),
    ("Shopping", "#f97316"),
    ("Bills", "#6366f1"),
    ("Entertainment", "#ec4899"),
    ("Health", "#22c55e"),
    ("Education", "#0ea5e9"),
    ("Salary", "#16a34a"),
    ("Investments", "#8b5cf6"),
    ("Other", "#64748b"),
]


def ensure_default_categories(user_id):
    existing_names = {category.name for category in Category.query.filter_by(user_id=user_id).all()}
    added = False
    for name, color in DEFAULT_CATEGORIES:
        if name not in existing_names:
            db.session.add(Category(user_id=user_id, name=name, color=color))
            added = True
    if added:
        db.session.commit()


def get_default_category_names():
    return [name for name, _color in DEFAULT_CATEGORIES]


def monthly_bounds(target_date=None):
    current = target_date or date.today()
    start = current.replace(day=1)
    if start.month == 12:
        end = start.replace(year=start.year + 1, month=1)
    else:
        end = start.replace(month=start.month + 1)
    return start, end


def month_key_for(value):
    return value.strftime("%Y-%m")


def get_dashboard_summary(user_id):
    total_income = db.session.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == "income",
    ).scalar() or Decimal("0")

    total_expenses = db.session.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == "expense",
    ).scalar() or Decimal("0")

    balance = total_income - total_expenses
    start, end = monthly_bounds()

    monthly_income = db.session.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == "income",
        Transaction.date >= start,
        Transaction.date < end,
    ).scalar() or Decimal("0")

    monthly_expenses = db.session.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == "expense",
        Transaction.date >= start,
        Transaction.date < end,
    ).scalar() or Decimal("0")

    recent_transactions = (
        Transaction.query.filter_by(user_id=user_id)
        .order_by(Transaction.date.desc(), Transaction.created_at.desc())
        .limit(5)
        .all()
    )

    breakdown = (
        db.session.query(Category.name, func.coalesce(func.sum(Transaction.amount), 0))
        .join(Transaction, Transaction.category_id == Category.id)
        .filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == "expense",
            Transaction.date >= start,
            Transaction.date < end,
        )
        .group_by(Category.name)
        .order_by(func.sum(Transaction.amount).desc())
        .all()
    )

    return {
        "total_balance": float(balance),
        "monthly_income": float(monthly_income),
        "monthly_expenses": float(monthly_expenses),
        "savings_rate": float((monthly_income - monthly_expenses) / monthly_income * 100) if monthly_income else 0,
        "recent_transactions": [item.to_dict() for item in recent_transactions],
        "expense_breakdown": [
            {"name": name, "amount": float(amount)} for name, amount in breakdown
        ],
    }


def get_monthly_analytics(user_id, year, month):
    start = date(year, month, 1)
    end = monthly_bounds(start)[1]

    income = db.session.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == "income",
        Transaction.date >= start,
        Transaction.date < end,
    ).scalar() or Decimal("0")

    expenses = db.session.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == "expense",
        Transaction.date >= start,
        Transaction.date < end,
    ).scalar() or Decimal("0")

    daily_rows = (
        db.session.query(Transaction.date, func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == "expense",
            Transaction.date >= start,
            Transaction.date < end,
        )
        .group_by(Transaction.date)
        .order_by(Transaction.date.asc())
        .all()
    )

    breakdown_rows = (
        db.session.query(Category.name, func.coalesce(func.sum(Transaction.amount), 0))
        .join(Transaction, Transaction.category_id == Category.id)
        .filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == "expense",
            Transaction.date >= start,
            Transaction.date < end,
        )
        .group_by(Category.name)
        .order_by(func.sum(Transaction.amount).desc())
        .all()
    )

    return {
        "month": month_key_for(start),
        "income": float(income),
        "expenses": float(expenses),
        "net": float(income - expenses),
        "daily_expenses": [
            {"date": day.isoformat(), "amount": float(amount)} for day, amount in daily_rows
        ],
        "expense_breakdown": [
            {"name": name, "amount": float(amount)} for name, amount in breakdown_rows
        ],
    }


def get_spending_trend(user_id, months=6):
    today = date.today().replace(day=1)
    series = []
    for offset in range(months - 1, -1, -1):
        month_year = today.year
        month_value = today.month - offset
        while month_value <= 0:
            month_value += 12
            month_year -= 1
        start = date(month_year, month_value, 1)
        end = monthly_bounds(start)[1]
        income = db.session.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == "income",
            Transaction.date >= start,
            Transaction.date < end,
        ).scalar() or Decimal("0")
        expenses = db.session.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == "expense",
            Transaction.date >= start,
            Transaction.date < end,
        ).scalar() or Decimal("0")
        series.append(
            {
                "month": month_key_for(start),
                "income": float(income),
                "expenses": float(expenses),
                "net": float(income - expenses),
            }
        )
    return series


def get_summary_insights(user_id):
    summary = get_dashboard_summary(user_id)
    expense_ratio = 0
    if summary["monthly_income"]:
        expense_ratio = summary["monthly_expenses"] / summary["monthly_income"] * 100

    insights = []
    if expense_ratio > 80:
        insights.append("Your monthly expenses are consuming most of your income. Review discretionary spending.")
    elif expense_ratio > 60:
        insights.append("Spending is healthy, but there is room to improve savings consistency.")
    else:
        insights.append("Strong cash flow this month. Consider automating transfers to savings or investments.")

    if summary["expense_breakdown"]:
        top = summary["expense_breakdown"][0]
        insights.append(f"{top['name']} is your largest expense category this month.")

    if not summary["recent_transactions"]:
        insights.append("Add your first transaction to unlock personalized finance insights.")

    return insights