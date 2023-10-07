import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import '../componentStyles/HomeStyles.css';
import axios from 'axios';
import AccountCard from './AccountCard';

function HomePage() {
    const navigate = useNavigate();
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
            }).catch((err) => {
                setError(err.response.data);
                console.log(err);
            })
    };

    const [userAccounts, setUserAccounts] = useState([]);
    const getUserAccounts = async (authToken) => {
        await axios.get(`http://localhost:8000/getCustomerAccounts`, {
            headers: {
                'authorization': `Bearer ${authToken}`
            }
        }).then((response) => {
            setUserAccounts(response.data);
        }).catch((err) => {
            console.log(err);
        })
    };


    const goToLoginPage = () => {
        navigate('/');
    };
    const goToBillPage = () => {
        navigate('/billpay');
    }
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

                await getUserAccounts(customerAuth);

                setIsUserDataLoaded(true);
            } catch (err) {
                setIsUserDataLoaded(false);
                console.log(err);
            }
        }

        fetchUserData();
    }, [])
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
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                            <li className="nav-item"><button type="button" className="nav-link btn btn-outline-secondary nav-bar-bttn"><i class="bi bi-search me-2"></i>ATM Search</button></li>
                            <li className="nav-item"><button type="button" className="nav-link btn btn-outline-secondary nav-bar-bttn"><i class="bi bi-door-closed-fill me-2"></i>Close Account</button></li>
                            <li className="nav-item"><button type="button" className="nav-link btn btn-primary nav-bar-bttn"><i class="bi bi-box-arrow-right me-2"></i>Logout</button></li>
                        </ul>
                    </div>
                </div>
            </nav>
            {/* <!-- Welcome Banner--> */}
            {
                isUserDataLoaded ? (
                    <header className="bg-dark py-5">
                        <div className="container px-5">
                            <div className="row gx-5 justify-content-center">
                                <div className="col-lg-6">
                                    <div className="text-center my-5">
                                        <h1 className="display-5 fw-bolder text-white mb-2">Welcome {userData.full_name}</h1>
                                        <p className="lead text-white-50 mb-4">Thank you for choosing Hoken bank. Happy banking!</p>
                                        <div className="d-grid gap-4 d-sm-flex justify-content-sm-center">
                                            <button type="button" class="btn btn-primary">Open Account</button>
                                            <button type="button" class="btn btn-primary">Normal Payment</button>
                                            <button type="button" class="btn btn-primary">Automatic Payment</button>
                                            <button type="button" class="btn btn-primary">Check Deposit</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>
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
            <div className="d-flex flex-row justify-content-center mt-5 mb-5">
                {isUserDataLoaded ? (
                    userAccounts.map((account) => (
                        <AccountCard
                            key={account.account_id}
                            account_id={account.account_id}
                            account_type={account.account_type}
                            account_balance={account.balance}
                        />
                    ))
                ) : (
                    <div className="container px-5">
                        <div className="row gx-5 justify-content-center">
                            <div className="col-lg-6">
                                <div className="text-center my-5">
                                    <div className="d-flex justify-content-center">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>


            {/* <!-- Footer--> */}
            <footer className="py-5 bg-dark">
                <div className="container px-5"><p className="m-0 text-center text-white">Copyright &copy; Hoken 2023</p></div>
            </footer>
            {/* <!-- Bootstrap core JS--> */}
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>



        </div>

    )
}
export default HomePage;

