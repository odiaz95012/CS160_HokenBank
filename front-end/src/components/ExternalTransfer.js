import React from 'react';
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';


function ExternalTransfer(onSubmit, onClose) {
    const navigate = useNavigate();
    const [accountID, setAccountID] = useState('');
    const [amount, setAmount] = useState('');
    const [accountIDError, setAccountIDError] = useState('');
    const [amountError, setAmountError] = useState('');

    const handSubmit = (e) => {
        e.preventDefault();
        if (accountID.trim() === '') {
            setAccountIDError("Enter a valid account ID");
        } else {
            setAccountIDError("");
        }
        if (amount.trim() === "" || parseFloat(amount) <= 0) {
            setAmountError("Enter a valid amount");
        }
        else {
            setAmountError("");


        }
    }
    const gotoAccountPage = () => {
        navigate('/accountPage');
    }

    return (
        <div>

            {/* main form */}
            <div className="container mt-5">
                <p className="text-center">Send</p>
                <form onSubmit={handSubmit} >
                    <div className="input-group rounded">
                        <input
                            type="text"
                            className="form-control rounded"
                            placeholder="Enter Account ID of Account to send to"
                            value={accountID}
                            onChange={(e) => setAccountID(e.target.value)}

                        />
                    </div>
                    <p className="text-danger">{accountIDError}</p>

                    <div className="input-group rounded">
                        <input
                            type="number"
                            className="form-control rounded"
                            placeholder="Enter Amount $"
                            aria-label="Search"
                            aria-describedby="search-addon"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                    <p className="text-danger">{amountError}</p>

                    <div className="text-center">
                        <button type="submit" className="btn btn-primary">Confirm</button>
                    </div>
                </form>
                <br />

            </div>


        </div>


    )
}

export default ExternalTransfer
