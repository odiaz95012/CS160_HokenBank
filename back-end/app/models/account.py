from . import db


class AccountInformation(db.Model):
    __tablename__ = 'AccountInformation'
    account_id = db.Column('account_id', db.Integer, primary_key=True,
                           autoincrement=True)
    customer_id = db.Column(db.Integer, db.ForeignKey(
        'CustomerInformation.customer_id'),
        nullable=False)
    account_type = db.Column(db.String(20), nullable=False)
    balance = db.Column(db.Numeric(scale = 2), nullable=False)
    status = db.Column(db.String(1), nullable=False)
    transactions = db.relationship('TransactionHistory',
                                   backref='account', lazy=True)
    payments = db.relationship('AutomaticPayments', backref='account',
                               lazy=True)

    __table_args__ = (
        db.CheckConstraint("account_type IN ('Checking', 'Savings')",
                           name='check_account_type'),
        db.CheckConstraint("balance >= 0", name='check_balance'),
        db.CheckConstraint("status IN ('A', 'I')", name='check_status'),
        {})

    def __init__(self, customer_id: int, account_type: str, balance: float,
                 status: str):
        self.customer_id = customer_id
        self.account_type = account_type
        self.balance = balance
        self.status = status

    def serialize(self):
        return {
            'account_id': self.account_id,
            'customer_id': self.customer_id,
            'account_type': self.account_type,
            'balance': self.balance,
            'status': self.status
        }
