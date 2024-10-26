import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import pic from "./carstat.png"
import {Tabs, Tab, Input, Button, Card, CardBody, CardHeader} from "@nextui-org/react";
import {EyeFilledIcon} from "./EyeFilledIcon";
import {EyeSlashFilledIcon} from "./EyeSlashFilledIcon";
import Typed from 'typed.js';
import Footerlogin from "./FooterLogin"
import { jwtDecode } from 'jwt-decode'; // Correct import statement
////
import "./Register.css";


import Modal from './Modal'; // Import the modal component


function Register2() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = React.useState(false);
const toggleVisibility = () => setIsVisible(!isVisible);
const [selected, setSelected] = React.useState("login");
const [isLoaded, setIsLoaded] = useState(false);
////sin
const [alertType, setAlertType] = useState('error');

  const [usergo, setUsergo] = useState(null);
///sign


function handleCallbackResponse(response) {
  console.log("Encoded JWT ID token:" + response.credential);
  var userObject = jwtDecode(response.credential);
  console.log(userObject);
  setUsergo(userObject);
  handleGoogleLogin(userObject); // Trigger Google login
  handleGoogleRegister(userObject); // Trigger Google registration
}
const handleGoogleRegister = async (userObject) => {
  setIsLoading(true);
  setShowAlert(false);

  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/google-register`, {
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
      const loginResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
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
console.log("message",message)
console.log("showAlert",showAlert)
const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};

const handleSubmiti = async (e) => {
  console.log("handleSubmiti")
  e.preventDefault();
  setIsLoading(true);
  setShowAlert(false);

  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/register`, {
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
    }, 14000);
  } catch (error) {
    console.error('Registration error:', error);
    setMessage('An error occurred. Please try again.');
    setAlertType('error');
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 20000);
  }
};
useEffect(() => {
  const trackHomeVisit = async () => {
    try {
      // Check if the visit has already been logged
      const isVisitLogged = localStorage.getItem('homeVisitLogged');
      if (!isVisitLogged) {
        const response = await fetch('https://api.dynamofleet.com/dywebsite/trackAction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ actionName: 'App-HomePage-Register' }),
        });
        if (response.ok) {
        
          localStorage.setItem('homeVisitLogged', true);
        } else {
         
        }
      } else {
       
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Call the trackHomeVisit function when the Home component mounts
  trackHomeVisit();
}, [1]);
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
  
    button.style.borderRadius = '5px';
  
  }
}, []);
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const options = {
      strings: ['fleet', 'vehicles', 'drivers'],
      typeSpeed: 280,
      backSpeed: 180,
      loop: true,
    };

    const typed = new Typed('#typed', options);

    // Cleanup
    return () => {
      typed.destroy();
    };
  }, []);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
   
  
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
        const loginResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
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
          const registerResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/google-register`, {
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
            const newLoginResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
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
        
        button.style.borderRadius = '5px';

      }
    }, []);
    
  
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };
  
    const handleSubmit = async (e) => {
      console.log("handleSubmit")
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
  
    useEffect(() => {
      const trackHomeVisit = async () => {
        try {
          // Check if the visit has already been logged
          const isVisitLogged = localStorage.getItem('homeVisitLogged');
          if (!isVisitLogged) {
            const response = await fetch('https://api.dynamofleet.com/dywebsite/trackAction', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ actionName: 'App-HomePage' }),
            });
            if (response.ok) {
            
              localStorage.setItem('homeVisitLogged', true);
            } else {
             
            }
          } else {
           
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };
    
      // Call the trackHomeVisit function when the Home component mounts
      trackHomeVisit();
    }, [1]);

  return (
    <div className="flex flex-col h-screen w-screen" style={{ backgroundColor: "#f4f4f5" }}>
      <div className='flex'>
          <div className="hidden md:flex w-3/4 bg-cover bg-center">
        <div className="hidden md:flex w-4/4">



        <div className={`relative w-full isolate ml-32 pt-40 lg:px-8 ${isLoaded ? 'animate-fadeIn' : 'opacity-0'}`}>
          <div
            aria-hidden="true"
            className="absolute  inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 "
          >
            <div
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
              className="relative  left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            />
          </div>
          <div className="mx-auto max-w-2xl py-16 sm:py-20 lg:py-10">
          
            <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-600 sm:text-6xl custom-font">
          Manage and monitor every aspect of your <br></br> <span id="typed" className="text-blue-400"></span>.
        </h1>

        <p className="mt-6 text-base leading-8 text-gray-600 hidden xl:block">
              DynamoFleet is the ideal fleet management software, providing comprehensive solutions to manage both your vehicles and drivers. Enhance cost efficiency, and assume full control over your fleet management.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button
                color="success"
                variant="flat"
                className="shadow-2xl border border-indigo-300 text-gray-700"
                as="a"
                href="https://www.dynamofleet.com/"
                target="_blank" // optional, to open in a new tab
                rel="noopener noreferrer" // optional, for security reasons
              >
                Visit our website
              </Button>

              
              <a href="https://www.dynamofleet.com/learn" className="text-sm font-semibold leading-6 text-gray-900">
              Learn more <span aria-hidden="true">→</span>
              </a>

              </div>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          >
            <div
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
              className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            />
          </div>

          
        </div>





          </div>
          </div>


          <div className="flex-1 pr-40 flex flex-col w-full justify-center items-center p-4 pt-40">
        <Card className="max-w-full w-[340px]  rounded-lg h-[450px]" style={{border:'1px solid blue'}}>
          <CardBody className="overflow-hidden ">
            <Tabs
              fullWidth
              size="md"
              aria-label="Tabs form"
              selectedKey={selected}
              onSelectionChange={setSelected}
            
            >
              {/* <Tab key="login" title="Login"  style={{ outline: 'none' }}>
                <form className="flex flex-col gap-6 focus:outline-none" onSubmit={selected === "login" ? handleSubmit : handleSubmiti}>
                <div className="space-y-4">
                <p className=" text-xs mb-0">Email</p>
                <Input
                  isRequired
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
<div>
                  <p className="text-center text-small">
                    Need to create an account?{" "}
                    <span className="text-blue-600 cursor-pointer">
                    <Link to="/register">Sign up.</Link>
                  </span>

                    </p>
                    <p className="text-center text-sm mt-0 pt-0 mb-1">
                    Did you forget your password?{" "}
                    <Link to="/change-password" className="text-blue-600 cursor-pointer">
                      Reset.
                    </Link>
                  </p>

                  </div>
                 
                  <div className="flex gap-2 justify-end mt-14">
                    <Button fullWidth color="primary" variant='flat' type="submit"  disabled={isLoading} className="shadow-2xl border border-indigo-600 ">
                    {isLoading ? 'Logging In...' : 'Login'}
                    </Button>
                  </div>
                  <div className='passwrongi'>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
                </form>
              </Tab> */}
              <Tab key="sign-up" title="Sign up"  className={`${selected=='sign-up'?'focus:outline-none':''}`} style={{ outline: 'none' }}>
                <form className="flex flex-col gap-4 h-[300px] focus:border-none ">
                <p className=" text-xs">Username</p>
                  <Input  
                  type="text"
                  name="username" 
                  value={formData.username} 
                  onChange={handleChange} 
                  color="secondary" 
                  isRequired  
                  style={{
                        backgroundColor: "transparent", // No background color
                        border: "none",                 // No border
                        outline: "none",                // No outline
                        boxShadow: "none", 
                        color:'black',  
                        marginTop:'0px'
                        
                      
                      }}
                      className="max-w-xs mt-0  " 
                      placeholder="Enter your name" />
                  <p className=" text-xs">Email</p>
                  <Input   
                        color="secondary" 
                        isRequired  
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange}
                        style={{
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
                    
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange}
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
                 <p className="text-center text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-600 cursor-pointer">
                      Login
                    </Link>
                  </p>

                  <div className="flex gap-2 justify-end mt-2">
                    <Button fullWidth color="primary" variant='flat' type="submit"  disabled={isLoading} onClick={handleSubmiti} className="shadow-2xl border border-indigo-600">
                     
                      {isLoading ? 'Registering...' : 'Register'}
                    </Button>
                  </div>
                </form>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
        <div className='text-sm mt-1 mb-2 text-gray-600'>Alternatively, {selected=="login"?'Log in':'sign in'} with your Google Account.</div>
        <div id='signInDiv'></div>
          </div>

        
          <div className="greenSquare"></div>
          <div className="greenSquare2"></div>
        </div>
        <div  style={{marginTop:'47px'}}>
        <Footerlogin/>
        </div>

        <Modal show={showAlert} message={message} onClose={() => setShowAlert(false)} alertType={alertType} />
    </div>
  )
}

export default Register2
