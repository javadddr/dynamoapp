import React, { useState } from 'react';
import Footerlogin from "./FooterLogin"
import { Card, CardBody, Button } from '@nextui-org/react';
function ChangePass() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messagew, setMessagew] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/request-password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setIsLoading(false);
    if (response.ok) {
      setMessage(''); // Clear any previous error message
      setMessagew('Email sent. Please check your inbox for the password reset link.')
      setShowPopup(true); // Show popup on success
    } else {
      setMessage('Failed to send password reset email. Please try again.');
      setShowPopup(false); // Ensure the popup is not shown on failure
      setIsLoading(false);
    }
  };
  const subheading="Forget your password?"
  const heading="Request a new password"

  const text="Please enter the email address that you used to register, and we will send you a link to reset your password via Email."

  return (
    <div>
    <div className='mainlogin'>
    {showPopup && (
  <div className="popup">
    <div className="popup-content">
      <div className="gif">
    

      </div>
      <div className="messageandemail">
      {messagew}
      <button onClick={() => setShowPopup(false)}>Close</button>
      </div>
      
    </div>
    
  </div>
)}

        <div className='reseterror'>
        {message && !showPopup && <div className="message">{message}</div>}
        </div>
    
    
   
      



      <section className="py-6 md:py-8 lg:py-12 xl:py-20" >
      <div className="container mx-auto">
        <div className="flex flex-col justify-center items-center text-center">
          {subheading && (
            <p className="text-primary uppercase m-0">
              {subheading}
            </p>
          )}
          {heading && (
            <h1 className="font-extrabold leading-tight text-4xl md:text-5xl lg:text-6xl">
              {heading}
            </h1>
          )}
          {text && (
            <p className="mt-2 text-lg">
              {text}
            </p>
          )}
          <div className="flex justify-center align-center text-center">
          <form  onSubmit={handleSubmit} className="grid grid-cols-1 ml-56 mb-5  md:grid-cols-2 mt-6 gap-1 text-center md:w-auto">
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              type="email"
              id="form-002-email"
              name="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email" 
              required 
              className="p-2 border border-gray-300 rounded-md w-[300px]"
            />
            <Button
              type="submit"
              className=" p-2 w-[100px]"
              disabled={isLoading}
              color='success'
              variant='flat'
              radius="sm"
            >
              Request
            </Button>
          </form>
          </div>
        </div>
      </div>
      <div className='flex justify-center'>
        <a href="/login">Already have an account? <span style={{color:'blue'}}>Login.</span></a>
      </div>
      <div className='flex justify-center'>
       <a href="/register">Don't have an account? <span style={{color:'blue'}}>Sign up.</span></a>
      </div>
    </section>
    <div className="greenSquare"></div>
          <div className="greenSquare2"></div>
    </div>
     <div  style={{marginTop:'-80px'}}>
     <Footerlogin/>
     </div>
     </div>
  );
}

export default ChangePass;
