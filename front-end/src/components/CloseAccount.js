// @app.route('/closeAccount/<int:account_id>', methods = ['PATCH'])
// @is_authenticated
// @account_owner
// def close_account(account_id):
// account = AccountInformation.query.get(account_id)
// if not account:
//     return f'Bank Account with account_id {account_id} not found', 404
// if account.status == 'I':
//     return (f'Bank Account with account_id {account_id} is inactive',
//         404)
// if request.method == 'PATCH':
//     account.balance = float(0)
// account.status = 'I'
// db.session.commit()
// return (f'Bank Account with account_id {account_id} '
//                 f'closed successfully')


import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import axios from 'axios';


function CloseAccount() {
    const navigate = useNavigate();
    const [accountID, setAccountID] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);



    const handleConfirm = async (authToken, customer_id) => {
        try {
            const authToken = Cookies.get('authToken');
            const response = await axios.patch(`http://localhost:8000/closeAccount/${accountID}`, null, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.status === 200) {
                setSuccessMessage('Bank Account closed successfully');
            }
        } catch (err) {
            setError('Failed to close the bank account');
        }
    };


    const getCustomerToken = async () => {
        const authToken = Cookies.get('authToken');
        return authToken;
    };
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                //Retrieve the customer id and auth token, authToken is at index 0 and customer_id is at index 1 
                const customerAuth = await getCustomerToken();
                //Retrieve the customer details
                await handleConfirm(customerAuth);



                setIsUserDataLoaded(true);
            } catch (err) {
                setIsUserDataLoaded(false);
                console.log(err);
            }
        }

        fetchUserData();
    }, []);
    const goToLoginPage = () => {
        navigate('/');
    };
    const gotoAccoutnPage = () => {
        navigate('/accountPage');
    }











    return (
        <div>
            {/* navigate bar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container px-5">
                    <img
                        src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/lotus.webp"
                        style={{ width: '85px' }}
                        alt="logo"
                    />
                    <a className="navbar-brand" href="#!">Hoken</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                            <li className="nav-item"><a className="nav-link active" aria-current="page" href="#!">Home</a></li>
                            <li className="nav-item"><a className="nav-link" href="#!">About</a></li>
                            <li className="nav-item"><a className="nav-link" href="#!">Contact</a></li>
                            <li className="nav-item"><a className="nav-link" href="#!">Services</a></li>
                            <li className="nav-item"><button id="logoutBttn" type="button" className="btn btn-primary">Logout</button></li>
                        </ul>
                    </div>
                </div>
            </nav>
            <div className="container mt-5">
                <h2>Close Bank Account</h2>
                <div className="form-group">
                    <label htmlFor="accountID">Account ID</label>
                    <input
                        type="number"
                        className="form-control"
                        id="accountID"
                        placeholder="Enter your account ID"
                        value={accountID}
                        onChange={(e) => setAccountID(e.target.value)}
                    />
                </div>
                {error && <p className="text-danger">{error}</p>}
                {successMessage && <p className="text-success">{successMessage}</p>}
                <div className="form-group">
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleConfirm && goToLoginPage}
                    >
                        Confirm
                    </button>
                </div>
                <br />
                <div className="form-group">
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={gotoAccoutnPage}
                    >
                        Cancel
                    </button>
                </div>
            </div>



        </div >
    )
}

export default CloseAccount
