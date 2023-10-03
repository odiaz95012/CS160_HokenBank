import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PopUpModal from './PopUpModal';
import axios from 'axios';


function Registration() {

  const navigate = useNavigate();


  const goToLoginPage = () => {
    navigate('/');
  };




  function isValidZipCode(zipCode) {

    // Pattern that must include exactly 5 numeric digits
    const pattern = /^\d{5}$/;

    //Check if zipcode is 5 numeric digits
    if (!pattern.test(zipCode)) {
      throw new Error("The zipcode must be exactly 5 numeric digits.")
    }
    return true;
  }


  function isValidUsername(username) {
    //username must be 6-18 characters
    if (!username.length >= 6 && username.length <= 18) {
      throw new Error("The username must be 6-18 characters in length.")
    }
    return true;
  }

  function isValidEmail(email) {
    // Regular expression for a basic email format validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
      throw new Error("The input email is not valid.")
    }
    return true;
  }
  function isValidPassword(password) {

    const minLength = 6;
    const maxLength = 18;

    // Regular expressions to check for uppercase, lowercase, and special characters
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const specialRegex = /[!@#$%^&*(),.?":{}|<>]/;

    // Check password length
    if (password.length < minLength || password.length > maxLength) {
      throw new Error("The password must be 6-18 characters long");
    }

    // Check for uppercase, lowercase, and special characters
    if (!uppercaseRegex.test(password) || !lowercaseRegex.test(password) || !specialRegex.test(password)) {
      throw new Error("The password must contain at least 1 uppercase, 1 lowercase, and 1 special character.");
    }

    // If all checks pass, the password is valid
    return true;
  }

  function confirmPasswordsMatch(password, confirmPassword) {
    if (password !== confirmPassword) {
      throw new Error("The passwords do not match.")
    }
    return true;
  }

  async function verifyInputFields() {
    const { username, zipcode, email, password, confirmPassword } = formData;

    try {
      //Check that all attributes are not null or empty
      checkAttributesNotNull('Name', formData.fullName);
      checkAttributesNotNull('Username', formData.username);
      checkAttributesNotNull('Zipcode', formData.zipcode);
      checkAttributesNotNull('Age', formData.age);
      checkAttributesNotNull('Gender', formData.gender);
      checkAttributesNotNull('Email', formData.email);
      checkAttributesNotNull('Password', formData.password);
      checkAttributesNotNull('Confirm Password', formData.confirmPassword);
      //Check that each attribute meet their constraints
      const isPasswordsMatch = confirmPasswordsMatch(password, confirmPassword);
      const isUsernameValid = isValidUsername(username);
      const isEmailValid = isValidEmail(email);
      const isZipcodeValid = isValidZipCode(zipcode);
      const isPasswordValid = isValidPassword(password);

      if (isPasswordsMatch && isUsernameValid && isZipcodeValid && isEmailValid && isPasswordValid) {
        //If all checks passed, send over account info to backend
        if (await handleSubmit()) {
          const accountStatusBody = document.getElementById('statusBody');
          accountStatusBody.className = "text-success";
          let count = 5;
          accountStatusBody.innerText = `Account creation Successful. \nRedirecting to the home page in ${count} seconds.`;
          
          const countdownInterval = setInterval(() => {
            count -= 1;
            accountStatusBody.innerText = `Account creation Successful. \nRedirecting to the home page in ${count} seconds.`;
          
            if (count === 0) {
              clearInterval(countdownInterval); // Stop the countdown when it reaches 0
              goToLoginPage();
            }
          }, 1000);
  
       }

      }

    } catch (err) {
      //Display the error message to the user
      const accountStatusBody = document.getElementById('statusBody');
      accountStatusBody.className = "text-danger";
      accountStatusBody.innerText = err.message;
    }
  }

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    zipcode: '',
    age: '',
    gender: '', // gender is set to none as default
    email: '',
    password: '',
    confirmPassword: ''
  });

  function checkAttributesNotNull(attributeName, attributeValue) {
    if (!attributeValue || attributeValue.trim() === '') {
      throw new Error(`The ${attributeName} field cannot be empty.`);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    axios.post(
      'http://localhost:8000/register', {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      full_name: formData.fullName,
      age: parseInt(formData.age),
      gender: formData.gender,
      zip_code: parseInt(formData.zipcode),
      status: 'A'
    }
    ).catch((err) => {
        const accountStatusBody = document.getElementById('statusBody');
        accountStatusBody.className = "text-danger";
        accountStatusBody.innerText = err.response.data;
        return false;
      });
    return true;
  };


  function updateSliderValue() {
    const slider = document.getElementById("customRange2");
    const sliderValueElement = document.getElementById("sliderValue");
    sliderValueElement.textContent = slider.value;
    // update the age value in the formData when it changes
    handleChange({
      target: {
        name: "age",
        value: slider.value,
      },
    });
  }

  //Get the value of the currently selected gender button
  //Param: the value of the selected gender button
  function updateGenderValue(genderValue) {
    setFormData({ ...formData, gender: genderValue });
  }




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

      <div className="container px-4 py-5 px-md-5 text-center text-lg-start my-5">
        <div className="row gx-lg-5 align-items-center mb-5">
          <div className="col-lg-6 mb-5 mb-lg-0" style={{ zIndex: 10 }}>
            <h1 className="my-5 display-5 fw-bold ls-tight" style={{ color: 'hsl(218, 81%, 95%)' }}>
              Your most reliable <br />
              <span style={{ color: 'hsl(218, 81%, 75%)' }}> online banking utility</span>
            </h1>
            <p className="mb-4 opacity-70" style={{ color: 'hsl(218, 81%, 85%)' }}>
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Temporibus, expedita iusto veniam atque, magni tempora mollitia dolorum consequatur nulla, neque debitis eos reprehenderit quasi ab ipsum nisi dolorem modi. Quos?
            </p>
          </div>

          <div className="col-lg-6 mb-5 mb-lg-0 position-relative">
            <div id="radius-shape-1" className="position-absolute rounded-circle shadow-5-strong"></div>
            <div id="radius-shape-2" className="position-absolute shadow-5-strong"></div>

            <div className="card bg-glass">
              <div className="card-body px-4 py-5 px-md-5">
                <form onSubmit={handleSubmit}>
                  {/* Fullname & Username */}
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <div className="form-outline">
                        <input name="fullName" type="text" id="form3Example1" className="form-control" onChange={handleChange} />
                        <label className="form-label" htmlFor="form3Example1">Name</label>
                      </div>
                    </div>
                    <div className="col-md-6 mb-4">
                      <div className="form-outline">
                        <input name="username" type="text" id="form3Example2" className="form-control" onChange={handleChange} />
                        <label className="form-label" htmlFor="form3Example2">Username</label>
                      </div>
                    </div>
                  </div>
                  {/*Age, Zipcode, & Gender*/}
                  <div className="row">

                    <div className="col">
                      <div className="form-outline  mb-4">
                        <input name="zipcode" type="text" id="form3Example1" className="form-control" onChange={handleChange} />
                        <label className="form-label" htmlFor="form3Example1">Zipcode</label>
                      </div>
                    </div>
                    <div className="col">
                      <div className="form-outline mb-4">
                        <input name="age" type="range" className="form-range" min="18" max="150" id="customRange2" onChange={updateSliderValue} />
                        <label htmlFor="customRange2" className="form-label">Age: <span id="sliderValue"></span> </label>
                      </div>
                    </div>
                    <div className="col">
                      <div className="btn-group" id="genderBtns" role="group" aria-label="Basic radio toggle button group">
                        <input type="radio" value="M" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off" onChange={() => updateGenderValue('M')} />
                        <label className="btn btn-outline-primary" htmlFor="btnradio1">Male</label>

                        <input type="radio" value="F" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off" onChange={() => updateGenderValue('F')} />
                        <label className="btn btn-outline-primary" htmlFor="btnradio2">Female</label>

                        <input type="radio" value="O" className="btn-check" name="btnradio" id="btnradio3" autoComplete="off" onChange={() => updateGenderValue('O')} />
                        <label className="btn btn-outline-primary" htmlFor="btnradio3">Other</label>
                      </div>
                      <label className="form-label" htmlFor="genderBtns">Gender</label>
                    </div>
                  </div>
                  {/* Email input */}
                  <div className="form-outline mb-4">
                    <input name="email" type="email" id="form3Example3" className="form-control" onChange={handleChange} />
                    <label className="form-label" htmlFor="form3Example3">Email address</label>
                  </div>

                  {/* Password input */}
                  <div className="form-outline mb-4">
                    <input name="password" type="password" id="form3Example4" className="form-control" onChange={handleChange} />
                    <label className="form-label" htmlFor="form3Example4">Password</label>
                  </div>
                  <div className="form-outline mb-4">
                    <input name="confirmPassword" type="password" id="form3Example4" className="form-control" onChange={handleChange} />
                    <label className="form-label" htmlFor="form3Example4">Confirm Password</label>
                  </div>


                  {/* Submit button */}

                  <PopUpModal
                    activatingBttn={
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        data-toggle="modal"
                        data-target="#exampleModal"
                      >
                        Sign Up
                      </button>}
                    title={<div><h4>Account Creation Status</h4></div>}
                    body={<div className="text-center"><p id="statusBody"></p></div>}
                    buttonOnClick={() => verifyInputFields()}
                  />
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Registration;
