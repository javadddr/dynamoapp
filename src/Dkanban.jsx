import React,{useState,useEffect} from 'react';
import { Avatar, AvatarGroup, Button, Badge, Chip,Tooltip ,CheckboxGroup, Checkbox} from '@nextui-org/react';
import "./Ckanban.css";
import { Card, CardBody } from "@nextui-org/react";
import {Input} from "@nextui-org/react";
import {SearchIcon} from "./assets/SearchIcon";
import { ArrowRightOutlined } from '@ant-design/icons';
import GetDrivers from './GetDrivers';
import Drivers from './Drivers';
import { useCars, useDrivers } from './CarDriver';
const Dkanban = ({ cars, theme, activeStatuses,drivers, updateDriverStatusInContext,setActiveStatuses }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const {refreshDrivers } = useDrivers(); // Assuming this gives you the drivers list
 
  const desiredOrder = [
    "Active",
    "Inactive",
    "Sick",
    "Holiday",
    "Over Hours",
    "Work Accident",
  ];
  const [statusCounts, setStatusCounts] = useState({
    "Active": 0,
    "Inactive": 0,
    "Sick": 0,
    "Holiday": 0,
    "Over Hours": 0,
    "Work Accident": 0,
  });

  useEffect(() => {
    const counts = {
      "Active": 0,
      "Inactive": 0,
      "Sick": 0,
      "Holiday": 0,
      "Over Hours": 0,
      "Work Accident": 0,
    };

    drivers.forEach((driver) => {
      if (driver.status && counts.hasOwnProperty(driver.status)) {
        counts[driver.status] += 1;
      }
    });

    setStatusCounts(counts);
  }, [drivers]); // Re-run this effect whenever `cars` changes
  const orderedStatuses = [...activeStatuses].sort((a, b) => {
    return desiredOrder.indexOf(a) - desiredOrder.indexOf(b);
  });

  const firstRowStatuses = orderedStatuses.slice(0, 4);
  const secondRowStatuses = orderedStatuses.slice(4);



  

  const statusStyles = {
    'Active': 'bg-green-100 text-green-900',
    'Inactive': 'bg-gray-300 text-slate-500',
    'Sick': 'bg-blue-100 text-blue-800',
    'Holiday': 'bg-yellow-100 text-yellow-800',
    'Over Hours': 'bg-purple-100 text-purple-800',
    'Work Accident': 'bg-red-100 text-red-800',
  };

  const handleDragStart = (e, driverId) => {
    const currentPipeline = e.target.closest('.pipeline-container')?.querySelector('.status-chip')?.innerText;
    e.dataTransfer.setData('driverId', driverId);
    e.dataTransfer.setData('pipeline', currentPipeline);
  };

  const updateDriverStatus = async (driverId, newStatus) => {
    const token = localStorage.getItem('userToken');
    try {
      // Step 1: Update the driver's current status
      let updateResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/drivers/${driverId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }), // Update the driver's status
      });
  
      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(`Failed to update driver status: ${errorText}`);
      }
  
      // Log successful driver update
      const updatedDriverData = await updateResponse.json();
      console.log('Driver status updated:', updatedDriverData);
  
      // Step 2: Create a new status record for the driver
      const statusResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/statusRecords/${driverId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }), // Create a new status record
      });
  
      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        throw new Error(`Failed to create driver status record: ${errorText}`);
      }
  
      // Log successful status record creation
      const statusRecordData = await statusResponse.json();
      console.log('New driver status record created:', statusRecordData);
  
      // Optionally, refresh the driver's data in the UI
      await refreshDrivers(); // Ensure you have a function to refresh/re-fetch driver data
  
    } catch (error) {
      console.error('Error in updating driver status and creating status record:', error);
    }
  };
  const handleDrop = async (e, newPipeline) => {
    e.preventDefault();
    const driverId = e.dataTransfer.getData("driverId");

    updateDriverStatusInContext(driverId, newPipeline);
    await updateDriverStatus(driverId, newPipeline);

  
 
  };
  


  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('hovered-pipeline');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('hovered-pipeline');
  };

  
  useEffect(() => {
    fetchPreferences();
  }, []);
  
  const fetchPreferences = () => {
    const token = localStorage.getItem('userToken');
    fetch(`${import.meta.env.VITE_BACKEND_URL}/preferencesd`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(response => response.json())
    
    .then(activeStatuses => { // Assuming the endpoint now correctly returns an array
      if (activeStatuses && activeStatuses.length > 0) {
        setActiveStatuses(activeStatuses);
      }
    })
    .catch(error => console.error('Error fetching preferences:', error));
  
  };

  const updatePreferences = (newStatuses) => {
    const token = localStorage.getItem('userToken');
    fetch(`${import.meta.env.VITE_BACKEND_URL}/preferencesd`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ activeStatuses: newStatuses }),
    })
    .then(response => response.json())
    .then(() => {
      setActiveStatuses(newStatuses);
    })
    .catch(error => console.error('Error updating preferences:', error));
  };
  
  
  
///pop up
const [isPopupOpen, setIsPopupOpen] = useState(false);
const [selectedDriver, setSelectedDriver] = useState(null);

const openPopup = (driver) => {
  setSelectedDriver(driver);
  setIsPopupOpen(true);
};

const closePopup = () => {
  setIsPopupOpen(false);
};
const findAssignedCars = (driverId) => {
  const today = new Date();
  return cars.filter((car) => 
    car.drivers.some(driver =>
      driver.driverId === driverId &&
      new Date(driver.from) <= today &&
      new Date(driver.till) >= today
    )
  );
};
const renderPipeline = (statuses) => (
  <div className="flex flex-wrap justify-center gap-2 mb-3">
    {statuses.map((status) => (
      <div
        key={status}
        className={`pipeline-container flex-shrink-0 w-full md:w-64 ${
          activeStatuses.length < 5 ? "h-[750px]" : "h-[450px]"
        } h-[450px] min-w-[300px] overflow-hidden`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, status)}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <Chip
            variant="dot"
            radius="sm"
            size="lg"
            className={` mb-1 text-sm border-1 font-semibold ${statusStyles[status]}`}
          >
            {status}
          </Chip>
          <div
            className={`${
              theme === "dark"
                ? "bg-gray-600 border border-gray-700"
                : "bg-gray-200"
            } rounded-lg shadow p-2 flex-1 overflow-auto scrollbar-hidden ${
              theme === "dark" ? "hover:bg-gray-700" : "hover:bg-slate-200"
            }`}
          >
            {drivers
              .filter((driver) => driver.status === status) // Filter by driver status
              .filter((driver) => {
                const lowerSearchQuery = searchQuery.toLowerCase();
                return (
                  driver.firstName.toLowerCase().includes(lowerSearchQuery) ||
                  driver.lastName.toLowerCase().includes(lowerSearchQuery) ||
                  driver.address.toLowerCase().includes(lowerSearchQuery)
                );
              })
              .map((driver) => (
                
                <Card
                  key={driver._id}
                  radius="sm"
                  className={`mb-2 hover:cursor-pointer z-10 h-[150px] shadow-2xl ${
                    theme === "dark" ? "hover:bg-slate-800" : "hover:bg-slate-200"
                  } ${theme === "dark" ? "dark" : "light"}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, driver._id)}
                >
                  <CardBody>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                    
                        <div className="font-semibold">
                          {driver.firstName} {driver.lastName}
                        </div>
                        <div className="text-sm">{driver.license}</div>
                        <div className="text-sm text-gray-500">
                          {driver.address || "No Location"}
                        </div>

                        {findAssignedCars(driver._id).length > 0 ? (
                            findAssignedCars(driver._id).map((car) => (
                              <div key={car._id} className="geeraliindiv3">
                                <div className="text-sm text-gray-500">
                                  <span className="text-yellow-800">Vehicle: </span>
                                  {car.general.internalName?.internalName || "No Vehicle"}
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
                      <AvatarGroup
                        isBordered
                        size="lg"
                        max={2}
                        className={`${theme === "dark" ? "dark" : "light"}`}
                        renderCount={(count) => (
                          <p className="text-lg mb-5 text-foreground font-medium ms-2">
                            +{count}
                          </p>
                        )}
                      >
                        <Tooltip
                          content={<span>{driver.firstName} <ArrowRightOutlined /> {driver.status}</span>}
                          delay={0}
                          closeDelay={0}
                          motionProps={{
                            variants: {
                              exit: {
                                opacity: 0,
                                left: -10,
                                transition: {
                                  duration: 0.7,
                                  ease: "easeIn",
                                },
                              },
                              enter: {
                                opacity: 1,
                                left: -10,
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
                      </AvatarGroup>
                    </div>
                    <Button
                      size="sm"
                      className="bg-green-100 w-[30%] text-black hover:bg-green-200 transition-colors duration-300 ease-in-out"
                      onClick={() => openPopup(driver)}
                    >
                      More Info
                    </Button>
                  </CardBody>
                </Card>
              ))}
          </div>
        </div>
      </div>
    ))}
  </div>
);


  return (
    <div>
      <div className='flex justify-between text-center  p-4' style={{backgroundColor:theme === 'dark' ?"#141b27":"#ffffff"}}>
        <div  >
      
        <CheckboxGroup
                orientation="horizontal"
                color="warning"
                value={activeStatuses}  // Bind to activeStatuses state
                onChange={(newStatuses) => {
                  updatePreferences(newStatuses); // Send new preferences to the server
                }}
                className={theme === 'dark' ? "dark" : "light"}
              >
      <Checkbox value="Active">Active <Chip
          size="sm"
          variant="faded"
          color="success"
        > {statusCounts.Active}</Chip></Checkbox>
        <Checkbox value="Over Hours">Over Hours <Chip
         size="sm"
         variant="faded"
         color="success"
      > {statusCounts["Over Hours"]}</Chip></Checkbox>
        <Checkbox value="Inactive">Inactive <Chip
       size="sm"
        variant="faded"
        color="success"
      >{statusCounts.Inactive}</Chip></Checkbox>
  <Checkbox value="Sick">Sick<Chip
       size="sm"
        variant="faded"
        color="success"
        
        
      > {statusCounts.Sick}</Chip></Checkbox>
  <Checkbox value="Holiday">Holiday<Chip
       size="sm"
        variant="faded"
        color="success"
      > {statusCounts.Holiday}</Chip></Checkbox>
  <Checkbox value="Work Accident">Work Accident <Chip
       size="sm"
        variant="faded"
        color="success"
      >{statusCounts["Work Accident"]}</Chip></Checkbox>



</CheckboxGroup>


        </div>
        {isPopupOpen && (
        <GetDrivers driver={selectedDriver} updateDriverStatusInContext={updateDriverStatusInContext} closePopup={closePopup} theme={theme} />
      )}
        <div >
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
    <div className={`p-2 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`} style={{backgroundColor:theme === 'dark' ?"#141b27":"#ffffff"}}>
      {renderPipeline(firstRowStatuses)}
      {renderPipeline(secondRowStatuses)}
    </div>
    </div>
  );
};

export default Dkanban;
