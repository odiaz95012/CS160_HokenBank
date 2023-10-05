from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import exc
from datetime import datetime
from functools import wraps
import jwt
from flask_bcrypt import Bcrypt
import pandas


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///CustomerInformation.sqlite3'
# app.config['SQLALCHEMY_DATABASE_URI'] =
# 'mysql+pymysql://root:password@mysql/bankingdb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
INTEREST_RATE = 1.05

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


class AccountInformation(db.Model):
    __tablename__ = 'AccountInformation'
    account_id = db.Column('account_id', db.Integer, primary_key=True,
                           autoincrement=True)
    customer_id = db.Column(db.Integer, db.ForeignKey(
        'CustomerInformation.customer_id'),
        nullable=False)
    account_type = db.Column(db.String(1), nullable=False)
    balance = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(1), nullable=False)
    transactions = db.relationship('TransactionHistory',
                                   backref='account', lazy=True)
    payments = db.relationship('AutomaticPayments', backref='account',
                               lazy=True)

    __table_args__ = (
        db.CheckConstraint("account_type IN ('C', 'S')",
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


class TransactionHistory(db.Model):
    __tablename__ = 'TransactionHistory'
    transaction_id = db.Column('transaction_id', db.Integer,
                               primary_key=True, autoincrement=True)
    account_id = db.Column(db.Integer, db.ForeignKey(
        'AccountInformation.account_id'),
        nullable=False)
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


def create_bank_manager():
    bank_manager = CustomerInformation(
        username='bank_manager',
        email='bank_manager@gmail.com',
        password='hokenadmin',
        full_name='Bank Manager',
        age=150,
        gender='O',
        zip_code=10000,
        status='A'
    )
    db.session.add(bank_manager)
    db.session.commit()


SECRET_KEY = "secret"


def is_authenticated(func):
    @wraps(func)
    def authenticate(*args, **kwargs):
        auth_header = request.headers.get('authorization')
        if not auth_header:
            return "Token Not Found", 401

        token = auth_header.split()[1]
        if not token:
            return "Token Not Found", 401
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        current_customer = data["customer_id"]
        customer = CustomerInformation.query.get(current_customer)
        if not customer:
            return "Invalid Customer", 401
        request.currentUser = current_customer
        return func(*args, **kwargs)
    return authenticate


def is_authorized(func):
    @wraps(func)
    def authorize(*args, **kwargs):
        return func(*args, **kwargs)
    return authorize


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return "Bad Request", 400

    username = data["username"]
    password = data["password"]

    if not (username or password):
        return "Bad Request", 400

    customer = CustomerInformation.query.filter_by(username=username).first()
    if customer is None:
        return (f'No account exists with the username {username}. \n Please '
                f'enter a valid username.'), 401
    
    if not bcrypt.check_password_hash(customer.password, password):
        return "Invalid Password", 401

    token = jwt.encode({"customer_id": customer.customer_id}, SECRET_KEY)

    return jsonify({"token": token}), 200


@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return "Bad Request", 400

    existing_customer = CustomerInformation.query.filter_by(
        username=data["username"]).first()
    if existing_customer:
        return (f"An account with the username {existing_customer.username} "
                f"already exists. \nPlease choose a different one."), 400

    # Hash password
    hashed_pw = bcrypt.generate_password_hash(data["password"]).decode('utf-8')
    customer = None
    # try:
    customer = CustomerInformation(
        username=data["username"],
        email=data["email"],
        password=hashed_pw,
        full_name=data["full_name"],
        age=data["age"],
        gender=data["gender"],
        zip_code=data["zip_code"],
        status=data["status"]
    )
    db.session.add(customer)
    db.session.commit()

    # except exc.IntegrityError:
    #     return "Invalid Input Format", 400

    return jsonify(customer.serialize()), 200


# Deactivate Customer Account
@app.route('/deactivateCustomer/<int:customer_id>', methods=['PATCH'])
@is_authenticated
def deactivate_customer(customer_id):
    customer = CustomerInformation.query.get(customer_id)
    if request.method == 'PATCH':
        if not customer:
            return f'Customer with customer_id {customer_id} not found', 404
        customer.status = 'I'
        # set all active accounts to 0 balance and 'I' status
        active_accounts = AccountInformation.query.filter(
            AccountInformation.customer_id == customer.customer_id and
            AccountInformation.status == 'A')
        for acc in active_accounts:
            close_account(acc.account_id)
        db.session.commit()
        return (f'Customer Account with customer_id {customer_id} '
                f'deactivated successfully')


# Retrieve customer info by customer_id
@app.route('/getCustomer/<int:customer_id>', methods=['GET'])
@is_authenticated
def get_customer_by_id(customer_id: int):
    if request.method == 'GET':
        customer = CustomerInformation.query.get(customer_id)
        if not customer:
            return jsonify({'error': f'Customer Account with customer_id '
                                     f'{customer_id} not found'}), 404
        # add additional check for 'I' status?
        return jsonify(customer.serialize())


@app.route('/openAccount', methods=['POST'])
@is_authenticated
def open_account():
    # Get the values from request parameters, query string, or any other source
    customer_id = int(request.args.get('customer_id'))
    account_type = request.args.get('account_type')

    # Create a customer object with the provided values
    account = AccountInformation(
        customer_id=customer_id,
        account_type=account_type,
        balance=float(0),
        status='A'
    )

    # Add the account to the database session and commit the changes
    db.session.add(account)
    db.session.commit()

    return 'Account opened successfully'


@app.route('/closeAccount/<int:account_id>', methods=['PATCH'])
@is_authenticated
def close_account(account_id):
    account = AccountInformation.query.get(account_id)
    if request.method == 'PATCH':
        if not account:
            return f'Account with account_id {account_id} not found', 404
        account.balance = float(0)
        account.status = 'I'
        db.session.commit()
        return (f'Bank Account with account_id {account_id} '
                f'closed successfully')


# Assuming you have a serialize method in your model
@app.route('/getAccount/<int:account_id>', methods=['GET'])
@is_authenticated
def get_account_by_id(account_id: int):
    if request.method == 'GET':
        account = AccountInformation.query.get(account_id)
        if not account:
            return jsonify({'error': f'Bank Account with account_id '
                                     f'{account_id} not found'}), 404
        # add additional check for 'I' status?
        return jsonify(account.serialize())


# Get all customers
@app.route('/getCustomers', methods=['GET'])
@is_authenticated
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


# Get all accounts
@app.route('/getAccounts', methods=['GET'])
@is_authenticated
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
@is_authenticated
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
        create_transaction_history_entry(account_id, 'Deposit', amount)
        return (f'${amount} successfully deposited to Bank Account '
                f'with account_id {account_id}')


@app.route('/withdraw/<int:account_id>/<int:amount>', methods=['PATCH'])
@is_authenticated
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
        create_transaction_history_entry(account_id, 'Withdraw', -amount)
        return (f'${amount} successfully withdrawn from Bank Account '
                f'with account_id {account_id}')


@app.route('/transfer/<int:from_account_id>/<int:to_account_id>/<int:amount'
           '>', methods=['PATCH'])
@is_authenticated
def transfer(from_account_id, to_account_id, amount):
    if amount <= 0:
        return f'Transfer amount must be positive', 404
    from_account = AccountInformation.query.get(from_account_id)
    to_account = AccountInformation.query.get(to_account_id)
    if request.method == 'PATCH':
        if not from_account:
            return (f'Sending Account with account_id {from_account_id} not '
                    f'found', 404)
        if not to_account:
            return (f'Receiving Account with account_id {to_account_id} not '
                    f'found', 404)
        if from_account.status == 'I':
            return (f'Sending Account with account_id {from_account_id} is '
                    f'inactive', 404)
        if to_account.status == 'I':
            return (f'Receiving Account with account_id {to_account_id} is '
                    f'inactive', 404)
        new_balance = from_account.balance - amount
        if new_balance < 0:
            return (f'Transfer from Bank Account with account_id '
                    f'{from_account_id} will put it into negative balance',
                    404)
        from_account.balance = new_balance
        to_account.balance += amount
        db.session.commit()
        create_transaction_history_entry(from_account_id, 'Transfer', -amount)
        create_transaction_history_entry(to_account_id, 'Transfer', amount)
        return (f'${amount} successfully transferred from Bank Account '
                f'with account_id {from_account_id} to Bank Account with '
                f'account_id {to_account_id}')


@app.route('/normalPayment/<int:account_id>/<int:amount>', methods=['PATCH'])
@is_authenticated
def normal_payment(account_id, amount):
    if amount <= 0:
        return f'Payment amount must be positive', 404
    account = AccountInformation.query.get(account_id)
    if request.method == 'PATCH':
        if not account:
            return f'Bank Account with account_id {account_id} not found', 404
        if account.status == 'I':
            return (f'Bank Account with account_id {account_id} is inactive',
                    404)
        new_balance = account.balance - amount
        if new_balance < 0:
            return (f'Bill payment will put Bank Account with account_id '
                    f'{account_id} into negative balance', 404)
        account.balance = new_balance
        db.session.commit()
        create_transaction_history_entry(account_id, 'Normal Payment', -amount)
        return (f'${amount} successfully paid by Bank Account with '
                f'account_id {account_id}')

# setting up automatic payment
@app.route('/automaticPayment/<int:account_id>/<int:amount>/<string:date>', methods=['PATCH'])
@is_authenticated
def automatic_payment(account_id, amount, date):
    # note: flask can't take datetime representation of date, so needs to be converted to datetime
    # pandas parses datetime from string in format YYYY-MM-DD
    dtime = pandas.to_datetime(date)
    if amount <= 0:
        return f'Payment amount must be positive', 404
    if dtime < datetime.now():
        return f'Date may not be in the past', 404
    account = AccountInformation.query.get(account_id)
    if request.method == 'PATCH':
        if not account:
            return f'Bank Account with account_id {account_id} not found', 404
        if account.status == 'I':
            return (f'Bank Account with account_id {account_id} is inactive',
                    404)
        
        create_automatic_payment_entry(account.customer_id, account_id, amount, dtime)
        return (f'Payment of ${amount} successfully scheduled for Bank Account with '
                f'account_id {account_id} and date {date}')

# executing automatic payment, job should auto-execute when server is running   
def automatic_payment_job(payment_id):
    # access payment
    automatic_payment = AutomaticPayments.query.get(payment_id)
    # access account
    account = AccountInformation.query.get(automatic_payment.account_id)

    new_balance = account.balance - automatic_payment.amount
    # placeholder before grace period implement
    if new_balance < 0:
        delete_automatic_payment_entry(payment_id)
        return (f'Scheduled payment with account_id '
                f'{automatic_payment.account_id} failed due to negative balance', 404)
    
    # set new balance and reset date for one month from original date, add transaction
    account.balance = new_balance
    automatic_payment.date = automatic_payment.date + pandas.DateOffset(months = 1)
    db.session.commit()
    create_transaction_history_entry(account.account_id, 'Automatic Payment', -automatic_payment.amount)

# schedule this job once a year (5% annual interest)
def interest_accumulation():
    db.session.query(AccountInformation).\
    filter(AccountInformation.status == "A", 
           AccountInformation.account_type == "S").\
    update({'balance': AccountInformation.balance * INTEREST_RATE})
    db.session.commit()

def create_transaction_history_entry(account_id, action, amount):
    transaction = TransactionHistory(
        account_id=account_id,
        action=action,
        amount=amount
    )
    db.session.add(transaction)
    db.session.commit()


def create_automatic_payment_entry(customer_id, account_id, amount, date):
    automatic_payment = AutomaticPayments(
        customer_id=customer_id,
        account_id=account_id,
        amount=amount,
        date=date
    )
    db.session.add(automatic_payment)
    db.session.commit()


def delete_automatic_payment_entry(payment_id):
    AutomaticPayments.query.filter(AutomaticPayments.payment_id ==
                                   payment_id).delete()
    db.session.commit()


@app.route('/')
def index():
    return 'Hello World'


def create_dummy_customers():
    customer_data = [
        {
            'username': 'user_1',
            'email': 'user_1@gmail.com',
            'password': '12345678',
            'full_name': 'User Name 1',
            'age': 22,
            'gender': 'F',
            'zip_code': 95142,
            'status': 'A'
        },
        {
            'username': 'user_2',
            'email': 'user_2@gmail.com',
            'password': '12345678',
            'full_name': 'User Name 2',
            'age': 22,
            'gender': 'M',
            'zip_code': 95149,
            'status': 'A'
        },
        {
            'username': 'user_3',
            'email': 'user_3@gmail.com',
            'password': '12345678',
            'full_name': 'User Name 3',
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


def create_dummy_accounts():
    account_data = [
        {
            'customer_id': 2,
            'account_type': 'C',
            'balance': 1111.11,
            'status': 'A'
        },
        {
            'customer_id': 3,
            'account_type': 'S',
            'balance': 2222.22,
            'status': 'A'
        },
        {
            'customer_id': 4,
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
        # create_bank_manager()
        # create_dummy_customers()
        # create_dummy_accounts()

    app.run(debug=True, port=8000, host='0.0.0.0')
