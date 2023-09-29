from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy



app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///CustomerInformation.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)
db = SQLAlchemy(app)

class CustomerInformation(db.Model):
    customer_id = db.Column("customer_id", db.Integer, primary_key=True)
    username = db.Column(db.String(18))
    email = db.Column(db.String(45))
    password = db.Column(db.String(18))
    name = db.Column(db.String(100))
    age = db.Column(db.Integer)
    gender = db.Column(db.String(1))
    zipcode = db.Column(db.Integer)
    balance_due = db.Column(db.Float)
    status = db.Column(db.String(1))

    def __init__(self, customer_id: int, username: str, email: str, password: str, name: str, age: int, gender: str, zipcode: int, balance_due: float, status: str):
        self.customer_id = customer_id
        self.username = username
        self.email = email
        self.password = password
        self.name = name
        self.age = age
        self.gender = gender
        self.zipcode = zipcode
        self.balance_due = balance_due
        self.status = status

@app.route("/createCustomer", methods=['POST'])
def createCustomer():
    # Get the values from request parameters, query string, or any other source
    customer_id = int(request.args.get('customer_id'))
    username = request.args.get('username')
    email = request.args.get('email')
    password = request.args.get('password')
    name = request.args.get('name')
    age = int(request.args.get('age'))
    gender = request.args.get('gender')
    zipcode = int(request.args.get('zipcode'))
    balance_due = float(request.args.get('balance_due'))
    status = request.args.get('status')

    # Create a customer object with the provided values
    customer = CustomerInformation(
        customer_id=customer_id,
        username=username,
        email=email,
        password=password,
        name=name,
        age=age,
        gender=gender,
        zipcode=zipcode,
        balance_due=balance_due,
        status=status
    )

    # Add the customer to the database session and commit the changes
    db.session.add(customer)
    db.session.commit()

    return "Customer created successfully"

# Delete a customer by customer_id
@app.route("/deleteCustomer/<int:customer_id>", methods=['DELETE'])
def deleteCustomer(customer_id):
    customer = CustomerInformation.query.get(customer_id)
    
    if customer:
        db.session.delete(customer)
        db.session.commit()
        return f"Customer with customer_id {customer_id} deleted successfully"
    else:
        return f"Customer with customer_id {customer_id} not found", 404

# Get all customers
@app.route("/getCustomers", methods=["GET"])
def getCustomers():
    customers = CustomerInformation.query.all()
    customer_list = []

    for customer in customers:
        customer_data = {
            "customer_id": customer.customer_id,
            "username": customer.username,
            "email": customer.email,
            "password": customer.password,
            "name": customer.name,
            "age": customer.age,
            "gender": customer.gender,
            "zipcode": customer.zipcode,
            "balance_due": customer.balance_due,
            "status": customer.status
        }
        customer_list.append(customer_data)

    return jsonify(customer_list)

@app.route("/")
def index():
    return ("Hello World")




if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port= 8000, host="0.0.0.0")
