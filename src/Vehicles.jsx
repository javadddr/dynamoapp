import React, { useState,useEffect } from 'react';
import Ckanban from './Ckanban';
import { DatePicker,Select } from 'antd';

import plusi from "./plusi.svg"
import { Button } from '@nextui-org/react';
import './Vehicles.css';
function Vehicles({ cars,refreshCars, theme, updateCarStatusInContext, drivers }) {
  const [activeStatuses, setActiveStatuses] = useState(['Active', 'Inactive', 'Incoming', 'Outgoing', 'Transferring', 'Repairing', 'No Driver']); 
  const [showModal, setShowModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [carData, setCarData] = useState({
    state: '',
    general: {
      internalName: '',
      licensePlate: '',
      internalID: '',
      affiliatedCompany: '',
      location: '',
      registrationDate: '',
      activeInFleetSinceDate: '',
      registrationCertificate: '',
      model: '',
      vehicleType: '',
      vin: '',
      tareWeightKg: '', 
      registeredIn: '',
      loadCapacityKg: '',
      tensileLoadKg: '',
      trailerLoadKg: '',
      financingType: '',
      internalUnitName:'',
      unitCapacity: '',
    },
    drivers: [{
      driverId: '',
      from: '',
      till: '',
    }],
    carLicenseCheck: [{
      date: new Date(),
      licensePhoto: '',
      statuses: [{ // Note this change to an array
        status: 'Waiting',
        updatedAt: new Date() // Add the updatedAt field
      }]
    }],
    area: '',
    tasks: [{
      description: '',
      creatingDate: '',
      dueDate: '',
      owner: '',
      taskStatus: '', 
    }],
    invoices: [{
      invoiceNumber: '',
      invoiceType: '',
      for: '',
      date: '',
      amount: '', 
      currency: '',
    }],
    notes: [{
      content: '',
      creatingDate: '',
      creator: '',
    }],
    equipment: {
      carEquipment: [{
        date: '',
        item: '',
        quantity: '',
        cost: '',
        deliveredBy: '',
      }],
      workEquipment: [{
        date: '',
        item: '',
        quantity: '',
        cost: '',
        deliveredBy: '',
      }],
    },
  });
  const userRoles = localStorage.getItem('userRoles');
  const token = localStorage.getItem('userToken');
  const capacity = parseInt(localStorage.getItem('capacity'), 10);
  const createdAtDays = parseInt(localStorage.getItem('createdAtDays'), 10);
  const shouldShowAddVehicle = createdAtDays <= 14 || (cars.length < capacity && createdAtDays > 14);
  const updateCarStatus = async (carId, newStatus) => {
  
    const token = localStorage.getItem('userToken');
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cars/${carId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok) {
            throw new Error('Failed to update car status');
        }
        const data = await response.json();
     
  
        // No need to manually set drivers here
        // Instead, refresh the drivers from the context to reflect the change
        await refreshCars(); // Call refreshDrivers to update the list
    } catch (error) {
        console.error('Error updating car status:', error);
    }
  };

  const [activeInFleetSinceDate, setActiveInFleetSinceDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());
  const handleActiveInFleetSinceDateChange = (date) => {
    setActiveInFleetSinceDate(date);
    setCarData({
      ...carData,
      general: { ...carData.general, activeInFleetSinceDate: date.toISOString().substring(0, 10) }
    });
  };
 
  const handleChange = (e, section = null) => {
    if (section) {
      setCarData({
        ...carData,
        [section]: { ...carData[section], [e.target.name]: e.target.value }
      });
    } else {
      setCarData({ ...carData, [e.target.name]: e.target.value });
    }
  };
  const handleDateChange = (date) => {
    setStartDate(date);
    // Update your carData state for the registrationDate
    setCarData({
      ...carData,
      general: { ...carData.general, registrationDate: date.toISOString().substring(0, 10) }
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Simple validation for required fields
 
    // Format dates and ensure numbers are correctly typed
    const formattedRegistrationDate = startDate.toISOString();
    const formattedActiveInFleetSinceDate = activeInFleetSinceDate.toISOString();
  
    // Filter out drivers with empty driverId values
    const filteredDrivers = carData.drivers.filter(driver => driver.driverId.trim() !== "");
    const cleanObject = (obj) => {
      Object.keys(obj).forEach(key => {
        if (obj[key] && typeof obj[key] === 'object' && !(obj[key] instanceof Date)) {
          cleanObject(obj[key]);
        } else if (obj[key] === '' || obj[key] === '-') {
          delete obj[key];
        }
      });
    };
  
    // Create a deep copy of carData to avoid mutating the state
    const cleanedCarData = JSON.parse(JSON.stringify(carData));
   // Here, directly set the carLicenseCheck with desired default values
   const carLicenseCheckData = {
    date: new Date(),
    licensePhoto: '', // Assign accordingly if you have an input for this
    statuses: [{
      status: 'Waiting',
      updatedAt: new Date()
    }]
  };
    // Clean the copied data
    cleanObject(cleanedCarData);
    const submissionData = {
      ...carData,
     
      general: {
        ...carData.general,
        registrationDate: formattedRegistrationDate,
        activeInFleetSinceDate: formattedActiveInFleetSinceDate,
        tareWeightKg: Number(carData.general.tareWeightKg),
        loadCapacityKg: Number(carData.general.loadCapacityKg),
        tensileLoadKg: Number(carData.general.tensileLoadKg),
        trailerLoadKg: Number(carData.general.trailerLoadKg),
      },
      drivers: filteredDrivers, // Use filtered drivers
      carLicenseCheck: [carLicenseCheckData],

    };
    const cleanSubmissionData = JSON.parse(JSON.stringify(submissionData)); // Deep copy

  // Function to recursively clean objects and arrays of empty or placeholder values
const cleanData = (obj) => {
  Object.entries(obj).forEach(([key, value]) => {
    // Check if the key is 'area' and skip deletion if the value is an empty string
    if (key === 'area' && value === '') {
      // Do nothing, preserve the 'area' even if it's an empty string
    } else if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        obj[key] = value
          .map(item => cleanData(item))
          .filter(item => Object.keys(item).length > 0);
      } else {
        obj[key] = cleanData(value);
      }
    } else if (value === '' || value === '-') {
      delete obj[key];
    }
  });
  return obj;
};


  const filteredCarData = cleanData(cleanSubmissionData);

  // Filter out drivers with empty driverId values more safely
  if (filteredCarData.drivers) {
    filteredCarData.drivers = filteredCarData.drivers.filter(driver => driver.driverId && driver.driverId.trim() !== "");
  }
  
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cars/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(filteredCarData)
      });
  
      if (!response.ok) {
        throw new Error('Something went wrong with the car creation');
      }
  
      const data = await response.json();
        // Now, update the status of the newly created driver
        if (data._id) {
          await updateCarStatus(data._id, carData.status);
        }
  
      refreshCars();
      setShowModal(false); // Close the modal on success
      setShowNotification(true); // Show notification
     
     

    setTimeout(() => {
    
      setTimeout(() => setShowNotification(false), 500);
    }, 3000); 
  
    // Reset form state to initial values
    setCarData({
      state: '',
      general: {
        internalName: '',
        licensePlate: '',
        internalID: '',
        affiliatedCompany: '',
        location: '',
        registrationDate: '',
        activeInFleetSinceDate: '',
        registrationCertificate: '',
        model: '',
        vehicleType: '',
        vin: '',
        tareWeightKg: '', 
        registeredIn: '',
        loadCapacityKg: '',
        tensileLoadKg: '',
        trailerLoadKg: '',
        financingType: '',
        internalUnitName:'',
        unitCapacity: '',
      },
      drivers: [{
        driverId: '',
        from: '',
        till: '',
      }],
      carLicenseCheck: [{
        date: new Date(), // Reset with a new Date instance
        licensePhoto: '',
        status: 'Waiting',
      }],
      area: '',
      tasks: [{
        description: '',
        creatingDate: '',
        dueDate: '',
        owner: '',
        taskStatus: '', 
      }],
      invoices: [{
        invoiceNumber: '',
        invoiceType: '',
        for: '',
        date: '',
        amount: '', 
        currency: '',
      }],
      notes: [{
        content: '',
        creatingDate: '',
        creator: '',
      }],
      equipment: {
        carEquipment: [{
          date: '',
          item: '',
          quantity: '',
          cost: '',
          deliveredBy: '',
        }],
        workEquipment: [{
          date: '',
          item: '',
          quantity: '',
          cost: '',
          deliveredBy: '',
        }],
      },
    });

    // Reset additional state variables
    setStartDate(new Date());
    setActiveInFleetSinceDate(new Date());

    } catch (error) {
      console.error("Error adding car:", error);
    }
  };

  const onChange1 = (date, dateString) => {
    setStartDate( date);
  };

  const stateOptions = [
  
    {
      value: "Active",
      label: "Active",
    },
    {
   value: "Inactive",
      label: "Inactive",
    },
    {
      value: "Incoming",
      label: "Incoming",
    },
    {
      value: "Outgoing",
      label: "Outgoing",
    },
    {
      value: "Transferring",
      label: "Transferring",
    },
    {
      value: "Repairing",
      label: "Repairing",
    },
    {
      value: "No Driver",
      label: "No Driver",
    },
  ];

  const financingTypeOptions = [
   
    {
      value: "Leasing",
      label: "Leasing",
    },
    {
      value: "Long term rental(leasing)",
      label: "Long term rental(leasing)",
    },
    {
      value: "Credit",
      label: "Credit",
    },
    {
      value: "Purchase",
      label: "Purchase",
    },
    {
      value: "Long term rental",
      label: "Long term rental",
    },
  ];
  const financingTypeOptions1 = [
   
    {
      value: "Transporter",
      label: "Transporter",
    },
    {
      value: "Two-wheeler",
      label: "Two-wheeler",
    },
    {
      value: "Truck",
      label: "Truck",
    },
    {
      value: "Bus",
      label: "Bus",
    },
    {
      value: "Build up",
      label: "Build up",
    },
    {
      value: "Excavator",
      label: "Excavator",
    },
    {
      value: "Tractor",
      label: "Tractor",
    },
    {
      value: "Special vehicle",
      label: "Special vehicle",
    },
    {
      value: "Swap body",
      label: "Swap body",
    },
  ];

  
  return (
    <div style={{ backgroundColor: theme.theme === 'dark' ? '#141b27' : '#f5f8fa'}}>
 <div>
            {showNotification && (
  <div className="notificationP show">
    New Vehicle was created
    <div className="loading-line"></div>
  </div>
)}
       <div style={{ backgroundColor: theme === 'dark' ? '#141b27' : '#ffffff'}}  className={userRoles === 'user' ? "hidddenforuserdfj" : "vehicles-container"}>
       {shouldShowAddVehicle && (
                <Button className='addimg mt-3 mb-3 mr-4 w-[180px] shadow-xl ' onClick={() => setShowModal(true)}>
                    <img src={plusi} alt="Add" style={{width:'12%', marginRight: "8px" }} />
                    Add New Vehicle
                </Button>
            )}


      {showModal && (
        <div className="modalcarso" >
          <div className="modal-contentcarso" >
          <label className='Addvehicle' htmlFor="Add vehicle">Add vehicle</label>
            <form onSubmit={handleSubmit}>
            <div className="form-group-state">
              <label htmlFor="state">State</label>
              <Select
               
                style={{
                  width: '57.7%', // Adjust the width as needed
                }}
                value={carData.state}
                onChange={(value) => handleChange({ target: { name: 'state', value } })}
                placeholder="Select State"
                optionFilterProp="children"
                filterOption={(input, option) => 
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={stateOptions}
               
              />
            </div>
              <div className="form-group-state">
                <label htmlFor="internalName">Internal Name / ID</label>
                <input
                  type="text"
                  name="internalName"
                  value={carData.general.internalName}
                  onChange={(e) => handleChange(e, 'general')}
                  required
                />
              </div>
              <div className="form-group-state">
                <label htmlFor="licensePlate">License plate</label>
                <input
                  type="text"
                  name="licensePlate"
                  value={carData.general.licensePlate}
                  onChange={(e) => handleChange(e, 'general')}
                  required
                />
              </div>
              <div className="form-group-state">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  name="location"
                  value={carData.general.location}
                  onChange={(e) => handleChange(e, 'general')}
                />
              </div>
              <div className="form-group-state">
                <label htmlFor="affiliatedCompany">Affiliated company</label>
                <input
                  type="text"
                  name="affiliatedCompany"
                  value={carData.general.affiliatedCompany}
                  onChange={(e) => handleChange(e, 'general')}
                />
              </div>
              <div className="form-group-state">
                <label htmlFor="registeredIn">Registered in</label>
                <input
                  type="text"
                  name="registeredIn"
                  value={carData.general.registeredIn}
                  onChange={(e) => handleChange(e, 'general')}
                />
              </div>
              <div className="form-group-state">
                <label htmlFor="registrationDate">Registration date</label>
                <div className='dateveform'>
                <DatePicker onChange={handleDateChange} style={{ width: '98%',marginLeft:'2%' }}/>
                  </div>
                </div>
                <div className="form-group-state">
                <label htmlFor="registrationDate">Active in fleet since</label>
                <div className='dateveform'>
                <DatePicker onChange={handleActiveInFleetSinceDateChange} style={{ width: '98%',marginLeft:'2%' }}  />
                  </div>
                </div>

              <div className="form-group-state">
                <label htmlFor="model">Model</label>
                <input
                  type="text"
                  name="model"
                  value={carData.general.model}
                  onChange={(e) => handleChange(e, 'general')}
                />
              </div>
              <div className="form-group-state">
                <label htmlFor="financingType">Financing type</label>
                <Select
                
                  style={{
                    width: '57.7%', // Adjust the width as needed
                  }}
                  value={carData.general.financingType}
                  onChange={(value) => handleChange({ target: { name: 'financingType', value } }, 'general')}
                  placeholder="Select Type"
                  optionFilterProp="children"
                  filterOption={(input, option) => 
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={financingTypeOptions}
                />
              </div>
              <div className="form-group-state">
                <label htmlFor="vehicleType">Vehicle type</label>
                <Select
                
                  style={{
                    width: '57.7%', // Adjust the width as needed
                  }}
                  value={carData.general.vehicleType}
                  onChange={(value) => handleChange({ target: { name: 'vehicleType', value } }, 'general')}
                  placeholder="Select Type"
                  optionFilterProp="children"
                  filterOption={(input, option) => 
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={financingTypeOptions1}
                />
              </div>
       
              <div className="form-group-state">
                <label htmlFor="tareWeightKg">Tare weight</label>
                <input
                  type="number"
                  name="tareWeightKg"
                  value={carData.general.tareWeightKg}
                  onChange={(e) => handleChange(e, 'general')}
                />
              </div>
             
              <div className="form-group-state">
                <label htmlFor="loadCapacityKg">Load capacity</label>
                <input
                  type="number"
                  name="loadCapacityKg"
                  value={carData.general.loadCapacityKg}
                  onChange={(e) => handleChange(e, 'general')}
                />
              </div>
              <div className="form-group-state">
                <label htmlFor="tensileLoadKg">Tensile load</label>
                <input
                  type="number"
                  name="tensileLoadKg"
                  value={carData.general.tensileLoadKg}
                  onChange={(e) => handleChange(e, 'general')}
                />
              </div>
              <div className="form-group-state">
                <label htmlFor="trailerLoadKg">Trailer load</label>
                <input
                  type="number"
                  name="trailerLoadKg"
                  value={carData.general.trailerLoadKg}
                  onChange={(e) => handleChange(e, 'general')}
                />
              </div>
              <div className="form-group-state">
                <label htmlFor="internalUnitName">Internal Unit Name</label>
                <input
                  type="text"
                  name="internalUnitName"
                  value={carData.general.internalUnitName}
                  onChange={(e) => handleChange(e, 'general')}
                />
              </div>
              <div className="form-group-state">
                <label htmlFor="unitCapacity">Internal Unit Capacity</label>
                <input
                  type="number"
                  name="unitCapacity"
                  value={carData.general.unitCapacity}
                  onChange={(e) => handleChange(e, 'general')}
                />
              </div>

              <div className='btnboth'>
             
              <button id="close" onClick={() => setShowModal(false)}>Cancel</button>
              <button id="closeccdo" type="submit">Create vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
 
    </div>

      <Ckanban 
        cars={cars} 
        drivers={drivers} 
        setActiveStatuses={setActiveStatuses} 
        theme={theme} 
        updateCarStatusInContext={updateCarStatusInContext} 
        activeStatuses={activeStatuses} 
      />
    </div>
  );
}

export default Vehicles;
