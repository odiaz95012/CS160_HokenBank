import React, { useEffect, useState } from 'react';
import NavBar from './NavBar';
import { Nav, InputGroup, Row, Col, Form, Container, Image, Button } from 'react-bootstrap';
import axios from 'axios';
import Cookies from 'js-cookie';
import PopUpAlert from './PopUpAlert';
import UpdateProfileSummary from './UpdateProfileSummary';
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

    const childrenSetAlert = (alertText: string, alertVariant: string) => {
        setAlert({ text: alertText, variant: alertVariant });
    };

    const clearInputFields = () => {
        setUpdatedAccount(defaultUpdatedAccount);
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
                                    <p className='h6 my-4 fs-4'>Email: {userData.email}</p>
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
                                    value={updatedAccount.new_name}
                                    onChange={handleInput}
                                />
                            </InputGroup>
                            <div className='d-flex text-start'>
                                <Form.Text className="me-5" id="nameRequirements" muted>
                                    Your name must be 3-30 characters in length and only contain letters.
                                </Form.Text>
                            </div>

                            <InputGroup className="mt-4">
                                <InputGroup.Text id="username">New Username</InputGroup.Text>
                                <Form.Control
                                    placeholder="Set new username"
                                    aria-label="Username"
                                    aria-describedby="username"
                                    name="new_username"
                                    value={updatedAccount.new_username}
                                    onChange={handleInput}
                                />
                            </InputGroup>
                            <div className='d-flex text-start'>
                                <Form.Text id="usernameRequirements" muted>
                                    Your username must be 6-18 characters long.
                                </Form.Text>
                            </div>
                            <InputGroup className="mt-4">
                                <InputGroup.Text id="zipcode">Change Zip Code</InputGroup.Text>
                                <Form.Control
                                    placeholder="Enter new zipcode"
                                    aria-label="Enter new zipcode"
                                    aria-describedby="zipcode"
                                    name="new_zipcode"
                                    value={updatedAccount.new_zipcode}
                                    onChange={handleInput}
                                />
                            </InputGroup>
                            <div className='d-flex text-start'>
                                <Form.Text id="zipcodeRequirements" muted>
                                    The zipcode must be exactly 5 numeric digits. (e.g. 95116)
                                </Form.Text>
                            </div>
                            <InputGroup className="mt-4">
                                <InputGroup.Text id="email">New Email</InputGroup.Text>
                                <Form.Control
                                    placeholder="Enter new email"
                                    aria-label="New Email"
                                    aria-describedby="email"
                                    name="new_email"
                                    value={updatedAccount.new_email}
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
                                    value={updatedAccount.new_password}
                                    onChange={handleInput}
                                />
                            </InputGroup>
                            <div className='d-flex text-start'>
                                <Form.Text id="passwordHelpBlock" muted>
                                    Your password must be 6-18 characters long, contain at least 1 capital letter,
                                    1 lowercase letter, 1 number, and 1 special character (!@#$%^&*(),.?":{ }|).
                                </Form.Text>
                            </div>

                            <InputGroup className="mt-4">
                                <InputGroup.Text id="password">Confirm New Password</InputGroup.Text>
                                <Form.Control
                                    placeholder="Confirm new password"
                                    aria-label="Confirm New Password"
                                    aria-describedby="password"
                                    type='password'
                                    name="confirm_password"
                                    onChange={handleInput}
                                    value={updatedAccount.confirm_password}
                                />
                            </InputGroup>

                            <div className='d-flex justify-content-center align-items-center mt-4 mb-4'>
                                {/* <Button variant='primary' onClick={() => updateProfile(updatedAccount)}>
                                    Submit Changes
                                </Button> */}
                                <UpdateProfileSummary
                                    updatedAttributes={updatedAccount}
                                    handleAlert={handleAlert}
                                    setAlert={childrenSetAlert}
                                    setUserData={childSetUserData}
                                    handleClearInputFields={clearInputFields}
                                />
                            </div>

                        </Col>
                    </Row>

                );
            default:
                return null;
        }
    };

    const childSetUserData = (newUserData: UserData) => {
        setUserData(newUserData);
    }



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



    return (
        <>
            <NavBar caller='profile' />
            <div className='container'>
                <div className="d-flex justify-content-center mt-3" id='pop-up-alert'>
                    <PopUpAlert text={alert ? alert.text : ''} variant={alert ? alert.variant : 'info'} />
                </div>
                <Row className='mb-5'>
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
            <footer className="py-5 bg-dark">
                <div className="container px-5 mt-5"><p className="m-0 text-center text-white">Copyright &copy; Hoken 2023</p></div>
            </footer>

        </>
    );
}

export default Profile;
