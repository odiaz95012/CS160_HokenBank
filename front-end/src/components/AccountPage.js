import React from 'react';

import { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AccountPage(props) {
    const [userData, setUserData] = useState({
        customer_id: '',
        username: '',
        email: '',
        full_name: '',
        age: 0,
        gender: '',
        zip_code: 0,
        status: ''
    });


    const [error, setError] = useState('');
    const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);

    const getUserData = async (authToken) => {
        await axios.get(`http://localhost:8000/getCustomer`, {
            headers: {
                'authorization': `Bearer ${authToken}`
            }
        })
            .then((response) => {
                setUserData(response.data);
                console.log(response.data);
            }).catch((err) => {
                setError(err.response.data);
                console.log(err);
            })
    };

    // const [userAccount, setUserAccount] = useState([]);
    // const getUserAccounts = async (authToken) => {
    //     await axios.get(`http://localhost:8000//getAccount/${customer_id}`, {
    //         headers: {
    //             'authorization': `Bearer ${authToken}`
    //         }
    //     }).then((response) => {
    //         setUserAccount(response.data);
    //     }).catch((err) => {
    //         console.log(err);
    //     })
    // };
    const getCustomerToken = async () => {
        const authToken = Cookies.get('authToken');
        return authToken;
    };



    useEffect(() => {
        const fetchUserData = async () => {
            try {
                //Retrieve the customer id and auth token, authToken is at index 0 and customer_id is at index 1 
                const customerAuth = await getCustomerToken();
                //Retrieve the customer details
                await getUserData(customerAuth);

                // await getUserAccounts(customerAuth);

                setIsUserDataLoaded(true);
            } catch (err) {
                setIsUserDataLoaded(false);
                console.log(err);
            }
        }

        fetchUserData();
    }, [])
    const navigate = useNavigate();
    const gotoCloseAccountPage = () => {
        navigate('/closeAccount');
    }
    const gotoInternalTransferPage = () => {
        navigate('/internalTransfer');
    }
    const gotoExternalTransferPage = () => {
        navigate('/externalTransfer');
    }

    const [modalVisible, setModalVisible] = useState(false);

    const openModal = () => {

        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
    };
    const handleFormSubmit = () => {
        closeModal();
    }






    return (

        <div>
            <h1>Account Page</h1>

            {/* <!-- Responsive navbar--> */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container px-5">
                    <img
                        src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/lotus.webp"
                        style={{ width: '85px' }}
                        alt="logo"
                    />
                    <a className="navbar-brand" href="#!">Hoken</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                            <li className="nav-item"><a className="nav-link active" aria-current="page" href="#!">Home</a></li>
                            <li className="nav-item"><a className="nav-link" href="#!">About</a></li>
                            <li className="nav-item"><a className="nav-link" href="#!">Contact</a></li>
                            <li className="nav-item"><a className="nav-link" href="#!">Services</a></li>
                            <li className="nav-item"><button id="logoutBttn" type="button" className="btn btn-primary">Logout</button></li>
                        </ul>
                    </div>
                </div>
            </nav>
            {/* <!-- Welcome Banner--> */}


            <div className="container mt-5">
                <section className="py-5 border-bottom" id="features">
                    <div className="container px-5 my-5">
                        <div className="row gx-5">
                            <div className="col-lg-4 mb-5 mb-lg-0">

                                <h2 className="h4 fw-bolder">Account</h2>

                                <p>Account ID:</p>
                                <p>Balance:</p>
                            </div>
                        </div>
                    </div>
                </section>

                {isUserDataLoaded ? (
                    // <header className="bg-dark py-5">
                    <div className="container px-5">
                        <div className="row gx-5 justify-content-center">
                            <div className="col-lg-6">
                                <div className="text-center my-5">
                                    <h1 className="display-5 fw-bolder text-white mb-2">Welcome {userData.full_name}</h1>


                                    <div className="d-grid gap-3 d-sm-flex justify-content-sm-center">
                                        <div className="text-center pt-1 mb-5 pb-1 ">
                                            <PopUpModal
                                                activatingBttn={<button className="btn btn-primary btn-lg px-4 me-sm-3" href="#features" onClick={openModal}>Internal Transfer</button>}
                                                title={<div style={{ textAlign: "center" }}><p className="h4">Internal Transfer</p></div>}
                                                body={<InternalTransfer onFormSubmit={handleFormSubmit} onClose={closeModal} />}
                                            />
                                        </div>

                                        <div className="text-center pt-1 mb-5 pb-1 ">
                                            <PopUpModal
                                                activatingBttn={<button className="btn btn-primary btn-lg px-4 me-sm-3" href="#features" onClick={openModal}>External Transfer</button>}
                                                title={<div style={{ textAlign: "center" }}><p className="h4">External Transfer</p></div>}
                                                body={<ExternalTransfer onFormSubmit={handleFormSubmit} onClose={closeModal} />}
                                            />
                                        </div>
                                        <div className="text-center pt-1 mb-5 pb-1 ">
                                            <PopUpModal
                                                activatingBttn={<button className="btn btn-primary btn-lg px-4 me-sm-3" href="#features" onClick={openModal}>Inactivate Account</button>}
                                                title={<div style={{ textAlign: "center" }}><p className="h4">Inactivate</p></div>}
                                                body={<CloseAccount onFormSubmit={handleFormSubmit} onClose={closeModal} />}
                                            />
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    // </header>
                ) : (
                    <header className="bg-dark py-5">
                        <div className="container px-5">
                            <div className="row gx-5 justify-content-center">
                                <div className="col-lg-6">
                                    <div className="text-center my-5">
                                        <div className="d-flex justify-content-center">
                                            <div className="spinner-border text-primary" role="status"> </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>
                )
                }
                {/* <!-- Accounts section--> */}

                {/* <!-- Footer--> */}
                <footer className="py-5 bg-dark">
                    <div className="container px-5"><p className="m-0 text-center text-white">Copyright &copy; Hoken 2023</p></div>
                </footer>
                {/* <!-- Bootstrap core JS--> */}
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>




            </div >
        </div >





    )
}

export default AccountPage
