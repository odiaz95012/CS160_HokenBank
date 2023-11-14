import React, { useEffect, useState } from 'react';
import NavBar from './NavBar';
import { Nav, InputGroup, Row, Col, Form, Container, Image, Button } from 'react-bootstrap';
import axios from 'axios';
import Cookies from 'js-cookie';
import PopUpAlert from './PopUpAlert';
const ProfileImage = require('../utilities/profile_default.png');



interface ProfileProps { }

const Profile: React.FC<ProfileProps> = () => {
    const [activeTab, setActiveTab] = useState<string>('viewProfile');
    interface UserData {
        customer_id: string,
        username: string,
        email: string,
        full_name: string,
        age: number,
        gender: string,
        zip_code: number,
        status: string
    }
    const defaultUserData: UserData = {
        customer_id: '',
        username: '',
        email: '',
        full_name: '',
        age: 0,
        gender: '',
        zip_code: 0,
        status: ''
    };

    interface UpdatedAccount {
        new_username: string,
        new_email: string,
        new_password: string,
        new_zipcode: string,
        new_name: string,
        confirm_password: string
    }
    interface Alert {
        text: string,
        variant: string
    }

    const defaultUpdatedAccount: UpdatedAccount = {
        new_username: '',
        new_email: '',
        new_password: '',
        new_zipcode: '',
        new_name: '',
        confirm_password: ''
    }

    const [userData, setUserData] = useState<UserData>(defaultUserData);
    const [updatedAccount, setUpdatedAccount] = useState<UpdatedAccount>(defaultUpdatedAccount);
    const [alert, setAlert] = useState<Alert>({ text: '', variant: '' });

    const handleAlert = () => {
        const alertElem = document.getElementById('pop-up-alert') as HTMLElement;
        alertElem.style.visibility = 'visible';
        // Automatically dismiss the alert after 3 seconds
        setTimeout(() => {
            setAlert({ text: '', variant: '' }); // reset alert
            alertElem.style.visibility = 'hidden';
        }, 3000);
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target as HTMLInputElement;
        setUpdatedAccount({ ...updatedAccount, [name]: value });
    };

    const handleTabSelect = (selectedTab: string | null) => {
        if (selectedTab) {
            setActiveTab(selectedTab);
        }
    };

    const getUserData = async (authToken: string) => {
        await axios.get(`http://localhost:8000/getCustomer`, {
            headers: {
                'authorization': `Bearer ${authToken}`
            }
        })
            .then((response) => {
                setUserData(response.data);
            }).catch((err) => {
                console.log(err);
            })
    };

    const renderInputGroup = () => {
        switch (activeTab) {
            case 'viewProfile':
                return (
                    <Container className='grid gap-3 align-items-center justify-content-center my-5 pb-3'>
                        <Row>
                            <Col md={4} className='offset-md-2 ps-5 g-col-4 mb-5'>
                                <Image
                                    src={ProfileImage}
                                    width={200}
                                    className='mt-5'
                                    roundedCircle
                                />
                            </Col>
                            <Col md={6} className='mb-5'>
                                <div className='ps-5 g-col-4 mb-5'>
                                    <p className='h6 my-4 fs-4'>Name: {userData.full_name}</p>
                                    <p className='h6 my-4 fs-4'>Username: {userData.username}</p>
                                    <p className='h6 my-4 fs-4'>Customer ID: {userData.customer_id}</p>
                                    <p className='h6 my-4 fs-4'>Age: {userData.age}</p>
                                    <p className='h6 my-4 fs-4'>Gender: {userData.gender}</p>
                                    <p className='h6 my-4 fs-4'>Zip Code: {userData.zip_code}</p>
                                </div>
                            </Col>
                        </Row>
                    </Container>

                )
            case 'editProfile':
                return (
                    <Row>
                        <Col md={12} className='text-center'>
                            <p className='fs-6 pt-1'>*Not all input fields are required, only enter the fields you would like to update*</p>
                            <InputGroup className="mt-3">
                                <InputGroup.Text id="name">Name</InputGroup.Text>
                                <Form.Control
                                    placeholder="Enter new name"
                                    aria-label="New Name"
                                    aria-describedby="name"
                                    name="new_name"
                                    onChange={handleInput}
                                />
                            </InputGroup>
                            <InputGroup className="mt-4">
                                <InputGroup.Text id="username">New Username</InputGroup.Text>
                                <Form.Control
                                    placeholder="Set new username"
                                    aria-label="Username"
                                    aria-describedby="username"
                                    name="new_username"
                                    onChange={handleInput}
                                />
                            </InputGroup>
                            <InputGroup className="mt-4">
                                <InputGroup.Text id="zipcode">Change Zip Code</InputGroup.Text>
                                <Form.Control
                                    placeholder="Enter new zipcode"
                                    aria-label="Enter new zipcode"
                                    aria-describedby="zipcode"
                                    name="new_zipcode"
                                    onChange={handleInput}
                                />
                            </InputGroup>
                            <InputGroup className="mt-4">
                                <InputGroup.Text id="email">New Email</InputGroup.Text>
                                <Form.Control
                                    placeholder="Enter new email"
                                    aria-label="New Email"
                                    aria-describedby="email"
                                    name="new_email"
                                    onChange={handleInput}
                                />
                            </InputGroup>
                            <InputGroup className="mt-4">
                                <InputGroup.Text id="password">New Password</InputGroup.Text>
                                <Form.Control
                                    placeholder="Enter new password"
                                    aria-label="New Password"
                                    aria-describedby="password"
                                    type='password'
                                    name="new_password"
                                    onChange={handleInput}
                                />
                            </InputGroup>
                            <InputGroup className="mt-4">
                                <InputGroup.Text id="password">Confirm New Password</InputGroup.Text>
                                <Form.Control
                                    placeholder="Confirm new password"
                                    aria-label="Confirm New Password"
                                    aria-describedby="password"
                                    type='password'
                                    name="confirm_password"
                                    onChange={handleInput}
                                />
                            </InputGroup>

                            <div className='d-flex justify-content-center align-items-center mt-4 mb-4'>
                                <Button variant='primary' onClick={() => updateProfile(updatedAccount)}>
                                    Submit Changes
                                </Button>
                            </div>

                        </Col>
                    </Row>

                );
            default:
                return null;
        }
    };


    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const authToken = Cookies.get('authToken');
                if (authToken) {
                    await getUserData(authToken);
                }
            } catch (err) {
                console.log(err);
            }
        }
        fetchProfile();
    }, []);

    const isValidName = (name: string) => {
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(name)) {
            throw new Error('The input name is not valid. Please only enter alphabetical characters.');
        }
        return true;
    };

    const isValidEmail = (email: string) => {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if (!emailRegex.test(email)) {
            throw new Error('The input email is not valid.');
        }
        return true;
    };

    const isValidPassword = (password: string) => {
        const minLength = 6;
        const maxLength = 18;
        const uppercaseRegex = /[A-Z]/;
        const lowercaseRegex = /[a-z]/;
        const specialRegex = /[!@#$%^&*(),.?":{}|<>]/;

        if (password.length < minLength || password.length > maxLength) {
            throw new Error('The password must be 6-18 characters long');
        }

        if (!uppercaseRegex.test(password) || !lowercaseRegex.test(password) || !specialRegex.test(password)) {
            throw new Error('The password must contain at least 1 uppercase, 1 lowercase, and 1 special character.');
        }

        return true;
    };

    const confirmPasswordsMatch = (password: string, confirmPassword: string) => {
        if (password !== confirmPassword) {
            throw new Error('The passwords do not match.');
        }
        return true;
    };

    const isValidZipCode = (zipCode: string) => {
        const pattern = /^\d{5}$/;
        if (!pattern.test(zipCode)) {
            throw new Error('The zipcode must be exactly 5 numeric digits. (e.g. 95116)');
        }
        return true;
    };

    const isValidUsername = (username: string) => {
        if (!(username.length >= 6 && username.length <= 18)) {
            throw new Error('The username must be 6-18 characters in length.');
        }
        return true;
    };

    // Create the payload for the update profile request
    const createRequestPayload = async (updatedName?: string, updatedUsername?: string, updatedEmail?: string, updatedPassword?: string, updatedPasswordConfirm?: string, updatedZipcode?: string) => {
        try {
            let payload = {};

            if (updatedName && isValidName(updatedName)) payload = { ...payload, new_name: updatedName };

            if (updatedUsername && isValidUsername(updatedUsername)) payload = { ...payload, new_username: updatedUsername };

            if (updatedEmail && isValidEmail(updatedEmail)) payload = { ...payload, new_email: updatedEmail };

            if (updatedZipcode && isValidZipCode(updatedZipcode)) payload = { ...payload, new_zipcode: updatedZipcode };

            if (updatedPassword) {
                // If the user is updating their password, check that the new password and confirm password match, and verify it is a valid password
                if (!updatedPasswordConfirm) {
                    throw new Error('Please confirm the password.');
                }

                if (confirmPasswordsMatch(updatedPassword, updatedPasswordConfirm) && isValidPassword(updatedPassword)) {
                    payload = { ...payload, new_password: updatedPassword };
                }
            }

            if (Object.keys(payload).length === 0) {
                throw new Error('Please provide at least one field to update.');
            }

            return payload;
        } catch (error) {
            throw error; // Rethrow the error to be caught in the calling function
        }
    };



    const updateProfile = async (updatedProfile: UpdatedAccount) => {
        try {
            const authToken = Cookies.get('authToken');
            if (authToken) {
                const payload = await createRequestPayload(updatedProfile.new_name, updatedProfile.new_username, updatedProfile.new_email, updatedProfile.new_password, updatedProfile.confirm_password, updatedProfile.new_zipcode);
                if (payload) {
                    await axios.patch(`http://localhost:8000/updateCustomer`, payload, {
                        headers: {
                            'authorization': `Bearer ${authToken}`
                        }
                    })
                        .then((response) => {
                            console.log(response.data);
                            setAlert({ text: 'Successfully updated profile!', variant: 'success' });
                            setUserData(response.data.updated_customer); // update the user data state
                            handleAlert();
                        }).catch((err) => {
                            setAlert({ text: err.response.data.error, variant: 'danger' });
                            handleAlert();
                        })
                }
            }
        } catch (err: any) {
            setAlert({ text: err.message, variant: 'warning' });
            handleAlert();
            setUpdatedAccount(defaultUpdatedAccount); // reset the updated account state
        }
    };

    return (
        <>
            <NavBar caller='profile' />
            <div className='container'>
                <div className="d-flex justify-content-center mt-3" id='pop-up-alert'>
                    <PopUpAlert text={alert ? alert.text : ''} variant={alert ? alert.variant : 'info'} />
                </div>
                <Row>
                    <Col md={12}>
                        <Nav
                            variant="tabs"
                            title="Edit Profile"
                            defaultActiveKey="/profile"
                            justify
                            fill
                            activeKey={activeTab}
                            onSelect={handleTabSelect}
                        >
                            <Nav.Item>
                                <Nav.Link eventKey="viewProfile" className='text-primary fs-5'>
                                    View Profile
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="editProfile" className='text-primary fs-5'>
                                    Edit Profile
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Col>
                </Row>
                {renderInputGroup()}

            </div>
            {activeTab === 'viewProfile' ? (
                <footer className="py-5 bg-dark">
                    <div className="container px-5 mt-2"><p className="m-0 text-center text-white">Copyright &copy; Hoken 2023</p></div>
                </footer>
            ) : (
                <footer className="py-5 bg-dark">
                    <div className="container px-5"><p className="m-0 text-center text-white">Copyright &copy; Hoken 2023</p></div>
                </footer>
            )

            }

        </>
    );
}

export default Profile;
