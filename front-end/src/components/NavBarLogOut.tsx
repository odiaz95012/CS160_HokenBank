import React from 'react';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';


function NavBarLogOut(): JSX.Element {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const navigate = useNavigate();

    const logout = () => {
        Cookies.remove('authToken');
        navigate("/");
    }

    return (
        <>
            <span onClick={handleShow} style={{ border: 'none', background: 'none', outline: 'none' }}>
                Log Out
            </span>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Log Out</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center">
                        <p className="lead">Are you sure you want to logout?</p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={logout}>
                        Log Out
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default NavBarLogOut;