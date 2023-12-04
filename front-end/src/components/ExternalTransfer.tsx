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
interface ExternalTransferProps {
  setAlert?: (alertText: string, alertVariant: string) => void;
  handleAlert?: () => void;
  handleExternalTransferInput: (e: React.ChangeEvent<HTMLElement>) => void;
}

function ExternalTransfer({ handleAlert, setAlert, handleExternalTransferInput }: ExternalTransferProps): JSX.Element {
  const { accountID } = useParams() as { accountID: string };
  const [toAccount, setToAccount] = useState<string>('');
  const [amount, setAmount] = useState<string>('');



  const handleAmount = (e: React.ChangeEvent<HTMLElement>) => {
    const target = e.target as HTMLInputElement;
    setAmount(target.value);
    handleExternalTransferInput(e);
  };

  const handleAccount = (e: React.ChangeEvent<HTMLElement>) => {
    const target = e.target as HTMLInputElement;
    setToAccount(target.value);
    handleExternalTransferInput(e);
  };



  return (
    <div>
      <div className="row justify-content-center my-1">
        <div className="d-flex justify-content-center">
          <p className='lead'>Please enter the required details</p>
        </div>

        <div className='d-flex'>
          <label className='form-label' htmlFor='toAccountID'>Recepient Account ID</label>
        </div>
        <div className="input-group rounded">
          <input
            type="number"
            min={0}
            className="form-control rounded"
            placeholder="Destination Account ID"
            value={toAccount}
            onChange={handleAccount}
            name="toAccountID"
            id="toAccountID"
          />
        </div>
        <br />
        <div className='d-flex pt-2'>
          <label className='form-label' htmlFor='amount'>Amount</label>
        </div>
        <div className="input-group rounded">
          <input
            type="number"
            min={0}
            name="amount"
            className="form-control rounded"
            placeholder="Enter Amount $"
            value={amount}
            onChange={handleAmount}
            id="amount"
          />
        </div>
        <br />
      </div>
    </div>
  );
}

export default ExternalTransfer;
