import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Registration from './components/Registration';
import HomePage from './components/HomePage';
import ProtectedRoutes from './components/ProtectedRoutes';
import AccountDetails from './components/AccountDetails';
import CloseAccount from './components/CloseAccount';
import ATMSearch from './components/ATMSearch';
import InternalTransfer from './components/InternalTransfer';
import ExternalTransfer from './components/ExternalTransfer';
import ATMHome from './components/ATMHome';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" exact element={<Login />} /> {/* Root URL route */}
        <Route path="/registration" element={<Registration />} />
        <Route element={<ProtectedRoutes />}>
          <Route path="/home" element={<HomePage />} exact />
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
