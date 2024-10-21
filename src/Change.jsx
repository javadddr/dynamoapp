
import React, { useState } from 'react';
import eye from "../src/eye.png"
import eye1 from "../src/eye1.png"
import "./Login.css"
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
function Change() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [alert, setAlert] = useState({ show: false, severity: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Use useNavigate hook
  
  
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

    // Ensure the token is included in the body correctly
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    const data = await response.json(); // Parse JSON response
    setIsLoading(false);
    if (response.ok) {
      setAlert({ show: true, severity: 'success', message: data.message });
      setTimeout(() => {
        setAlert({ show: false, severity: '', message: '' });
        navigate('/login'); // Redirect after alert disappears
      }, 3000); // Disappear after 3 seconds
      navigate('/login'); // Redirect to login page after successful password change
    } else {
      setAlert({ show: true, severity: 'error', message: data.message || 'Failed to change password. Please try again.' });
      setTimeout(() => {
        setAlert({ show: false, severity: '', message: '' });
      }, 3000);
    }
  };
  const togglePasswordVisibility = () => { // Add this function
    setShowPassword(!showPassword);
  };
  const togglePasswordVisibility1 = () => { // Add this function
    setShowPassword1(!showPassword1);
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
      <h2>Choose a new password</h2>
      <div className='email'>
        <label>New Password:</label>
        <input 
          type={showPassword1 ? 'text' : 'password'}
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="New password" 
          required 
        />
         </div>
         <div onClick={togglePasswordVisibility1} className="password-toggle2">
            <img src={showPassword1 ? eye1 : eye} style={{width:'30px'}} alt="Toggle Password Visibility" />
          </div>
         <div className='email'>
        <label>Repeat the new password:</label>
        <input 
           type={showPassword ? 'text' : 'password'}
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          placeholder="Confirm new password" 
          required 
        />
         </div>
        
          <div onClick={togglePasswordVisibility} className="password-toggle1">
            <img src={showPassword ? eye1 : eye} style={{width:'30px'}} alt="Toggle Password Visibility" />
          </div>
       
        <button id='justatikso' type="submit" className="form-submit" disabled={isLoading}>
            {isLoading ? 'Changing...' : 'Change password'}
          </button>
        <div className='linkins'>
        <div className='forgotpassddo'>
        <a href="/login">Already have an account? <span>Log in here</span></a>
      </div>
      <div className='forgotrigister'>
       <a href="/register">Don't have an account? <span>Sign up here!</span></a>
      </div>
        </div>
      </form>
    
    </div>
    </div>
  );
}

export default Change;
