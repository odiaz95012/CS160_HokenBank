import React from 'react'
import PopUpModal from './PopUpModal';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import '../componentStyles/NavBarStyles.css';
import LogoutModal from './LogoutModal';

function NavBar() {
    const navigate = useNavigate();
    const logout = () => {
        Cookies.remove('authToken');
        navigate("/");
    }
    return (
        <div className='row'>
            {/* <!-- Responsive navbar--> */}
            <div className='col-md-12'>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container px-5">
                    <img
                        src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/lotus.webp"
                        style={{ width: '85px' }}
                        alt="logo"
                        id="logo"
                    />
                    <a className="navbar-brand" id="home" onClick={() => navigate('/home')}>Hoken</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation"><span className="navbar-toggler-icon"></span></button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav ms-auto mb-lg-0 my-2">
                            <li className="nav-item my-2"><button type="button" className="nav-link btn btn-outline-secondary nav-bar-bttn" onClick={() => navigate('/atmSearch')}><i className="bi bi-search me-2"></i>ATM Search</button></li>
                            <li className="nav-item my-2"><button type="button" className="nav-link btn btn-outline-secondary nav-bar-bttn"><i className="bi bi-door-closed-fill me-2"></i>Close Account</button></li>
                            <li className="nav-item my-2">
                                <LogoutModal/>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            </div>
        </div>
    )
}

export default NavBar;