import React, { useEffect, useState } from 'react';
import NavBar from './NavBar';
import { Nav, InputGroup, Row, Col, Form, Container, Image, Button } from 'react-bootstrap';
import axios from 'axios';
import Cookies from 'js-cookie';
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

    const [userData, setUserData] = useState<UserData>(defaultUserData);

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
                    <Container className='grid gap-3 align-items-center justify-content-center mt-5'>
                        <Row className='mt-5'>
                            <Col md={4} className='offset-md-2 ps-5 g-col-4'>
                                <Image
                                    src={ProfileImage}
                                    width={200}
                                    className='mt-5'
                                    roundedCircle
                                />
                            </Col>
                            <Col md={6}>
                                <div className='ps-5 g-col-4'>
                                    <p className='h6 my-4 fs-4'>Name: {userData.full_name}</p>
                                    <p className='h6 my-4 fs-4'>Username: {userData.username}</p>
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
                        <Col md={12}>
                            <InputGroup className="mt-5">
                                <InputGroup.Text id="name">Name</InputGroup.Text>
                                <Form.Control
                                    placeholder="Enter new name"
                                    aria-label="New Name"
                                    aria-describedby="name"

                                />
                            </InputGroup>
                            <InputGroup className="mt-5">
                                <InputGroup.Text id="username">New Username</InputGroup.Text>
                                <Form.Control
                                    placeholder="Set new username"
                                    aria-label="Username"
                                    aria-describedby="username"
                                />
                            </InputGroup>
                            <InputGroup className="mt-5">
                                <InputGroup.Text id="email">New Email</InputGroup.Text>
                                <Form.Control
                                    placeholder="Enter new email"
                                    aria-label="New Email"
                                    aria-describedby="email"
                                />
                            </InputGroup>
                            <InputGroup className="mt-5">
                                <InputGroup.Text id="password">New Password</InputGroup.Text>
                                <Form.Control
                                    placeholder="Enter new password"
                                    aria-label="New Password"
                                    aria-describedby="password"
                                />
                            </InputGroup>
                            <InputGroup className="mt-5">
                                <InputGroup.Text id="password">Confirm New Password</InputGroup.Text>
                                <Form.Control
                                    placeholder="Confirm new password"
                                    aria-label="Confirm New Password"
                                    aria-describedby="password"
                                />
                            </InputGroup>
                            <div className='d-flex justify-content-center align-items-center mt-4'>
                                <Button variant='primary'>
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
        const fethProfile = async () => {
            try {
                const authToken = Cookies.get('authToken');
                if (authToken) {
                    await getUserData(authToken);
                }
            } catch (err) {
                console.log(err);
            }
        }
        fethProfile();
    }, []);

    return (
        <>
            <NavBar caller='profile' />
            <div className='container'>
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
            {/* <!-- Footer--> */}
            <footer className="py-5 bg-dark fixed-bottom">
                <div className="container px-5"><p className="m-0 text-center text-white">Copyright &copy; Hoken 2023</p></div>
            </footer>
        </>
    );
}

export default Profile;
