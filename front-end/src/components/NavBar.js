import React from 'react'
import PopUpModal from './PopUpModal';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

function NavBar() {
    const navigate = useNavigate();
    const logout = () => {
        Cookies.remove('authToken');
        navigate("/");
    }
    return (
        <div>
            {/* <!-- Responsive navbar--> */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container px-5">
                    <img
                        src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/lotus.webp"
                        style={{ width: '85px' }}
                        alt="logo"
                    />
                    <a className="navbar-brand" href="#!">Hoken</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation"><span className="navbar-toggler-icon"></span></button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav ms-auto mb-lg-0 my-2">
                            <li className="nav-item my-2"><button type="button" className="nav-link btn btn-outline-secondary nav-bar-bttn"><i className="bi bi-search me-2"></i>ATM Search</button></li>
                            <li className="nav-item my-2"><button type="button" className="nav-link btn btn-outline-secondary nav-bar-bttn"><i className="bi bi-door-closed-fill me-2"></i>Close Account</button></li>
                            <li className="nav-item my-2">
                                <PopUpModal
                                    activatingBttn={
                                        <button
                                            type="button"
                                            className="nav-link btn btn-primary  nav-bar-bttn"
                                            data-toggle="modal"
                                            data-target="#exampleModal"
                                        >
                                            <i className="bi bi-arrow-bar-right me-2"></i>
                                            Logout
                                        </button>}
                                    title={<div><h4>Logout</h4></div>}
                                    body={<div className="text-center"><p className="text-primary ">Are you sure you want to logout?</p></div>}
                                    closeBttnText={"Yes"}
                                    additionalBttnText={"No"}
                                    submitAction={() => logout()}
                                />
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default NavBar;