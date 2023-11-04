from flask import Blueprint, request, jsonify
from models.account import AccountInformation
from models import db
from helpers.middleware import is_authenticated, account_owner
from decimal import Decimal
from models.customer import CustomerInformation
from . import bcrypt

account = Blueprint('account', __name__)


@account.route('/openAccount', methods=['POST'])
@is_authenticated
def open_account():
    # Get the values from request parameters, query string, or any other source
    customer_id = request.currentUser
    account_type = request.get_json().get('account_type')

    # Create a customer object with the provided values
    try:
        # Create a customer object with the provided values
        account = AccountInformation(
            customer_id=customer_id,
            account_type=account_type,
            balance=Decimal(0),
            status='A'
        )
        # Add the account to the database session and commit the changes
        db.session.add(account)
        db.session.commit()

        return jsonify(account.serialize())
    except Exception:
        return 'Unexpected error occurred.'


@account.route('/closeAccount/<int:account_id>', methods=['PATCH'])
@is_authenticated
@account_owner
def close_account(account_id):
    account = AccountInformation.query.get(account_id)
    customer_id = request.currentUser
    password = request.get_json().get('password')
    hashed_password = CustomerInformation.query.get(customer_id).password
    if not bcrypt.check_password_hash(hashed_password, password):
        return 'Incorrect password', 401
    if not account:
        return f'Bank Account with account_id {account_id} not found', 404
    if account.status == 'I':
        return (f'Bank Account with account_id {account_id} is inactive',
                404)
    try:
        account.balance = Decimal(0)
        account.status = 'I'
        db.session.commit()
        return (f'Bank Account with account_id {account_id} '
                f'closed successfully')

    except Exception:
        return 'Unexpected error occurred.'


# Assuming you have a serialize method in your model
@account.route('/getAccount/<int:account_id>', methods=['GET'])
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


# Get all accounts, including inactive ones
@account.route('/getAccounts', methods=['GET'])
@is_authenticated
def get_accounts():
    accounts = AccountInformation.query.all()
    account_list = []
    try:
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
    except Exception:
        return 'Unexpected error occurred.'


# Get all active accounts associated with the customer ID
@account.route('/getCustomerAccounts', methods=['GET'])
@is_authenticated
def get_customer_accounts():
    customer_id = request.currentUser
    try:
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

        return jsonify(account_list)
    except Exception:
        return 'Unexpected error occurred.'
