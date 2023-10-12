from . import db
from .account import AccountInformation
from sqlalchemy.ext.hybrid import hybrid_property


class CustomerInformation(db.Model):
    __tablename__ = 'CustomerInformation'
    customer_id = db.Column('customer_id', db.Integer, primary_key=True,
                            autoincrement=True)
    username = db.Column(db.String(18), unique=True, nullable=False)
    email = db.Column(db.String(45), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(1), nullable=False)
    zip_code = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(1), nullable=False)
    accounts = db.relationship('AccountInformation', backref='customer',
                               lazy=True)
    transactions = db.relationship('TransactionHistory', backref='customer',
                                   lazy=True)
    payments = db.relationship('AutomaticPayments', backref='customer',
                               lazy=True)

    __table_args__ = (
        db.CheckConstraint("LENGTH(username) BETWEEN 6 and 18",
                           name='check_username_length'),
        db.CheckConstraint("LENGTH(password) BETWEEN 6 and 100",
                           name='check_password_length'),
        db.CheckConstraint("18 <= age <= 150", name='check_age'),
        db.CheckConstraint("gender IN ('M', 'F', 'O')", name='check_gender'),
        db.CheckConstraint("10000 <= zip_code <= 99999",
                           name='check_zip_code'),
        db.CheckConstraint("status IN ('A', 'I')", name='check_status'),
        {})

    def __init__(self, username: str, email: str, password: str,
                 full_name: str, age: int, gender: str, zip_code: int,
                 status: str):
        self.username = username
        self.email = email
        self.password = password
        self.full_name = full_name
        self.age = age
        self.gender = gender
        self.zip_code = zip_code
        self.status = status

    def serialize(self):
        return {
            'customer_id': self.customer_id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'age': self.age,
            'gender': self.gender,
            'zip_code': self.zip_code,
            'status': self.status
        }

    @hybrid_property
    def total_balance(self) -> float:
        total_balance = float(0)
        active_accounts = AccountInformation.query.filter(
            AccountInformation.customer_id == self.customer_id,
            AccountInformation.status == 'A').all()
        for acc in active_accounts:
            total_balance += acc.balance
        return total_balance
