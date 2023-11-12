import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from './DatePicker';
import PopUpAlert from './PopUpAlert';
import '../componentStyles/ATMHomeStyles.css'; //only has the pop up alert css

interface FormData {
  fullName: string;
  username: string;
  zipcode: string;
  birthDate: Date | null;
  age: number | null;
  gender: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function Registration() {
  const navigate = useNavigate();

  const goToLoginPage = () => {
    navigate('/');
  };

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    username: '',
    zipcode: '',
    birthDate: null,
    age: null,
    gender: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleDateChange = (date: Date) => {
    setFormData({ ...formData, birthDate: date, age: calculateAge(date) });
  };

  const calculateAge = (birthdate: Date) => {
    const currentDate = new Date();
    let age = currentDate.getFullYear() - birthdate.getFullYear();
    if (
      currentDate.getMonth() < birthdate.getMonth() ||
      (currentDate.getMonth() === birthdate.getMonth() &&
        currentDate.getDate() < birthdate.getDate())
    ) {
      age -= 1;
    }
    return age;
  };

  const updateGenderValue = (genderValue: string) => {
    setFormData({ ...formData, gender: genderValue });
  };

  const verifyInputFields = async () => {
    const { username, zipcode, age, email, password, confirmPassword } = formData;
    try {
      checkAttributesNotNull('Name', formData.fullName);
      checkAttributesNotNull('Username', formData.username);
      checkAttributesNotNull('Zipcode', formData.zipcode);
      checkAttributesNotNull('Birthdate', formData.birthDate);
      checkAttributesNotNull('Gender', formData.gender);
      checkAttributesNotNull('Email', formData.email);
      checkAttributesNotNull('Password', formData.password);
      checkAttributesNotNull('Confirm Password', formData.confirmPassword);

      const isPasswordsMatch = confirmPasswordsMatch(password, confirmPassword);
      const isNameValid = isValidName(formData.fullName);
      const isUsernameValid = isValidUsername(username);
      const isAgeValid = isValidAge(age);
      const isEmailValid = isValidEmail(email);
      const isZipcodeValid = isValidZipCode(zipcode);
      const isPasswordValid = isValidPassword(password);

      if (isPasswordsMatch && isNameValid && isUsernameValid && isAgeValid && isZipcodeValid && isEmailValid && isPasswordValid) {
        if (await handleSubmit()) {
          
          let count = 3;
          setAlert({ text: 'Account creation Successful. \nRedirecting to the login page in 5 seconds.', variant: 'success' });

          const countdownInterval = setInterval(() => {
            count -= 1;
            setAlert({ text: `Account creation Successful. \nRedirecting to the login page in ${count} seconds.`, variant: 'success' });

            if (count === 0) {
              clearInterval(countdownInterval);
              goToLoginPage();
            }
          }, 1000);
          handleAlert();
        }
      }
    } catch (err: any) {
      setAlert({ text: err.message, variant: 'danger' });
      handleAlert();
      return false;
    }
  };

  function isValidZipCode(zipCode: string) {
    const pattern = /^\d{5}$/;
    if (!pattern.test(zipCode)) {
      throw new Error('The zipcode must be exactly 5 numeric digits. (e.g. 95116)');
    }
    return true;
  }

  function isValidUsername(username: string) {
    if (!(username.length >= 6 && username.length <= 18)) {
      throw new Error('The username must be 6-18 characters in length.');
    }
    return true;
  }

  const isValidAge = (age: number | null) => {
    if (age !== null) {
      if (age < 18) {
        throw new Error('You must be at least 18 years old to open a Hoken bank account.');
      }
      if (age > 150) {
        throw new Error('The birthdate is invalid.');
      }
    }
    return true;
  };

  const isValidName = (name: string) => {
    const nameRegex = /^[A-Za-z\s]+$/;
    if(!nameRegex.test(name)) {
      throw new Error('The input name is not valid. Please only enter alphabetical characters.');
    }
    return true;
  };

  function isValidEmail(email: string) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
      throw new Error('The input email is not valid.');
    }
    return true;
  }

  function isValidPassword(password: string) {
    const minLength = 6;
    const maxLength = 18;
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const specialRegex = /[!@#$%^&*(),.?":{}|<>]/;

    if (password.length < minLength || password.length > maxLength) {
      throw new Error('The password must be 6-18 characters long');
    }

    if (!uppercaseRegex.test(password) || !lowercaseRegex.test(password) || !specialRegex.test(password)) {
      throw new Error('The password must contain at least 1 uppercase, 1 lowercase, and 1 special character.');
    }

    return true;
  }

  function confirmPasswordsMatch(password: string, confirmPassword: string) {
    if (password !== confirmPassword) {
      throw new Error('The passwords do not match.');
    }
    return true;
  }

  async function handleSubmit() {
    try {
      await axios.post('http://localhost:8000/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        age: formData.age,
        gender: formData.gender,
        zip_code: parseInt(formData.zipcode, 10),
        status: 'A',
      });
      return true;
    } catch (err: any) {
      setAlert({ text: err.response.data, variant: 'danger' });
      handleAlert();
      return false;
    }
  }

  function checkAttributesNotNull(attributeName: string, attributeValue: any) {
    if (!attributeValue || attributeValue === '') {
      throw new Error(`The ${attributeName} field cannot be empty.`);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  interface Alert {
    text: string,
    variant: string
}
const defaultAlert: Alert = {
    text: '',
    variant: ''
}
const [alert, setAlert] = useState<Alert>(defaultAlert);

const handleAlert = () => {
  const alertElem = document.getElementById('pop-up-alert') as HTMLElement;
  alertElem.style.visibility = 'visible';
  // Automatically dismiss the alert after 3 seconds
  setTimeout(() => {
      setAlert(defaultAlert); // reset alert
      alertElem.style.visibility = 'hidden';
  }, 3000);
}

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
      <div className="container px-4 py-5 px-md-5 text-center text-lg-start my-5">
        <div className="row gx-lg-5 align-items-center mb-5">
          <div className="col-lg-6 mb-5 mb-lg-0" style={{ zIndex: 10 }}>
            <h1 className="mb-4 display-5 fw-bold ls-tight" style={{ color: 'hsl(218, 81%, 95%)' }}>
              Your most reliable <br />
              <span style={{ color: 'hsl(218, 81%, 75%)' }}> online banking utility</span>
            </h1>
            <p className="mb-4 opacity-70" style={{ color: 'hsl(218, 81%, 85%)' }}>
              Join Hoken Bank Today!
              <br /><br />
              Register now to unlock a world of financial possibilities.
              <br /><br />
              Experience secure and efficient banking at your fingertips.
              <br /><br />
              Hoken Online Bank - Your financial partner.
            </p>
          </div>
          <div className="col-lg-6 mb-5 mb-lg-0 position-relative">
            <div id="radius-shape-1" className="position-absolute rounded-circle shadow-5-strong"></div>
            <div id="radius-shape-2" className="position-absolute shadow-5-strong"></div>
            <div className="d-flex justify-content-center" id='pop-up-alert'>
              <PopUpAlert text={alert ? alert.text : ''} variant={alert ? alert.variant : 'info'} />
            </div>
            <div className="card bg-glass">
              <div className="card-body px-4 py-5 px-md-5 ">
                <form>
                  {/* Fullname & Username */}
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <div className="form-outline">
                        <input name="fullName" type="text" id="validationCustom01" className="form-control" onChange={handleChange} />
                        <label className="form-label" htmlFor="validationCustom01">Name</label>
                      </div>
                    </div>
                    <div className="col-md-6 mb-4">
                      <div className="form-outline">
                        <input name="username" type="text" id="form3Example2" className="form-control" onChange={handleChange} />
                        <label className="form-label" htmlFor="form3Example2">Username</label>
                      </div>
                    </div>
                  </div>
                  {/* Age, Zipcode, & Gender */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="form-outline">
                        <input name="zipcode" type="text" id="form3Example1" className="form-control" onChange={handleChange} />
                        <label className="form-label" htmlFor="form3Example1">Zipcode</label>
                      </div>
                    </div>
                    <div className="col-md-6 mb-2">
                      <div className="btn-group" id="genderBtns" role="group" aria-label="Basic radio toggle button group">
                        <input type="radio" value="M" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off" onChange={() => updateGenderValue('M')} />
                        <label className="btn btn-outline-primary" htmlFor="btnradio1">Male</label>
                        <input type="radio" value="F" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off" onChange={() => updateGenderValue('F')} />
                        <label className="btn btn-outline-primary" htmlFor="btnradio2">Female</label>
                        <input type="radio" value="O" className="btn-check" name="btnradio" id="btnradio3" autoComplete="off" onChange={() => updateGenderValue('O')} />
                        <label className="btn btn-outline-primary" htmlFor="btnradio3">Other</label>
                      </div>
                      <div>
                        <label className="form-label" htmlFor="genderBtns">Gender</label>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-4">
                    <DatePicker
                      placeholderText="Birthdate"
                      peekNextMonth={true}
                      showMonthDropdown={true}
                      showYearDropdown={true}
                      dropdownMode="select"
                      selected={formData.birthDate}
                      onDateChange={handleDateChange}
                      wrapperClassName="form-control"
                      maxDate={new Date()}
                      id="form2Example3"
                      labelText="Birthdate"
                    />
                  </div>
                  {/* Email input */}
                  <div className="form-outline mb-4">
                    <input name="email" type="email" id="form3Example3" className="form-control" onChange={handleChange} />
                    <label className="form-label" htmlFor="form3Example3">Email address</label>
                  </div>
                  {/* Password input */}
                  <div className="form-outline mb-4">
                    <input name="password" type="password" id="password" className="form-control" onChange={handleChange} />
                    <label className="form-label" htmlFor="password">Password</label>
                  </div>
                  <div className="form-outline mb-4">
                    <input name="confirmPassword" type="password" id="confirmPassword" className="form-control" onChange={handleChange} />
                    <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                  </div>
                  {/* Submit button */}
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => verifyInputFields()}
                      >
                        Sign Up
                      </button>
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
