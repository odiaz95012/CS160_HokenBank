// ProtectedRoute.js
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const ProtectedRoutes = () => {
    //check if user is authenticated to navigate to protected routes
    const isAuthenticated = !!Cookies.get('authToken');
    return isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoutes;
