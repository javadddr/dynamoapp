import React, { useEffect, useState } from 'react';

import Loading from './Loading'; // Adjust the path as necessary
import GetCars from './GetCars';
import nopic from "./nopic.png"
import {Input} from "@nextui-org/react";
import {SearchIcon} from "./assets/SearchIcon";
import {Chip} from "@nextui-org/react";
import { Card, CardBody } from "@nextui-org/react";
const VehicleInspection = (theme) => {
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggingCarId, setDraggingCarId] = useState(null);
  const [dragOverPipeline, setDragOverPipeline] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  let isDarkMode; // Declare the variable
console.log(theme.theme)
if (theme.theme === 'dark') {
  isDarkMode = true; // Set to true if theme is 'dark'
} else {
  isDarkMode = false; // Set to false otherwise
}

  
  const handleCarPictureClick = (event, car) => {
    event.stopPropagation();
    setSelectedCar(car);
  };


  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const createDefaultLicenseCheck = async (car) => {
      const date = car.general.activeInFleetSinceDate ? new Date(car.general.activeInFleetSinceDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cars/${car._id}/licenseCheck`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date,
            status: "Waiting",
            licensePhoto: ""
          }),
        });
        if (!response.ok) throw new Error('Failed to create default license check');
      } catch (error) {
        console.error("Error creating default license check:", error);
      }
    };

    const refreshCars = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cars`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch cars');
        }

        const fetchedCars = await response.json();
        await Promise.all(fetchedCars.map(async (car) => {
          // Check if car is undefined or has no entries
          if (!car.carLicenseCheck || car.carLicenseCheck.length === 0) {
            await createDefaultLicenseCheck(car);
          }
        }));
        // Check each driver for an empty driverLicenseCheck array
        await Promise.all(fetchedCars.map(async (car) => {
          if (car.carLicenseCheck.length.length === 0) {
            await createDefaultLicenseCheck(car);
          }
        }));

        // Fetch drivers again to update the state with the new license checks
        const updatedCarsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cars`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const updatedCars = await updatedCarsResponse.json();
        setCars(updatedCars);
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    };

    refreshCars();
  }, [selectedCar]); // Dependency array is empty, so this effect runs only once when the component mounts

  // The rest of your component...

  const onDragStart = (event, carId) => {
    event.dataTransfer.setData("carId", carId);
    setDraggingCarId(carId); // Track the dragged driver
  };
  

  const onDragOver = (event, status) => {
    event.preventDefault(); // Necessary to allow dropping
    setDragOverPipeline(status); // Track the pipeline being dragged over
  };
  const updateCarStatus = async (carId, licenseCheckId, newStatus) => {
   
    const token = localStorage.getItem('userToken'); // Retrieve the auth token
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cars/${carId}/licenseCheck/${licenseCheckId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the authorization header if your endpoint requires it
        },
        body: JSON.stringify({ status: newStatus }),
      });
  
      if (!response.ok) throw new Error('Failed to update driver status');
      return await response.json(); // Assuming the updated driver object or license check is returned
    } catch (error) {
      console.error('Error updating driver status:', error);
      throw error; // Re-throw the error to handle it in the calling function
    }
  };
  
  
  const onDrop = async (event, newStatus) => {
    event.preventDefault();
    const carId = event.dataTransfer.getData("carId");
  
    // Hypothetical way to get the licenseCheckId. This needs to be adjusted based on your app's logic.
    // It might involve looking up the driver in your state and selecting the relevant licenseCheckId.
    const car = cars.find(d => d._id === carId);
    const licenseCheckId = car.carLicenseCheck[car.carLicenseCheck.length - 1]._id;
  
    try {
      await updateCarStatus(carId, licenseCheckId, newStatus);
      // Refresh drivers to reflect the change
      const updatedCarsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cars`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('userToken')}`,
        },
      });
      if (!updatedCarsResponse.ok) throw new Error('Failed to fetch updated cars');
      const updatedCars = await updatedCarsResponse.json();
      setCars(updatedCars);
      setDraggingCarId(null);
  setDragOverPipeline(null);

    } catch (error) {
      console.error('Error updating driver status or refreshing cars:', error);
    }
  };
  
  useEffect(() => {
    const fetchCars = async () => {
      setIsLoading(true); // Set loading state to true while fetching data
      const token = localStorage.getItem('userToken');

      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cars`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch cars');
        }

        const fetchedCars = await response.json();

        // Perform any additional operations you need on fetchedDrivers here

        setCars(fetchedCars); // Update state with fetched drivers
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setIsLoading(false); // Set loading state to false once data fetching is complete or fails
      }
    };

    fetchCars();
  }, []);

  // The rest of your component...

  if (isLoading) {
    return <Loading />; // Show loading component while data is being fetched
  }
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter drivers based on search query
  const filteredCars = cars.filter(car => {
    const nameMatch = car.general.internalName?.toLowerCase().includes(searchQuery.toLowerCase()) || car.general.licensePlate?.toLowerCase().includes(searchQuery.toLowerCase());
    const locationMatch = car.area?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Debugging: Log any drivers that don't have expected properties
    if (!car.general.internalName || !car.general.licensePlate || !car.area) {
      console.log('car missing expected property:', car);
    }
  
    return nameMatch || locationMatch;
  });
  const statusStylesoo = {
    'Active': 'bg-green-100 text-green-900',
    'Inactive': 'bg-gray-300 text-slate-500',
    'Incoming': 'bg-blue-100 text-blue-800',
    'Outgoing': 'bg-yellow-100 text-yellow-800',
    'Transferring': 'bg-purple-100 text-purple-800',
    'Repairing': 'bg-red-100 text-red-800',
    'No Driver': 'bg-pink-100 text-pink-800',
  };

  const calculateDaysAgo = (dateString) => {
    const date = new Date(dateString);
    const currentDate = new Date();
  
    // Normalize both dates to the start of the day for accurate comparison
    date.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
  
    const differenceInTime = currentDate.getTime() - date.getTime();
    const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
  
    return differenceInDays; // Returns the number of days ago
  };

  return (
    <div className={`flex flex-col justify-center px-2 pt-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
    <div className="flex justify-end mb-5">
    <div>
          <Input
            isClearable
            radius="sm"
            classNames={{
              label: "text-black/50 dark:text-white/90",
              input: [
                "bg-transparent",
                "text-black/90 dark:text-white/90",
                "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                "border-0",
                "max-w-[300px]",
                "focus:ring-0", 
                "focus:outline-none"  
              ],
              innerWrapper: "bg-transparent",
              inputWrapper: [
                "shadow-xl",
                "bg-default-200/50",
                "dark:bg-default/60",
                "backdrop-blur-xl",
                "backdrop-saturate-200",
                "hover:bg-default-200/70",
                "dark:hover:bg-default/70",
                `${theme === 'dark' ? "dark" : "light"}`,
                "!cursor-text",
                "max-w-[300px]"
              ],
            }}
            placeholder="Type to search..."
            startContent={
              <SearchIcon className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
            }
            value={searchQuery} // Bind input value to state
            onChange={(e) => setSearchQuery(e.target.value)} // Update state on input change
            onClear={() => setSearchQuery('')} // Clear the input when the "X" is clicked
          />
          </div>
    </div>
  
    <div className="flex space-x-1">
  {['No or expired inspection', 'Waiting', 'Under Inspection', 'Inspection Done', 'Rejected'].map((status, index) => {
    // Map each status to a color based on the index
    const statusColors = [
      'default',    // No or expired inspection
      'primary',  // Waiting
      'warning',    // Under Inspection
      'success',    // Inspection Done
      'danger'      // Rejected
    ];

    return (
      <div key={status} className="flex-1">
       <div>
        <Chip
          variant="flat"
          color={statusColors[index]}
          className="mb-1 h-12 max-w-full justify-center flex rounded-br-none rounded-bl-none"
          radius="sm"
        >
          <span  className=" justify-center flex">{status}</span>
        </Chip>
 </div>
        <div
          className={`p-1 border h-[638px] mb-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'} overflow-y-auto scrollbar-hide`}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => onDrop(event, status)}
        >
          <div className="space-y-3">
            {filteredCars.filter(car => {
              const latestLicenseCheck = car.carLicenseCheck[car.carLicenseCheck.length - 1] || {};
              const latestStatus = latestLicenseCheck.statuses?.[latestLicenseCheck.statuses.length - 1]?.status;
              return latestStatus === status;
            }).map((car) => (
              <Card
                key={car._id}
                isPressable
                isHoverable
                className={`cursor-pointer rounded-lg z-10 shadow-2xl  ${draggingCarId === car._id ? 'opacity-50' : ''} w-full ${isDarkMode ? 'dark' : 'light'} m-0`} 
                onDragStart={(event) => onDragStart(event, car._id)}
                draggable
                onClick={(event) => handleCarPictureClick(event, car)}
              >
               <CardBody className={`space-y-2 ${isDarkMode ? 'dark' : 'light'}`}>
  <div className={`font-bold text-sm ${isDarkMode ? 'text-yellow-400' : 'text-sky-700'}`}>
    Name: {car.general.internalName}
  </div>
  <div className='text-sm'>License Plate: {car.general.licensePlate}</div>
  <div className='text-sm'>Area: {car.area || 'No Area'}</div>
  
  <div className="flex justify-between items-center">
    <div>
    State:
    <span className={`px-1 text-sm py-1 ml-1 rounded-full ${statusStylesoo[car.state]}`}>
      {car.state}
    </span>
    </div>
 
    <span className='text-sm'>{calculateDaysAgo(car.carLicenseCheck[0].date)} Days</span>
  </div>
</CardBody>

              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  })}
</div>

  
    {selectedCar && (
      <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedCar(null)}>
        <div onClick={(e) => e.stopPropagation()}>
          <GetCars car={selectedCar} theme={theme.theme} closePopup={() => setSelectedCar(null)} />
        </div>
      </div>
    )}
  </div>
  
  );
  
  
};

export default VehicleInspection;

