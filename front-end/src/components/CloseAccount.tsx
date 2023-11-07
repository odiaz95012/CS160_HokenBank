import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

interface CloseAccountProps {
  onSubmit?: () => void;
  onClose?: () => void;
  account_id?: number;
  onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children?: React.ReactNode;
}

function CloseAccount({ onSubmit, onClose, account_id, onInputChange }: CloseAccountProps) {
  const navigate = useNavigate();
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');


  const getCustomerAuthToken = () => {
    return Cookies.get('authToken');
  }

  const gotoHomePage = () => {
    navigate('/home');
  };

  const passwordHandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === '') {
      setError("Enter your password");
    } else {
      setError("");
    }
  };

  const handlePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    setPassword(target.value);
    onInputChange && onInputChange(e);
  }
  


  const closeAccount = (account_id: number, password: string, authToken: string) => {
    if(password === '' || account_id === -1) {
      return;
    }
    axios.patch(`http://localhost:8000/closeAccount/${account_id}`, {
      account_id: account_id,
      password: password
    }, {
      headers: {
        'authorization': `Bearer ${authToken}`
      }
    }).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.log(error);
    });
  };

  return (
    <div>
      <div className="container text-center mt-5">
        <p className='h5 mb-3'>Please enter your password to close the account</p>
        <form onSubmit={passwordHandler}>
          <div className="form-group text-start">
            <label htmlFor="password" className='form-label mb-1'>Password Confirm</label>
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={handlePasswordInput}
            />
          </div>
          <p className="text-danger">{error}</p>
          <div className="form-group">
            <button
              type="submit"
              className="btn btn-primary"
              onClick={async () => {
                const authToken = await getCustomerAuthToken();
                if (authToken && account_id) {
                  closeAccount(account_id, password, authToken);
                }
              }}
            >
              Confirm
            </button>

          </div>
        </form>
        <br />
      </div >
    </div >
  );
}

export default CloseAccount;