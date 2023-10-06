import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Registration from './components/Registration';
import HomePage from './components/HomePage';
import ProtectedRoutes from './components/ProtectedRoutes';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" exact element={<Login />} /> {/* Root URL route */}
        <Route path="/registration" element={<Registration />} />
        <Route element={<ProtectedRoutes/>}> 
            <Route path="/home" element={<HomePage/>} exact/>
        </Route>
        {/* Other routes */}
      </Routes>
    </Router>
  );
}

export default App;
