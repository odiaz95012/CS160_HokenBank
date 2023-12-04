from flask import Blueprint, request, jsonify
from models import db
from models.transaction import TransactionHistory
from models.customer import CustomerInformation
from models.account import AccountInformation
from helpers.middleware import is_authenticated, account_owner, is_admin
from sqlalchemy import desc
from sqlalchemy.sql import func, text
from decimal import Decimal


history = Blueprint('history', __name__)


# number = 0 to return all entries
@history.route('/getCustomerCompleteHistory/<int:number>', methods=['GET'])
@is_authenticated
def get_customer_complete_history(number):
    try:
        customer_id = request.currentUser
        if number < 0:
            return f'Query number must be positive', 400
        customer = CustomerInformation.query.get(customer_id)
        if not customer:
            return (
            f'Customer Account with customer_id {customer_id} not found',
            404)
        if customer.status == 'I':
            return (f'Customer Account with customer_id {customer_id} is '
                    f'inactive', 406)
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
        return jsonify(record_list), 200
    except Exception as e:
        # Log the exception to help diagnose the issue
        print(f"Exception: {str(e)}")
        return 'Unexpected error occurred.', 500


# number = 0 to return all entries
@history.route('/getCustomerTransactionHistory/<int:number>', methods=['GET'])
@is_authenticated
def get_customer_transaction_history(number):
    try:
        customer_id = request.currentUser
        if number < 0:
            return f'Query number must be positive', 400
        customer = CustomerInformation.query.get(customer_id)
        if not customer:
            return (
            f'Customer Account with customer_id {customer_id} not found',
            404)
        if customer.status == 'I':
            return (f'Customer Account with customer_id {customer_id} is '
                    f'inactive', 406)
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
        return jsonify(transaction_list), 200
    except Exception as e:
        # Log the exception to help diagnose the issue
        print(f"Exception: {str(e)}")
        return 'Unexpected error occurred.', 500


# number = 0 to return all entries
@history.route('/getCustomerPaymentHistory/<int:number>', methods=['GET'])
@is_authenticated
def get_customer_payment_history(number):
    try:
        customer_id = request.currentUser
        if number < 0:
            return f'Query number must be positive', 400
        customer = CustomerInformation.query.get(customer_id)
        if not customer:
            return (
            f'Customer Account with customer_id {customer_id} not found',
            404)
        if customer.status == 'I':
            return (f'Customer Account with customer_id {customer_id} is '
                    f'inactive', 406)
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
        return jsonify(payment_list), 200
    except Exception as e:
        # Log the exception to help diagnose the issue
        print(f"Exception: {str(e)}")
        return 'Unexpected error occurred.', 500


# number = 0 to return all entries
@history.route('/getAccountCompleteHistory/<int:account_id>/<int:number>',
               methods=['GET'])
@is_authenticated
@account_owner
def get_account_complete_history(account_id, number):
    try:
        if number < 0:
            return f'Query number must be positive', 400
        account = AccountInformation.query.get(account_id)
        if not account:
            return f'Bank Account with account_id {account_id} not found', 404
        if account.status == 'I':
            return (f'Bank Account with account_id {account_id} is inactive',
                    406)
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
        return jsonify(record_list), 200
    except Exception as e:
        # Log the exception to help diagnose the issue
        print(f"Exception: {str(e)}")
        return 'Unexpected error occurred.', 500


# number = 0 to return all entries
@history.route('/getAccountTransactionHistory/<int:account_id>/<int:number>',
               methods=['GET'])
@is_authenticated
@account_owner
def get_account_transaction_history(account_id, number):
    try:
        if number < 0:
            return f'Query number must be positive', 400
        account = AccountInformation.query.get(account_id)
        if not account:
            return f'Bank Account with account_id {account_id} not found', 404
        if account.status == 'I':
            return (f'Bank Account with account_id {account_id} is inactive',
                    406)
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
        return jsonify(transaction_list), 200
    except Exception as e:
        # Log the exception to help diagnose the issue
        print(f"Exception: {str(e)}")
        return 'Unexpected error occurred.', 500


# number = 0 to return all entries
@history.route('/getAccountPaymentHistory/<int:account_id>/<int:number>',
               methods=['GET'])
@is_authenticated
@account_owner
def get_account_payment_history(account_id, number):
    try:
        if number < 0:
            return f'Query number must be positive', 400
        account = AccountInformation.query.get(account_id)
        if not account:
            return f'Bank Account with account_id {account_id} not found', 404
        if account.status == 'I':
            return (f'Bank Account with account_id {account_id} is inactive',
                    406)
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
        return jsonify(payment_list), 200
    except Exception as e:
        # Log the exception to help diagnose the issue
        print(f"Exception: {str(e)}")
        return 'Unexpected error occurred.', 500


# default values:
# min_balance, max_balance, min_age, max_age = 0
# gender = 'A'
# zip_code = 99999
@history.route(
    '/generateUserReport/<float:min_balance>/<float:max_balance>/<int:min_age'
    '>/<int:max_age>/<int:zip_code>/<string:gender>', methods=['GET'])
@is_authenticated
@is_admin
def generate_user_report(min_balance, max_balance, min_age, max_age, zip_code,
                         gender):
    try:
        d_min_balance = Decimal(str(min_balance))
        d_max_balance = Decimal(str(max_balance))
        if d_min_balance < 0:
            return f'Minimum balance must be positive', 400
        if d_max_balance < 0:
            return f'Maximum balance must be positive', 400
        if d_max_balance != 0 and d_max_balance < d_min_balance:
            return f'Minimum balance cannot exceed maximum balance', 400
        if min_age < 0:
            return f'Minimum age must be positive', 400
        if max_age < 0:
            return f'Maximum age must be positive', 400
        if max_age != 0 and max_age < min_age:
            return f'Minimum age cannot exceed maximum age', 400
        if gender not in ('M', 'F', 'O', 'A'):
            return f'Gender must be one of the following options: M, F, O, A', 400
        if zip_code < 10000 or zip_code > 99999:
            return f'Zip code must be a 5-digit integer', 400

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

        if zip_code != 99999:
            select_customers = select_customers.filter(
                CustomerInformation.zip_code == zip_code)

        select_customers = select_customers.having(
            text(f'total_balance >= {d_min_balance}'))

        if d_max_balance != 0:
            select_customers = select_customers.having(
                text(f'total_balance <= {d_max_balance}'))

        customer_list = []

        for record in select_customers.all():
            customer = record[0]
            customer_data = {
                'customer_id': customer.customer_id,
                'age': customer.age,
                'gender': customer.gender,
                'zip_code': customer.zip_code,
                'balance': Decimal(str(record[1]))
            }
            customer_list.append(customer_data)

        return jsonify(customer_list), 200
    except Exception as e:
        # Log the exception to help diagnose the issue
        print(f"Exception: {str(e)}")
        return 'Unexpected error occurred.', 500


@history.route('/generateIndividualReport/<int:customer_id>', methods=['GET'])
@is_authenticated
@is_admin
def generate_individual_report(customer_id):
    try:
        customer = CustomerInformation.query.get(customer_id)
        if not customer:
            return (
            f'Customer Account with customer_id {customer_id} not found',
            404)
        select_customer = (db.session.query(
            CustomerInformation,
            func.sum(AccountInformation.balance).label("total_balance"),
            func.count(AccountInformation.account_id).label("account_count"))
        .filter(CustomerInformation.customer_id ==
                customer_id,
                AccountInformation.customer_id ==
                CustomerInformation.customer_id,
                AccountInformation.status == 'A').group_by(
            CustomerInformation.customer_id)).first()

        if not select_customer:
            return (
                f'Customer Account with customer_id {customer_id} has no '
                f'active bank accounts',
                404)

        customer = select_customer[0]
        customer_data = {
            'customer_id': customer.customer_id,
            'username': customer.username,
            'email': customer.email,
            'full_name': customer.full_name,
            'age': customer.age,
            'gender': customer.gender,
            'zip_code': customer.zip_code,
            'status': customer.status,
            'balance': Decimal(str(select_customer[1])),
            'accounts': select_customer[2]
        }
        return jsonify(customer_data), 200
    except Exception as e:
        # Log the exception to help diagnose the issue
        print(f"Exception: {str(e)}")
        return 'Unexpected error occurred.', 500
