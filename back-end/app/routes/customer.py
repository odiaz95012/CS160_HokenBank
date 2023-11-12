from flask import Blueprint, request, jsonify
from models.customer import CustomerInformation
from models.account import AccountInformation
import jwt
from models import db
from helpers.middleware import is_authenticated, is_admin
from decimal import Decimal
from . import bcrypt

customer = Blueprint('customer', __name__)

SECRET_KEY = "secret"


@customer.route('/login', methods=['POST'])
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
                f'enter a valid username.'), 404
    if customer.status == 'I':
        return (f'Customer account with username {username} has been '
                f'deactivated.\nPlease enter a valid username.'), 406

    if not bcrypt.check_password_hash(customer.password, password):
        return "Invalid Password", 401

    token = jwt.encode({"customer_id": customer.customer_id}, SECRET_KEY)

    return jsonify({"token": token}), 200


@customer.route('/register', methods=['POST'])
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
@customer.route('/deactivateCustomer', methods=['PATCH'])
@is_authenticated
def deactivate_customer():
    customer_id = request.currentUser
    customer = CustomerInformation.query.get(customer_id)
    if not customer:
        return (f'Customer Account with customer_id {customer_id} not found',
                404)
    if customer.status == 'I':
        return (f'Customer Account with customer_id {customer_id} is '
                f'inactive', 406)
    try:
        # set all active accounts to 0 balance and 'I' status
        db.session.query(AccountInformation).filter(
            AccountInformation.customer_id == customer.customer_id,
            AccountInformation.status == 'A').update(
            {'balance': Decimal(0), 'status': 'I'})
        customer.status = 'I'
        db.session.commit()
        return (f'Customer Account with customer_id {customer_id} '
                f'deactivated successfully')
    except Exception:
        return 'Unexpected error occurred.', 500


# Retrieve customer info by customer_id
@customer.route('/getCustomer', methods=['GET'])
@is_authenticated
def get_customer_by_id():
    customer_id = request.currentUser
    try:
        customer = CustomerInformation.query.get(customer_id)
        if not customer:
            return jsonify({'error': f'Customer Account with customer_id '
                                     f'{customer_id} not found'}), 404
        # add additional check for 'I' status?
        return jsonify(customer.serialize())

    except Exception:
        return 'Unexpected error occurred.', 500


# Get all customers
@customer.route('/getCustomers', methods=['GET'])
@is_authenticated
@is_admin
def get_customers():
    customers = CustomerInformation.query.all()
    customer_list = []

    try:
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
    except Exception:
        return 'Unexpected error occurred.', 500
