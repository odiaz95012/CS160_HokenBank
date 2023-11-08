import React, { useState } from 'react';

interface CloseAccountProps {
  account_id?: number;
  onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function CloseAccount({  onInputChange }: CloseAccountProps) {
 
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');




  const handlePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    setPassword(target.value);
    onInputChange && onInputChange(e);
  }
  



  return (
    <div>
      <div className="container text-center mt-5">
        <p className='h5 mb-3'>Please enter your password to close the account</p>
        <form>
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
        </form>
        <br />
      </div >
    </div >
  );
}

export default CloseAccount;