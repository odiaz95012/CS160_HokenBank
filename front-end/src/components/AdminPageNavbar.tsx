import React from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import LogoutModal from './LogoutModal';

function AdminPageNavBar(): JSX.Element {


    return (
        <Navbar expand="lg" bg="dark" variant="dark">
            <Navbar.Brand className='ms-4'>
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
                    <Nav.Item className="my-2 me-4">
                        <LogoutModal />
                    </Nav.Item>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default AdminPageNavBar;
