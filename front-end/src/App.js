import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login.tsx';
import Registration from './components/Registration.tsx';
import HomePage from './components/HomePage.tsx';
import ProtectedRoutes from './components/ProtectedRoutes.tsx';
import AccountDetails from './components/AccountDetails.tsx';
import CloseAccount from './components/CloseAccount.tsx';
import ATMSearch from './components/ATMSearch.tsx';
import InternalTransfer from './components/InternalTransfer.tsx';
import ExternalTransfer from './components/ExternalTransfer.tsx';
import ATMHome from './components/ATMHome.tsx';
import AdminPage from './components/AdminPage.tsx';
import AdminRoute from './components/AdminRoute.tsx';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" exact element={<Login />} /> {/* Root URL route */}
        <Route path="/registration" element={<Registration />} />
        <Route element={<ProtectedRoutes />}>
          <Route path="/home" element={<HomePage />} exact />
          <Route element={<AdminRoute/>}>
              <Route path="/admin" element={<AdminPage/>} exact/>
          </Route>
          <Route path="/atm" element={<ATMHome/>} exact/>
          <Route path="/accountDetails/:accountID" element={<AccountDetails />} exact />
          <Route path="/atmSearch" element={<ATMSearch/>} exact/>
          <Route path="/closeAccount" element={<CloseAccount />} exact />
          <Route path="/internalTransfer" element={<InternalTransfer />} exact />
          <Route path="/externalTransfer" element={<ExternalTransfer />} exact />
        </Route>
        {/* Other routes */}
      </Routes>
    </Router>
  );
}

export default App;
