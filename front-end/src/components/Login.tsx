import React, { useState } from 'react';
import '../componentStyles/LoginStyles.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import PopUpAlert from './PopUpAlert';

interface FormData {
    username: string;
    password: string;
}

function Login() {
    //latest 
    const navigate = useNavigate();

    const goToRegistration = () => {
        navigate('/registration');
    };

    const goToHome = (destination: string) => {
        if (destination === 'ATM') {
            navigate('/atm');
        } else if (destination === 'Web') {
            navigate('/home');
        } else {
            navigate('/admin');
        }
    };

    const [formData, setFormData] = useState<FormData>({
        username: '',
        password: '',
    });

    const [alert, setAlert] = useState<{ text: string; variant: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const login = async (data: FormData, destination: string) => {
        if (!data.username || !data.password) {
            setAlert({
                text: 'At least one required input field was not provided. Please try again.',
                variant: 'warning',
            });
            handleAlert();
            return;
        }
        axios
            .post('http://localhost:8000/login', {
                username: data.username,
                password: data.password,
            })
            .then((response) => {
                const authToken = response.data.token;
                Cookies.set('authToken', authToken);
                if (data.username === 'bank_manager') {
                    destination = 'Admin';
                }
                loginSuccessMessage(destination);
            })
            .catch((err) => {
                setAlert({ text: err.response.data, variant: 'danger' });
                handleAlert();
            });
    };

    const loginSuccessMessage = (destination: string) => {
        const alertElem = document.getElementById('pop-up-alert');
        alertElem!.style.visibility = 'visible';
        let count = 5;
        setAlert({ text: `Login successful!\nRedirecting to the ${destination} home page in ${count} seconds.`, variant: 'success' });
        const countdownInterval = setInterval(() => {
            count -= 1;
            setAlert({ text: `Login successful!\nRedirecting to the ${destination} home page in ${count} seconds.`, variant: 'success' });

            if (count === 0) {
                clearInterval(countdownInterval);
                goToHome(destination);
                alertElem!.style.visibility = 'hidden';
                setAlert(null);
            }
        }, 1000);
    };

    const handleAlert = () => {
        const alertElem = document.getElementById('pop-up-alert');
        alertElem!.style.visibility = 'visible';
        setTimeout(() => {
            setAlert(null);
            alertElem!.style.visibility = 'hidden';
        }, 3000);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    };

    return (
        <section className="background-radial-gradient overflow-auto">
            <style>
                {`
        .background-radial-gradient {
          background-color: hsl(218, 41%, 15%);
          background-image: radial-gradient(650px circle at 0% 0%, hsl(218, 41%, 35%) 15%, hsl(218, 41%, 30%) 35%, hsl(218, 41%, 20%) 75%, hsl(218, 41%, 19%) 80%, transparent 100%), radial-gradient(1250px circle at 100% 100%, hsl(218, 41%, 45%) 15%, hsl(218, 41%, 30%) 35%, hsl(218, 41%, 20%) 75%, hsl(218, 41%, 19%) 80%, transparent 100%);
          height: 100vh;
        },
      `}
            </style>
            <div className="container py-5 h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col-xl-10">
                        <div className="card rounded-3 text-black">
                            <div className="row g-0">
                                <div className="col-lg-6">
                                    <div className="card-body p-md-5 mx-md-4">
                                        <div className="d-flex justify-content-center" id="pop-up-alert">
                                            {alert ? <PopUpAlert text={alert.text} variant={alert.variant} /> : null}
                                        </div>
                                        <div className="text-center">
                                            <img
                                                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/lotus.webp"
                                                style={{ width: '185px' }}
                                                alt="logo"
                                            />
                                            <h4 className="mt-1 mb-5 pb-1">Welcome to Hoken</h4>
                                        </div>

                                        <form onSubmit={handleSubmit}>
                                            <p>Please login to your account</p>

                                            <div className="form-outline mb-4">
                                                <input
                                                    type="text"
                                                    id="form2Example11"
                                                    className="form-control"
                                                    placeholder="Username"
                                                    name="username"
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div className="form-outline mb-4">
                                                <input
                                                    type="password"
                                                    id="form2Example22"
                                                    className="form-control"
                                                    placeholder="Password"
                                                    name="password"
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div className="d-flex justify-content-center pt-1 mb-4 pb-1 me-3">
                                                <button
                                                    className="btn btn-primary btn-block fa-lg gradient-custom-2"
                                                    type="submit"
                                                    id="loginWebBttn"
                                                    onClick={() => login(formData, 'Web')}
                                                >
                                                    Login via Web
                                                </button>
                                                <button
                                                    className="btn btn-primary btn-block fa-lg gradient-custom-2 ms-3"
                                                    type="submit"
                                                    id="loginATMBttn"
                                                    onClick={() => login(formData, 'ATM')}
                                                >
                                                    Login via ATM
                                                </button>
                                            </div>

                                            <div className="d-flex align-items-center justify-content-center pb-4">
                                                <p className="mb-0 me-2">Don't have an account?</p>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger"
                                                    onClick={() => goToRegistration()}
                                                >
                                                    Create new
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                                <div className="col-lg-6 d-flex align-items-center gradient-custom-2">
                                    <div className="text-white px-3 py-4 p-md-5 mx-md-4">
                                        <h4 className="mb-4">The future of online banking is here</h4>
                                        <p className="small mb-0">
                                            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed
                                            do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                                            enim ad minim veniam, quis nostrud exercitation ullamco laboris
                                            nisi ut aliquip ex ea commodo consequat.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Login;
