import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import MainPage from './MainPage';
import Login from './Login';
import Register from './Register';
import Home from './Home';
import { CarDriverProvider } from './CarDriver';
import Change from './Change';
import ChangePass from './ChangePass';
import SetPassword from './SetPassword';
import LogIn2 from './LogIn2';
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
        <Route path="/reset-password/:token" element={<Change />} />
          <Route path="/login" element={<LogIn2 />} />
          <Route path="/*" element={<PrivateRoute element={<MainPage />} />} />
          <Route path="/change-password" element={<ChangePass />} />
          <Route path="/register" element={<Register />} />
          <Route path="/set-password/:token" element={<SetPassword />} />
        </Routes>
      </Router>
    </CarDriverProvider>
  );
};

export default App;
