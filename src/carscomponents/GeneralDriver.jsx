import React, { useState, useEffect } from 'react';
import "./GeneralCar.css"
import Piei2 from '../Piei2';
import editIcon from './edit.svg'; // Path to your edit icon
import checkIcon from './check.svg'; // Path to your check icon
import { useCars, useDrivers } from '../CarDriver';
import { InlineEdit } from 'rsuite';
import 'rsuite/InlineEdit/styles/index.css';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";

const GeneralDriver = ({ driver: propDriver,onDriverUpdate,onDeleted,theme,updateDriverStatusInContext,closePopup }) => {
  const [driver, setDriver] = useState(propDriver); // New state to manage Driver data
  const { refreshDrivers } = useDrivers();
  const startDate = new Date(driver.startDate);

  const [openDialog, setOpenDialog] = useState(false);

  
 
  const [editValues, setEditValues] = useState({});
 
  useEffect(() => {
    setDriver(propDriver);
  }, [propDriver]);

  
  const token = localStorage.getItem('userToken');
  const options = { year: 'numeric', month: 'short' };
  const formattedDate = startDate.toLocaleDateString('en-US', options);
  const [isEditing, setIsEditing] = useState({});

  const handleDeleteClick = () => {
    setOpenDialog(true);
};


  const currentDate = new Date();
  const differenceInMilliseconds = currentDate - startDate;
  const differenceInYears = differenceInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
  const age = Math.round(differenceInYears * 10) / 10; // Round to one decimal place

  
  const isDarkMode = theme === 'dark';

  const [chartDataPie, setChartDataPie] = useState([]);

  const chartConfig = {
    visitors: {
      label: "Status",
    },
    Active: {
      label: "Active",
      color: "hsl(var(--chart-2))",
    },
    Inactive: {
      label: "Inactive",
      color: "hsl(var(--chart-1))",
    },
    Sick: {
      label: "Sick",
      color: "hsl(var(--chart-3))",
    },
    Holiday: {
      label: "Holiday",
      color: "hsl(var(--chart-4))",
    },
    "OverHours": {
      label: "Over Hours",
      color: "hsl(var(--chart-5))",
    },
    "WorkAccident": {
      label: "Work Acciden",
      color: "#d0a9a4",
    },
   
  };
  const title1=`Status of the ${driver.firstName}`

  useEffect(() => {
    const fetchStatusRecordsForAllDrivers = async () => {
      const token = localStorage.getItem('userToken');
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/statusRecords/statusByCreator`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch status records for cars');
        }
  
        const allStatusRecords = await response.json();
     
  
        // Filter records for the current car
        const filteredRecords = allStatusRecords.filter(record => record.driverId === driver._id);
  
        let statusDurationSum = {};
        const currentDate = new Date();
  
        filteredRecords.forEach((record) => {
          const startDate = new Date(record.from);
          const endDate = record.to ? new Date(record.to) : currentDate;
          const durationDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
  
          if (!statusDurationSum[record.status]) {
            statusDurationSum[record.status] = 0;
          }
          statusDurationSum[record.status] += Math.round(durationDays);
        });
  
        const summarizedStatuses = Object.entries(statusDurationSum).map(([label, value]) => ({
          label,
          value,
        }));
  

  
        const totalValue = summarizedStatuses.reduce((sum, { value }) => sum + value, 0);
        const pieData = summarizedStatuses.map(({ label, value }) => ({
          browser: label,
          visitors: Number(((value / totalValue) * 100).toFixed(1)),
          fill: `var(--color-${label.replace(/\s+/g, '')})`,
        }));
  
        setChartDataPie(pieData);
      
      } catch (error) {
        console.error('Error fetching status records for cars:', error);
      }
    };
  
    fetchStatusRecordsForAllDrivers();
  }, [driver._id]);  // Include car._id as a dependency







  const handleEditClick = (fieldName) => {
    setIsEditing({ ...isEditing, [fieldName]: true });
    if (!editValues[fieldName]) {
      // Initialize editValues with the current driver field value
      setEditValues(prev => ({
        ...prev,
        [fieldName]: { value: driver[fieldName], isGeneralField: true },
      }));
    }
  };
  const handleEditChange = (fieldName, value) => {
    setEditValues(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], value },
    }));
  };
  const handleSaveClick = async () => {
    const updatedFields = Object.keys(editValues).reduce((acc, key) => {
      const editValue = editValues[key];
      acc[key] = editValue.value; // Use the value from editValues
      return acc;
    }, {});
  
    // Now, updatedFields object contains all the fields that were edited
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/drivers/${driver._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFields),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update the driver');
      }
  
      const updatedDriver = await response.json();
      setDriver(updatedDriver); // Update local state with the updated driver info
      onDriverUpdate(updatedDriver); // Assuming this is a prop function to handle the update in a parent component
      setIsEditing({}); // Reset editing state
      setEditValues({}); // Clear edit values
      refreshDrivers(); // Refresh drivers list if necessary
    } catch (error) {
      console.error('Error updating driver:', error);
      
    }
  };
  const deleteDriver = async () => {

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/drivers/${driver._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete the car');
      }
     
     
      setOpenDialog(false);
      closePopup()
       refreshDrivers(); // Refresh the list of cars or take any other appropriate action
       if (onDeleted) onDeleted(); // If there's a callback to handle the deletion (like closing the details view), call it
     } catch (error) {
       console.error('Error deleting car:', error);
     
     
     }
  };
  const mostRecentStatusUpdate = driver.driverLicenseCheck.reduce((latest, check) => {
    return check.statuses.reduce((last, statusUpdate) => {
      const currentUpdateTime = new Date(statusUpdate.updatedAt).getTime();
      if (currentUpdateTime > last.time) {
        return { time: currentUpdateTime, status: statusUpdate.status, date: statusUpdate.updatedAt };
      }
      return last;
    }, latest);
  }, { time: 0, status: '', date: '' });

  return (
    <div className="font-sans text-base flex flex-col justify-between">
       <div className="flex justify-between">
          <div style={{width:"400px"}}>
              <div className=" flex w-full mb-4 text-left ">
                <div className="w-1/2 flex items-center ">
                  <p className={`font-sans m-0 ${theme=='dark'?"text-gray-300 ":"text-gray-500 "} font-medium text-sm`}>Name:</p>
                </div>
                <div className="text-sm font-normal cursor-pointer relative w-1/2 flex items-center">
                  {isEditing.firstName ? (
                    <div className="flex items-center w-full ">
                      <input 
                        value={editValues.firstName ? editValues.firstName.value : ''} 
                        onChange={(e) => handleEditChange('firstName', e.target.value, true)}
                        className="text-sm w-full h-[19px] border border-blue-300 rounded-lg px-3 py-2 text-gray-800 font-normal shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
                        placeholder="Enter name"
                      />
                      <button 
                        onClick={() => handleSaveClick('firstName')} 
                        className="w-6 h-5 flex items-center justify-center bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 ml-2"
                      >
                        <img src={checkIcon} alt="Save" className="w-4 h-4 " />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center w-full">
                      <span className={`${theme=='dark'?"text-yellow-600":"text-gray-900 "}`}>{driver.firstName}</span>
                      <div 
                        className="absolute  inset-0 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity duration-300"
                        onClick={() => handleEditClick('firstName', true)}
                      >
                        <button className="w-6 h-6 flex items-center justify-center bg-blue-300 text-white rounded-full shadow-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300">
                          <img src={editIcon} alt="Edit" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className=" flex w-full mb-4 text-left ">
                <div className="w-1/2 flex items-center ">
                  <p className={`font-sans m-0 ${theme=='dark'?"text-gray-300 ":"text-gray-500 "} font-medium text-sm`}>Last Name:</p>
                </div>
                <div className="text-sm font-normal cursor-pointer relative w-1/2 flex items-center">
                  {isEditing.lastName ? (
                    <div className="flex items-center w-full ">
                      <input 
                        value={editValues.lastName ? editValues.lastName.value : ''} 
                        onChange={(e) => handleEditChange('lastName', e.target.value, true)}
                        className="text-sm w-full h-[19px] border border-blue-300 rounded-lg px-3 py-2 text-gray-800 font-normal shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
                        placeholder="Enter last name"
                      />
                      <button 
                        onClick={() => handleSaveClick('lastName')} 
                        className="w-6 h-5 flex items-center justify-center bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 ml-2"
                      >
                        <img src={checkIcon} alt="Save" className="w-4 h-4 " />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center w-full">
                      <span className={`${theme=='dark'?"text-yellow-600":"text-gray-900 "}`}>{driver.lastName}</span>
                      <div 
                        className="absolute  inset-0 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity duration-300"
                        onClick={() => handleEditClick('lastName', true)}
                      >
                        <button className="w-6 h-6 flex items-center justify-center bg-blue-300 text-white rounded-full shadow-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300">
                          <img src={editIcon} alt="Edit" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className=" flex w-full mb-4 text-left ">
                <div className="w-1/2 flex items-center ">
                   <p className={`font-sans m-0 ${theme=='dark'?"text-gray-300 ":"text-gray-500 "} font-medium text-sm`}>Status:</p>
                </div>
                <div className="text-sm font-normal cursor-pointer relative w-1/2 flex items-center">
                {isEditing.state ? (
                    <div className="text-sm flex items-center w-full">
                      <select
                        value={editValues['status'] ? editValues['status'].value : driver.status}
                        onChange={(e) => handleEditChange('status', e.target.value, false)} 
                        className="text-sm w-full h-[19px] border border-gray-300 rounded-lg pt-0 py-0 text-gray-800 font-normal shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Sick">Sick</option>
                        <option value="Holiday">Holiday</option>
                        <option value="Over Hours">Over Hours</option>
                        <option value="Work Accident">Work Accident</option>
                      
                      </select>
                      <button
                        onClick={() => handleSaveClick('status')}
                        className="w-6 h-5 flex items-center justify-center bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 ml-2"
                      >
                        <img src={checkIcon} alt="Save" className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm relative flex items-center w-full">
                      <span className={`${theme=='dark'?"text-yellow-600":"text-gray-900 "}`} onClick={() => handleEditClick('status', driver.status, false)}>
                        {driver.status || "Select Status"}
                      </span>
                      <div
                        className="text-sm absolute inset-0 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                        onClick={() => handleEditClick('state', driver.status, false)}
                      >
                        <button className="text-sm w-6 h-6 flex items-center justify-center bg-blue-300 text-white rounded-full shadow-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300">
                          <img src={editIcon} alt="Edit" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className=" flex w-full mb-4 text-left ">
                <div className="w-1/2 flex items-center ">
                  <p className={`font-sans m-0 ${theme=='dark'?"text-gray-300 ":"text-gray-500 "} font-medium text-sm`}>Address (Location):</p>
                </div>
                <div className="text-sm font-normal cursor-pointer relative w-1/2 flex items-center">
                  {isEditing.address ? (
                    <div className="flex items-center w-full ">
                      <input 
                        value={editValues.address ? editValues.address.value : ''} 
                        onChange={(e) => handleEditChange('address', e.target.value, true)}
                        className="text-sm w-full h-[19px] border border-blue-300 rounded-lg px-3 py-2 text-gray-800 font-normal shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
                        placeholder="Enter address"
                      />
                      <button 
                        onClick={() => handleSaveClick('address')} 
                        className="w-6 h-5 flex items-center justify-center bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 ml-2"
                      >
                        <img src={checkIcon} alt="Save" className="w-4 h-4 " />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center w-full">
                      <span className={`${theme=='dark'?"text-yellow-600":"text-gray-900 "}`}>{driver.address}</span>
                      <div 
                        className="absolute  inset-0 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity duration-300"
                        onClick={() => handleEditClick('address', true)}
                      >
                        <button className="w-6 h-6 flex items-center justify-center bg-blue-300 text-white rounded-full shadow-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300">
                          <img src={editIcon} alt="Edit" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className=" flex w-full mb-4 text-left ">
                <div className="w-1/2 flex items-center ">
                  <p className={`font-sans m-0 ${theme=='dark'?"text-gray-300 ":"text-gray-500 "} font-medium text-sm`}>Email:</p>
                </div>
                <div className="text-sm font-normal cursor-pointer relative w-1/2 flex items-center">
                  {isEditing.email ? (
                    <div className="flex items-center w-full ">
                      <input 
                        value={editValues.email ? editValues.email.value : ''} 
                        onChange={(e) => handleEditChange('email', e.target.value, true)}
                        className="text-sm w-full h-[19px] border border-blue-300 rounded-lg px-3 py-2 text-gray-800 font-normal shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
                        placeholder="Enter email"
                      />
                      <button 
                        onClick={() => handleSaveClick('email')} 
                        className="w-6 h-5 flex items-center justify-center bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 ml-2"
                      >
                        <img src={checkIcon} alt="Save" className="w-4 h-4 " />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center w-full">
                      <span className={`${theme=='dark'?"text-yellow-600":"text-gray-900 "}`}>{driver.email}</span>
                      <div 
                        className="absolute  inset-0 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity duration-300"
                        onClick={() => handleEditClick('email', true)}
                      >
                        <button className="w-6 h-6 flex items-center justify-center bg-blue-300 text-white rounded-full shadow-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300">
                          <img src={editIcon} alt="Edit" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className=" flex w-full mb-4 text-left ">
                <div className="w-1/2 flex items-center ">
                  <p className={`font-sans m-0 ${theme=='dark'?"text-gray-300 ":"text-gray-500 "} font-medium text-sm`}>Mobile:</p>
                </div>
                <div className="text-sm font-normal cursor-pointer relative w-1/2 flex items-center">
                  {isEditing.mobile ? (
                    <div className="flex items-center w-full ">
                      <input 
                        value={editValues.mobile ? editValues.mobile.value : ''} 
                        onChange={(e) => handleEditChange('mobile', e.target.value, true)}
                        className="text-sm w-full h-[19px] border border-blue-300 rounded-lg px-3 py-2 text-gray-800 font-normal shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
                        placeholder="Enter mobile"
                      />
                      <button 
                        onClick={() => handleSaveClick('mobile')} 
                        className="w-6 h-5 flex items-center justify-center bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 ml-2"
                      >
                        <img src={checkIcon} alt="Save" className="w-4 h-4 " />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center w-full">
                      <span className={`${theme=='dark'?"text-yellow-600":"text-gray-900 "}`}>{driver.mobile}</span>
                      <div 
                        className="absolute  inset-0 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity duration-300"
                        onClick={() => handleEditClick('mobile', true)}
                      >
                        <button className="w-6 h-6 flex items-center justify-center bg-blue-300 text-white rounded-full shadow-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300">
                          <img src={editIcon} alt="Edit" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex w-full mb-4 text-left">


                <div className="w-1/2 flex items-center">
                  <p className={`font-sans m-0 ${theme=='dark'?"text-gray-300 ":"text-gray-500 "} font-medium text-sm`}>Start Date:</p>
                </div>

              
                <div className="text-sm relative w-1/2 flex items-center font-normal">
                  {isEditing.startDate ? (
                    <div className="flex items-center w-full">
                      <input
                        type="date"
                        value={editValues['startDate'] ? editValues['startDate'].value : driver.startDate ? driver.startDate.substring(0, 10) : ''}
                        onChange={(e) => handleEditChange('startDate', e.target.value, true)} // True because it's within `general`
                        className="text-sm w-full h-[19px] border border-gray-300 rounded-lg pt-0 py-1 text-gray-800 font-normal shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                      <button
                        onClick={() => handleSaveClick('startDate')}
                        className="text-sm w-6 h-5 flex items-center justify-center bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 ml-2"
                      >
                        <img src={checkIcon} alt="Save" className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative flex items-center w-full">
                      <span className={`${theme=='dark'?"text-yellow-600":"text-gray-900 "}`} onClick={() => handleEditClick('startDate', driver.startDate, true)}>
                        {driver.startDate ? new Date(driver.startDate).toLocaleDateString() + ` (${age} ${age > 1 ? 'years ago' : 'year ago'})` : "Set Date"}
                      </span>
                      <div
                        className="absolute inset-0 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                        onClick={() => handleEditClick('startDate', driver.startDate, true)}
                      >
                        <button className="w-6 h-6 flex items-center justify-center bg-blue-300 text-white rounded-full shadow-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300">
                          <img src={editIcon} alt="Edit" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
              <div className="flex w-full mb-4 text-left">
                <div className="w-1/2 flex items-center">
                  <p className={`font-sans m-0 ${theme=='dark'?"text-gray-300 ":"text-gray-500 "} font-medium text-sm`}>End Date:</p>
                </div>
                <div className="text-sm relative w-1/2 flex items-center font-normal">
                  {isEditing.endDate ? (
                    <div className="flex items-center w-full">
                      <input
                        type="date"
                        value={editValues['endDate'] ? editValues['endDate'].value : driver.endDate ? driver.endDate.substring(0, 10) : ''}
                        onChange={(e) => handleEditChange('endDate', e.target.value, true)} // True because it's within `general`
                        className="text-sm w-full h-[19px] border border-gray-300 rounded-lg pt-0 py-1 text-gray-800 font-normal shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                      <button
                        onClick={() => handleSaveClick('endDate')}
                        className="text-sm w-6 h-5 flex items-center justify-center bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 ml-2"
                      >
                        <img src={checkIcon} alt="Save" className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative flex items-center w-full">
                      <span className={`${theme=='dark'?"text-yellow-600":"text-gray-900 "}`} onClick={() => handleEditClick('endDate', driver.endDate, true)}>
                        {driver.endDate ? new Date(driver.endDate).toLocaleDateString() : "Set Date"}
                      </span>
                      <div
                        className="absolute inset-0 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                        onClick={() => handleEditClick('endDate', driver.endDate, true)}
                      >
                        <button className="w-6 h-6 flex items-center justify-center bg-blue-300 text-white rounded-full shadow-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300">
                          <img src={editIcon} alt="Edit" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>


              <div className=" flex w-full mb-4 text-left ">
                <div className="w-1/2 flex items-center ">
                  <p className={`font-sans m-0 ${theme=='dark'?"text-gray-300 ":"text-gray-500 "} font-medium text-sm`}>Most Recent License Check:</p>
                </div>
                <div className="text-sm font-normal cursor-pointer relative w-1/2 flex items-center">
                {mostRecentStatusUpdate.date ? (
          <div className='checkitemgeneral'>
            <p className={`${theme=='dark'?"text-yellow-600":"text-gray-900 "}`}>{new Date(mostRecentStatusUpdate.date).toLocaleDateString()}</p><br></br>
      
              </div>
            ) : (
              <div className='generalgenerals'>
                <p>No license checks recorded</p>
              </div>
            )}
                </div>
              </div>
              <div className=" flex w-full mb-4 text-left ">
                <div className="w-1/2 flex items-center ">
                  <p className={`font-sans m-0 ${theme=='dark'?"text-gray-300 ":"text-gray-500 "} font-medium text-sm`}>Most Recent License status:</p>
                  
                </div>
                <div className="text-sm font-normal cursor-pointer relative w-1/2 flex items-center">
                {mostRecentStatusUpdate.date ? (
                  <div className='checkitemgeneral'>
                   <p className={`font-sans m-0 ${theme=='dark'?"text-emerald-400 ":"text-blue-600 "}  text-emerald-500 font-medium text-sm`}>{mostRecentStatusUpdate.status}</p>
                  
                      </div>
                    ) : (
                      <div className='generalgenerals'>
                        <p>No license checks recorded</p>
                      </div>
                    )}
                </div>
              </div>

          </div>
          <div style={{width:"400px"}}>
          <Piei2 chartData={chartDataPie} theme={theme} chartConfig={chartConfig} title={title1} />
         
         </div>  
      </div>
      <div className="flex justify-between h-[220px]">
        <div className="w-3/10 flex flex-col justify-center items-start">
          <Button  size="md" color="danger" onClick={handleDeleteClick} >
            Delete Driver
          </Button>
        </div>
        <div className=" w-[400px] flex justify-center">
       
        </div>
      </div>

      <Modal isOpen={openDialog} onClose={() => setOpenDialog(false)}>
      <ModalContent  className={` ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}>
          {(onClose) => (
              <>
                  <ModalHeader className="flex flex-col gap-1">Confirm Deletion</ModalHeader>
                  <ModalBody>
                      <p>Are you sure you want to delete {driver.name}?</p>
                  </ModalBody>
                  <ModalFooter>
                      <Button color="danger" variant="light" onPress={onClose}>
                          Cancel
                      </Button>
                      <Button color="primary" onPress={deleteDriver}>
                          Delete
                      </Button>
                  </ModalFooter>
              </>
          )}
      </ModalContent>
      </Modal>

    </div>
  );
};

export default GeneralDriver;


