import React from 'react';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import CloseAccount from './CloseAccount';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

interface CloseAccountModalProps {
    setAlert?: (alertText: string, alertVariant: string) => void;
    handleAlert?: () => void;
}

function NavBarCloseAccount({ handleAlert, setAlert }: CloseAccountModalProps): JSX.Element {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);



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
        setPassword('');
        setShow(false);
    };

    const getCustomerToken = async () => {
        const authToken = Cookies.get('authToken');
        return authToken;
    };

    return (
        <>
            <span onClick={handleShow} style={{ border: 'none', background: 'none', outline: 'none' }}>
                Close Account
            </span>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Close Account</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CloseAccount onInputChange={handlePasswordInput} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={async () => {
                        const authToken = await getCustomerToken();
                        if (authToken) {
                            closeAccount(authToken, password);
                        };
                    }}>
                        Close Account
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default NavBarCloseAccount;