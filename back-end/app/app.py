from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import exc
from datetime import datetime
from functools import wraps
import jwt
from flask_bcrypt import Bcrypt


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///CustomerInformation.sqlite3'
# app.config['SQLALCHEMY_DATABASE_URI'] =
# 'mysql+pymysql://root:password@mysql/bankingdb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)


class CustomerInformation(db.Model):
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

    # __table_args__ = (
    #     SQLAlchemy.CheckConstraint(6 <= username.length <= 18,
    #                                name='check_username_length'),
    #     SQLAlchemy.CheckConstraint(6 <= password.length <= 18,
    #                                name='check_password_length'),
    #     SQLAlchemy.CheckConstraint(18 <= age <= 150, name='check_age'),
    #     SQLAlchemy.CheckConstraint(gender in ('M', 'F', 'O'),
    #                                name='check_gender'),
    #     SQLAlchemy.CheckConstraint(10000 <= zip_code <= 99999,
    #                                name='check_zip_code'),
    #     SQLAlchemy.CheckConstraint(status in ('A', 'I'),
    #                                name='check_status'),
    #     {})

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
    customer_id = db.Column(db.Integer, db.ForeignKey('customer_information.customer_id'),
                            nullable=False)
    account_type = db.Column(db.String(1), nullable=False)
    balance = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(1), nullable=False)
    transactions = db.relationship('TransactionHistory',
                                   backref='account', lazy=True)
    payments = db.relationship('AutomaticPayments', backref='account',
                               lazy=True)

    # __table_args__ = (
    #     SQLAlchemy.CheckConstraint(account_type in ('C', 'S'),
    #                                name='check_gender'),
    #     SQLAlchemy.CheckConstraint(balance >= 0,
    #                                name='check_balance'),
    #     SQLAlchemy.CheckConstraint(status in ('A', 'I'),
    #                                name='check_status'),
    #     {})

    def __init__(self, account_type: str, balance: float, status: str):
        self.account_type = account_type
        self.balance = balance
        self.status = status


class TransactionHistory(db.Model):
    transaction_id = db.Column('transaction_id', db.Integer,
                               primary_key=True, autoincrement=True)
    account_id = db.Column(db.Integer, db.ForeignKey('account_information.account_id'),
                           nullable=False)
    action = db.Column(db.String(20), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # __table_args__ = (
    #     SQLAlchemy.CheckConstraint(action in ('Deposit', 'Withdraw',
    #                                           'Transfer', 'Normal Payment',
    #                                           'Automatic Payment'),
    #                                name='check_action'),
    #     SQLAlchemy.CheckConstraint(amount >= 0,
    #                                name='check_amount'),
    #     {})

    def __init__(self, action: str, amount: float, date: datetime):
        self.action = action
        self.amount = amount
        self.date = date


class AutomaticPayments(db.Model):
    payment_id = db.Column('payment_id', db.Integer, primary_key=True,
                           autoincrement=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer_information.customer_id'),
                            nullable=False)
    account_id = db.Column(db.Integer, db.ForeignKey('account_information.account_id'),
                           nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # __table_args__ = (
    #     SQLAlchemy.CheckConstraint(amount >= 0,
    #                                name='check_amount'),
    #     {})

    def __init__(self, amount: float, date: datetime):
        self.amount = amount
        self.date = date


SECRET_KEY = "secret"


def isAuthenticated(func):
    @wraps(func)
    def authenticate(*args, **kwargs):
        authHeader = request.headers.get('authorization')
        if not authHeader:
            return "Token Not Found", 401

        token = authHeader.split()[1]
        if not token:
            return "Token Not Found", 401
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        currentCustomer = data["customer_id"]
        customer = CustomerInformation.query.get(currentCustomer)
        if not customer:
            return "Invalid Customer", 401
        request.currentUser = currentCustomer
        return func(*args, **kwargs)
    return authenticate


def isAuthorized(func):
    @wraps(func)
    def authorize(*args, ** kwargs):

        return func(*args, **kwargs)
    return authorize


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json(0)
    print(data)
    if not data:
        return "Bad Request", 400

    username = data["username"]
    password = data["password"]

    if not (username or password):
        return "Bad Request", 400

    customer = CustomerInformation.query.filter_by(
        username=username).first()
    if customer is None:
        return "Invalid Username", 401
    try:
        bcrypt.check_password_hash(customer.password, password)
    except Exception:
        return "Invalid Password", 401

    token = jwt.encode({"customer_id": customer.customer_id}, SECRET_KEY)

    return jsonify({"token": token})


@app.route('/register', methods=['POST'])
def register():
    data = request.get_json(0)
    if not data:
        return "Bad Request", 400

    existingCustomer = CustomerInformation.query.filter_by(
        username=data["username"]).first()
    if existingCustomer:
        return "Username already exists", 400

    # Hash password
    hashedPw = bcrypt.generate_password_hash(data["password"]).decode('utf-8')
    customer = None
    try:
        customer = CustomerInformation(
            username=data["username"],
            email=data["email"],
            password=hashedPw,
            full_name=data["full_name"],
            age=data["age"],
            gender=data["gender"],
            zip_code=data["zip_code"],
            status=data["status"]
        )
        db.session.add(customer)
        db.session.commit()

    except exc.IntegrityError:
        return "Invalid Input Format", 400

    return jsonify(customer.serialize())


# Deactivate Customer Account
@app.route('/deactivateCustomer/<int:customer_id>', methods=['PATCH'])
@isAuthenticated
def deactivateCustomer(customer_id):
    customer = CustomerInformation.query.get(customer_id)
    if request.method == 'PATCH':
        if customer:
            customer.status = 'I'
            db.session.commit()
            return (f'Customer Account with customer_id {customer_id} '
                    f'deactivated successfully')
        else:
            return f'Customer with customer_id {customer_id} not found', 404


@app.route('/getCustomer/<int:customer_id>', methods=['GET'])
def getCustomerById(customer_id: int):
    if request.method == 'GET':
        customer = CustomerInformation.query.get(customer_id)
        if customer:
            return jsonify(customer.serialize())
            # Assuming you have a serialize method in your model
        else:
            return jsonify({'error': f'Customer with customer_id '
                                     f'{customer_id} not found'}), 404


@app.route('/getCustomers', methods=['GET'])
# Get all customers
def getCustomers():
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


@app.route('/')
def index():
    return ('Hello World')


def create_dummy_users(db):
    customer_data = [
        {
            'username': 'user1',
            'email': 'user1@gmail.com',
            'full_name': 'User Name 1',
            'password': '12345678',
            'age': 22,
            'gender': 'F',
            'zip_code': 95142,
            'status': 'A'
        },
        {
            'username': 'user2',
            'email': 'user2@gmail.com',
            'full_name': 'User Name 2',
            'password': '12345678',
            'age': 22,
            'gender': 'F',
            'zip_code': 95149,
            'status': 'A'
        },
        {
            'username': 'user3',
            'email': 'user3@gmail.com',
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


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # create_dummy_users(db)

    app.run(debug=True, port=8000, host='0.0.0.0')
