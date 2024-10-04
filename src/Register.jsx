//this is here just to give the props to login page 
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';


import Modal from './Modal'; // Import the modal component
import { jwtDecode } from 'jwt-decode'; // Correct import statement


function Register() {
  const navigate = useNavigate();
  const [alertType, setAlertType] = useState('error');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usergo, setUsergo] = useState(null);

  function handleCallbackResponse(response) {
    console.log("Encoded JWT ID token:" + response.credential);
    var userObject = jwtDecode(response.credential);
    console.log(userObject);
    setUsergo(userObject);
    handleGoogleRegister(userObject); // Trigger Google registration
  }

  const handleGoogleRegister = async (userObject) => {
    setIsLoading(true);
    setShowAlert(false);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/google-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userObject.email,
          name: userObject.name
        }),
      });
      const data = await response.json();

      if (response.ok) {
        // Proceed to login after successful registration
        const loginResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userObject.email,
            password: 'google_oauth' // Use 'google_oauth' as the password for Google login
          }),
        });
        const loginData = await loginResponse.json();

        if (loginResponse.ok) {
          localStorage.setItem('userToken', loginData.token);
          localStorage.setItem('userRoles', loginData.result.roles);
          localStorage.setItem('username', loginData.result.username);
          localStorage.setItem('userEmail', loginData.result.email);
          localStorage.setItem('userId', loginData.result._id);
          localStorage.setItem('capacity', loginData.result.capacity.toString()); // Save capacity as a string

          // Calculate and save the days since account creation
          const createdAtDate = new Date(loginData.result.createdAt);
          const currentDate = new Date();
          const timeDiff = currentDate.getTime() - createdAtDate.getTime();
          const daysSinceCreation = Math.floor(timeDiff / (1000 * 3600 * 24)); // Convert milliseconds to days
          localStorage.setItem('createdAtDays', daysSinceCreation.toString()); // Save as a string

          navigate('/main'); // Redirect to MainPage after login
        } else {
          setMessage('Login after registration failed. Please try logging in manually.');
          setAlertType('error');
          setShowAlert(true);
        }
      } else {
        setMessage('Google Registration failed. Please try again.');
        setAlertType('error');
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Google registration error:', error);
      setMessage('An error occurred. Please try again.');
      setAlertType('error');
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: handleCallbackResponse
    });
    google.accounts.id.renderButton(
      document.getElementById("signInDiv"),
      { theme: "outline", size: "large" }
    );
    const button = document.querySelector('#signInDiv div');
    if (button) {
      button.style.border = '1px solid yellow';
      button.style.boxShadow = 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px';
      button.style.borderRadius = '5px';
    }
  }, []);

  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      navigate('/main');
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setShowAlert(false);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      setMessage(data.message || (response.ok ? `Registration successful. Please check your email (${formData.email}) to activate your account.` : 'Registration failed. Please try again.'));
      setAlertType(response.ok ? 'success' : 'error');
      setIsLoading(false);
      setShowAlert(true);

      setTimeout(() => {
        setShowAlert(false);
        if (response.ok) {
          navigate('/main'); // Redirect to MainPage
        }
      }, 4000);
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('An error occurred. Please try again.');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 20000);
    }
  };

  return (
    <div className='register-main'>
      <div className="form-container">
      {message && showAlert && (
        <Stack sx={{ width: '100%', position: 'absolute', top: -90, left: 0, zIndex: 1000, borderRadius: '30px' }} spacing={2}>
          <Alert
            className={`alert-enter ${showAlert ? 'alert-enter-active' : 'alert-exit-active'}`}
            variant="filled"
            severity={alertType}
            sx={{
              fontSize: '16px',
              borderRadius: '10px',
              '& .MuiAlert-message': {
                fontSize: '16px'
              }
            }}
          >
            {message}
          </Alert>
        </Stack>
      )}
        <form onSubmit={handleSubmit} className="register-form">
          <h2>Register</h2>
          <div className="email">
            <label>Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required />
          </div>
          <div className="email">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="password-field">
          <label>Password</label>
          <div className='eyeandpass'>
            <div className='onlypass'>
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required />
              <div onClick={togglePasswordVisibility} className="password-toggle">

              </div>
            </div>
          </div>
          </div>
          <button id='justatikso' type="submit" className="form-submit" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
          <div className='googldivin'>Alternatively, Register with your Google Account.</div>
          <div id='signInDiv'></div>
          <h6 className="term-form-footer">
            By registering, you accept our <br />
            <a href="https://dynamofleet.com/terms-of-service" target="_blank" rel="noopener noreferrer" style={{ color: 'blue' }}>Terms of Service</a> and <a href="https://dynamofleet.com/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: 'blue' }}>Privacy Notice</a>.
          </h6>
        
          <p className="form-footer">
             <Link to="/login">Already have an account? <span>Log in here</span></Link>.
          </p>
        </form>
        <div className="greenSquare"></div>
          <div className="greenSquare2"></div>
      </div>
 
      <div className='company-info'>
     
        <a href="https://dynamofleet.com/" target="_blank" rel="noopener noreferrer">DynamoFleet</a> is a premium product developed by DynamoChart UG, based in Germany.<br />&copy; 2024 DynamoChart UG. All rights reserved.
      </div>
      <Modal show={showAlert} message={message} onClose={() => setShowAlert(false)} alertType={alertType} />
    </div>
  );
}

export default Register;

