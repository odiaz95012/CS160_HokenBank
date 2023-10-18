import React, { useState } from 'react';
import '../componentStyles/LoginStyles.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PopUpModal from './PopUpModal';
import Cookies from 'js-cookie';

function Login() {

  const navigate = useNavigate();

  const goToRegistration = () => {
    navigate('/registration');
  };

  const goToHome = () => {
    navigate('/home');
  }

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const login = async () => {
    axios.post('http://localhost:8000/login', {
      username: formData.username,
      password: formData.password
    }).then((response) => {
      const authToken = response.data.token;
      Cookies.set('authToken', authToken);
      const loginStatusBody = document.getElementById('statusBody');
      loginStatusBody.className = "text-success"; // Set the success class
      let count = 5;
      loginStatusBody.innerText = `Login Successful. \nRedirecting to the home page in ${count} seconds.`;
      
      const countdownInterval = setInterval(() => {
        count -= 1;
        loginStatusBody.innerText = `Login Successful. \nRedirecting to the home page in ${count} seconds.`;
      
        if (count === 0) {
          clearInterval(countdownInterval); // Stop the countdown when it reaches 0
          goToHome();
        }
      }, 1000);
    }).catch((err) => {
      const loginStatusBody = document.getElementById('statusBody');
      loginStatusBody.className = "text-danger";
      loginStatusBody.innerText = err.response.data;
    })
  };



  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement login logic here (e.g., send data to a server).
  };

  return (
    <section className="background-radial-gradient overflow-hidden">
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

                      <div className="text-center pt-1 mb-5 pb-1 ">
                        <PopUpModal
                          activatingBttn={
                            <button
                              className="btn btn-primary btn-block fa-lg gradient-custom-2 mb-3 loginBtn"
                              type="submit"
                              data-toggle="modal"
                              data-target="#exampleModal"
                              id='loginBttn'
                            >
                              Log in
                            </button>}
                          title={<div><p className="h4">Login Status</p></div>}
                          body={<div className="text-center"><p id="statusBody"></p></div>}
                          buttonOnClick={() => login()}
                        />

                          {/* <a className="text-muted" href="#!">
                          Forgot password?
                        </a> */}
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
