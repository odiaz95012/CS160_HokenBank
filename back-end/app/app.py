import json
from models import db
from models.automatic_payment import AutomaticPayments
from models.transaction import TransactionHistory
from models.customer import CustomerInformation
from models.account import AccountInformation
from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy import exc, desc
from sqlalchemy.sql import func, text, and_
from datetime import datetime
from functools import wraps
import jwt
from flask_bcrypt import Bcrypt
import pandas
import cv2
import pytesseract
from PIL import Image
import re
from apscheduler.schedulers.background import BackgroundScheduler
import pytz

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///CustomerInformation.sqlite3'
# app.config['SQLALCHEMY_DATABASE_URI'] =
# 'mysql+pymysql://root:password@mysql/bankingdb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

sched = BackgroundScheduler()

CORS(app)
db.init_app(app)
bcrypt = Bcrypt(app)

SECRET_KEY = "secret"
INTEREST_RATE = 1.05


def create_bank_manager():
    admin = CustomerInformation.query.filter_by(
        username="bank_manager").first()
    if not admin:
        bank_manager = CustomerInformation(
            username='bank_manager',
            email='bank_manager@gmail.com',
            password=bcrypt.generate_password_hash(
                'Hoken-Admin1').decode('utf-8'),
            full_name='Bank Manager',
            age=150,
            gender='O',
            zip_code=10000,
            status='A'
        )
        db.session.add(bank_manager)
        db.session.commit()


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
        customer = CustomerInformation.query.filter_by(
            customer_id=current_customer).first()
        if not customer:
            return "Invalid Customer", 401
        if customer.status == 'I':
            return "Inactive Customer", 401
        request.currentUser = current_customer
        return func(*args, **kwargs)

    return authenticate


def account_owner(func):
    @wraps(func)
    def authorize(*args, **kwargs):
        account_id = kwargs["account_id"]
        current_customer = request.currentUser
        account = AccountInformation.query.filter_by(
            account_id=account_id).first()
        if account:
            account_owner_id = account.customer.customer_id
            if current_customer != account_owner_id:
                return "Not Account Owner", 403
        else:
            return "Invalid Account ID ", 400

        return func(*args, **kwargs)

    return authorize


def automatic_payment_owner(func):
    @wraps(func)
    def authorize(*args, **kwargs):
        current_customer = request.currentUser
        payment_id = kwargs["payment_id"]
        payment = AutomaticPayments.query.filter_by(
            payment_id=payment_id).first()
        if payment:
            payment_owner_id = payment.customer.customer_id
            if current_customer != payment_owner_id:
                return "Not Automatic Payment Owner", 403
        else:
            return "Invalid Payment ID ", 400

        return func(*args, **kwargs)

    return authorize


def is_admin(func):
    @wraps(func)
    def authorize(*args, **kwargs):
        current_customer = request.currentUser
        username = CustomerInformation.query.filter_by(
            customer_id=current_customer).first().username
        if username != 'bank_manager':
            return "Not a manager", 401

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
    if not customer:
        return (f'No account exists with the username {username}.\nPlease '
                f'enter a valid username.'), 401
    if customer.status == 'I':
        return (f'Customer account with username {username} has been '
                f'deactivated.\nPlease enter a valid username.'), 401

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
                f"already exists.\nPlease choose a different one."), 400

    # Hash password
    hashed_pw = bcrypt.generate_password_hash(data["password"]).decode('utf-8')
    # customer = None
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
@app.route('/deactivateCustomer', methods=['PATCH'])
@is_authenticated
def deactivate_customer():
    customer_id = request.currentUser
    customer = CustomerInformation.query.get(customer_id)
    if not customer:
        return (f'Customer Account with customer_id {customer_id} not found',
                404)
    if customer.status == 'I':
        return (f'Customer Account with customer_id {customer_id} is '
                f'inactive', 404)
    if request.method == 'PATCH':
        # set all active accounts to 0 balance and 'I' status
        db.session.query(AccountInformation).filter(
            AccountInformation.customer_id == customer.customer_id,
            AccountInformation.status == 'A').update(
            {'balance': float(0), 'status': 'I'})
        customer.status = 'I'
        db.session.commit()
        return (f'Customer Account with customer_id {customer_id} '
                f'deactivated successfully')


# Retrieve customer info by customer_id
@app.route('/getCustomer', methods=['GET'])
@is_authenticated
def get_customer_by_id():
    customer_id = request.currentUser
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
    customer_id = request.currentUser
    account_type = request.get_json().get('account_type')

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

    return jsonify(account.serialize())


@app.route('/closeAccount/<int:account_id>', methods=['PATCH'])
@is_authenticated
@account_owner
def close_account(account_id):
    account = AccountInformation.query.get(account_id)
    if not account:
        return f'Bank Account with account_id {account_id} not found', 404
    if account.status == 'I':
        return (f'Bank Account with account_id {account_id} is inactive',
                404)
    if request.method == 'PATCH':
        account.balance = float(0)
        account.status = 'I'
        db.session.commit()
        return (f'Bank Account with account_id {account_id} '
                f'closed successfully')


# Assuming you have a serialize method in your model
@app.route('/getAccount/<int:account_id>', methods=['GET'])
@is_authenticated
@account_owner
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


# Get all accounts, including inactive ones
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


# Get all active accounts associated with the customer ID
@app.route('/getCustomerAccounts', methods=['GET'])
@is_authenticated
def get_customer_accounts():
    customer_id = request.currentUser
    active_accounts = AccountInformation.query.filter(
        AccountInformation.customer_id == customer_id and
        AccountInformation.status == 'A').all()
    account_list = []

    for account in active_accounts:
        account_data = {
            'account_id': account.account_id,
            'account_type': account.account_type,
            'balance': account.balance
        }
        account_list.append(account_data)

    return jsonify(account_list)


@app.route('/deposit/<int:account_id>/<float:amount>', methods=['PATCH'])
@is_authenticated
@account_owner
def deposit(account_id, amount):
    customer_id = request.currentUser
    if amount <= 0:
        return f'Deposit amount must be positive', 404
    account = AccountInformation.query.get(account_id)
    if not account:
        return f'Bank Account with account_id {account_id} not found', 404
    if account.status == 'I':
        return (f'Bank Account with account_id {account_id} is inactive',
                404)
    if request.method == 'PATCH':
        account.balance += amount
        db.session.commit()
        create_transaction_history_entry(
            customer_id, account_id, 'Deposit', amount)
        return (f'${amount} successfully deposited to Bank Account '
                f'with account_id {account_id}')


@app.route('/withdraw/<int:account_id>/<float:amount>', methods=['PATCH'])
@is_authenticated
@account_owner  
def withdraw(account_id, amount):
    customer_id = request.currentUser
    if amount <= 0:
        return f'Withdraw amount must be positive', 404
    account = AccountInformation.query.get(account_id)
    if not account:
        return f'Bank Account with account_id {account_id} not found', 404
    if account.status == 'I':
        return (f'Bank Account with account_id {account_id} is inactive',
                404)
    if request.method == 'PATCH':
        new_balance = account.balance - amount
        if new_balance < 0:
            return (f'Withdrawal will put Bank Account with account_id '
                    f'{account_id} into negative balance', 404)
        account.balance = new_balance
        db.session.commit()
        create_transaction_history_entry(
            customer_id, account_id, 'Withdraw', -amount)
        return (f'${amount} successfully withdrawn from Bank Account '
                f'with account_id {account_id}')


@app.route('/transfer/<int:from_account_id>/<int:to_account_id>/<float:amount'
           '>', methods=['PATCH'])
@is_authenticated
@account_owner
def transfer(from_account_id, to_account_id, amount):
    from_customer_id = request.currentUser
    if amount <= 0:
        return f'Transfer amount must be positive', 404
    from_account = AccountInformation.query.get(from_account_id)
    if not from_account:
        return (f'Sending Account with account_id {from_account_id} not '
                f'found', 404)
    if from_account.status == 'I':
        return (f'Sending Account with account_id {from_account_id} is '
                f'inactive', 404)
    to_account = AccountInformation.query.get(to_account_id)
    if not to_account:
        return (f'Receiving Account with account_id {to_account_id} not '
                f'found', 404)
    if to_account.status == 'I':
        return (f'Receiving Account with account_id {to_account_id} is '
                f'inactive', 404)
    to_customer_id = AccountInformation.query.get(to_account_id).customer_id
    if request.method == 'PATCH':
        new_balance = from_account.balance - amount
        if new_balance < 0:
            return (f'Transfer from Bank Account with account_id '
                    f'{from_account_id} will put it into negative balance',
                    404)
        from_account.balance = new_balance
        to_account.balance += amount
        db.session.commit()
        create_transaction_history_entry(
            from_customer_id, from_account_id, 'Transfer', -amount)
        create_transaction_history_entry(
            to_customer_id, to_account_id, 'Transfer', amount)
        return (f'${amount} successfully transferred from Bank Account '
                f'with account_id {from_account_id} to Bank Account with '
                f'account_id {to_account_id}')


@app.route('/normalPayment/<int:account_id>/<float:amount>', methods=['PATCH'])
@is_authenticated
@account_owner
def normal_payment(account_id, amount):
    customer_id = request.currentUser
    if amount <= 0:
        return f'Payment amount must be positive', 404
    account = AccountInformation.query.get(account_id)
    if not account:
        return f'Bank Account with account_id {account_id} not found', 404
    if account.status == 'I':
        return (f'Bank Account with account_id {account_id} is inactive',
                404)
    if request.method == 'PATCH':
        new_balance = account.balance - amount
        if new_balance < 0:
            return (f'Bill payment will put the account with Account ID: '
                    f'{account_id} into negative balance.', 404)
        account.balance = new_balance
        db.session.commit()
        create_transaction_history_entry(
            customer_id, account_id, 'Normal Payment', -amount)
        return jsonify(account.serialize())


# setting up automatic payment
@app.route('/automaticPayment/<int:account_id>/<float:amount>/<string:date>',
           methods=['PATCH'])
@is_authenticated
@account_owner
def automatic_payment(account_id, amount, date):
    # note: flask can't take datetime representation of date, so needs to be
    # converted to datetime
    # pandas parses datetime from string in format YYYY-MM-DD
    if amount <= 0:
        return f'Payment amount must be positive', 404

    # take datetime with offset
    timestamp = pandas.to_datetime(date)
    # convert timestamp to datetime object
    date_time = timestamp.to_pydatetime()

    #take timezone & create local time
    local_date = date_time.astimezone()
    # convert local time to utc
    utc_date = local_date.astimezone(pytz.utc)

    # check that date is in future
    if utc_date < datetime.now().astimezone(pytz.utc):
        return f'Date must be in future', 404

    account = AccountInformation.query.get(account_id)
    if not account:
        return f'Bank Account with account_id {account_id} not found', 404
    if account.status == 'I':
        return (f'Bank Account with account_id {account_id} is inactive',
                404)
    if request.method == 'PATCH':
        create_automatic_payment_entry(account.customer_id, account_id,
                                       amount, utc_date)
        # use local date
        return (f'Payment of ${amount} successfully scheduled for Bank '
                f'Account with account_id {account_id} and date {date}')


# executing automatic payment, job should auto-execute when server is running
def automatic_payment_job(payment_id):
    # access payment
    autopayment = AutomaticPayments.query.get(payment_id)
    # access account
    account = AccountInformation.query.get(autopayment.account_id)

    new_balance = account.balance - autopayment.amount
    # placeholder before grace period implement
    if new_balance < 0:
        delete_automatic_payment_entry(payment_id)
        return (f'Scheduled payment with account_id '
                f'{autopayment.account_id} failed due to negative balance',
                404)

    # set new balance and reset date for one month from original date,
    # add transaction
    account.balance = new_balance
    autopayment.date = autopayment.date + pandas.DateOffset(months=1)
    db.session.commit()
    create_transaction_history_entry(account.account_id, 'Automatic Payment',
                                     -autopayment.amount)


# go thru db + update all automatic jobs on the day
def automatic_payment_cycle():
    # only checking date portion of "date"
    with app.app_context():
        due_today = (AutomaticPayments.query.filter(
                     AutomaticPayments.date == datetime.now().astimezone(pytz.utc)))
        if (due_today):
            for due in due_today:
                 automatic_payment_job(due.payment_id)
        over_due = (AutomaticPayments.query.filter(
                  AutomaticPayments.date < datetime.now().astimezone(pytz.utc)))
        if (over_due):
            for due in over_due:
                 automatic_payment_job(due.payment_id)
            return f'overdue payments detected and executed'

# schedule this job once a year (5% annual interest)

def interest_accumulation():
    with app.app_context():
         db.session.query(AccountInformation).filter(
            and_ (AccountInformation.status == "A",
            AccountInformation.account_type == "Savings")).update(
             {'balance': AccountInformation.balance * INTEREST_RATE})
         db.session.commit()


def create_transaction_history_entry(customer_id, account_id, action, amount):
    transaction = TransactionHistory(
        customer_id=customer_id,
        account_id=account_id,
        action=action,
        amount=amount
    )
    db.session.add(transaction)
    db.session.commit()


def create_automatic_payment_entry(customer_id, account_id, amount, date):
    autopayment = AutomaticPayments(
        customer_id=customer_id,
        account_id=account_id,
        amount=amount,
        date=date
    )
    db.session.add(autopayment)
    db.session.commit()

@app.route('/cancelAutomaticPayment/<int:payment_id>', methods=['PATCH'])
@is_authenticated
def cancel_automatic_payment(payment_id):
    customer_id = request.currentUser
    payment = AutomaticPayments.query.filter(
        AutomaticPayments.payment_id == payment_id,
        AutomaticPayments.customer_id == customer_id
    ).first()

    if payment:
        db.session.delete(payment)  # Delete the record
        db.session.commit()  # Commit the transaction
        return jsonify(message=f'Automatic payment with the payment id: {payment_id} was successfully cancelled'), 200
    else:
        return jsonify(message=f'No automatic payment with the payment id: {payment_id} was found.'), 404
    

def delete_automatic_payment_entry(payment_id):
    AutomaticPayments.query.filter(AutomaticPayments.payment_id ==
                                   payment_id).delete()
    db.session.commit()


# number = 0 to return all entries
@app.route('/getCustomerCompleteHistory/<int:number>', methods=['GET'])
@is_authenticated
def get_customer_complete_history(number):
    customer_id = request.currentUser
    if number < 0:
        return f'Query number must be positive', 404
    customer = CustomerInformation.query.get(customer_id)
    if not customer:
        return (f'Customer Account with customer_id {customer_id} not found',
                404)
    if customer.status == 'I':
        return (f'Customer Account with customer_id {customer_id} is '
                f'inactive', 404)
    if request.method == 'GET':
        if number == 0:
            records = (TransactionHistory.query.filter(
                TransactionHistory.customer_id == customer_id)
                       .order_by(desc(TransactionHistory.date)).all())
        else:
            records = (TransactionHistory.query.filter(
                TransactionHistory.customer_id == customer_id)
                       .order_by(desc(TransactionHistory.date)).limit(
                number).all())
        record_list = []
        for record in records:
            record_list.append(record.serialize())
        return jsonify(record_list)


# number = 0 to return all entries
@app.route('/getCustomerTransactionHistory/<int:number>', methods=['GET'])
@is_authenticated
def get_customer_transaction_history(number):
    customer_id = request.currentUser
    if number < 0:
        return f'Query number must be positive', 404
    customer = CustomerInformation.query.get(customer_id)
    if not customer:
        return (f'Customer Account with customer_id {customer_id} not found',
                404)
    if customer.status == 'I':
        return (f'Customer Account with customer_id {customer_id} is '
                f'inactive', 404)
    if request.method == 'GET':
        if number == 0:
            transactions = (TransactionHistory.query.filter(
                TransactionHistory.customer_id == customer_id,
                TransactionHistory.action.in_(
                    ('Deposit', 'Withdraw', 'Transfer')))
                            .order_by(desc(TransactionHistory.date)).all())
        else:
            transactions = (TransactionHistory.query.filter(
                TransactionHistory.customer_id == customer_id,
                TransactionHistory.action.in_(
                    ('Deposit', 'Withdraw', 'Transfer')))
                            .order_by(desc(TransactionHistory.date)).limit(
                number).all())
        transaction_list = []
        for transaction in transactions:
            transaction_list.append(transaction.serialize())
        return jsonify(transaction_list)


# number = 0 to return all entries
@app.route('/getCustomerPaymentHistory/<int:number>', methods=['GET'])
@is_authenticated
def get_customer_payment_history(number):
    customer_id = request.currentUser
    if number < 0:
        return f'Query number must be positive', 404
    customer = CustomerInformation.query.get(customer_id)
    if not customer:
        return (f'Customer Account with customer_id {customer_id} not found',
                404)
    if customer.status == 'I':
        return (f'Customer Account with customer_id {customer_id} is '
                f'inactive', 404)

    if request.method == 'GET':
        if number == 0:
            payments = (TransactionHistory.query.filter(
                TransactionHistory.customer_id == customer_id,
                TransactionHistory.action.in_(
                    ('Normal Payment', 'Automatic Payment')))
                        .order_by(desc(TransactionHistory.date)).all())
        else:
            payments = (TransactionHistory.query.filter(
                TransactionHistory.customer_id == customer_id,
                TransactionHistory.action.in_(
                    ('Normal Payment', 'Automatic Payment')))
                        .order_by(desc(TransactionHistory.date)).limit(
                number).all())
        payment_list = []
        for payment in payments:
            payment_list.append(payment.serialize())
        return jsonify(payment_list)


# upcoming automatic payments
@app.route('/getUpcomingPayments/<int:number>', methods=['GET'])
@is_authenticated
def get_upcoming_payments(number):
    customer_id = request.currentUser
    if number < 0:
        return f'Query number must be positive', 404
    customer = CustomerInformation.query.get(customer_id)
    if not customer:
        return (f'Customer Account with customer_id {customer_id} not found',
                404)
    if customer.status == 'I':
        return (f'Customer Account with customer_id {customer_id} is '
                f'inactive', 404)
    if request.method == 'GET':
        upcoming = []
        if number == 0:
            upcoming = (AutomaticPayments.query.filter
                        (AutomaticPayments.customer_id == customer_id))
        else:
            upcoming = (AutomaticPayments.query.filter
                        (AutomaticPayments.customer_id == customer_id)).limit(
                number)
        upcoming_payments = []
        for payment in upcoming:
            upcoming_payments.append(payment.serialize())
        return jsonify(upcoming_payments)


# number = 0 to return all entries
@app.route('/getAccountCompleteHistory/<int:account_id>/<int:number>',
           methods=['GET'])
@is_authenticated
@account_owner
def get_account_complete_history(account_id, number):
    if number < 0:
        return f'Query number must be positive', 404
    account = AccountInformation.query.get(account_id)
    if not account:
        return f'Bank Account with account_id {account_id} not found', 404
    if account.status == 'I':
        return (f'Bank Account with account_id {account_id} is inactive',
                404)
    if request.method == 'GET':
        if number == 0:
            records = (TransactionHistory.query.filter(
                TransactionHistory.account_id == account.account_id)
                       .order_by(desc(TransactionHistory.date)).all())
        else:
            records = (TransactionHistory.query.filter(
                TransactionHistory.account_id == account.account_id)
                       .order_by(desc(TransactionHistory.date)).limit(
                number).all())
        record_list = []
        for record in records:
            record_list.append(record.serialize())
        return jsonify(record_list)


# number = 0 to return all entries
@app.route('/getAccountTransactionHistory/<int:account_id>/<int:number>',
           methods=['GET'])
@is_authenticated
@account_owner
def get_account_transaction_history(account_id, number):
    if number < 0:
        return f'Query number must be positive', 404
    account = AccountInformation.query.get(account_id)
    if not account:
        return f'Bank Account with account_id {account_id} not found', 404
    if account.status == 'I':
        return (f'Bank Account with account_id {account_id} is inactive',
                404)
    if request.method == 'GET':
        if number == 0:
            transactions = (TransactionHistory.query.filter(
                TransactionHistory.account_id == account.account_id,
                TransactionHistory.action.in_(
                    ('Deposit', 'Withdraw', 'Transfer')))
                            .order_by(desc(TransactionHistory.date)).all())
        else:
            transactions = (TransactionHistory.query.filter(
                TransactionHistory.account_id == account.account_id,
                TransactionHistory.action.in_(
                    ('Deposit', 'Withdraw', 'Transfer')))
                            .order_by(desc(TransactionHistory.date)).limit(
                number).all())
        transaction_list = []
        for transaction in transactions:
            transaction_list.append(transaction.serialize())
        return jsonify(transaction_list)


# number = 0 to return all entries
@app.route('/getAccountPaymentHistory/<int:account_id>/<int:number>',
           methods=['GET'])
@is_authenticated
@account_owner
def get_account_payment_history(account_id, number):
    if number < 0:
        return f'Query number must be positive', 404
    account = AccountInformation.query.get(account_id)
    if not account:
        return f'Bank Account with account_id {account_id} not found', 404
    if account.status == 'I':
        return (f'Bank Account with account_id {account_id} is inactive',
                404)
    if request.method == 'GET':
        if number == 0:
            payments = (TransactionHistory.query.filter(
                TransactionHistory.account_id == account.account_id,
                TransactionHistory.action.in_(
                    ('Normal Payment', 'Automatic Payment')))
                        .order_by(desc(TransactionHistory.date)).all())
        else:
            payments = (TransactionHistory.query.filter(
                TransactionHistory.account_id == account.account_id,
                TransactionHistory.action.in_(
                    ('Normal Payment', 'Automatic Payment')))
                        .order_by(desc(TransactionHistory.date)).limit(
                number).all())
        payment_list = []
        for payment in payments:
            payment_list.append(payment.serialize())
        return jsonify(payment_list)


# default values:
# min_balance, max_balance, min_age, max_age = 0
# gender = 'A'
# zip_code = 100000
@app.route(
    '/generateUserReport/<float:min_balance>/<float:max_balance>/<int:min_age'
    '>/<int:max_age>/<int:zip_code>/<string:gender>', methods=['GET'])
@is_authenticated
@is_admin
def generate_user_report(min_balance, max_balance, min_age, max_age, zip_code,
                         gender):
    if min_balance < float(0):
        return f'Minimum balance must be positive', 404
    if max_balance < float(0):
        return f'Maximum balance must be positive', 404
    if max_balance != 0 and max_balance < min_balance:
        return f'Minimum balance cannot exceed maximum balance', 404
    if min_age < 0:
        return f'Minimum age must be positive', 404
    if max_age < 0:
        return f'Maximum age must be positive', 404
    if max_age != 0 and max_age < min_age:
        return f'Minimum age cannot exceed maximum age', 404
    if gender not in ('M', 'F', 'O', 'A'):
        return f'Gender must be one of the following options: M, F, O, A', 404
    if zip_code < 10000 or zip_code > 100000:
        return f'Zip code must be a 5-digit integer', 404

    select_customers = (db.session.query(
        CustomerInformation, func.sum(AccountInformation.balance).label(
            "total_balance"))
                        .filter(CustomerInformation.customer_id ==
                                AccountInformation.customer_id)
                        .group_by(CustomerInformation.customer_id))

    select_customers = select_customers.filter(
        CustomerInformation.status == 'A')

    select_customers = select_customers.filter(
        CustomerInformation.age >= min_age)

    if max_age != 0:
        select_customers = select_customers.filter(
            CustomerInformation.age <= max_age)

    if gender != 'A':
        select_customers = select_customers.filter(
            CustomerInformation.gender == gender)

    if zip_code != 100000:
        select_customers = select_customers.filter(
            CustomerInformation.zip_code == zip_code)

    select_customers = select_customers.having(
        text(f'total_balance >= {min_balance}'))

    if max_balance != float(0):
        select_customers = select_customers.having(
            text(f'total_balance <= {max_balance}'))

    customer_list = []

    for record in select_customers.all():
        customer = record[0]
        customer_data = {
            'customer_id': customer.customer_id,
            'age': customer.age,
            'gender': customer.gender,
            'zip_code': customer.zip_code,
            'balance': record[1]
        }
        customer_list.append(customer_data)

    return jsonify(customer_list)


@app.route('/checkDeposit/<int:account_id>', methods=["POST"])
@is_authenticated
@account_owner
def check_deposit(account_id):
    customer_id = request.currentUser
    file = request.files.get('check')
    if not file:
        return "No check fo found", 400
    try:
        image = Image.open(file)
        text = pytesseract.image_to_string(image, lang="eng")
        print(text)
        # extract full name of receiver on the check
        name_text = re.search('pay(\s)*to.*\|', text,
                              flags=re.IGNORECASE).group()
        name = name_text.split(':')[1].split('|')[0].strip()
        # extract the amount deposited
        amount_text = re.search('\$\s[0-9,.]+', text).group().replace(",", "")
        amount = float(re.split('\s', amount_text)[1])
    except Exception:
        return "Can not scan the check. Not in valid format", 400

    # check if the name on the check matches current user's name
    account = AccountInformation.query.filter_by(account_id=account_id).first()
    if account.customer.full_name != name:
        return "Check does not belong to current user", 403

    # deposit the amount to the account
    account.balance += amount
    create_transaction_history_entry(
        customer_id, account_id, 'Deposit', amount)
    db.session.commit()

    return jsonify(account.serialize())


@app.route('/')
def index():
    return 'Hello World'


def create_dummy_customers():
    customer_data = [
        {
            'username': 'test_user1',
            'email': 'testuser1@gmail.com',
            'password': '12345678',
            'full_name': 'Test User 1',
            'age': 22,
            'gender': 'F',
            'zip_code': 95116,
            'status': 'A'
        },
        {
            'username': 'test_user2',
            'email': 'testuser2@gmail.com',
            'password': '12345678',
            'full_name': 'Test User 2',
            'age': 22,
            'gender': 'M',
            'zip_code': 95116,
            'status': 'A'
        },
        {
            'username': 'test_user3',
            'email': 'testuser3@gmail.com',
            'password': '12345678',
            'full_name': 'Test User 3',
            'age': 24,
            'gender': 'F',
            'zip_code': 95012,
            'status': 'I'
        }
    ]
    for cus in customer_data:
        customer = CustomerInformation(
            username=cus['username'],
            email=cus['email'],
            password=bcrypt.generate_password_hash(
                cus['password']).decode('utf-8'),
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
            'account_type': 'Checking',
            'balance': 1111.11,
            'status': 'A'
        },
        {
            'customer_id': 3,
            'account_type': 'Savings',
            'balance': 2222.22,
            'status': 'A'
        },
        {
            'customer_id': 4,
            'account_type': 'Checking',
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


# add two jobs to sched
# original times
#sched.add_job(automatic_payment_cycle,'cron', hour=0, minute = 0)
#sched.add_job(interest_accumulation,'cron', month = 1, day = 1, hour = 0, minute = 0)
sched.add_job(automatic_payment_cycle, 'cron', minute = '*')
sched.add_job(interest_accumulation, 'cron', minute = '*')
sched.start()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        create_bank_manager()
        # create_dummy_customers()
        # create_dummy_accounts()

    app.run(debug=True, port=8000, host='0.0.0.0')
