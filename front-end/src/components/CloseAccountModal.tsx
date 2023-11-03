import React from 'react';
import PopUpModal from './PopUpModal';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

function CloseAccountModal() {
    //latest 
    const navigate = useNavigate();
    const closeAccount = (authToken: string) => {
        axios.patch("http://localhost:8000/deactivateCustomer", {}, {
            headers: {
                'authorization': `Bearer ${authToken}`
            }
        }).then(() => {
            Cookies.remove('authToken');
            navigate('/');
        })
            .catch((err) => console.log(err));
    };

    const getCustomerToken = async () => {
        const authToken = Cookies.get('authToken');
        return authToken;
    };


    return (
        <>
            <PopUpModal
                activatingBttn={
                    <button type="button" className="nav-link btn btn-outline-secondary nav-bar-bttn">
                        <i className="bi bi-door-closed-fill me-2"></i>Close Account
                    </button>}
                data-toggle="modal"
                data-target="#exampleModal"
                title={<div>Close Account</div>}
                body={
                    <div className='container text-center my-4'>
                        <p className='h6 text-danger'>
                            ARE YOU SURE YOU WANT TO CLOSE YOUR ACCOUNT?
                            <br /><br />
                            THIS ACTION CANNOT BE UNDONE.
                        </p>
                    </div>
                }
                closeBttnText={"Yes, I'm sure"}
                additionalBttnText={"Cancel"}
                closeOnSubmit={true}
                submitAction={async () => {
                    const authToken = await getCustomerToken();
                    if (authToken) {
                        closeAccount(authToken);
                    }
                }}

            />
        </>
    )
}

export default CloseAccountModal;