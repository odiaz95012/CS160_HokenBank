import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CloseAccountProps {
  onSubmit?: () => void;
  onClose?: () => void;
}

function CloseAccount({ onSubmit, onClose }: CloseAccountProps) {
//latest version
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');

  const goToLoginPage = () => {
    navigate('/');
  };

  const gotoAccountPage = () => {
    navigate('/accountPage');
  };

  const passwordHandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === '') {
      setError("Enter your password");
    } else {
      setError("");
    }
  };

  return (
    <div>
      <div className="container mt-5">
        <h2>Close Bank Account</h2>
        <form onSubmit={passwordHandler}>
          <div className="form-group">
            <label htmlFor="password">Password Confirm</label>
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <p className="text-danger">{error}</p>
          <div className="form-group">
            <button type="submit" className="btn btn-primary">
              Confirm
            </button>
          </div>
        </form>
        <br />
      </div>
    </div>
  );
}

export default CloseAccount;
