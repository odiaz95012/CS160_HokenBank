import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useParams } from 'react-router-dom';


interface Account {
  account_id: number,
  account_type: string,
  balance: number
}
interface InternalTransferProps {
  setAlert?: (alertText: string, alertVariant: string) => void;
  handleAlert?: () => void;
  handleAccountSelect: (selectedAccountId: string) => void;
  handleAmountInput: (e: React.ChangeEvent<HTMLElement>) => void;
}
function InternalTransfer({ handleAlert, setAlert, handleAccountSelect, handleAmountInput }: InternalTransferProps): JSX.Element {
  const { accountID } = useParams() as { accountID: string };
  const [toAccount, setToAccount] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const token = Cookies.get('authToken');
  const [userAccounts, setUserAccounts] = useState<any>([]);
  

  useEffect(() => {
    getUserAccounts();

  }, []);






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
      setAlert && setAlert(`Error fetching accounts: ${err.message}`, 'danger' );
      console.log(err);
    }
  };

  const handleAmount = (e:React.ChangeEvent<HTMLElement>) => {
    const target = e.target as HTMLInputElement;
    setAmount(target.value);
    handleAmountInput(e);
  }


  const handleAccountSelection = (selectedAccountId: string) => {
    setToAccount(selectedAccountId);
    handleAccountSelect(selectedAccountId);
  };

  const formatBalance = (balance: number) => {

    /// Convert the number to a string
    const numStr = balance.toString();

    // Split the number into integer and decimal parts (if applicable)
    const [integerPart, decimalPart] = numStr.split('.');

    // Add commas to the integer part
    const integerWithCommas = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');


    // Reconstruct the formatted number
    if (decimalPart) {
        return integerWithCommas + '.' + decimalPart;
    } else {

        return integerWithCommas + '.00';
    }
};






  return (
    <div>
      <div className="row justify-content-center my-1">
        <div className="d-flex text-center h6 lead">
          <p>Please select the account you would like to transfer to and the desired amount.</p>
        </div>

          
          <div className="col-md-6 mb-4">
              <label className="form-label" htmlFor="accountsList">
                Accounts
              </label>

            <div className="overflow-container">
              {userAccounts.length > 0 ? (
                <ul className="list-group">
                  {userAccounts.map((account: Account) => (
                    <li key={account.account_id} className="list-group-item">
                      <input
                        className="form-check-input me-1"
                        name="toAccountID"
                        type="radio"
                        value={account.account_id}
                        id={account.account_id.toString()}
                        checked={toAccount === account.account_id.toString()}
                        onChange={() => handleAccountSelection(account.account_id.toString())}
                      />
                      <label className="form-check-label" htmlFor={account.account_id.toString()}>
                        Account ID: {account.account_id}
                      </label>
                      <label className="form-check-label ps-3" htmlFor={account.account_id.toString()}>
                        Balance: ${formatBalance(account.balance)}
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
                onChange={handleAmount}
              />
            </div>
          </div>
          <br />

        
        <br />
        <br />

      </div>
    </div>
  );
}

export default InternalTransfer;
