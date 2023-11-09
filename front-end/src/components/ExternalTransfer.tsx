import React, { useState } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import PopUpAlert from './PopUpAlert';

interface Account {
  account_id: number;
  account_type: string;
  balance: number;
}

function InternalTransfer() {
  const navigate = useNavigate();
  const { accountID } = useParams() as { accountID: string };
  const [toAccount, setToAccount] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const token = Cookies.get('authToken');
  const [alert, setAlert] = useState<{ text: string; variant: string } | null>(null);

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



  return (
    <div>
      <div className="row justify-content-center my-1">
        <div className="d-flex justify-content-center" id="pop-up-alert">
          {alert ? <PopUpAlert text={alert.text} variant={alert.variant} /> : null}
        </div>
        <div className="d-flex justify-content-center">
          <p>SENT</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group rounded">
            <input
              type="text"
              className="form-control rounded"
              placeholder="To Account"
              value={toAccount}
              onChange={(e) => setToAccount(e.target.value)}
            />
          </div>
          <br />

          <div className="input-group rounded">
            <input
              type="text"
              className="form-control rounded"
              placeholder="Enter Amount $"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <br />

          <div className="text-center">
            <button type="submit" className="btn btn-primary">
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InternalTransfer;
