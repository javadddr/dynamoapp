import React, { useEffect, useState } from 'react';
import GetDrivers from './GetDrivers';
import Loading from './Loading'; // Adjust the path as necessary
import GetCars from './GetCars';
import nopic from "./nopic.png"
import { ArrowRightOutlined } from '@ant-design/icons';
import {Badge, Avatar} from "@nextui-org/react";
import {Input} from "@nextui-org/react";
import {SearchIcon} from "./assets/SearchIcon";
import { useCars, useDrivers } from './CarDriver';
import {Chip} from "@nextui-org/react";
import { Card,Tooltip, CardBody } from "@nextui-org/react";
const DriversLicense = (theme) => {
  const [drivers, setDrivers] = useState([]);
  const { cars, refreshCars } = useCars();
  const [selectedCar, setSelectedCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [draggingCarId, setDraggingCarId] = useState(null);
  const [draggingDriverId, setDraggingDriverId] = useState(null);
  const [dragOverPipeline, setDragOverPipeline] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  console.log("selectedDriver",selectedDriver)
  const [searchQuery, setSearchQuery] = useState('');

  let isDarkMode; // Declare the variable

  if (theme.theme === 'dark') {
    isDarkMode = true; // Set to true if theme is 'dark'
  } else {
    isDarkMode = false; // Set to false otherwise
  }
  
  const handleDriverPictureClick = (event, driver) => {
    event.stopPropagation();
    setSelectedDriver(driver);
  };



  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const createDefaultLicenseCheck = async (driver) => {
      const date = driver.startDate ? new Date(driver.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/drivers/${driver._id}/licenseCheck`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date,
            status: "Not Enrolled",
            licensePhoto: ""
          }),
        });
        if (!response.ok) throw new Error('Failed to create default license check');
      } catch (error) {
        console.error("Error creating default license check:", error);
      }
    };

    const refreshDrivers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/drivers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch drivers');
        }

        const fetchedDrivers = await response.json();
        await Promise.all(fetchedDrivers.map(async (driver) => {
          // Check if driverLicenseCheck is undefined or has no entries
          if (!driver.driverLicenseCheck || driver.driverLicenseCheck.length === 0) {
            await createDefaultLicenseCheck(driver);
          }
        }));
        // Check each driver for an empty driverLicenseCheck array
        await Promise.all(fetchedDrivers.map(async (driver) => {
          if (driver.driverLicenseCheck.length === 0) {
            await createDefaultLicenseCheck(driver);
          }
        }));

        // Fetch drivers again to update the state with the new license checks
        const updatedDriversResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/drivers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const updatedDrivers = await updatedDriversResponse.json();
        setDrivers(updatedDrivers);
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    };

    refreshDrivers();
  }, [selectedDriver]); // Dependency array is empty, so this effect runs only once when the component mounts

  // The rest of your component...

  const onDragStart = (event, driverId) => {
    event.dataTransfer.setData("driverId", driverId);
    setDraggingDriverId(driverId); // Track the dragged driver
  };
  

  const onDragOver = (event, status) => {
    event.preventDefault(); // Necessary to allow dropping
    setDragOverPipeline(status); // Track the pipeline being dragged over
  };
  const updateDriverStatus = async (driverId, licenseCheckId, newStatus) => {
    const token = localStorage.getItem('userToken'); // Retrieve the auth token
    try {
      // Construct the URL with the driverId and licenseCheckId
      const url = `${import.meta.env.VITE_BACKEND_URL}/drivers/${driverId}/licenseCheck/${licenseCheckId}/status`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the authorization header
        },
        body: JSON.stringify({ status: newStatus }), // Send the new status
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error('Failed to update driver status: ' + error.message);
      }
  
      return await response.json(); // Assuming the updated driver object or license check is returned
    } catch (error) {
      console.error('Error updating driver status:', error);
      throw error; // Re-throw the error to handle it in the calling function
    }
  };
  
  
  
  const onDrop = async (event, newStatus) => {
    event.preventDefault();
    const driverId = event.dataTransfer.getData("driverId");
    
    // Find the driver based on the ID
    const driver = drivers.find(d => d._id === driverId);
    if (!driver || driver.driverLicenseCheck.length === 0) {
      console.error("Driver or driver's license check not found.");
      return;
    }
  
    // Assuming the driverLicenseCheck array is sorted or we're interested in the latest entry
    const licenseCheckId = driver.driverLicenseCheck[driver.driverLicenseCheck.length - 1]._id;
    
    try {
      await updateDriverStatus(driverId, licenseCheckId, newStatus);
      // Refresh drivers to reflect the change
      const updatedDriversResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/drivers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('userToken')}`,
        },
      });
      if (!updatedDriversResponse.ok) throw new Error('Failed to fetch updated drivers');
      const updatedDrivers = await updatedDriversResponse.json();
      setDrivers(updatedDrivers);
      setDraggingDriverId(null);
  setDragOverPipeline(null);

    } catch (error) {
      console.error('Error updating driver status or refreshing drivers:', error);
    }
  };
  
  useEffect(() => {
    const fetchDrivers = async () => {
      setIsLoading(true); // Set loading state to true while fetching data
      const token = localStorage.getItem('userToken');

      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/drivers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch drivers');
        }

        const fetchedDrivers = await response.json();

        // Perform any additional operations you need on fetchedDrivers here

        setDrivers(fetchedDrivers); // Update state with fetched drivers
      } catch (error) {
        console.error("Error fetching drivers:", error);
      } finally {
        setIsLoading(false); // Set loading state to false once data fetching is complete or fails
      }
    };

    fetchDrivers();
  }, []);

  // The rest of your component...

  if (isLoading) {
    return <Loading />; // Show loading component while data is being fetched
  }
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter drivers based on search query
  const filteredDrivers = drivers.filter(driver => {
    const nameMatch = driver.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) || driver.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
    const locationMatch = driver.address?.toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch = driver.status?.toLowerCase().includes(searchQuery.toLowerCase());
    // Debugging: Log any drivers that don't have expected properties
    if (!driver.firstName || !driver.lastName || !driver.address|| !driver.status) {
      console.log('Driver missing expected property:', driver);
    }

    return nameMatch || locationMatch || statusMatch;
  });

 
  const findAssignedCars = (driverId) => {
    const today = new Date();
    // console.log("Today:", today);
    return cars.filter((car) => {
      const matchingDrivers = car.drivers.filter(driver => {
        const fromDate = new Date(driver.from);
        const tillDate = new Date(driver.till);
        // console.log("Checking driver:", driver);
        // console.log("From date:", fromDate, "Till date:", tillDate);
        return driver.driverId === driverId &&
          fromDate <= today &&
          tillDate >= today;
      });
      // console.log("Matching drivers for car:", matchingDrivers);
      return matchingDrivers.length > 0;
    });
  };
  
  const handleCarPictureClick = (event, driver) => {
    event.stopPropagation();
    console.log("driver",driver)
    setSelectedDriver(driver)
    // console.log("Driver ID:", driver._id);
    const cars = findAssignedCars(driver._id);
    // console.log("Assigned cars:", cars);
  };
  
  const statusStyles = {
    'Active': 'bg-green-700 text-green-900',
    'Inactive': 'bg-gray-600 text-slate-500',
    'Sick': 'bg-blue-600 text-blue-800',
    'Holiday': 'bg-yellow-600 text-yellow-900',
    'Over Hours': 'bg-purple-600 text-purple-800',
    'Work Accident': 'bg-red-600 text-red-800',
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
  {['Not Enrolled', 'Setup', 'Driver Check', 'Pending Review', 'Valid Licenses'].map((status, index) => {
    // Map each status to a color based on the index
    const statusColors = [
      'default',    
      'primary',  
      'warning',   
      'danger',    
      'success'    
    ];

    return (
      <div key={status} className="flex-1">
       <div>
        <Chip
          variant="flat"
          color={statusColors[index]}
          className="mb-0 h-12 max-w-full justify-center flex rounded-br-none rounded-bl-none"
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
  {filteredDrivers
  .filter(driver => {
    const latestLicenseCheck = driver.driverLicenseCheck[driver.driverLicenseCheck.length - 1] || {};
    const latestStatus = latestLicenseCheck.statuses?.[latestLicenseCheck.statuses.length - 1]?.status || '';
    return latestStatus === status;
  })
  .map((driver) => (
    <Card
      key={driver._id}
      isPressable
      isHoverable
      className={`cursor-pointer rounded-lg z-10 shadow-2xl ${draggingCarId === driver._id ? 'opacity-50' : ''} w-full ${isDarkMode ? 'dark' : 'light'} m-0`}
      onDragStart={(event) => onDragStart(event, driver._id)}
      draggable
      onClick={(event) => handleDriverPictureClick(event, driver)}
    >
      <CardBody className={`space-y-2 flex ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="flex justify-items-center justify-center">
          <Badge
            content=""
            color=""
            placement="top-right"
            className={`w-[20px] h-[20px] ${statusStyles[driver.status] || ''}`}
          >
             <Tooltip
                          content={<span>{driver.firstName} <ArrowRightOutlined /> {driver.status}</span>}
                          delay={0}
                          closeDelay={0}
                          motionProps={{
                            variants: {
                              exit: {
                                opacity: 0,
                                left: 0,
                                transition: {
                                  duration: 0.7,
                                  ease: "easeIn",
                                },
                              },
                              enter: {
                                opacity: 1,
                                left: 0,
                                transition: {
                                  duration: 0.15,
                                  ease: "easeOut",
                                },
                              },
                            },
                          }}
                        >
                         <Avatar
                            isBordered={false}
                            radius="full"
                            src={driver.picture ? `https://api.dynamofleet.com/uploads/${driver.picture}` : undefined}
                            alt={driver.firstName || "No Picture"}
                            className="w-14 h-14 text-large border-2 border-fuchsia-700 hover:cursor-pointer"
                          >
                            {!driver.picture && "No Pic"}
                          </Avatar>
                   </Tooltip>
          </Badge>
        </div>
        <div className="flex justify-items-center justify-center">
          <div className={`font-bold text-sm ${isDarkMode ? 'text-yellow-400' : 'text-sky-700'}`}>
          {driver.firstName} {driver.lastName}
          </div>
          
        </div>
        <div>
        <div className={` mt-0 pt-0 text-sm flex justify-items-center justify-center ${isDarkMode ? 'text-gray-400' : 'text-lime-800'}`}>
            Status: {driver.status} 
          </div>
        </div>
        <div>
          <div className='text-sm flex justify-items-center justify-center'>
            Location: {driver.address}
          </div>
        </div>
        <div className={`  text-sm flex justify-items-center justify-center`}>
        {findAssignedCars(driver._id).length > 0 ? (
                            findAssignedCars(driver._id).map((car) => (
                              <div key={car._id} className="geeraliindiv3">
                                <div className="text-sm text-gray-500">
                                  <span className="text-yellow-800">Vehicle: </span>
                                  {car.general.internalName|| "No Vehicle"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  <span className="text-yellow-800">Area: </span>
                                  {car.area || "No Area"}
                                </div>
                              </div>
                            ))
                          ) : (
                            // Always show "Vehicle" and "Area" even if there are no cars
                            <div className="geeraliindiv3">
                              <div className="text-sm text-gray-500">
                                <span className="text-yellow-800">Vehicle: </span>No Vehicle
                              </div>
                              <div className="text-sm text-gray-500">
                                <span className="text-yellow-800">Area: </span>No Area
                              </div>
                            </div>
                          )}
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

{selectedDriver && (
  <div className="modal-overlay" onClick={() => setSelectedDriver(null)}>
    <div onClick={e => e.stopPropagation()}>
      <GetDrivers driver={selectedDriver}  theme={theme.theme} closePopup={() => setSelectedDriver(null)} />
    </div>
  </div>
)}
  </div>
  
  );
  
  
};

export default DriversLicense;



