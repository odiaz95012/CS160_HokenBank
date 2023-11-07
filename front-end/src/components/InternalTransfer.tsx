import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import PopUpAlert from './PopUpAlert';

interface Alert {
  text: string;
  variant: string;
}
interface Account {
  account_id: number,
  account_type: string,
  balance: number
}
function InternalTransfer() {
  const navigate = useNavigate();
  const { accountID } = useParams() as { accountID: string };
  const [toAccount, setToAccount] = useState<string>('');
  const [alert, setAlert] = useState<{ text: string; variant: string } | null>(null);

  const [amount, setAmount] = useState<string>('');
  const token = Cookies.get('authToken');
  const [userAccounts, setUserAccounts] = useState<any>([]);

  useEffect(() => {
    getUserAccounts();
  }, []);

  const gotoAccountPage = () => {
    navigate('/accountPage');
  };

  const isValidAmount = (amount: string) => {
    const pattern = /^\d+\.\d{2}$/;
    return pattern.test(amount) && parseFloat(amount) > 0;
  };

  const isValidAccount = (account: string) => {
    const pattern = /^\d+$/;
    return pattern.test(account) && parseInt(account) > 0;
  };

  const handleAlert = () => {
    const alertElem = document.getElementById('pop-up-alert');
    alertElem!.style.visibility = 'visible';
    setTimeout(() => {
      setAlert(null);
      alertElem!.style.visibility = 'hidden';
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('submit');
    console.log(toAccount);
    console.log(amount);
    console.log(accountID);
    if (!isValidAccount(toAccount) || toAccount === '') {
      setAlert({ text: 'Invalid account.', variant: 'danger' });
      handleAlert();


    } else if (!isValidAmount(amount) || amount === '') {
      setAlert({ text: 'Invalid amount.', variant: 'danger' });
      handleAlert();
    } else {
      transfer();
    }
  };

  const transfer = async () => {
    const parsedAccountId = parseInt(toAccount);
    const parsedAmount = parseFloat(amount).toFixed(2);

    try {
      const response = await axios.patch(
        `http://localhost:8000/transfer/${accountID}/${parsedAccountId}/${parsedAmount}`,
        {},
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      setAlert({ text: 'Transfer successful.', variant: 'success' });
      handleAlert();
      setToAccount('');
      setAmount('');
    } catch (err: any) {
      setAlert({ text: `Transfer failed: ${err.message}`, variant: 'danger' });
      handleAlert();
    }
  };

  const getUserAccounts = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/getCustomerAccounts`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      let accounts: Account[] = response.data;
      // Filter out the account that is being transferred from
      accounts = accounts.filter((account: Account) => account.account_id !== parseInt(accountID));
      setUserAccounts(accounts);
    } catch (err: any) {
      setAlert({ text: `Error fetching accounts: ${err.message}`, variant: 'danger' });
      console.log(err);
    }
  };

  const handleAccountSelection = (selectedAccount: string) => {
    setToAccount(selectedAccount);
  };

  return (
    <div>
      <div className="row justify-content-center my-1">
        <div className="d-flex justify-content-center" id="pop-up-alert">
          {alert ? <PopUpAlert text={alert.text} variant={alert.variant} /> : null}
        </div>
        <div className="d-flex justify-content-center">
          <p>Please enter the required payment details</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="col-md-6 mb-4">
            <label className="form-label" htmlFor="accountsList">
              Accounts
            </label>
            <div className="overflow-container">
              {userAccounts.length > 0 ? (
                <ul className="list-group">
                  {userAccounts.map((account: any) => (
                    <li key={account.account_id} className="list-group-item">
                      <input
                        className="form-check-input me-1"
                        name="accountSelection"
                        type="radio"
                        value={account.account_id}
                        id={account.account_id.toString()}
                        checked={account.account_id === toAccount}
                        onChange={() => handleAccountSelection(account.account_id)}
                      />
                      <label className="form-check-label" htmlFor={account.account_id.toString()}>
                        Account ID: {account.account_id}
                      </label>
                      <label className="form-check-label ps-3" htmlFor={account.account_id.toString()}>
                        Balance: ${account.balance}
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <div>
                  <p className="text-danger">There are no active accounts.</p>
                </div>
              )}
            </div>
          </div>
          <div className="col-md-6 mb-4">
            <div className="form-outline">
              <div className="d-flex justify-content-start">
                <label className="form-label" htmlFor="validationCustom01">
                  Amount
                </label>
              </div>
              <input
                name="amount"
                type="text"
                id="validationCustom01"
                className="form-control"
                placeholder="$"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          <br />
          <div className="text-center">
            <button type="submit" className="btn btn-primary">
              Confirm
            </button>
          </div>
        </form>
        <br />
        <br />

      </div>
    </div>
  );
}

export default InternalTransfer;
