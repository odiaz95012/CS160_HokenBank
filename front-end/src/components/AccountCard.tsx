import React from 'react';
import '../componentStyles/AccountCardStyles.css';
import { useNavigate } from 'react-router-dom';

interface AccountCardProps {
    account_id: number,
    account_type: string,
    account_balance: number,
    showDetailsBttn: boolean,
    onSelectAccount: Function,
    isSelected: boolean,
    caller: string
  }
function AccountCard(props:AccountCardProps): JSX.Element {
  //latest version

  const navigate = useNavigate();

  const { account_id, account_type, account_balance, showDetailsBttn, onSelectAccount, isSelected, caller } = props;

  const handleAccountSelection = () => {
    if (caller === 'atm') {
      onSelectAccount({ account_id, account_type, account_balance });
    }
  };

  const viewAccountDetails = () => {
    // Construct the route path with the account ID parameter.
    const accountDetailsPath = `/accountDetails/${account_id}`;
  
    // Navigate to the account details page.
    navigate(accountDetailsPath);
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
    <div className="col-12 col-md-4 px-2" onClick={handleAccountSelection}>
      <div className="card my-3">
        <div className={`card-body account-card account${isSelected ? '-selected' : ''}`}>
          <div className="position-absolute top-0 end-0 me-3 mt-1">
            {/*Render different icons depending on the type of account*/}
            {
              account_type === 'Checking' ? (
                <i className="bi bi-card-checklist" style={{ fontSize: '25px' }}></i>
              ) : (

                <i className="bi bi-piggy-bank" style={{ fontSize: '25px' }}></i>
              )
            }
          </div>
          <h5 className="card-title mt-1 mb-4">Account ID: {account_id}</h5>
          <h5 className="card-title mb-4">Account Type: {account_type}</h5>
          <h5 className="card-title mb-4">Balance: ${formatBalance(account_balance)}</h5>
          {showDetailsBttn ? (
            <a href="#" className="btn btn-primary mb-3" onClick={viewAccountDetails}>View Account Details<i className="bi bi-arrow-left ms-2"></i></a>
          ) : (null)}
        </div>
      </div>

    </div>
  );
}

export default AccountCard;
