import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import MainPage from './MainPage';
import Login from './Login';
import LogIn2 from './LogIn2';
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
          <Route path="/login" element={<LogIn2 />} />
          <Route path="/*" element={<PrivateRoute element={<MainPage />} />} />
          <Route path="/change-password" element={<ChangePass />} />
        </Routes>
      </Router>
    </CarDriverProvider>
  );
};

export default App;
