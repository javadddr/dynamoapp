// MainPage.jsx
import React, { useState, useEffect } from 'react';
import { Route, Routes ,Navigate} from 'react-router-dom';
import Sidebar from './Sidebar';
import FleetOverviewWrapper from './FleetOverviewWrapper';
import Vehicles from './Vehicles';
import { Link } from 'react-router-dom';
import Drivers from './Drivers';
import VehicleInspection from './VehicleInspection';
import DriversLicense from './DriversLicense';
import DrivingFines from './DrivingFines';
import Equipments from './Equipments';
import Areas from './Areas';
import Reports from './Reports';
import ManageUser from './ManageUser';
import MyPlan from './MyPlan';
import HelpMe from './HelpMe';
import Nav from './Nav';
import Data from './Data';
import Loading from './Loading';
import { useCars, useDrivers } from './CarDriver';
import "./MainPage.css"
import {  Button } from "@nextui-org/react";
const MainPage = () => {
  const [theme, setTheme] = useState('light');
  const [lan, setLan] = useState('');
  useEffect(() => {
    const storedLan = localStorage.getItem('lan');
    if (storedLan) {
      setLan(storedLan); // Use the stored value if it exists
    } else {
      localStorage.setItem('lan', 'US'); // Set default value in localStorage
      setLan('US'); // Set the default state
    }
  }, []);
  
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const token = localStorage.getItem('userToken');
  const userId = localStorage.getItem('userId');
  const capacity = Number(localStorage.getItem('capacity')); // Convert to number
  const createdAtDays = Number(localStorage.getItem('createdAtDays')); // Convert to number
  const showTrialEndedOverlay = capacity === 0 && createdAtDays >= 14;

  const changeTheme = (value) => {
    setTheme(value ? 'dark' : 'light');
  };


  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const { cars, refreshCars, updateCarStatusInContext } = useCars();
  const { drivers, refreshDrivers, updateDriverStatusInContext } = useDrivers();

  useEffect(() => {
    refreshCars();
    refreshDrivers();
  }, [refreshCars, refreshDrivers]);

  const handleSubscribeClick = () => {
   
  
    if (!token || !userId) {
      console.error("User token or ID is missing!");
      return; // Exit if no token or userId is available
    }
  
    // Construct the URL with query parameters
    const billingUrl = new URL('https://billing.dynamofleet.com');
    billingUrl.searchParams.append('token', token);
   
    // Navigate to the billing page in the same tab with parameters
    window.location.href = billingUrl.href;

  };

  return (
    <div>
      {showTrialEndedOverlay ? (
        <div className="flex justify-center  backdrop-blur-md items-center h-screen w-full relative">
       <div className="text-center">
          <div className=" ">
            <h2 className='text-3xl font-extrabold'>Your trial period has come to an end!</h2>
            <p>Subscribe now to continue using our services.</p>
            <Button
            color="secondary"
            variant="flat"
            className="px-4 py-2 mt-4 w-[200px]"
              onClick={handleSubscribeClick}
              
            >
              Subscribe
            </Button>
           
          </div>
          Or
          <div>
          <Link to="https://www.dynamofleet.com/contact" target="_blank">
          <Button
            color="warning"
            variant="flat"
            className="px-4 py-2 mt-0 w-[200px]"
          >
            Contact us
          </Button>
        </Link>
          </div>
          </div>
        
        </div>
      ) : (
        // Show the main content when trial is still active
        <div className="flex h-screen overflow-hidden">
          <Sidebar theme={theme} lan={lan} collapsed={collapsed} userId={userId} token={token}/>
          <div className={`flex flex-col flex-grow transition-all duration-300 ${collapsed ? 'ml-14' : 'ml-56'}`}>
            <Nav theme={theme} setLan={setLan} lan={lan} collapsed={collapsed} changeTheme={changeTheme} toggleSidebar={toggleSidebar} />
            <div className="flex-grow overflow-auto">
              {loading ? (
                <Loading />
              ) : (
                <Routes>
                  <Route path="/" element={<Navigate to="/fleet-overview" />} />
                  <Route path="/fleet-overview" element={<FleetOverviewWrapper theme={theme} />} />
                  <Route path="/vehicles" element={<Vehicles data={data} cars={cars} theme={theme} updateCarStatusInContext={updateCarStatusInContext} drivers={drivers} refreshCars={refreshCars}/>} />
                  <Route path="/drivers" element={<Drivers data={data} cars={cars} theme={theme} updateDriverStatusInContext={updateDriverStatusInContext} drivers={drivers} refreshCars={refreshCars} />} />
                  <Route path="/vehicle-inspection" element={<VehicleInspection theme={theme} data={data} />} />
                  <Route path="/drivers-license" element={<DriversLicense data={data} theme={theme} />} />
                  <Route path="/driving-fines" element={<DrivingFines data={data} theme={theme} />} />
                  <Route path="/equipments" element={<Equipments data={data} theme={theme} />} />
                  <Route path="/areas" element={<Areas data={data} cars={cars} theme={theme} />} />
                  <Route path="/reports" element={<Reports data={data} theme={theme} />} />
                  <Route path="/manage-user" element={<ManageUser data={data} theme={theme} />} />
                  <Route path="/my-plan" element={<MyPlan data={data} theme={theme} />} />
                  <Route path="/help-me" element={<HelpMe data={data} theme={theme} />} />
                </Routes>
              )}
            </div>
          </div>
          <Data setLoading={setLoading} setData={setData} />
        </div>
      )}
    </div>
  );
};

export default MainPage;
