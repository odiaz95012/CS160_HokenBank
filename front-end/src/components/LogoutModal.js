import React from 'react'
import PopUpModal from './PopUpModal';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

function LogoutModal() {

    const navigate = useNavigate();
    const logout = () => {
        Cookies.remove('authToken');
        navigate("/");
    }

    return (
        <>
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
        </>
    )
}

export default LogoutModal;