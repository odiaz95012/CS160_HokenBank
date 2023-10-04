import React from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Login from './components/Login';
import Registration from './components/Registration';
import MainPage from './components/MainPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" exact element={ <Login/> } /> {/* Root URL route */}
        <Route path="/registration" element={ <Registration/>} />
        <Route path="/home" element={ <MainPage/> } />
        
        {/* Other routes */}
      </Routes>
    </Router>
  );
}

export default App;
