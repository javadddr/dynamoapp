import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import "./Login.css";
import logo from "./assets/logo5.png";
import eye from "../src/eye.png";
import eye1 from "../src/eye1.png";
import { jwtDecode } from 'jwt-decode';

import {Tabs, Tab, Input, Button, Card, CardBody, CardHeader} from "@nextui-org/react";
import {EyeFilledIcon} from "./EyeFilledIcon";
import {EyeSlashFilledIcon} from "./EyeSlashFilledIcon";
import { color } from 'framer-motion';
function Login() {
const backendUrl = import.meta.env.VITE_BACKEND_URL;
const [isVisible, setIsVisible] = React.useState(false);

const toggleVisibility = () => setIsVisible(!isVisible);
const [selected, setSelected] = React.useState("login");

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  function handleCallbackResponse(response) {
    console.log("Encoded JWT ID token:" + response.credential);
    var userObject = jwtDecode(response.credential);
    console.log(userObject);
    handleGoogleLogin(userObject); // Trigger Google login
  }

  const handleGoogleLogin = async (userObject) => {
    setIsLoading(true);

    try {
      // Attempt to log in the user
      const loginResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userObject.email,
          password: 'google_oauth' // Use the default password for Google login
        }),
      });
      const loginData = await loginResponse.json();

      if (loginResponse.ok) {
        // Store user information and token in localStorage
        storeUserData(loginData);
        navigate('/fleet-overview'); // Redirect to MainPage
      } else {
        // If login fails, attempt to register the user
        const registerResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/google-register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userObject.email,
            name: userObject.name
          }),
        });

        const registerData = await registerResponse.json();

        if (registerResponse.ok) {
          // Proceed to login after successful registration
          const newLoginResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: userObject.email,
              password: 'google_oauth' // Use 'google_oauth' as the password for Google login
            }),
          });

          const newLoginData = await newLoginResponse.json();

          if (newLoginResponse.ok) {
            storeUserData(newLoginData);
            navigate('/fleet-overview'); // Redirect to MainPage after login
          } else {
            setErrorMessage('Login after registration failed. Please try logging in manually.');
          }
        } else {
          setErrorMessage('Google Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Google login error:', error);
      setErrorMessage('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const storeUserData = (data) => {
    localStorage.setItem('userToken', data.token);
    localStorage.setItem('userRoles', data.result.roles);
    localStorage.setItem('username', data.result.username);
    localStorage.setItem('userEmail', data.result.email);
    localStorage.setItem('userId', data.result._id);
    localStorage.setItem('capacity', data.result.capacity.toString());
    localStorage.setItem('tokentime', new Date().toISOString());
    const createdAtDate = new Date(data.result.createdAt);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - createdAtDate.getTime();
    const daysSinceCreation = Math.floor(timeDiff / (1000 * 3600 * 24));
    localStorage.setItem('createdAtDays', daysSinceCreation.toString());
  };


  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
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
      button.style.width = '100%';  // Set full width
    }
  }, []);
  

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
 
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
  
      setIsLoading(false);
      if (response.ok) {
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userRoles', data.result.roles);
        localStorage.setItem('username', data.result.username);
        localStorage.setItem('userEmail', data.result.email);
        localStorage.setItem('userId', data.result._id);
        localStorage.setItem('capacity', data.result.capacity.toString());
       
        const createdAtDate = new Date(data.result.createdAt);
        const currentDate = new Date();
        const timeDiff = currentDate.getTime() - createdAtDate.getTime();
        const daysSinceCreation = Math.floor(timeDiff / (1000 * 3600 * 24));
        localStorage.setItem('createdAtDays', daysSinceCreation.toString());
        localStorage.setItem('tokentime', new Date().toISOString());
        navigate('/fleet-overview'); // Redirect to MainPage
      } else {
        setErrorMessage('Login failed. Please verify your credentials and try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      navigate('/fleet-overview');
    }
  }, [navigate]);

  return (
    <div className='mainlogin'>
      <div className="login-container">
        <form onSubmit={handleSubmit} className="login-form">
          <h2>Login</h2>
          <div className='email'>
            <label>Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="password-field">
            <label>Password:</label>
            <div className='eyeandpass'>
              <div className='onlypass'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div onClick={togglePasswordVisibility} className="password-toggle">
                <img src={showPassword ? eye1 : eye} style={{ width: '30px' }} alt="Toggle Password Visibility" />
              </div>
            </div>
          </div>
          <div className='buttonlogin'>
            <button id='justatikso' type="submit" className="form-submit" disabled={isLoading}>
              {isLoading ? 'Logging In...' : 'Log In'}
            </button>
          </div>
          <div className='passwrongi'>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
          <div className='googldivin'>Alternatively, sign in with your Google Account.</div>
          <div id='signInDiv'></div>
          <div className='forgotpass'>
            <Link to="/change-password">Did you forget your password? <span>Click here!</span></Link>
          </div>
          <div className='forgotregister'>
            <Link to="/register">Don't have an account? <span>Sign up here!</span></Link>
          </div>
        </form>
        <div className="greenSquare"></div>
        <div className="greenSquare2"></div>
      </div>
      <div className="flex flex-col w-full">
      <Card className="max-w-full w-[340px]  rounded-sm h-[400px]">
        <CardBody className="overflow-hidden ">
          <Tabs
            fullWidth
            size="md"
            aria-label="Tabs form"
            selectedKey={selected}
            onSelectionChange={setSelected}
          
          >
            <Tab key="login" title="Login"  style={{ outline: 'none' }}>
              <form className="flex flex-col gap-6 focus:outline-none">
              <div className="space-y-4">
   <p className=" text-xs mb-0">Email</p>
  <Input
    isRequired

    placeholder="Enter your email"
    labelPlacement="outside"
  
    type="email"
    color="secondary"
   
    style={{
      backgroundColor: "transparent", // No background color
      border: "none",                 // No border
      outline: "none",                // No outline
      boxShadow: "none", 
      color:'black',  
      marginTop:'0px'
      
     
    }}
    className="max-w-xs mt-0  "
  />
    <p className=" text-xs mb-5">Password</p>
  <Input
 
  placeholder="Enter your password"
  labelPlacement="outside"
  color="secondary"
  endContent={
    <button
      className="focus:outline-none focus:text-gray-900 "
      type="button"
      onClick={toggleVisibility}
      aria-label="toggle password visibility"
    >
      {isVisible ? (
        <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
      ) : (
        <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
      )}
    </button>
  }
  type={isVisible ? "text" : "password"}
  variant="flat"
  style={{
    backgroundColor: "transparent", // No background color
    border: "none",                 // No border
    outline: "none",                // No outline
    boxShadow: "none", 

    color:'black'            // No shadow
  }}
  className="max-w-xs text-gray-900"
/>


</div>

                <p className="text-center text-small">
                  Need to create an account?{" "}
                  <Link size="sm" onPress={() => setSelected("sign-up")}>
                    Sign up
                  </Link>
                </p>
                <div className="flex gap-2 justify-end">
                  <Button fullWidth color="primary" variant='flat'>
                    Login
                  </Button>
                </div>
              </form>
            </Tab>
            <Tab key="sign-up" title="Sign up"  className={`${selected=='sign-up'?'focus:outline-none':''}`} style={{ outline: 'none' }}>
              <form className="flex flex-col gap-4 h-[300px] focus:border-none ">
              <p className=" text-xs">Name</p>
                <Input   color="secondary" isRequired  style={{
                      backgroundColor: "transparent", // No background color
                      border: "none",                 // No border
                      outline: "none",                // No outline
                      boxShadow: "none", 
                      color:'black',  
                      marginTop:'0px'
                      
                     
                    }}
                    className="max-w-xs mt-0  " placeholder="Enter your name" type="password" />
                <p className=" text-xs">Email</p>
                <Input   color="secondary" isRequired  style={{
                      backgroundColor: "transparent", // No background color
                      border: "none",                 // No border
                      outline: "none",                // No outline
                      boxShadow: "none", 
                      color:'black',  
                      marginTop:'0px'
                      
                     
                    }}
                    className="max-w-xs mt-0  " placeholder="Enter your email" type="email" />
                <p className=" text-xs">Password</p>
                <Input
                  
                   
                    placeholder="Enter your password"
                    endContent={
                      <button className="focus:outline-none" type="button" onClick={toggleVisibility} aria-label="toggle password visibility">
                        {isVisible ? (
                          <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                        ) : (
                          <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                        )}
                      </button>
                    }
                    type={isVisible ? "text" : "password"}
                    color="secondary"
   
                    style={{
                      backgroundColor: "transparent", // No background color
                      border: "none",                 // No border
                      outline: "none",                // No outline
                      boxShadow: "none", 
                      color:'black',  
                      marginTop:'0px'
                      
                     
                    }}
                    className="max-w-xs mt-0  "
                  />
                <p className="text-center text-small">
                  Already have an account?{" "}
                  <Link size="sm" onPress={() => setSelected("login")}>
                    Login
                  </Link>
                </p>
                <div className="flex gap-2 justify-end">
                  <Button fullWidth color="primary" variant='flat'>
                    Sign up
                  </Button>
                </div>
              </form>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
    </div>
  );
}

export default Login;
