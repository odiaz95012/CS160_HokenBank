from flask import Blueprint, request, jsonify
from models.account import AccountInformation
from models import db
from helpers.middleware import is_authenticated, account_owner, is_admin
from decimal import Decimal
from models.customer import CustomerInformation
from . import bcrypt

account = Blueprint('account', __name__)


@account.route('/openAccount', methods=['POST'])
@is_authenticated
def open_account():
    try:
        # Get the values from request parameters, query string, or any other source
        customer_id = request.currentUser
        customer = CustomerInformation.query.get(customer_id)
        if not customer:
            return (
            f'Customer Account with customer_id {customer_id} not found',
            404)
        if customer.status == 'I':
            return (f'Customer Account with customer_id {customer_id} is '
                    f'inactive', 406)
        account_type = request.get_json().get('account_type')

        # Create a customer object with the provided values
        account = AccountInformation(
            customer_id=customer_id,
            account_type=account_type,
            balance=Decimal(str(0.00)),
            status='A'
        )
        # Add the account to the database session and commit the changes
        db.session.add(account)
        db.session.commit()

        return jsonify(account.serialize()), 200
    except Exception as e:
        # Log the exception to help diagnose the issue
        print(f"Exception: {str(e)}")
        db.session.rollback()  # revert changes if any error occurs
        return 'Unexpected error occurred.', 500


@account.route('/closeAccount/<int:account_id>', methods=['PATCH'])
@is_authenticated
@account_owner
def close_account(account_id):
    try:
        customer_id = request.currentUser
        customer = CustomerInformation.query.get(customer_id)
        if not customer:
            return f'Customer Account with customer_id {customer_id} not found', 404
        if customer.status == 'I':
            return (f'Customer Account with customer_id {customer_id} is inactive', 406)

        password = request.get_json().get('password')
        hashed_password = CustomerInformation.query.get(customer_id).password
        if not bcrypt.check_password_hash(hashed_password, password):
            return 'Incorrect password', 401

        account = AccountInformation.query.get(account_id)
        if not account:
            return f'Bank Account with account_id {account_id} not found', 404
        if account.status == 'I':
            return (f'Bank Account with account_id {account_id} is inactive', 406)
        # Check if account has a balance
        if account.balance > Decimal(str(0.00)):
            return ("The account's balance must be withdrawn or transferred "
                    "to another account before closing."), 400

        account.status = 'I'
        db.session.commit()
        return f'Bank Account with account_id {account_id} closed successfully', 200
    except Exception as e:
        # Log the exception to help diagnose the issue
        print(f"Exception: {str(e)}")
        db.session.rollback()  # revert changes if any error occurs
        return 'Unexpected error occurred.', 500


# Assuming you have a serialize method in your model
@account.route('/getAccount/<int:account_id>', methods=['GET'])
@is_authenticated
@account_owner
def get_account_by_id(account_id):
    try:
        account = AccountInformation.query.get(account_id)
        if not account:
            return jsonify({'error': f'Bank Account with account_id '
                                     f'{account_id} not found'}), 404
        # add additional check for 'I' status?
        return jsonify(account.serialize()), 200
    except Exception as e:
        # Log the exception to help diagnose the issue
        print(f"Exception: {str(e)}")
        return 'Unexpected error occurred.', 500


# Get all accounts, including inactive ones
@account.route('/getAccounts', methods=['GET'])
@is_authenticated
@is_admin
def get_accounts():
    try:
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

        return jsonify(account_list), 200
    except Exception as e:
        # Log the exception to help diagnose the issue
        print(f"Exception: {str(e)}")
        return 'Unexpected error occurred.', 500


# Get all active accounts associated with the customer ID
@account.route('/getCustomerAccounts', methods=['GET'])
@is_authenticated
def get_customer_accounts():
    try:
        customer_id = request.currentUser
        active_accounts = AccountInformation.query.filter(
            AccountInformation.customer_id == customer_id,
            AccountInformation.status == 'A').all()
        account_list = []

        for account in active_accounts:
            account_data = {
                'account_id': account.account_id,
                'account_type': account.account_type,
                'balance': account.balance
            }
            account_list.append(account_data)

        return jsonify(account_list), 200
    except Exception as e:
        # Log the exception to help diagnose the issue
        print(f"Exception: {str(e)}")
        return 'Unexpected error occurred.', 500
