import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Cookies from 'js-cookie';
import axios from 'axios';

interface UpdatedAttributes {
    [key: string]: string;
}
interface UpdatedAccount {
    new_username: string,
    new_email: string,
    new_password: string,
    new_zipcode: string,
    new_name: string,
    confirm_password: string
}

interface UserData {
    customer_id: string,
    username: string,
    email: string,
    full_name: string,
    age: number,
    gender: string,
    zip_code: number,
    status: string
}

interface UpdateProfileSummaryProps {
    updatedAttributes: UpdatedAccount;
    setAlert: (alertText: string, alertVariant: string) => void;
    handleAlert: () => void;
    setUserData: (userData: UserData) => void;
    handleClearInputFields: () => void;
}


function UpdateProfileSummary({ updatedAttributes, setAlert, handleAlert, setUserData, handleClearInputFields }: UpdateProfileSummaryProps) {

    const [show, setShow] = useState(false);

    // Mapping of updated account keys to more readable display names
    const fieldNamesMapping: Record<string, string> = {
        new_name: 'Updated Name',
        new_username: 'Updated Username',
        new_email: 'Updated Email',
        new_password: 'Updated Password',
        new_zipcode: 'Updated Zip Code',

    };

    // Object containing only the fields that the user has updated with suitable names
    const updatedFields: Record<string, string> = Object.entries(updatedAttributes)
        .filter(([key, value]) => value !== '' && key !== 'confirm_password')
        .reduce((acc, [key, value]) => {
            // Get the display name from the mapping, or use the original key if not found
            const displayName = fieldNamesMapping[key] || key;
            acc[displayName] = value;
            return acc;
        }, {} as Record<string, string>);

    const [formattedUpdatedAttributes, setFormattedUpdatedAttributes] = useState<UpdatedAttributes>({});

    useEffect(() => {
        // Check if there's any change in updatedFields
        const isUpdated = JSON.stringify(updatedFields) !== JSON.stringify(formattedUpdatedAttributes);

        // If there's a change, update formattedUpdatedAttributes
        if (isUpdated) {
            setFormattedUpdatedAttributes(updatedFields);
        }
    }, [updatedFields, formattedUpdatedAttributes]);



    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const isValidName = (name: string) => {
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(name)) {
            throw new Error('The input name is not valid. Please only enter alphabetical characters.');
        }
        return true;
    };

    const isValidEmail = (email: string) => {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if (!emailRegex.test(email)) {
            throw new Error('The input email is not valid.');
        }
        return true;
    };

    const isValidPassword = (password: string) => {
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
    };

    const confirmPasswordsMatch = (password: string, confirmPassword: string) => {
        if (password !== confirmPassword) {
            throw new Error('The passwords do not match.');
        }
        return true;
    };

    const isValidZipCode = (zipCode: string) => {
        const pattern = /^\d{5}$/;
        if (!pattern.test(zipCode)) {
            throw new Error('The zipcode must be exactly 5 numeric digits. (e.g. 95116)');
        }
        return true;
    };

    const isValidUsername = (username: string) => {
        if (!(username.length >= 6 && username.length <= 18)) {
            throw new Error('The username must be 6-18 characters in length.');
        }
        return true;
    };

    const createRequestPayload = async (updatedProfile: UpdatedAccount) => {
        const payload: Partial<UpdatedAccount> = {};

        if (updatedProfile.new_name && isValidName(updatedProfile.new_name)) {
            payload.new_name = updatedProfile.new_name;
        }

        if (updatedProfile.new_username && isValidUsername(updatedProfile.new_username)) {
            payload.new_username = updatedProfile.new_username;
        }

        if (updatedProfile.new_email && isValidEmail(updatedProfile.new_email)) {
            payload.new_email = updatedProfile.new_email;
        }

        if (updatedProfile.new_zipcode && isValidZipCode(updatedProfile.new_zipcode)) {
            payload.new_zipcode = updatedProfile.new_zipcode;
        }

        if (updatedProfile.new_password && updatedProfile.confirm_password) {
            if (confirmPasswordsMatch(updatedProfile.new_password, updatedProfile.confirm_password) &&
                isValidPassword(updatedProfile.new_password)) {
                payload.new_password = updatedProfile.new_password;
            }
        }

        if (Object.keys(payload).length === 0) {
            throw new Error('Please provide at least one valid field to update.');
        }

        return payload;
    };



    const updateProfile = async (updatedProfile: UpdatedAccount) => {
        try {
            const authToken = Cookies.get('authToken');
            if (authToken) {
                const payload = await createRequestPayload(updatedProfile);
                if (payload) {
                    await axios.patch(`http://localhost:8000/updateCustomer`, payload, {
                        headers: {
                            'authorization': `Bearer ${authToken}`
                        }
                    })
                        .then((response) => {
                            console.log(response.data);
                            setAlert('Successfully updated profile!', 'success');
                            setUserData(response.data.updated_customer); // update the user data state
                            handleAlert();
                            handleClearInputFields();
                        }).catch((err) => {
                            setAlert(err.response.data.error, 'danger');
                            handleAlert();
                        })
                }
            }
        } catch (err: any) {
            setAlert(err.message, 'warning');
            handleAlert();
        }
    };

    const updateProfileHandler = () => {
        const updatedAccount: UpdatedAccount = {
            new_username: updatedAttributes.new_username,
            new_email: updatedAttributes.new_email,
            new_password: updatedAttributes.new_password,
            new_zipcode: updatedAttributes.new_zipcode,
            new_name: updatedAttributes.new_name,
            confirm_password: updatedAttributes.confirm_password
        }
        updateProfile(updatedAccount);
        handleClose();
        setFormattedUpdatedAttributes({});
    };

    const [passwordVisibility, setPasswordVisibility] = useState<boolean>(false);

    const togglePasswordVisibility = () => {
        setPasswordVisibility((prevVisibility) => !prevVisibility);
    };

    return (
        <>
            <Button variant="primary" onClick={handleShow} className="me-2">
                Update Summary
            </Button>
            <Offcanvas show={show} onHide={handleClose} placement='end'>
                <Offcanvas.Header closeButton>
                    <div className="d-flex justify-content-center w-100">
                        <Offcanvas.Title>Update Profile Details Summary</Offcanvas.Title>
                    </div>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <div className='text-center'>
                        {Object.keys(formattedUpdatedAttributes).length > 0 ? (
                            Object.keys(formattedUpdatedAttributes).map((key) => (
                                <div key={key}>
                                    <p className='fs-7'>
                                        {key === 'Updated Password' ? (
                                            <div key={key} style={{ position: 'relative' }}>
                                                <label className='form-label me-2' htmlFor='new-password'>Updated Password:</label>
                                                <input
                                                    type={passwordVisibility ? 'text' : 'password'}
                                                    value={formattedUpdatedAttributes[key]}
                                                    disabled
                                                    id="new-password"
                                                    className='form-control'
                                                    style={{ paddingRight: '40px' }}
                                                />
                                                <span
                                                    style={{
                                                        position: 'absolute',
                                                        top: '75%',
                                                        right: '5%',
                                                        transform: 'translateY(-50%)',
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={togglePasswordVisibility}
                                                >
                                                    <i className={passwordVisibility ? 'bi bi-eye-slash' : 'bi bi-eye'}></i>
                                                </span>
                                            </div>
                                        ) : (
                                            `${key}: ${formattedUpdatedAttributes[key]}`
                                        )}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className='lead'>No changes made</p>
                        )}
                    </div>
                    <div className='d-flex justify-content-center align-items-center mt-2'>

                        <Button variant="primary" className="me-2" onClick={updateProfileHandler}>
                            Update Profile
                        </Button>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
}

export default UpdateProfileSummary;