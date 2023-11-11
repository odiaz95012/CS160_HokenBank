import React, { useEffect, useState } from 'react';
import PopUpModal from './PopUpModal';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import CloseAccount from './CloseAccount';

interface CloseAccountModalProps {
    setAlert?: (alertText: string, alertVariant: string) => void;
    handleAlert?: () => void;
}
function CloseAccountModal({handleAlert, setAlert}: CloseAccountModalProps): JSX.Element {

    //Latest
    const navigate = useNavigate();

    const [password, setPassword] = useState<string>('');

    const handlePasswordInput = (e: React.ChangeEvent<HTMLElement>) => {
        const target = e.target as HTMLInputElement;
        setPassword(target.value);
    }


    const closeAccount = (authToken: string, password: string) => {
        if (password === '') {
            setAlert && setAlert("Please enter your password to close your account.", "warning");
            handleAlert && handleAlert();
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
                setAlert && setAlert(err.response.data, "danger");
                handleAlert && handleAlert();
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
                    if (authToken) {
                        closeAccount(authToken, password);
                    }
                }}
                closeBtnVariant='danger'
            />
        </>
    )
}

export default CloseAccountModal;