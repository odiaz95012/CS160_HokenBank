from datetime import datetime
from . import db
from .account import AccountInformation
from sqlalchemy.ext.hybrid import hybrid_property


class TransactionHistory(db.Model):
    __tablename__ = 'TransactionHistory'
    transaction_id = db.Column('transaction_id', db.Integer,
                               primary_key=True, autoincrement=True)
    account_id = db.Column(db.Integer, db.ForeignKey(
        'AccountInformation.account_id'), nullable=False)
    action = db.Column(db.String(20), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    __table_args__ = (
        db.CheckConstraint("action IN ('Deposit', 'Withdraw','Transfer', "
                           "'Normal Payment',  'Automatic Payment')",
                           name='check_action'),
        {})

    def __init__(self, account_id: int, action: str, amount: float):
        self.account_id = account_id
        self.action = action
        self.amount = amount

    @hybrid_property
    def customer_id(self) -> int:
        account = AccountInformation.query.get(self.account_id)
        return account.customer_id
