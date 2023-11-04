import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface InternalTransferProps {
  onChange?: () => void;
  onClose?: () => void;
}

function InternalTransfer({ onChange, onClose }: InternalTransferProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [phoneError, setPhoneError] = useState<string>(''); // Separate error state for phone
  const [emailError, setEmailError] = useState<string>(''); // Separate error state for email
  const [amountError, setAmountError] = useState<string>(''); // Separate error state for amount

  const gotoAccountPage = () => {
    navigate('/accountPage');
  }

  function isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  }

  function isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (email.trim() === '' || !isValidEmail(email)) {
      setEmailError("Enter a valid email");
    } else {
      setEmailError("");
    }

    if (phone.trim() === '' || !isValidPhoneNumber(phone)) {
      setPhoneError("Enter a valid phone number");
    } else {
      setPhoneError("");
    }

    if (amount.trim() === '' || parseFloat(amount) <= 0) {
      setAmountError("Enter a valid amount");
    } else {
      setAmountError("");
    }
  }

  return (
    <div>
      {/* main content */}
      <div className="container mt-5">
        <p className="text-center">Send</p>
        <form onSubmit={handleSubmit}>
          <div className="input-group rounded">
            <input
              type="text"
              className="form-control rounded"
              placeholder="Please enter the account ID of the recipient account"
              aria-label="Search"
              aria-describedby="search-addon"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <p className="text-danger">{emailError}</p>

          <div className="input-group rounded">
            <input
              type="number"
              className="form-control rounded"
              placeholder="Enter Amount $"
              aria-label="Search"
              aria-describedby="search-addon"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <p className="text-danger">{amountError}</p>

          <div className="text-center">
            <button type="submit" className="btn btn-primary">Confirm</button>
          </div>
        </form>
        <br />
      </div>
    </div>
  );
}

export default InternalTransfer;
