import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import '../componentStyles/HomeStyles.css';
import axios from 'axios';


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

    const getUserData = async (authToken, customer_id ) => {
        await axios.get(`http://localhost:8000/getCustomer/${customer_id}`, {
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

    const goToLoginPage = () => {
        navigate('/');
    };
    const goToBillPage = () => {
        navigate('/billpay');
    }
    const getCustomerID = async () => {
        const authToken = Cookies.get('authToken');
        // setAuthToken(authToken);
        const customerObj = JSON.parse(window.atob(authToken.split('.')[1]));
        // setCustomerID(customerObj.customer_id);
        return [authToken, customerObj.customer_id];
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                //Retrieve the customer id and auth token, authToken is at index 0 and customer_id is at index 1 
                const customerAuth = await getCustomerID();
                //Retrieve the customer details
                await getUserData(customerAuth[0], customerAuth[1]);


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
            {
                isUserDataLoaded ? (
                    <header className="bg-dark py-5">
                        <div className="container px-5">
                            <div className="row gx-5 justify-content-center">
                                <div className="col-lg-6">
                                    <div className="text-center my-5">
                                        <h1 className="display-5 fw-bolder text-white mb-2">Welcome {userData.full_name}</h1>
                                        <p className="lead text-white-50 mb-4">Thank you for choosing Hoken bank. Happy banking!</p>
                                        <div className="d-grid gap-3 d-sm-flex justify-content-sm-center">
                                            <a className="btn btn-primary btn-lg px-4 me-sm-3" href="#features">Get Started</a>
                                            <a className="btn btn-outline-light btn-lg px-4" href="#!">Learn More</a>
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
            <section className="py-5 border-bottom" id="features">
                <div className="container px-5 my-5">
                    <div className="row gx-5">
                        <div className="col-lg-4 mb-5 mb-lg-0">
                            <div className="feature bg-primary bg-gradient text-white rounded-3 mb-3"><i className="bi bi-collection"></i></div>
                            <h2 className="h4 fw-bolder">Featured title</h2>
                            <p>Paragraph of text beneath the heading to explain the heading. We'll add onto it with another sentence and probably just keep going until we run out of words.</p>
                            <a className="text-decoration-none" href="#!">
                                Call to action
                                <i className="bi bi-arrow-right"></i>
                            </a>
                        </div>
                        <div className="col-lg-4 mb-5 mb-lg-0">
                            <div className="feature bg-primary bg-gradient text-white rounded-3 mb-3"><i className="bi bi-building"></i></div>
                            <h2 className="h4 fw-bolder">Featured title</h2>
                            <p>Paragraph of text beneath the heading to explain the heading. We'll add onto it with another sentence and probably just keep going until we run out of words.</p>
                            <a className="text-decoration-none" href="#!">
                                Call to action
                                <i className="bi bi-arrow-right"></i>
                            </a>
                        </div>
                        <div className="col-lg-4">
                            <div className="feature bg-primary bg-gradient text-white rounded-3 mb-3"><i className="bi bi-toggles2"></i></div>
                            <h2 className="h4 fw-bolder">Featured title</h2>
                            <p>Paragraph of text beneath the heading to explain the heading. We'll add onto it with another sentence and probably just keep going until we run out of words.</p>
                            <a className="text-decoration-none" href="#!">
                                Call to action
                                <i className="bi bi-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

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

