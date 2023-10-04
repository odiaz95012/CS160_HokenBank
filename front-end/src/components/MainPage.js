import React from 'react'
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';


function MainPage() {
    const navigate = useNavigate();

    const goToLoginPage = () => {
        navigate('/');
    };
    const goToBillPage = () => {
        navigate('/billpay');
    }
    const getAuthToken = () => {
        const authToken = Cookies.get('authToken');
        console.log(authToken);
    };
    return (
        <div>
            <button class="btn btn-primary" onClick={goToLoginPage}>Log out</button>
            <button class="btn btn-primary" onClick={getAuthToken}>AutoPay</button>
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
export default MainPage;

