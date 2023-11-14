import React, { useState } from 'react';
import { Button, InputGroup, Modal, Row, Col, Form } from 'react-bootstrap';
import '../componentStyles/ForgotPasswordStyles.css';
import axios from 'axios';

interface ForgotPasswordProps {
    setAlert?: (alertText: string, alertVariant: string) => void;
    handleAlert?: () => void;
}

function ForgotPassword({ handleAlert, setAlert }: ForgotPasswordProps): JSX.Element {
    const [show, setShow] = useState(false);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [emailExists, setEmailExists] = useState(false);

    const handleClose = () => {
        setShow(false);
        // Reset states when closing the modal
    };

    const handleShow = () => setShow(true);

    const checkEmail = async () => {
        if (email === '') {
            setAlert && setAlert('Please enter an email address to reset your password.', 'warning');
            handleAlert && handleAlert();
            handleClose();
            return;
        }
        try {
            axios.get(`http://localhost:8000/checkEmail?email=${email}`)
                .then((response) => {
                    if (response.status === 200) {
                        setEmailExists(true);
                    }
                }).catch(() => {
                    setAlert && setAlert(`An account with the email ${email} does not exist.`, 'danger');
                    handleAlert && handleAlert();
                    handleClose();
                    setEmail('');
                    setEmailExists(false);
                })

        } catch (error) {
            console.log(error);
        }
    };

    const resetPassword = async () => {
        if (email === '' || password === '' || confirmPassword === '') {
            setAlert && setAlert('Please enter all fields to reset your password.', 'warning');
            handleAlert && handleAlert();
            handleClose();
            return;

        }
        if (password !== confirmPassword) {
            setAlert && setAlert('Passwords do not match.', 'warning');
            handleAlert && handleAlert();
            handleClose();
            return;
        }
        axios.patch(`http://localhost:8000/resetPassword`, {
            email: email,
            new_password: password
        }).then((response) => {
            if (response.status === 200) {
                setAlert && setAlert(`Password successfully reset.`, 'success');
                handleAlert && handleAlert();
                handleClose();
                setEmail('');
                setEmailExists(false);
            }
        }).catch((err: any) => {
            console.log(err);
            setAlert && setAlert(err.response.data.error, 'danger');
            handleAlert && handleAlert();
            handleClose();
            setEmail('');
            setEmailExists(false);
        })
    };

    const handleEmailSubmit = async () => {
        // If the email was already proven to exist then we can change the password
        if (emailExists) {
            resetPassword();
        } else { // Check if input email exists in db
            checkEmail();
        }

    };

    return (
        <>
            <a onClick={handleShow} id="forgot-password">
                Forgot Password?
            </a>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Account Recovery</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col md={12}>
                            <p className='text-center'>Please enter your email address</p>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <InputGroup className="mt-4">
                                <InputGroup.Text id="email">Email</InputGroup.Text>
                                <Form.Control
                                    placeholder="Please enter your email"
                                    aria-label="email"
                                    aria-describedby="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {emailExists ? (
                                    <span>
                                        <i className="bi bi-check" 
                                        style={{
                                            color: 'green', 
                                            position: 'absolute', 
                                            right: '10px',
                                            fontSize: '25px'
                                        }}
                                        />
                                    </span>
                                ) : (null)}
                            </InputGroup>

                        </Col>
                    </Row>
                    {emailExists && (
                        <>
                            <Row>
                                <Col md={12}>
                                    <InputGroup className="mt-4">
                                        <InputGroup.Text id="password">Change Password</InputGroup.Text>
                                        <Form.Control
                                            placeholder="Enter new password"
                                            aria-label="New Password"
                                            aria-describedby="password"
                                            type='password'
                                            name="new_password"
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </InputGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={12}>
                                    <InputGroup className="mt-4">
                                        <InputGroup.Text id="password">Confirm Password</InputGroup.Text>
                                        <Form.Control
                                            placeholder="Confirm new password"
                                            aria-label="Confirm New Password"
                                            aria-describedby="password"
                                            type='password'
                                            name="confirm_password"
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </InputGroup>
                                </Col>
                            </Row>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleEmailSubmit}>
                        Submit Email
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ForgotPassword;
