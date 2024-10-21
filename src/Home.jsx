import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate instead of useHistory

function Home() {
  const { token } = useParams();
  const [activationStatus, setActivationStatus] = useState('');
  const navigate = useNavigate(); // Use useNavigate hook

  useEffect(() => {
    if (token) {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/activate/${token}`)
        .then(response => {
          if (response.ok && response.headers.get("Content-Type")?.includes("application/json")) {
            return response.json();
          }
          throw new Error('Network response was not ok or not JSON.');
        })
        .then(data => {
        
          setActivationStatus('Account activated successfully. You can now log in.');
          navigate('/login'); // Redirect to login page after setting the activation status
        })
        .catch(error => {
          console.log(error); // Logs any error, including parsing issues
          setActivationStatus('Failed to activate account. The link may be expired or invalid.');
        });
    }
  }, [token, navigate]); // Add navigate as a dependency

  return (
    <div>
      {activationStatus || 'Activation in progress...'}
    </div>
  );
}

export default Home;
