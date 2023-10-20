from datetime import datetime
from . import db


class AutomaticPayments(db.Model):
    __tablename__ = 'AutomaticPayments'
    payment_id = db.Column('payment_id', db.Integer, primary_key=True,
                           autoincrement=True)
    customer_id = db.Column(db.Integer, db.ForeignKey(
        'CustomerInformation.customer_id'),
        nullable=False)
    account_id = db.Column(db.Integer, db.ForeignKey(
        'AccountInformation.account_id'),
        nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    __table_args__ = (
        db.CheckConstraint("amount >= 0", name='check_amount'),
        {})

    def __init__(self, customer_id: int, account_id: int, amount: float,
                 date: datetime):
        self.customer_id = customer_id
        self.account_id = account_id
        self.amount = amount
        self.date = date

    def serialize(self):
        return {
            'payment_id': self.payment_id,
            'customer_id': self.customer_id,
            'account_id': self.account_id,
            'amount': self.amount,
            'date': self.date
        }
