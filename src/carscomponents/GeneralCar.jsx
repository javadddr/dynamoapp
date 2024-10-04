import React, { useState, useEffect } from 'react';
import "./GeneralCar.css"
import Piei2 from '../Piei2';
import editIcon from './edit.svg'; // Path to your edit icon
import checkIcon from './check.svg'; // Path to your check icon
import { useCars, useDrivers } from '../CarDriver';

import 'rsuite/InlineEdit/styles/index.css';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";

const GeneralCar = ({ car: propCar,onCarUpdate,onDeleted,theme,updateCarStatusInContext,closePopup }) => {
  const [car, setCar] = useState(propCar); // New state to manage car data
  const { refreshCars } = useCars();
  
  const startDate = new Date(car.general.activeInFleetSinceDate);
  const RegistratiDate = new Date(car.general.registrationDate);
  const [openDialog, setOpenDialog] = useState(false);

  
 
  const [editValues, setEditValues] = useState({});
 
  useEffect(() => {
    setCar(propCar);
  }, [propCar]);

  const [areas, setAreas] = useState([]);
  const token = localStorage.getItem('userToken');
  const options = { year: 'numeric', month: 'short' };
  const formattedDate = startDate.toLocaleDateString('en-US', options);
  const [isEditing, setIsEditing] = useState({});
  const formattregisterDate = RegistratiDate.toLocaleDateString('en-US', options);
  const handleDeleteClick = () => {
    setOpenDialog(true);
};

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/areas`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch areas');
        }
        const areasData = await response.json();
        setAreas(areasData.map(area => area.areaName)); // Assuming you just need the area names
      } catch (error) {
        console.error('Error fetching areas:', error);
      }
    };

    fetchAreas();
  }, [token]); // Re-fetch if token changes
  const currentDate = new Date();
  const differenceInMilliseconds = currentDate - startDate;
  const differenceInYears = differenceInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
  const age = Math.round(differenceInYears * 10) / 10; // Round to one decimal place
  const deleteCar = async () => {
  

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cars/${car._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete the car');
      }

      setSnackbarInfo({ open: true, severity: 'success', message: 'Car deleted successfully.' });
      closePopup()
      setOpenDialog(false);
       refreshCars(); // Refresh the list of cars or take any other appropriate action
       if (onDeleted) onDeleted(); // If there's a callback to handle the deletion (like closing the details view), call it
     } catch (error) {
       console.error('Error deleting car:', error);
       setSnackbarInfo({ open: true, severity: 'error', message: 'Error deleting car.' });
       setOpenDialog(false);
     }
  };


  const handleEditChange = (fieldName, value, isGeneralField = true) => {
    // Directly storing value and isGeneralField flag without nesting them
    setEditValues({ ...editValues, [fieldName]: { value, isGeneralField } });
  
  };
const handleSaveClick = async (fieldName) => {
  setIsEditing({ ...isEditing, [fieldName]: false });
  let updateData;
  if (editValues[fieldName].isGeneralField) {
    updateData = { general: { ...car.general, [fieldName]: editValues[fieldName].value } };
  } else {
    // For top-level fields like 'state'
    updateData = { [fieldName]: editValues[fieldName].value };
  }
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cars/${car._id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error('Failed to update the car');
    }
    const updatedCar = await response.json();
    setCar(updatedCar); //
    onCarUpdate(updatedCar);
    setSnackbarInfo({ open: true, severity: 'success', message: 'Car saved successfully.' });
    refreshCars();
  
  } catch (error) {
    console.error('Error updating car:', error);
    setSnackbarInfo({ open: true, severity: 'error', message: 'Error saving car details.' });
  }
};

  // Example for editing internalName
  const handleEditClick = (fieldName, isGeneralField = true) => {
    setIsEditing({ ...isEditing, [fieldName]: true });
    // Correctly pre-fill the current value on edit based on whether the field is within 'general' or top-level
    const currentValue = isGeneralField ? car.general[fieldName] : car[fieldName];
    setEditValues({ ...editValues, [fieldName]: { value: currentValue, isGeneralField } });
  };
  
  const isDarkMode = theme === 'dark';

  const [chartDataPie, setChartDataPie] = useState([]);
  const [statusDurationSumCars, setStatusDurationSumCars] = useState({});
  useEffect(() => {
    const fetchStatusRecordsForAllCars = async () => {
      const token = localStorage.getItem('userToken');
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/carStatusRecords/statusByCreator`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch status records for cars');
        }
  
        const allStatusRecords = await response.json();
     
  
        // Filter records for the current car
        const filteredRecords = allStatusRecords.filter(record => record.carId === car._id);
  
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
  
        setStatusDurationSumCars(summarizedStatuses);
  
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
  
    fetchStatusRecordsForAllCars();
  }, [car._id]);  // Include car._id as a dependency
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
    Incoming: {
      label: "Incoming",
      color: "hsl(var(--chart-3))",
    },
    Outgoing: {
      label: "Outgoing",
      color: "hsl(var(--chart-4))",
    },
    Transferring: {
      label: "Transferring",
      color: "hsl(var(--chart-5))",
    },
    Repairing: {
      label: "Repairing",
      color: "#d0a9a4",
    },
    "NoDriver": {
      label: "No Driver",
      color: "#c7c7ff",
    },
  };
  const title1=`Status of the ${car.general.internalName}`

  return (
    <div className="font-sans text-base flex flex-col justify-between">
       <div className="flex justify-between">
     <div style={{width:"400px"}}>
     <div className=" flex w-full mb-4 text-left ">
      <div className="w-1/2 flex items-center ">
        <p className={`font-sans m-0 ${theme=='dark'?"text-gray-300 ":"text-gray-500 "} font-medium text-sm`}>Internal name:</p>
      </div>
      <div className="text-sm font-normal cursor-pointer relative w-1/2 flex items-center">
        {isEditing.internalName ? (
          <div className="flex items-center w-full ">
            <input 
              value={editValues.internalName ? editValues.internalName.value : ''} 
              onChange={(e) => handleEditChange('internalName', e.target.value, true)}
              className="text-sm w-full h-[19px] border border-blue-300 rounded-lg px-3 py-2 text-gray-800 font-normal shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Enter name"
            />
            <button 
              onClick={() => handleSaveClick('internalName')} 
              className="w-6 h-5 flex items-center justify-center bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 ml-2"
            >
              <img src={checkIcon} alt="Save" className="w-4 h-4 " />
            </button>
          </div>
        ) : (
          <div className="flex items-center w-full">
            <span className={`${theme=='dark'?"text-yellow-600":"text-gray-900 "}`}>{car.general.internalName}</span>
            <div 
              className="absolute  inset-0 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity duration-300"
              onClick={() => handleEditClick('internalName', true)}
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
  <p className={`font-sans m-0 ${theme=='dark'?"text-gray-300 ":"text-gray-500 "} font-medium text-sm`}>State:</p>
</div>


<div className="text-sm relative w-1/2 flex items-center font-normal">
  {isEditing.state ? (
    <div className="text-sm flex items-center w-full">
      <select
        value={editValues['state'] ? editValues['state'].value : car.state}
        onChange={(e) => handleEditChange('state', e.target.value, false)} 
        className="text-sm w-full h-[19px] border border-gray-300 rounded-lg pt-0 py-0 text-gray-800 font-normal shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
      >
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
        <option value="Incoming">Incoming</option>
        <option value="Outgoing">Outgoing</option>
        <option value="Transferring">Transferring</option>
        <option value="Repairing">Repairing</option>
        <option value="No Driver">No Driver</option>
      </select>
      <button
        onClick={() => handleSaveClick('state')}
        className="w-6 h-5 flex items-center justify-center bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 ml-2"
      >
        <img src={checkIcon} alt="Save" className="w-4 h-4" />
      </button>
    </div>
  ) : (
    <div className="text-sm relative flex items-center w-full">
      <span className={`${theme=='dark'?"text-yellow-600":"text-gray-900 "}`} onClick={() => handleEditClick('state', car.state, false)}>
        {car.state || "Select State"}
      </span>
      <div
        className="text-sm absolute inset-0 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
        onClick={() => handleEditClick('state', car.state, false)}
      >
        <button className="text-sm w-6 h-6 flex items-center justify-center bg-blue-300 text-white rounded-full shadow-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300">
          <img src={editIcon} alt="Edit" className="w-4 h-4" />
        </button>
      </div>
    </div>
  )}
</div>

</div>

  <div className="flex w-full mb-4 text-left">
 
  <div className="w-1/2 flex items-center">
    <p className={`font-sans m-0 ${theme=='dark'?"text-gray-300 ":"text-gray-500 "} font-medium text-sm`}>License plate:</p>
  </div>

 
  <div className="relative w-1/2 flex items-center font-normal">
    {isEditing.licensePlate ? (
      <div className="text-sm flex items-center w-full">
        <input 
          value={editValues['licensePlate'] ? editValues['licensePlate'].value : car.licensePlate} 
          onChange={(e) => handleEditChange('licensePlate', e.target.value, true)}
          className="text-sm w-full h-[19px] border border-gray-300 rounded-lg px-2 py-1 text-gray-800 font-normal shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
          placeholder="Enter License Plate"
        />
        <button 
          onClick={() => handleSaveClick('licensePlate')} 
          className="text-sm w-6 h-5 flex items-center justify-center bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 ml-2"
        >
          <img src={checkIcon} alt="Save" className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <div className="text-sm relative flex items-center w-full">
        <span className={`${theme=='dark'?"text-yellow-600":"text-gray-900 "}`}>{car.general.licensePlate || <span className="text-gray-500">No License Plate</span>}</span>
        <div 
          className="absolute inset-0 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          onClick={() => handleEditClick('licensePlate', true)}
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
  <p className={`font-sans m-0 ${theme=='dark'?"text-gray-300 ":"text-gray-500 "} font-medium text-sm`}>Vehicle type:</p>
</div>


<div className="relative w-1/2 flex items-center font-normal">
  {isEditing.vehicleType ? (
    <div className="flex items-center w-full">
      <select
        value={editValues['vehicleType'] ? editValues['vehicleType'].value : car.general.vehicleType}
        onChange={(e) => handleEditChange('vehicleType', e.target.value, true)} 
        className="text-sm w-full h-[19px] border border-gray-300 rounded-lg pt-0 py-0 text-gray-800 font-normal shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
      >
        <option value="Car">Car</option>
        <option value="Transporter">Transporter</option>
        <option value="Two-wheeler">Two-wheeler</option>
        <option value="Truck">Truck</option>
        <option value="Bus">Bus</option>
        <option value="Build up">Build up</option>
        <option value="Excavator">Excavator</option>
        <option value="Tractor">Tractor</option>
        <option value="Trailer">Trailer</option>
        <option value="Special vehicle">Special vehicle</option>
        <option value="Swap body">Swap body</option>
      </select>
      <button
        onClick={() => handleSaveClick('vehicleType')}
        className="text-sm w-6 h-5 flex items-center justify-center bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 ml-2"
      >
        <img src={checkIcon} alt="Save" className="w-4 h-4" />
      </button>
    </div>
  ) : (
    <div className="text-sm relative flex items-center w-full">
      <span className={`${theme=='dark'?"text-yellow-600":"text-gray-900 "}`} onClick={() => handleEditClick('vehicleType', car.general.vehicleType, true)}>
        {car.general.vehicleType || "Select vehicle type"}
      </span>
      <div
        className="absolute inset-0 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
        onClick={() => handleEditClick('vehicleType', car.general.vehicleType, true)}
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

  <div className="w-1/2 flex items-center ">
    <p className={`font-sans m-0 ${theme=='dark'?"text-gray-300 ":"text-gray-500 "} font-medium text-sm`}>Location:</p>
  </div>

  <div className="relative w-1/2 flex items-center font-normal">
    {isEditing.location ? (
      <div className="flex items-center w-full">
        <input 
          type="text"
          value={editValues['location'] ? editValues['location'].value : car.general.location || ''}
          onChange={(e) => handleEditChange('location', e.target.value, true)}
          className="text-sm w-full h-[19px] border border-gray-300 rounded-lg px-2 py-0 text-gray-800 font-normal shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
          placeholder="Enter Location"
        />
        <button 
          onClick={() => handleSaveClick('location')} 
          className="text-sm w-6 h-5 flex items-center justify-center bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 ml-2"
        >
          <img src={checkIcon} alt="Save" className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <div className="text-sm relative flex items-center w-full">
        <span className={`${theme=='dark'?"text-yellow-600":"text-gray-900 "}`}>{car.general.location || "No Location Set"}</span>
        <div 
          className="absolute inset-0 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          onClick={() => handleEditClick('location', car.general.location, true)}
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
    <p className={`font-sans m-0 ${theme=='dark'?"text-gray-300 ":"text-gray-500 "} font-medium text-sm`}>Area:</p>
  </div>

 
  <div className="text-sm relative w-1/2 flex items-center font-normal">
    {isEditing.area ? (
      <div className="flex items-center w-full">
        <select
          value={editValues['area'] ? editValues['area'].value : car.area || ''}
          onChange={(e) => handleEditChange('area', e.target.value, false)} // Note the `false` flag here for non-general field
          className="text-sm w-full h-[19px] border border-gray-300 rounded-lg pt-0 py-0 text-gray-800 font-normal shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
          style={{ minWidth: '150px' }} // Set minimum width to 150px
        >
          <option value="">Select Area</option>
          {areas.map((areaName, index) => (
            <option key={index} value={areaName}>{areaName}</option>
          ))}
        </select>
        <button
          onClick={() => handleSaveClick('area')}
          className="text-sm w-6 h-5 flex items-center justify-center bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 ml-2"
        >
          <img src={checkIcon} alt="Save" className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <div className="text-sm relative flex items-center w-full">
        <span className={`${theme=='dark'?"text-yellow-600":"text-gray-900 "}`} onClick={() => handleEditClick('area', car.area, false)}>
          {car.area || "Select Area"}
        </span>
        <div
          className="absolute inset-0 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          onClick={() => handleEditClick('area', car.area, false)}
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
    <p className={`font-sans m-0 ${theme=='dark'?"text-gray-300 ":"text-gray-500 "} font-medium text-sm`}>Registered in:</p>
  </div>

  
  <div className="text-sm relative w-1/2 flex items-center font-normal">
    {isEditing.registeredIn ? (
      <div className="flex items-center w-full">
        <input 
          type="text"
          value={editValues['registeredIn'] ? editValues['registeredIn'].value : car.general.registeredIn || ''}
          onChange={(e) => handleEditChange('registeredIn', e.target.value, true)}
          className="text-sm w-full h-[19px] border border-gray-300 rounded-lg px-2 py-1 text-gray-800 font-normal shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
          placeholder="Enter Registered In"
        />
        <button 
          onClick={() => handleSaveClick('registeredIn')} 
          className="text-sm w-6 h-5 flex items-center justify-center bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 ml-2"
        >
          <img src={checkIcon} alt="Save" className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <div className="text-sm relative flex items-center w-full">
        <span className={`${theme=='dark'?"text-yellow-600":"text-gray-900 "}`}>{car.general.registeredIn || "No Affiliated Company"}</span>
        <div 
          className="text-sm absolute inset-0 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          onClick={() => handleEditClick('registeredIn', car.general.registeredIn, true)}
        >
          <button className="text-sm w-6 h-6 flex items-center justify-center bg-blue-300 text-white rounded-full shadow-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300">
            <img src={editIcon} alt="Edit" className="w-4 h-4" />
          </button>
        </div>
      </div>
    )}
  </div>
</div>


<div className="flex w-full mb-4 text-left">


  <div className="w-1/2 flex items-center">
    <p className={`font-sans m-0 ${theme=='dark'?"text-gray-300 ":"text-gray-500 "} font-medium text-sm`}>Registration Date:</p>
  </div>

 
  <div className="text-sm relative w-1/2 flex items-center font-normal">
    {isEditing.registrationDate ? (
      <div className="flex items-center w-full">
        <input
          type="date"
          value={editValues['registrationDate'] ? editValues['registrationDate'].value : car.general.registrationDate ? car.general.registrationDate.substring(0, 10) : ''}
          onChange={(e) => handleEditChange('registrationDate', e.target.value, true)} // True because it's within `general`
          className="text-sm w-full h-[19px] border border-gray-300 rounded-lg pt-0 py-1 text-gray-800 font-normal shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <button
          onClick={() => handleSaveClick('registrationDate')}
          className="text-sm w-6 h-5 flex items-center justify-center bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 ml-2"
        >
          <img src={checkIcon} alt="Save" className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <div className="relative flex items-center w-full">
        <span className={`${theme=='dark'?"text-yellow-600":"text-gray-900 "}`} onClick={() => handleEditClick('registrationDate', car.general.registrationDate, true)}>
          {car.general.registrationDate ? new Date(car.general.registrationDate).toLocaleDateString() : "Set Date"}
        </span>
        <div
          className="absolute inset-0 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          onClick={() => handleEditClick('registrationDate', car.general.registrationDate, true)}
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
    <p className={`font-sans m-0 ${theme=='dark'?"text-gray-300 ":"text-gray-500 "} font-medium text-sm`}>Active in fleet since:</p>
  </div>

 
  <div className="text-sm relative w-1/2 flex items-center font-normal">
    {isEditing.activeInFleetSinceDate ? (
      <div className="flex items-center w-full">
        <input
          type="date"
          value={editValues['activeInFleetSinceDate'] ? editValues['activeInFleetSinceDate'].value : car.general.activeInFleetSinceDate ? car.general.activeInFleetSinceDate.substring(0, 10) : ''}
          onChange={(e) => handleEditChange('activeInFleetSinceDate', e.target.value, true)} // True because it's within `general`
          className="text-sm w-full h-[19px] border border-gray-300 rounded-lg pt-0 py-1 text-gray-800 font-normal shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <button
          onClick={() => handleSaveClick('activeInFleetSinceDate')}
          className="text-sm w-6 h-5 flex items-center justify-center bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 ml-2"
        >
          <img src={checkIcon} alt="Save" className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <div className="relative flex items-center w-full">
        <span className={`${theme=='dark'?"text-yellow-600":"text-gray-900 "}`} onClick={() => handleEditClick('activeInFleetSinceDate', car.general.activeInFleetSinceDate, true)}>
          {car.general.activeInFleetSinceDate ? new Date(car.general.activeInFleetSinceDate).toLocaleDateString() + ` (${age} ${age > 1 ? 'years' : 'year'})` : "Set Date"}
        </span>
        <div
          className="absolute inset-0 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          onClick={() => handleEditClick('activeInFleetSinceDate', car.general.activeInFleetSinceDate, true)}
        >
          <button className="w-6 h-6 flex items-center justify-center bg-blue-300 text-white rounded-full shadow-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300">
            <img src={editIcon} alt="Edit" className="w-4 h-4" />
          </button>
        </div>
      </div>
    )}
  </div>

</div>


     </div>
     <div style={{width:"400px"}}>
     <div className="flex w-full mb-4 text-left">

  <div className="w-1/2 flex items-center">
    <p className={`font-sans m-0 ${theme=='dark'?"text-gray-300 ":"text-gray-500 "} font-medium text-sm`}>Financing Type:</p>
  </div>


  <div className="text-sm relative w-1/2 flex items-center font-normal">
    {isEditing.financingType ? (
      <div className="flex items-center w-full">
        <select
          value={editValues['financingType'] ? editValues['financingType'].value : car.general.financingType || ''}
          onChange={(e) => handleEditChange('financingType', e.target.value, true)}
          className="text-sm w-full h-[19px] border border-gray-300 rounded-lg pt-0  py-0 text-gray-800 font-normal shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          <option value="Leasing">Leasing</option>
          <option value="Long term rental(leasing)">Long term rental(leasing)</option>
          <option value="Credit">Credit</option>
          <option value="Purchase">Purchase</option>
          <option value="Long term rental">Long term rental</option>
        </select>
        <button
          onClick={() => handleSaveClick('financingType')}
          className="w-6 h-5 flex items-center justify-center bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 ml-2"
        >
          <img src={checkIcon} alt="Save" className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <div className=" relative flex items-center w-full">
        <span className={`${theme=='dark'?"text-yellow-600":"text-gray-900 "}`}>{car.general.financingType || "Select Financing Type"}</span>
        <div
          className="absolute inset-0 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          onClick={() => handleEditClick('financingType', car.general.financingType, true)}
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
    <p className={`font-sans m-0 ${theme=='dark'?"text-gray-300 ":"text-gray-500 "} font-medium text-sm`}>Affiliated Company:</p>
  </div>


  <div className="text-sm relative w-1/2 flex items-center font-normal">
    {isEditing.affiliatedCompany ? (
      <div className="flex items-center w-full">
        <input 
          type="text"
          value={editValues['affiliatedCompany'] ? editValues['affiliatedCompany'].value : car.general.affiliatedCompany || ''}
          onChange={(e) => handleEditChange('affiliatedCompany', e.target.value, true)}
          className="text-sm w-full h-[19px] border border-gray-300 rounded-lg px-2 py-0 text-gray-800 font-normal shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
          placeholder="Enter Affiliated Company"
        />
        <button 
          onClick={() => handleSaveClick('affiliatedCompany')} 
          className="text-sm w-6 h-5 flex items-center justify-center bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 ml-2"
        >
          <img src={checkIcon} alt="Save" className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <div className="relative flex items-center w-full">
        <span className={`${theme=='dark'?"text-yellow-600":"text-gray-900 "}`}>{car.general.affiliatedCompany || "No Affiliated Company"}</span>
        <div 
          className="absolute inset-0 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          onClick={() => handleEditClick('affiliatedCompany', car.general.affiliatedCompany, true)}
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
    <p className={`font-sans m-0 ${theme=='dark'?"text-gray-300 ":"text-gray-500 "} font-medium text-sm`}>Tare Weight:</p>
  </div>


  <div className="text-sm relative w-1/2 flex items-center font-normal">
    {isEditing.tareWeightKg ? (
      <div className="flex items-center w-full">
        <input
          type="number"
          step="0.01" // Allows decimal values; adjust step as needed for your precision requirements
          value={editValues['tareWeightKg'] ? editValues['tareWeightKg'].value : car.general.tareWeightKg || ''}
          onChange={(e) => handleEditChange('tareWeightKg', e.target.value, true)}
          className="text-sm w-full h-[19px] border border-gray-300 rounded-lg px-2 py-1 text-gray-800 font-normal shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
          placeholder="Enter Tare Weight"
        />
        <button
          onClick={() => handleSaveClick('tareWeightKg')}
          className="w-6 h-5 flex items-center justify-center bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 ml-2"
        >
          <img src={checkIcon} alt="Save" className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <div className="relative flex items-center w-full">
        <span className={`${theme=='dark'?"text-yellow-600":"text-gray-900 "}`}>{car.general.tareWeightKg || car.general.tareWeightKg === 0 ? car.general.tareWeightKg : "Set Tare Weight"}</span>
        <div
          className="absolute inset-0 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          onClick={() => handleEditClick('tareWeightKg', car.general.tareWeightKg, true)}
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
    <p className={`font-sans m-0 ${theme=='dark'?"text-gray-300 ":"text-gray-500 "} font-medium text-sm`}>Load Capacity:</p>
  </div>

 
  <div className="text-sm relative w-1/2 flex items-center font-normal">
    {isEditing.loadCapacityKg ? (
      <div className="flex items-center w-full">
        <input
          type="number"
          value={editValues['loadCapacityKg'] ? editValues['loadCapacityKg'].value : car.general.loadCapacityKg || ''}
          onChange={(e) => handleEditChange('loadCapacityKg', e.target.value, true)}
          className="text-sm w-full h-[19px] border border-gray-300 rounded-lg px-2 py-1 text-gray-800 font-normal shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
          placeholder="Enter Load Capacity"
        />
        <button
          onClick={() => handleSaveClick('loadCapacityKg')}
          className="w-6 h-5 flex items-center justify-center bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 ml-2"
        >
          <img src={checkIcon} alt="Save" className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <div className="text-sm relative flex items-center w-full">
        <span className={`${theme=='dark'?"text-yellow-600":"text-gray-900 "}`}>{car.general.loadCapacityKg || car.general.loadCapacityKg === 0 ? `${car.general.loadCapacityKg}` : "Set Load Capacity"}</span>
        <div
          className="absolute inset-0 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          onClick={() => handleEditClick('loadCapacityKg', car.general.loadCapacityKg, true)}
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
    <p className={`font-sans m-0 ${theme=='dark'?"text-gray-300 ":"text-gray-500 "} font-medium text-sm`}>Tensile Load:</p>
  </div>


  <div className="text-sm relative w-1/2 flex items-center font-normal">
    {isEditing.tensileLoadKg ? (
      <div className="flex items-center w-full">
        <input
          type="number"
          step="any"
          value={editValues['tensileLoadKg'] ? editValues['tensileLoadKg'].value : car.general.tensileLoadKg || ''}
          onChange={(e) => handleEditChange('tensileLoadKg', e.target.value, true)}
          className="text-sm w-full h-[19px] border border-gray-300 rounded-lg px-2 py-0 text-gray-800 font-normal shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
          placeholder="Enter Tensile Load"
        />
        <button
          onClick={() => handleSaveClick('tensileLoadKg')}
          className="w-6 h-5 flex items-center justify-center bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 ml-2"
        >
          <img src={checkIcon} alt="Save" className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <div className="relative flex items-center w-full">
        <span className={`${theme=='dark'?"text-yellow-600":"text-gray-900 "}`}>{car.general.tensileLoadKg || car.general.tensileLoadKg === 0 ? `${car.general.tensileLoadKg}` : "Set Tensile Load"}</span>
        <div
          className="absolute inset-0 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          onClick={() => handleEditClick('tensileLoadKg', car.general.tensileLoadKg, true)}
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
    <p className={`font-sans m-0 ${theme=='dark'?"text-gray-300 ":"text-gray-500 "} font-medium text-sm`}>Trailer Load:</p>
  </div>

 
  <div className="text-sm relative w-1/2 flex items-center font-normal">
    {isEditing.trailerLoadKg ? (
      <div className="flex items-center w-full">
        <input
          type="number"
          step="any"
          value={editValues['trailerLoadKg'] ? editValues['trailerLoadKg'].value : car.general.trailerLoadKg || ''}
          onChange={(e) => handleEditChange('trailerLoadKg', e.target.value, true)}
          className="text-sm w-full h-[19px] border border-gray-300 rounded-lg px-2 py-1 text-gray-800 font-normal shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
          placeholder="Enter Trailer Load"
        />
        <button
          onClick={() => handleSaveClick('trailerLoadKg')}
          className="w-6 h-5 flex items-center justify-center bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 ml-2"
        >
          <img src={checkIcon} alt="Save" className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <div className="relative flex items-center w-full">
        <span className={`${theme=='dark'?"text-yellow-600":"text-gray-900 "}`}>{car.general.trailerLoadKg || car.general.trailerLoadKg === 0 ? `${car.general.trailerLoadKg}` : "Set Trailer Load"}</span>
        <div
          className="absolute inset-0 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          onClick={() => handleEditClick('trailerLoadKg', car.general.trailerLoadKg, true)}
        >
          <button className="w-6 h-6 flex items-center justify-center bg-blue-300 text-white rounded-full shadow-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300">
            <img src={editIcon} alt="Edit" className="w-4 h-4" />
          </button>
        </div>
      </div>
    )}
  </div>
</div>



<div className="w-full mb-4 text-left flex flex-col">
 
  <div className="flex flex-row items-center mb-2">
    <p className={`font-sans m-0 ${theme=='dark'?"text-gray-300 ":"text-gray-500 "} font-medium text-sm w-1/2`}>Internal Capacity:</p>
    <div className="flex items-center w-1/2">
      {isEditing.unitCapacity ? (
        <div className="flex items-center w-full">
          <input
            type="text"
            value={editValues['unitCapacity'] ? editValues['unitCapacity'].value : car.general.unitCapacity || ''}
            onChange={(e) => handleEditChange('unitCapacity', e.target.value, true)}
            className="text-sm w-full h-[19px] border border-gray-300 rounded-lg px-2 py-1 text-gray-800 font-normal shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Enter Unit Capacity"
          />
          <button
            onClick={() => handleSaveClick('unitCapacity')}
            className="text-sm w-6 h-5 flex items-center justify-center bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 ml-2"
          >
            <img src={checkIcon} alt="Save" className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="text-sm relative flex items-center w-full">
          <span className={`${theme=='dark'?"text-yellow-600":"text-gray-900 "}`}>{car.general.unitCapacity || "No Unit-Capacity Set"}</span>
          <div
            className="absolute inset-0 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
            onClick={() => handleEditClick('unitCapacity', car.general.unitCapacity, true)}
          >
            <button className="w-6 h-6 flex items-center justify-center bg-blue-300 text-white rounded-full shadow-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300">
              <img src={editIcon} alt="Edit" className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  </div>


  <div className="flex flex-row items-center">
    <p className={`font-sans m-0 ${theme=='dark'?"text-gray-300 ":"text-gray-500 "} font-medium text-sm w-1/2`}>Capacity's Name:</p>
    <div className="flex items-center w-1/2">
      {isEditing.internalUnitName ? (
        <div className="flex items-center w-full">
          <input
            type="text"
            value={editValues['internalUnitName'] ? editValues['internalUnitName'].value : car.general.internalUnitName || ''}
            onChange={(e) => handleEditChange('internalUnitName', e.target.value, true)}
            className="text-sm w-full h-[19px] border border-gray-300 rounded-lg px-2 py-0 text-gray-800 font-normal shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Enter Internal Unit Name"
          />
          <button
            onClick={() => handleSaveClick('internalUnitName')}
            className="w-6 h-5 flex items-center justify-center bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 ml-2"
          >
            <img src={checkIcon} alt="Save" className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="text-sm relative flex items-center w-full">
          <span className={`${theme=='dark'?"text-yellow-600":"text-gray-900 "}`}>{car.general.internalUnitName || "No Internal Unit Name Set"}</span>
          <div
            className="absolute inset-0 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
            onClick={() => handleEditClick('internalUnitName', car.general.internalUnitName, true)}
          >
            <button className="w-6 h-6 flex items-center justify-center bg-blue-300 text-white rounded-full shadow-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300">
              <img src={editIcon} alt="Edit" className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
</div>




<div className="flex w-full mb-4 text-left">


  <div className="w-1/2 flex items-center">
    <p className={`font-sans m-0 ${theme=='dark'?"text-gray-300 ":"text-gray-500 "} font-medium text-sm`}>Vehicle license check:</p>
  </div>


  <div className={`text-sm relative w-1/2 flex items-center font-normal`}>
    <div className="flex items-center w-full">
      {car.carLicenseCheck && car.carLicenseCheck.length > 0 &&
        car.carLicenseCheck[car.carLicenseCheck.length - 1].statuses &&
        car.carLicenseCheck[car.carLicenseCheck.length - 1].statuses.length > 0 ? (
          <div className="flex">
            <span className={`${theme=='dark'?"text-yellow-600":"text-gray-900 "}`}>
              {new Date(car.carLicenseCheck[car.carLicenseCheck.length - 1].statuses[car.carLicenseCheck[car.carLicenseCheck.length - 1].statuses.length - 1].updatedAt)
                .toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                .replace(',', '')} {/* Displays "Aug 2024" */}
            </span>
            <span className={`text-sm ${theme=='dark'?"text-emerald-400 ":"text-blue-600 "}  text-emerald-500 ml-2`}>
              {car.carLicenseCheck[car.carLicenseCheck.length - 1].statuses[car.carLicenseCheck[car.carLicenseCheck.length - 1].statuses.length - 1].status}
            </span>
          </div>
        ) : (
          <span className="text-gray-900">No License Check Data</span>
        )
      }
    </div>
  </div>
  
</div>



     </div>  
     </div>
     <div className="flex justify-between h-[220px]">
     <div className="w-3/10 flex flex-col justify-end items-start">
  <Button  size="md" color="danger" onClick={handleDeleteClick} >
    Delete Vehicle
  </Button>
</div>

    <div className=" w-[400px] flex justify-center">
    <Piei2 chartData={chartDataPie} theme={theme} chartConfig={chartConfig} title={title1} />
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
                    <p>Are you sure you want to delete {car.general.internalName}?</p>
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose}>
                        Cancel
                    </Button>
                    <Button color="primary" onPress={deleteCar}>
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

export default GeneralCar;

