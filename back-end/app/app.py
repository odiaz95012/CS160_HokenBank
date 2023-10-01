from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///CustomerInformation.sqlite3'
# app.config['SQLALCHEMY_DATABASE_URI'] =
# 'mysql+pymysql://root:password@mysql/bankingdb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)
db = SQLAlchemy(app)


class CustomerInformation(db.Model):
    customer_id = db.Column('customer_id', db.Integer, primary_key=True,
                            autoincrement=True)
    username = db.Column(db.String(18), unique=True, nullable=False)
    email = db.Column(db.String(45), unique=True, nullable=False)
    password = db.Column(db.String(18), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(1), nullable=False)
    zip_code = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(1), nullable=False)
    accounts = db.relationship('AccountInformation', backref='customer',
                               lazy=True)
    payments = db.relationship('AutomaticPayments', backref='customer',
                               lazy=True)

    __table_args__ = (
        SQLAlchemy.CheckConstraint(6 <= username.length <= 18,
                                   name='check_username_length'),
        SQLAlchemy.CheckConstraint(6 <= password.length <= 18,
                                   name='check_password_length'),
        SQLAlchemy.CheckConstraint(18 <= age <= 150, name='check_age'),
        SQLAlchemy.CheckConstraint(gender in ('M', 'F', 'O'),
                                   name='check_gender'),
        SQLAlchemy.CheckConstraint(10000 <= zip_code <= 99999,
                                   name='check_zip_code'),
        SQLAlchemy.CheckConstraint(status in ('A', 'I'),
                                   name='check_status'),
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


class AccountInformation(db.Model):
    account_id = db.Column('account_id', db.Integer, primary_key=True,
                           autoincrement=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.customer_id'),
                            nullable=False)
    account_type = db.Column(db.String(1), nullable=False)
    balance = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(1), nullable=False)
    transactions = db.relationship('TransactionHistory',
                                   backref='account', lazy=True)
    payments = db.relationship('AutomaticPayments', backref='account',
                               lazy=True)

    __table_args__ = (
        SQLAlchemy.CheckConstraint(account_type in ('C', 'S'),
                                   name='check_gender'),
        SQLAlchemy.CheckConstraint(balance >= 0,
                                   name='check_balance'),
        SQLAlchemy.CheckConstraint(status in ('A', 'I'),
                                   name='check_status'),
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


class TransactionHistory(db.Model):
    transaction_id = db.Column('transaction_id', db.Integer,
                               primary_key=True, autoincrement=True)
    account_id = db.Column(db.Integer, db.ForeignKey('account.account_id'),
                           nullable=False)
    action = db.Column(db.String(20), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    __table_args__ = (
        SQLAlchemy.CheckConstraint(action in ('Deposit', 'Withdraw',
                                              'Transfer', 'Normal Payment',
                                              'Automatic Payment'),
                                   name='check_action'),
        SQLAlchemy.CheckConstraint(amount >= 0,
                                   name='check_amount'),
        {})

    def __init__(self, account_id: int, action: str, amount: float,
                 date: datetime):
        self.account_id = account_id
        self.action = action
        self.amount = amount
        self.date = date


class AutomaticPayments(db.Model):
    payment_id = db.Column('payment_id', db.Integer, primary_key=True,
                           autoincrement=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.customer_id'),
                            nullable=False)
    account_id = db.Column(db.Integer, db.ForeignKey('account.account_id'),
                           nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    __table_args__ = (
        SQLAlchemy.CheckConstraint(amount >= 0,
                                   name='check_amount'),
        {})

    def __init__(self, customer_id: int, account_id: int, amount: float,
                 date: datetime):
        self.customer_id = customer_id
        self.account_id = account_id
        self.amount = amount
        self.date = date


@app.route('/createCustomer', methods=['POST'])
def create_customer():
    # Get the values from request parameters, query string, or any other source
    # customer_id = int(request.args.get('customer_id'))
    username = request.args.get('username')
    email = request.args.get('email')
    password = request.args.get('password')
    full_name = request.args.get('full_name')
    age = int(request.args.get('age'))
    gender = request.args.get('gender')
    zip_code = int(request.args.get('zip_code'))
    status = request.args.get('status')

    # Create a customer object with the provided values
    customer = CustomerInformation(
        username=username,
        email=email,
        password=password,
        full_name=full_name,
        age=age,
        gender=gender,
        zip_code=zip_code,
        status=status
    )

    # Add the customer to the database session and commit the changes
    db.session.add(customer)
    db.session.commit()

    return 'Customer created successfully'


# Deactivate Customer Account
@app.route('/deactivateCustomer/<int:customer_id>', methods=['PATCH'])
def deactivate_customer(customer_id):
    customer = CustomerInformation.query.get(customer_id)
    if request.method == 'PATCH':
        if not customer:
            return f'Customer with customer_id {customer_id} not found', 404
        customer.status = 'I'
        # set all accounts to 0 balance and 'I' status
        db.session.commit()
        return (f'Customer Account with customer_id {customer_id} '
                f'deactivated successfully')


# Assuming you have a serialize method in your model
@app.route('/getCustomer/<int:customer_id>', methods=['GET'])
def get_customer_by_id(customer_id: int):
    if request.method == 'GET':
        customer = CustomerInformation.query.get(customer_id)
        if not customer:
            return jsonify({'error': f'Customer Account with customer_id '
                                     f'{customer_id} not found'}), 404
        # add additional check for 'I' status?
        return jsonify(customer.serialize())


@app.route('/openAccount', methods=['POST'])
def open_account():
    # Get the values from request parameters, query string, or any other source
    # account_id = int(request.args.get('account_id'))
    customer_id = int(request.args.get('customer_id'))
    account_type = request.args.get('account_type')
    balance = float(request.args.get('balance'))
    status = request.args.get('status')

    # Create a customer object with the provided values
    account = AccountInformation(
        customer_id=customer_id,
        account_type=account_type,
        balance=balance,
        status=status
    )

    # Add the account to the database session and commit the changes
    db.session.add(account)
    db.session.commit()

    return 'Account opened successfully'


@app.route('/closeAccount/<int:account_id>', methods=['PATCH'])
def close_account(account_id):
    account = AccountInformation.query.get(account_id)
    if request.method == 'PATCH':
        if not account:
            return f'Account with account_id {account_id} not found', 404
        account.balance = 0
        account.status = 'I'
        db.session.commit()
        return (f'Bank Account with account_id {account_id} '
                f'closed successfully')


# Assuming you have a serialize method in your model
@app.route('/getAccount/<int:account_id>', methods=['GET'])
def get_account_by_id(account_id: int):
    if request.method == 'GET':
        account = AccountInformation.query.get(account_id)
        if not account:
            return jsonify({'error': f'Bank Account with account_id '
                                     f'{account_id} not found'}), 404
        # add additional check for 'I' status?
        return jsonify(account.serialize())


@app.route('/getCustomers', methods=['GET'])
# Get all customers
def get_customers():
    customers = CustomerInformation.query.all()
    customer_list = []

    for customer in customers:
        customer_data = {
            'customer_id': customer.customer_id,
            'username': customer.username,
            'email': customer.email,
            'password': customer.password,
            'full_name': customer.full_name,
            'age': customer.age,
            'gender': customer.gender,
            'zip_code': customer.zip_code,
            'status': customer.status
        }
        customer_list.append(customer_data)

    return jsonify(customer_list)


@app.route('/getAccounts', methods=['GET'])
# Get all accounts
def get_accounts():
    accounts = AccountInformation.query.all()
    account_list = []

    for account in accounts:
        account_data = {
            'account_id': account.account_id,
            'customer_id': account.customer_id,
            'account_type': account.account_type,
            'balance': account.balance,
            'status': account.status
        }
        account_list.append(account_data)

    return jsonify(account_list)


@app.route('/deposit/<int:account_id>/<int:amount>', methods=['PATCH'])
def deposit(account_id, amount):
    if amount <= 0:
        return f'Deposit amount must be positive', 404
    account = AccountInformation.query.get(account_id)
    if request.method == 'PATCH':
        if not account:
            return f'Bank Account with account_id {account_id} not found', 404
        if account.status == 'I':
            return (f'Bank Account with account_id {account_id} is inactive',
                    404)
        account.balance += amount
        db.session.commit()
        return (f'${amount} successfully deposited to Bank Account '
                f'with account_id {account_id}')


@app.route('/withdraw/<int:account_id>/<int:amount>', methods=['PATCH'])
def withdraw(account_id, amount):
    if amount <= 0:
        return f'Withdraw amount must be positive', 404
    account = AccountInformation.query.get(account_id)
    if request.method == 'PATCH':
        if not account:
            return f'Bank Account with account_id {account_id} not found', 404
        if account.status == 'I':
            return (f'Bank Account with account_id {account_id} is inactive',
                    404)
        new_balance = account.balance - amount
        if new_balance < 0:
            return (f'Withdrawal will put Bank Account with account_id '
                    f'{account_id} into negative balance', 404)
        account.balance = new_balance
        db.session.commit()
        return (f'${amount} successfully withdrawn from Bank Account '
                f'with account_id {account_id}')


@app.route('/transfer/<int:from_account_id>/<int:to_account_id>/<int:amount'
           '>', methods=['PATCH'])
def transfer(from_account_id, to_account_id, amount):
    return


@app.route('/')
def index():
    return 'Hello World'


def create_dummy_customers(db):
    customer_data = [
        {
            'username': 'user_1',
            'email': 'user_1@gmail.com',
            'full_name': 'User Name 1',
            'password': '12345678',
            'age': 22,
            'gender': 'F',
            'zip_code': 95142,
            'status': 'A'
        },
        {
            'username': 'user_2',
            'email': 'user_2@gmail.com',
            'full_name': 'User Name 2',
            'password': '12345678',
            'age': 22,
            'gender': 'M',
            'zip_code': 95149,
            'status': 'A'
        },
        {
            'username': 'user_3',
            'email': 'user_3@gmail.com',
            'full_name': 'User Name 3',
            'password': '12345678',
            'age': 24,
            'gender': 'F',
            'zip_code': 95122,
            'status': 'I'
        }
    ]
    for cus in customer_data:
        customer = CustomerInformation(
            username=cus['username'],
            email=cus['email'],
            password=cus['password'],
            full_name=cus['full_name'],
            age=cus['age'],
            gender=cus['gender'],
            zip_code=cus['zip_code'],
            status=cus['status']
        )
        db.session.add(customer)

    db.session.commit()


def create_dummy_accounts(db):
    account_data = [
        {
            'customer_id': 1,
            'account_type': 'C',
            'balance': 1111.11,
            'status': 'A'
        },
        {
            'customer_id': 2,
            'account_type': 'S',
            'balance': 2222.22,
            'status': 'A'
        },
        {
            'customer_id': 3,
            'account_type': 'C',
            'balance': 0,
            'status': 'I'
        }
    ]
    for acc in account_data:
        account = AccountInformation(
            customer_id=acc['customer_id'],
            account_type=acc['account_type'],
            balance=acc['balance'],
            status=acc['status']
        )
        db.session.add(account)

    db.session.commit()


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        create_dummy_customers(db)
        create_dummy_accounts(db)
    
    app.run(debug=True, port=8000, host='0.0.0.0')
