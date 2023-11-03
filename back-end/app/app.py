from models import db
from models.automatic_payment import AutomaticPayments
from models.account import AccountInformation
from flask import Flask
from flask_cors import CORS
from datetime import datetime
import pandas
from apscheduler.schedulers.background import BackgroundScheduler
import pytz
from helpers.helpers import create_bank_manager, create_transaction_history_entry, delete_automatic_payment_entry
from routes.account import account
from routes.automatic_payment import automaticPayment
from routes.customer import customer
from routes.transaction import transaction
from routes.history import history


app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///CustomerInformationRevised.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

sched = BackgroundScheduler()

CORS(app)
db.init_app(app)

app.register_blueprint(customer)
app.register_blueprint(transaction)
app.register_blueprint(history)
app.register_blueprint(account)
app.register_blueprint(automaticPayment)

INTEREST_RATE = 1.05


@app.route('/')
def index():
    return 'Hello World'


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        create_bank_manager()

    app.run(debug=True, port=8000, host='0.0.0.0')


# executing automatic payment, job should auto-execute when server is running
def automatic_payment_job(payment_id):
    with app.app_context():
        # access payment
        autopayment = AutomaticPayments.query.get(payment_id)
        # access account
        account = AccountInformation.query.get(autopayment.account_id)

        new_balance = account.balance - autopayment.amount
        # placeholder before grace period implement
        if new_balance < 0:
            delete_automatic_payment_entry(payment_id)

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
                     AutomaticPayments.date == datetime.now().astimezone(pytz.utc).date()))
        if (due_today):
            for due in due_today:
                automatic_payment_job(due.payment_id)
        over_due = (AutomaticPayments.query.filter(
            AutomaticPayments.date < datetime.now().astimezone(pytz.utc).date()))
        if (over_due):
            for due in over_due:
                automatic_payment_job(due.payment_id)

# schedule this job once a year (5% annual interest)


def interest_accumulation():
    with app.app_context():
        db.session.query(AccountInformation).filter(
            AccountInformation.status == "A",
            AccountInformation.account_type == "Savings").update(
            {'balance': AccountInformation.balance * INTEREST_RATE})
        db.session.commit()


# add two jobs to sched
# original times
# sched.add_job(automatic_payment_cycle,'cron', hour=0, minute = 0)
# sched.add_job(interest_accumulation,'cron', month = 1, day = 1, hour = 0, minute = 0)
sched.add_job(automatic_payment_cycle, 'cron', minute='*')
# sched.add_job(interest_accumulation, 'cron', minute = '*')
sched.start()
# atexit.register(lambda: sched.shutdown())
