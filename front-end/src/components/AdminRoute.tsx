import React, { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

const AdminRoute = () => {

 //latest version
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Check if the user is authenticated to navigate to protected routes
    const isAuthenticated = !!Cookies.get('authToken');
    const authToken = isAuthenticated ? Cookies.get('authToken') : null;

    useEffect(() => {
        // Perform authentication and authorization checks here
        // Example: Check if the user is authenticated and authorized for admin access
        if (isAuthenticated) {
            axios.get("http://localhost:8000/getCustomer", {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }).then((response) => {
                if (response.data.username === 'bank_manager') {
                    setIsAdmin(true);
                }
                setIsLoading(false);
            }).catch((err) => {
                console.log(err);
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, [authToken, isAuthenticated]);

    return isLoading ? (
        <></> // To not display this page when a user refreshes in the AdminPage
    ) : isAdmin ? (
        <Outlet />
    ) : (
        <div className='container text-center'>
            <div className="w3-display-middle my-5">
                <h1 className="w3-jumbo w3-animate-top w3-center"><code>Access Denied</code></h1>
                <hr className="w3-border-white w3-animate-left" style={{ margin: "auto", width: "50%" }} />
                <h3 className="w3-center w3-animate-right">You don't have permission to view this page.</h3>
                <h3 className="w3-center w3-animate-zoom">🚫🚫🚫🚫</h3>
                <h6 className="w3-center w3-animate-zoom">Error Code: 403 Forbidden</h6>
            </div>
        </div>
    );
};

export default AdminRoute;
