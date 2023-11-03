from models.customer import CustomerInformation
from models.account import AccountInformation
from models.automatic_payment import AutomaticPayments
from functools import wraps
from flask import request
import jwt

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
