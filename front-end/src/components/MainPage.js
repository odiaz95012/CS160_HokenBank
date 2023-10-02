import React from 'react'
import { useNavigate } from 'react-router-dom';

function MainPage() {
    const navigate = useNavigate();

    const goToLoginPage = () => {
        navigate('/');
    };
    const goToBillPage = () => {
        navigate('/billpay');
    }
    return (
        <div>
            <button class="btn btn-primary" onClick={goToLoginPage}>Log out</button>
            <button class="btn btn-primary" onClick={goToAutoPay}>AutoPay</button>
            {/* <button onClick={goToBillPage}>Bill Payment</button>
            <button onClick={gotoAutoPage}>setAutoPaymet</button>
            <button onClick={gotoOpenAccount}>Open Account</button> */}
            <div>
                <h1>Account:</h1>
                <p>AccountID:</p>
                <p>Account Type</p>
                <p>Balance</p>
            </div>



        </div>
    )
}
export default MainPage

