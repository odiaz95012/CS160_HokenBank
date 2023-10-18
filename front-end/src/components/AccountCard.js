import React from 'react';


function AccountCard(props) {
  const { account_id, account_type, account_balance } = props;

  //style={{ width: '18rem', height: '15rem' }}
  return (
    <div className="col-md-4 px-2" >
      <div className="card my-3">
        <div className="card-body account-card">
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
          <h5 className="card-title mb-4">Balance: {account_balance}</h5>
          <a href="#" className="btn btn-primary mb-3">View Account Details<i className="bi bi-arrow-left ms-2"></i></a>
        </div>
      </div>

    </div>
  );
}

export default AccountCard;
