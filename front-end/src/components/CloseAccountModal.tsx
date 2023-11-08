import React, { useEffect, useState } from 'react';
import PopUpModal from './PopUpModal';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import CloseAccount from './CloseAccount';

interface CloseAccountModalProps {
    handleAlert?: (alertText: string, alertVariant: string) => void;
}
function CloseAccountModal({handleAlert}: CloseAccountModalProps): JSX.Element {

    //Latest
    const navigate = useNavigate();

    const [password, setPassword] = useState<string>('');

    const handlePasswordInput = (e: React.ChangeEvent<HTMLElement>) => {
        const target = e.target as HTMLInputElement;
        setPassword(target.value);
    }


    const closeAccount = (authToken: string, password: string) => {
        if (password === '') {
            handleAlert && handleAlert("Enter your password", "danger");
            return;
        }
        axios.patch("http://localhost:8000/deactivateCustomer", {
            password: password
        }, {
            headers: {
                'authorization': `Bearer ${authToken}`
            }
        }).then(() => {
            Cookies.remove('authToken');
            navigate('/');
        })
            .catch((err) => {
                console.log(err);

            });
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
                body={<>
                    <CloseAccount 
                    onInputChange={handlePasswordInput}
                    />
                </>}
                closeBttnText={"Yes, I'm sure"}
                additionalBttnText={"Cancel"}
                closeOnSubmit={true}
                submitAction={async () => {
                    const authToken = await getCustomerToken();
                    if (authToken && password) {
                        closeAccount(authToken, password);
                    }
                }}
                closeBtnVariant='danger'
            />
        </>
    )
}

export default CloseAccountModal;