from flask import Blueprint, request, jsonify
from models.account import AccountInformation
from models import db
from helpers.middleware import is_authenticated, account_owner
from decimal import Decimal
import cv2
import pytesseract
from PIL import Image
import re
from helpers.helpers import create_transaction_history_entry


transaction = Blueprint('transaction', __name__)


@transaction.route('/deposit/<int:account_id>/<float:amount>', methods=['PATCH'])
@is_authenticated
@account_owner
def deposit(account_id, amount):
    try:
        customer_id = request.currentUser
        if amount <= 0:
            return f'Deposit amount must be positive', 400
        account = AccountInformation.query.get(account_id)
        if not account:
            return f'Bank Account with account_id {account_id} not found', 404
        if account.status == 'I':
            return (f'Bank Account with account_id {account_id} is inactive',
                    406)
        account.balance += Decimal(amount)
        db.session.commit()
        create_transaction_history_entry(
            customer_id, account_id, 'Deposit', Decimal(amount))
        return (f'${Decimal(amount)} successfully deposited to Bank Account '
                f'with account_id {account_id}'), 200
    except Exception as e:
        # Log the exception to help diagnose the issue
        print(f"Exception: {str(e)}")
        return 'Unexpected error occurred.', 500


@transaction.route('/withdraw/<int:account_id>/<float:amount>', methods=['PATCH'])
@is_authenticated
@account_owner
def withdraw(account_id, amount):
    try:
        customer_id = request.currentUser
        if amount <= 0:
            return f'Withdraw amount must be positive', 400
        account = AccountInformation.query.get(account_id)
        if not account:
            return f'Bank Account with account_id {account_id} not found', 404
        if account.status == 'I':
            return (f'Bank Account with account_id {account_id} is inactive',
                    406)
        new_balance = account.balance - Decimal(amount)
        if new_balance < 0:
            return (f'Withdrawal will put Bank Account with account_id '
                    f'{account_id} into negative balance', 400)
        account.balance = new_balance
        db.session.commit()
        create_transaction_history_entry(
            customer_id, account_id, 'Withdraw', -Decimal(amount))
        return (f'${Decimal(amount)} successfully withdrawn from Bank Account '
                f'with account_id {account_id}'), 200
    except Exception as e:
        # Log the exception to help diagnose the issue
        print(f"Exception: {str(e)}")
        return 'Unexpected error occurred.', 500


@transaction.route('/transfer/<int:account_id>/<int:to_account_id>/<float:amount'
                   '>', methods=['PATCH'])
@is_authenticated
@account_owner
def transfer(account_id, to_account_id, amount):
    try:
        from_customer_id = request.currentUser
        if amount <= 0:
            return f'Transfer amount must be positive', 400
        from_account = AccountInformation.query.get(account_id)
        if not from_account:
            return (f'Sending Account with account_id {account_id} not '
                    f'found', 404)
        if from_account.status == 'I':
            return (f'Sending Account with account_id {account_id} is '
                    f'inactive', 406)
        to_account = AccountInformation.query.get(to_account_id)
        if not to_account:
            return (f'Receiving Account with account_id {to_account_id} not '
                    f'found', 404)
        if to_account.status == 'I':
            return (f'Receiving Account with account_id {to_account_id} is '
                    f'inactive', 406)
        to_customer_id = to_account.customer_id
        new_balance = from_account.balance - Decimal(amount)
        if new_balance < 0:
            return (f'Transfer from Bank Account with account_id '
                    f'{account_id} will put it into negative balance',
                    400)
        from_account.balance = new_balance
        to_account.balance += Decimal(amount)
        db.session.commit()
        create_transaction_history_entry(
            from_customer_id, account_id, 'Transfer', -Decimal(amount))
        create_transaction_history_entry(
            to_customer_id, to_account_id, 'Transfer', Decimal(amount))
        return (
            f'${Decimal(amount)} successfully transferred from Bank Account '
            f'with account_id {account_id} to Bank Account with '
            f'account_id {to_account_id}'), 200
    except Exception as e:
        # Log the exception to help diagnose the issue
        print(f"Exception: {str(e)}")
        return 'Unexpected error occurred.', 500


@transaction.route('/normalPayment/<int:account_id>/<float:amount>', methods=['PATCH'])
@is_authenticated
@account_owner
def normal_payment(account_id, amount):
    try:
        customer_id = request.currentUser
        if amount <= 0:
            return f'Payment amount must be positive', 400
        account = AccountInformation.query.get(account_id)
        if not account:
            return f'Bank Account with account_id {account_id} not found', 404
        if account.status == 'I':
            return (f'Bank Account with account_id {account_id} is inactive',
                    406)
        new_balance = account.balance - Decimal(amount)
        if new_balance < 0:
            return (f'Bill payment will put the account with Account ID: '
                    f'{account_id} into negative balance.', 400)
        account.balance = new_balance
        db.session.commit()
        create_transaction_history_entry(
            customer_id, account_id, 'Normal Payment', -Decimal(amount))
        return jsonify(account.serialize()), 200
    except Exception as e:
        # Log the exception to help diagnose the issue
        print(f"Exception: {str(e)}")
        return 'Unexpected error occurred.', 500


@transaction.route('/checkDeposit/<int:account_id>', methods=["POST"])
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
        # extract full name of receiver on the check
        name_text = re.search('pay(\s)*to.*\|', text,
                              flags=re.IGNORECASE).group()
        name = name_text.split(':')[1].split('|')[0].strip()
        # extract the amount deposited
        amount_text = re.search('\$\s[0-9,.]+', text).group().replace(",", "")
        amount = Decimal(re.split('\s', amount_text)[1])
    except Exception:
        return "Can not scan the check. Not in valid format", 400
    try:
        # check if the name on the check matches current user's name
        account = AccountInformation.query.filter_by(
            account_id=account_id).first()
        if account.customer.full_name != name:
            return "Check does not belong to current user", 403

        # deposit the amount to the account
        account.balance += amount
        create_transaction_history_entry(
            customer_id, account_id, 'Deposit', amount)
        db.session.commit()

        return jsonify(account.serialize()), 200
    except Exception as e:
        # Log the exception to help diagnose the issue
        print(f"Exception: {str(e)}")
        return 'Unexpected error occurred.', 500
