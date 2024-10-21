// SetPassword.js
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
function SetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { token } = useParams(); // Capture the token from the URL
  const navigate = useNavigate();
  const [alert, setAlert] = useState({ show: false, severity: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
   
    if (password !== confirmPassword) {
      setIsLoading(false);
      setAlert({ show: true, severity: 'error', message: 'Passwords do not match.' });
      setTimeout(() => {
        setAlert({ show: false, severity: '', message: '' }); // Automatically hide the alert after 3 seconds
      }, 3000);
      return;
    }
  
    try {
      // Adjust this URL to match your actual backend endpoint for setting a new password
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/set-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }), // Ensure you're sending both the token and the new password
      });
      setIsLoading(false);
      if (!response.ok) {
        throw new Error('Failed to set password.');
      }

      setAlert({ show: true, severity: 'success', message: "Your password has been set" });
      setTimeout(() => {
        setAlert({ show: false, severity: '', message: '' });

      }, 3000); // Disappear after 3 seconds
      navigate('/login');
    } catch (error) {
      
      setAlert({ show: true, severity: 'error', message:'Failed to set the password. Please try again.' });
      setTimeout(() => {
        setAlert({ show: false, severity: '', message: '' });
      }, 3000);
    }
  };
  

  return (
    <div className='mainlogin'>
       <div className="login-container">
       {alert.show && (
          <Stack sx={{ position: 'fixed', top: 110, width: '20%', zIndex: 1000 }} spacing={2}>
            <Alert variant="filled" severity={alert.severity}>
              {alert.message}
            </Alert>
          </Stack>
        )}
      <form onSubmit={handleSubmit} className="login-form">
      <h2>Set Your Password</h2>
        <input
          type="text"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ color: 'black' }}
        />
        <input
          type="text"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={{ color: 'black' }}
        />
       
        <button id='justatikso' type="submit" className="form-submit" disabled={isLoading}>
            {isLoading ? 'Setting Password...' : 'Set Password'}
          </button>
      </form>
  
      </div>
    </div>
  );
}

export default SetPassword;
