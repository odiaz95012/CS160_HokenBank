import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Nav, Button } from 'react-bootstrap';
import LogoutModal from './LogoutModal';
import CloseAccountModal from './CloseAccountModal.tsx';
import CancelAutomaticPayments from './CancelAutomaticPayments.tsx';

interface NavBarProps {
    caller: string;
}

function NavBar({ caller }: NavBarProps): JSX.Element {
    const navigate = useNavigate();

    return (
        <Navbar expand="lg" bg="dark" variant="dark">
            <Navbar.Brand onClick={() => navigate('/home')} className='ms-2'>
                <img
                    src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/lotus.webp"
                    style={{ width: '85px' }}
                    alt="logo"
                    id="logo"
                />
                Hoken
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="navbarNav" />
            <Navbar.Collapse id="navbarNav">
                <Nav className="ms-auto mb-lg-0">
                    {caller !== 'atmSearch' ? (
                        <Nav.Item className="my-2">
                            <Button
                                variant="outline-secondary"
                                className="nav-bar-bttn"
                                onClick={() => navigate('/atmSearch')}
                            >
                                <i className="bi bi-search me-2"></i>ATM Search
                            </Button>
                        </Nav.Item>
                    ) : (
                        <Nav.Item className="my-2">
                            <Button
                                variant="outline-secondary"
                                className="nav-bar-bttn"
                                onClick={() => navigate('/home')}
                            >
                                <i className="bi bi-arrow-left pe-1"></i>Return Home
                            </Button>
                        </Nav.Item>
                    )}

                    <Nav.Item className="my-2">
                        <CancelAutomaticPayments />
                    </Nav.Item>
                    {caller !== 'accountDetails' ? (
                        <Nav.Item className="my-2">
                            <CloseAccountModal />
                        </Nav.Item>
                    ) : null}
                    <Nav.Item className="my-2 me-4">
                        <LogoutModal />
                    </Nav.Item>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default NavBar;
