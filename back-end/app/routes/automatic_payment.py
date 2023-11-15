from flask import Blueprint, request, jsonify
from models.account import AccountInformation
from models.customer import CustomerInformation
from models.automatic_payment import AutomaticPayments
from models import db
from helpers.middleware import is_authenticated, account_owner
from helpers.helpers import create_automatic_payment_entry, delete_automatic_payment_entry, create_transaction_history_entry
from decimal import Decimal
from datetime import datetime
import pandas
import pytz
from urllib.parse import unquote

automaticPayment = Blueprint('automatic_payment', __name__)


# setting up automatic payment
# note: flask can't take datetime representation of date, so needs to be
# converted to datetime from string
# pandas parses datetime from string in format YYYY-MM-DD
@automaticPayment.route('/automaticPayment/<int:account_id>/<float:amount>/<string:date>',
                        methods=['PATCH'])
@is_authenticated
@account_owner
def automatic_payment(account_id, amount, date):
    try:
        account = AccountInformation.query.get(account_id)
        if not account:
            return f'Bank Account with account_id {account_id} not found', 404
        if account.status == 'I':
            return (f'Bank Account with account_id {account_id} is inactive',
                    406)

        # check valid amount
        if Decimal(amount) <= 0:
            return f'Payment amount must be positive', 400
        elif Decimal(amount) > account.balance:
            return f'Payment may not exceed balance', 400

        # take datetime
        date_time = pandas.to_datetime(unquote(date)).to_pydatetime()
   
        # convert local time to utc for comparison
        utc_date = date_time.astimezone(pytz.utc)

        # check that date is in future
        if utc_date.date() < datetime.now().astimezone(pytz.utc).date():
            return f'Date must not be in past', 4007


        create_automatic_payment_entry(account.customer_id, account_id,
                                       Decimal(amount), date_time)
        return (
            f'Payment of ${Decimal(amount)} successfully scheduled for Bank '
            f'Account with account_id {account_id} and date {date_time.date()}'), 200
    except Exception as e:
        # Log the exception to help diagnose the issue
        print(f"Exception: {str(e)}")
        return 'Unexpected error occurred.', 500


@automaticPayment.route('/cancelAutomaticPayment/<int:payment_id>', methods=['PATCH'])
@is_authenticated
def cancel_automatic_payment(payment_id):
    try:
        customer_id = request.currentUser
        payment = AutomaticPayments.query.filter(
            AutomaticPayments.payment_id == payment_id,
            AutomaticPayments.customer_id == customer_id
        ).first()

        if payment:
            db.session.delete(payment)  # Delete the record
            db.session.commit()  # Commit the transaction
            return jsonify(
                message=f'Automatic payment with the payment id: {payment_id} was successfully cancelled'), 200
        else:
            return jsonify(
                message=f'No automatic payment with the payment id: {payment_id} was found.'), 404
    except Exception as e:
        # Log the exception to help diagnose the issue
        print(f"Exception: {str(e)}")
        return 'Unexpected error occurred.', 500


# upcoming automatic payments
@automaticPayment.route('/getUpcomingPayments/<int:number>', methods=['GET'])
@is_authenticated
def get_upcoming_payments(number):
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
        return jsonify(upcoming_payments), 200
    except Exception as e:
        # Log the exception to help diagnose the issue
        print(f"Exception: {str(e)}")
        return 'Unexpected error occurred.', 500
