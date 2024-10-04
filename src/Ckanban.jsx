import React,{useState,useEffect} from 'react';
import { Avatar, AvatarGroup, Button, Badge, Chip,Tooltip ,CheckboxGroup, Checkbox} from '@nextui-org/react';
import "./Ckanban.css";
import { Card, CardBody } from "@nextui-org/react";
import {Input} from "@nextui-org/react";
import {SearchIcon} from "./assets/SearchIcon";
import { ArrowRightOutlined } from '@ant-design/icons';
import GetCars from './GetCars';
const Ckanban = ({ cars, theme, activeStatuses,drivers, updateCarStatusInContext,setActiveStatuses }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const desiredOrder = [
    "Active",
    "No Driver",
    "Repairing",
    "Inactive",
    "Transferring",
    "Incoming",
    "Outgoing"
  ];
  const [statusCounts, setStatusCounts] = useState({
    "No Driver": 0,
    "Repairing": 0,
    "Transferring": 0,
    "Active": 0,
    "Inactive": 0,
    "Incoming": 0,
    "Outgoing": 0,
  });

  useEffect(() => {
    const counts = {
      "No Driver": 0,
      "Repairing": 0,
      "Transferring": 0,
      "Active": 0,
      "Inactive": 0,
      "Incoming": 0,
      "Outgoing": 0,
    };

    cars.forEach((car) => {
      if (car.state && counts.hasOwnProperty(car.state)) {
        counts[car.state] += 1;
      }
    });

    setStatusCounts(counts);
  }, [cars]); // Re-run this effect whenever `cars` changes
  const orderedStatuses = [...activeStatuses].sort((a, b) => {
    return desiredOrder.indexOf(a) - desiredOrder.indexOf(b);
  });

  const firstRowStatuses = orderedStatuses.slice(0, 4);
  const secondRowStatuses = orderedStatuses.slice(4);


const getCurrentDrivers = (carDrivers) => {
  const currentDate = new Date();
  return carDrivers.filter(driver =>
    new Date(driver.from) <= currentDate && new Date(driver.till) >= currentDate
  );
};

  const statusStyles = {
    'Active': 'bg-green-100 text-green-900',
    'Inactive': 'bg-gray-300 text-slate-500',
    'Incoming': 'bg-blue-100 text-blue-800',
    'Outgoing': 'bg-yellow-100 text-yellow-800',
    'Transferring': 'bg-purple-100 text-purple-800',
    'Repairing': 'bg-red-100 text-red-800',
    'No Driver': 'bg-pink-100 text-pink-800',
  };

  const handleDragStart = (e, carId) => {
    const currentPipeline = e.target.closest('.pipeline-container')?.querySelector('.status-chip')?.innerText;
    e.dataTransfer.setData('carId', carId);
    e.dataTransfer.setData('pipeline', currentPipeline);
  };

  const handleDrop = async (e, newPipeline) => {
    e.preventDefault();
    const carId = e.dataTransfer.getData('carId');
    const oldPipeline = e.dataTransfer.getData('pipeline');

    updateCarStatusInContext(carId, newPipeline);
    await updateCarStatus(carId, newPipeline);
  };

  const updateCarStatus = async (carId, newStatus) => {
    const token = localStorage.getItem('userToken');
    try {
      let response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cars/${carId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ state: newStatus }),
      });
      if (!response.ok) {
        throw new Error('Failed to update car status');
      }

      response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/carStatusRecords/${carId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create status record');
      }

    } catch (error) {
      console.error('Error updating car status or creating status record:', error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('hovered-pipeline');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('hovered-pipeline');
  };
  const driverStatusColors = {
    'Active': '#4CAF50',
    'Inactive': '#9E9E9E',
    'Sick': '#2196F3',
    'Holiday': '#FF9800',
    'Over Hours': '#FFEB3B',
    'Work Accident': '#F44336',
  };
  
  useEffect(() => {
    fetchPreferences();
  }, []);
  
  const fetchPreferences = () => {
    const token = localStorage.getItem('userToken');
    fetch(`${import.meta.env.VITE_BACKEND_URL}/preferences`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => response.json())
      .then(fetchedStatuses => { 
        if (fetchedStatuses && fetchedStatuses.length > 0) {
          setActiveStatuses(fetchedStatuses);
        }
      })
      .catch(error => console.error('Error fetching preferences:', error));
  };
  const updatePreferences = (newStatuses) => {
   
    const token = localStorage.getItem('userToken');
    fetch(`${import.meta.env.VITE_BACKEND_URL}/preferences`, {
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
const [selectedCar, setSelectedCar] = useState(null);

const openPopup = (car) => {
  setSelectedCar(car);
  setIsPopupOpen(true);
};

const closePopup = () => {
  setIsPopupOpen(false);
};
  const renderPipeline = (statuses) => (
    <div className="flex flex-wrap justify-center gap-2 mb-3">
      {statuses.map((status) => (
        <div
          key={status}
          className={`pipeline-container flex-shrink-0 w-full md:w-64 ${activeStatuses.length<5?"h-[750px]":"h-[450px]"} h-[450px] min-w-[300px] overflow-hidden`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, status)}
        >
          <div className="flex flex-col h-full overflow-hidden">
            <Chip
              variant="dot"
              radius="sm"
              size="lg"
              className={` mb-1 text-sm border-1 font-semibold  ${statusStyles[status]}`}
            >
              {status}
            </Chip>
            <div className={`${theme === 'dark' ? 'bg-gray-600 border border-gray-700' : 'bg-gray-200'} rounded-lg shadow p-2 flex-1 overflow-auto scrollbar-hidden  ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-slate-200'}`}>
            {cars
              .filter((car) => car.state === status)
              .filter((car) => {
                const lowerSearchQuery = searchQuery.toLowerCase();
                return (
                  car.general?.internalName.toLowerCase().includes(lowerSearchQuery) ||
                  car.general?.licensePlate.toLowerCase().includes(lowerSearchQuery) ||
                  car.general?.location.toLowerCase().includes(lowerSearchQuery) ||
                  car.area?.toLowerCase().includes(lowerSearchQuery) ||  // Added area to the search criteria
                  car.drivers.some((driver) => {
                    const driverDetail = drivers.find(d => d._id === driver.driverId);
                    return (
                      driverDetail?.firstName.toLowerCase().includes(lowerSearchQuery) ||
                      driverDetail?.lastName.toLowerCase().includes(lowerSearchQuery)
                    );
                  })
                );
              })

                .map((car) => (
                  <Card
                    key={car._id}
                    radius="sm"
                    className={`mb-2 hover:cursor-pointer  z-10 shadow-2xl ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-200'} ${theme === 'dark' ? 'dark' : 'light'}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, car._id)}
                  >
                    <div>
                      <CardBody>
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <div className="font-semibold">{car.general?.internalName}</div>
                            <div className="text-sm">{car.general?.licensePlate}</div>
                            <div className="text-sm text-gray-500">
                              {car.general?.location || 'No Location'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {car.area || 'No Area'}
                            </div>
                          </div>
                          <AvatarGroup isBordered size="lg" max={2} className={`${theme === 'dark' ? 'dark' : 'light'}`}   renderCount={(count) => (
                        <p className="text-lg mb-5 text-foreground font-medium ms-2">+{count}</p>
                      )}>
                            {getCurrentDrivers(car.drivers)
                              .map((carDriver) => {
                                const driverDetail = drivers.find(d => d._id === carDriver.driverId);
                                const badgeColor = driverStatusColors[driverDetail?.status] || 'default';

                                return (
                                  <div key={driverDetail?._id} className="relative inline-block flex items-center justify-center text-center">
                               <Tooltip 
                                  content={
                                    <span>
                                      {driverDetail.firstName} <ArrowRightOutlined /> {driverDetail.status}
                                    </span>
                                  }
                                  delay={0}
                                  closeDelay={0}
                                  motionProps={{
                                    variants: {
                                      exit: {
                                        opacity: 0,
                                        left:-10,
                                        transition: {
                                          duration: 0.7,
                                          ease: "easeIn",
                                        }
                                      },
                                      enter: {
                                        opacity: 1,
                                        left:-10,
                                        transition: {
                                          duration: 0.15,
                                          ease: "easeOut",
                                        }
                                      },
                                    },
                                  }}
                                >
                                    <Avatar
                                  isBordered={false}
                                      radius="full"
                                      src={driverDetail?.picture ? `https://api.dynamofleet.com/uploads/${driverDetail.picture}` : undefined}
                                      alt={driverDetail?.name || 'No Picture'}
                                      className="w-14 h-14 text-large border-2 border-fuchsia-700 hover:cursor-pointer"
                                    >
       
                               
                                      {!driverDetail?.picture && 'No Pic'}
                                     
                                    </Avatar>
                                    </Tooltip>
                                    <Badge
                                      size="lg"
                                      content=""
                                      shape="circle"
                                      placement="bottom-right"
                                      className="absolute bottom-6 right-0 transform translate-x-1/2 translate-y-1/2"
                                      style={{ backgroundColor: badgeColor }}
                                    />

                                  </div>
                                );
                              })
                            }

                            {getCurrentDrivers(car.drivers).length === 0 && (
                              <div className="relative inline-block">
                                <Avatar
                                isDisabled
                                  radius="full"
                                  className="w-14 h-14 text-sm border-1 border-white"
                                  showFallback name='N/A'
                                >
                                  
                                </Avatar>
                              
                              </div>
                            )}
                          </AvatarGroup>




                        </div>
                        <Button 
                          size="sm" 
                          className='bg-green-100 w-[30%] text-black hover:bg-green-200 transition-colors duration-300 ease-in-out'
                          onClick={() => openPopup(car)}
                        >
                          More Info
                        </Button>
                      </CardBody>
                    </div>
             
                    
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
        <Checkbox value="No Driver">No Driver <Chip
         size="sm"
         variant="faded"
         color="success"
      > {statusCounts["No Driver"]}</Chip></Checkbox>
        <Checkbox value="Repairing">Repairing <Chip
       size="sm"
        variant="faded"
        color="success"
      >{statusCounts.Repairing}</Chip></Checkbox>
  <Checkbox value="Inactive">Inactive<Chip
       size="sm"
        variant="faded"
        color="success"
        
        
      > {statusCounts.Inactive}</Chip></Checkbox>
  <Checkbox value="Incoming">Incoming<Chip
       size="sm"
        variant="faded"
        color="success"
      > {statusCounts.Incoming}</Chip></Checkbox>
  <Checkbox value="Outgoing">Outgoing <Chip
       size="sm"
        variant="faded"
        color="success"
      >{statusCounts.Outgoing}</Chip></Checkbox>
  <Checkbox value="Transferring">Transferring<Chip
       size="sm"
        variant="faded"
        color="success"
      > {statusCounts.Transferring}</Chip></Checkbox>


</CheckboxGroup>


        </div>
        {isPopupOpen && (
        <GetCars car={selectedCar} updateCarStatusInContext={updateCarStatusInContext} closePopup={closePopup} theme={theme} />
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

export default Ckanban;
