
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import axios from 'axios';


function CloseAccount() {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const goToLoginPage = () => {
        navigate('/');
    };
    const gotoAccoutnPage = () => {
        navigate('/accountPage');
    }
    const passwordHandler = (e) => {
        e.preventDefault();
        if (password.trim() === '') {
            setError("Enter your password");
        } else {
            setError("");
        }
    };











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
                <form onSubmit={passwordHandler}>
                    <div className="form-group">
                        <label htmlFor="password">Password Confirm</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <p className="text-danger">{error}</p>
                    <div className="form-group">
                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            Confirm
                        </button>
                    </div>
                </form>
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
