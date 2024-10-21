import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import MainPage from './MainPage';
import Login from './Login';
import Register from './Register';
import Home from './Home';
import { CarDriverProvider } from './CarDriver';
import ChangePass from './ChangePass';
const PrivateRoute = ({ element }) => {
  const token = localStorage.getItem('userToken');
  return token ? element : <Navigate to="/login" />;
};

const App = () => {
  return (
    <CarDriverProvider>
      <Router>
        <Routes>
        <Route path="/activate/:token" element={<Home />} /> 
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<PrivateRoute element={<MainPage />} />} />
          <Route path="/change-password" element={<ChangePass />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </CarDriverProvider>
  );
};

export default App;
