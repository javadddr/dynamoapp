
import React, { useState,useRef, useMemo, useCallback,useEffect } from "react";
import { DatePicker, Select } from 'antd';
import 'antd/dist/reset.css'; // Import Ant Design styles
import { Button } from '@nextui-org/react';
import moment from 'moment';
import { useCars, useDrivers } from '../CarDriver';
import { DownCircleOutlined } from '@ant-design/icons';
import editIcon from './edit.svg'; // Path to your edit icon
import del from './del.svg'; // Path to your edit icon
import { DeleteIcon } from "./DeleteIcon";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Pagination } from "@nextui-org/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
const columns = [
  { name: "Current Drivers", uid: "name" },
  { name: "From", uid: "from" },
  { name: "Till", uid: "till" },
  { name: "Area", uid: "area" },
  { name: "Status", uid: "status" },
  { name: "Action", uid: "action" }
  
];
const columns2 = [
  { name: "Futur Drivers", uid: "name" },
  { name: "From", uid: "from" },
  { name: "Till", uid: "till" },
  { name: "Area", uid: "area" },
  { name: "Status", uid: "status" },
  { name: "Action", uid: "action" }
  
];
function DriversOfCar({ theme, car: propCar, onCarUpdate }) {
  const isDarkMode = theme === 'dark';
  const accordionRef = useRef(null);
  const [editFromDate, setEditFromDate] = useState(moment(new Date(), 'YYYY-MM-DD HH:mm:ss')); // Default to now or convert from string if necessary
  const [editTillDate, setEditTillDate] = useState(moment(new Date(), 'YYYY-MM-DD HH:mm:ss')); // Same here
  
  const [page, setPage] = useState(1);
  const rowsPerPage = 2;
  const [page2, setPage2] = useState(1);
  const rowsPerPage2 = 2;
  const [car, setCar] = useState(propCar);
  const [fromDate, setFromDate] = useState(new Date());
  const [tillDate, setTillDate] = useState(new Date());
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [currentDrivers, setCurrentDrivers] = useState([]);
  const { drivers } = useDrivers();
  const { cars, refreshCars } = useCars();
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const [historyDrivers, setHistoryDrivers] = useState([]);
  const [editingDriverId, setEditingDriverId] = useState(null);
  const [futureDrivers, setFutureDrivers] = useState([]);
  console.log("futureDrivers",futureDrivers)
  console.log("historyDrivers",historyDrivers)
  const [openDialog, setOpenDialog] = useState(false);
const [selectedDriverForDeletion, setSelectedDriverForDeletion] = useState(null);

  const toggleAccordion = () => {
    setIsAccordionOpen(prev => !prev); // Toggle accordion open/close
  };


  
  function formatDate(date) {
    const options = { month: 'long' };
    const month = new Intl.DateTimeFormat('en-US', options).format(date);
    const day = date.getDate();
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
  
    // Determine the date suffix correctly
    const suffix = ((day) => {
      const j = day % 10,
            k = day % 100;
      if (j === 1 && k !== 11) {
        return "st";
      }
      if (j === 2 && k !== 12) {
        return "nd";
      }
      if (j === 3 && k !== 13) {
        return "rd";
      }
      return "th";
    })(day);
  
    return `${day}${suffix} of ${month}, ${hour}:${minute}`;
  }
  const handleFromDateChange = (date) => setFromDate(date ? date.toDate() : null);
  const handleTillDateChange = (date) => setTillDate(date ? date.toDate() : null);

  const handleAssignDriver = async () => {
    if (!fromDate || !tillDate || !selectedDriverId) {
      console.error("Missing required information.");
      return;
    }
    const token = localStorage.getItem('userToken');
    const fromISO = fromDate.toISOString();
    const tillISO = tillDate.toISOString();

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cars/${car._id}/driver`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ driverId: selectedDriverId, from: fromISO, till: tillISO }),
    });

    if (response.ok) {
      const updatedCarsList = await refreshCars();
      const updatedCar = updatedCarsList.find((c) => c._id === car._id);
      if (updatedCar) 
      setCar(updatedCar); // Update the local state with the updated car
      onCarUpdate(updatedCar);
      setFromDate(null);
      setTillDate(null);
      setSelectedDriverId(null);
      setIsAccordionOpen(false); // Close accordion on successful assignment
    
    }
    setFromDate(null);
    setTillDate(null);
    setSelectedDriverId(null);
  };

  useEffect(() => {
    const assignments = cars.flatMap(car =>
      car.drivers.map(driver => ({
        driverId: driver.driverId, from: new Date(driver.from), till: new Date(driver.till)
      }))
    );

    const isDriverAvailable = (driverId) => {
      return !assignments.some(assignment => {
        const assignmentStart = new Date(assignment.from);
        const assignmentEnd = new Date(assignment.till);
        return (
          driverId === assignment.driverId &&
          ((assignmentStart <= fromDate && assignmentEnd >= fromDate) ||
          (assignmentStart <= tillDate && assignmentEnd >= tillDate) ||
          (assignmentStart >= fromDate && assignmentEnd <= tillDate))
        );
      });
    };

    const filteredDrivers = drivers.filter(driver => isDriverAvailable(driver._id));
    setAvailableDrivers(filteredDrivers);
  }, [drivers, cars, fromDate, tillDate]);


  useEffect(() => {
    const now = new Date();
    const current = [];
    const history = [];
  
    car.drivers.forEach(driverAssignment => {
    
      const from = new Date(driverAssignment.from);
      const till = new Date(driverAssignment.till);
      const driverDetails = drivers.find(driver => driver._id === driverAssignment.driverId);
      
      if (driverDetails) {
        const pastAreas = driverDetails?.driverArea?.filter(area => {
          const areaTo = new Date(area.to);
          return areaTo < now; // Checking if the area's 'to' date is in the past
        }).map(area => area.area).join(", ") || "No area assigned"; // Joining areas or providing a fallback
    
        const driverInfo = {
          ...driverAssignment,
          name: `${driverDetails.firstName} ${driverDetails.lastName}`,
          status: driverDetails.status, 
          area: pastAreas, 
          picture: driverDetails.picture,
        };

      if (from <= now && till >= now) {
        current.push(driverInfo);
      } else if (till < now) {
        history.push(driverInfo);
      }
    }
  });
  console.log("current",current)
    setCurrentDrivers(current);
    setHistoryDrivers(history.map(driver => ({
      ...driver,
      from: formatDate(new Date(driver.from)),
      till: driver.till ? formatDate(new Date(driver.till)) : 'Present',
      status: drivers.find(d => d._id === driver.driverId)?.status || 'Unknown',
      area: driver.area, // Ensure to include the area here
    })));
  }, [car, drivers]);
  useEffect(() => {
    const now = new Date();
    const future = car.drivers
    .filter(driverAssignment => {
      const from = new Date(driverAssignment.from);
      return from > now;
    }).map(assignment => {
      const driverDetails = drivers.find(driver => driver._id === assignment.driverId);
  
     
      if (!driverDetails) return null;
      // Assuming driverDetails.driverArea is the correct path and it exists
      const futureAreas = driverDetails?.driverArea?.filter(area => {
        const areaFrom = new Date(area.from);
        const areaTo = new Date(area.to);
        return areaFrom <= now && areaTo >= now;
      }).map(area => area.area) || ["No area assigned yet"]; // Default message if no areas
  
      const areasString = futureAreas.length > 0 ? futureAreas.join(', ') : "No area assigned yet";
    
  
      return {
        ...assignment,
        name: `${driverDetails.firstName} ${driverDetails.lastName}`,
        status: driverDetails?.status || 'Status unknown',
        area: areasString,
        picture: driverDetails.picture,
      };
    }).filter(driver => driver !== null)
    .sort((a, b) => new Date(a.from) - new Date(b.from));
  
    setFutureDrivers(future);
  }, [car, drivers]);

  // Pagination state
  
  // Get current page items
// For currentDrivers table pagination
const items = useMemo(() => {
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  return currentDrivers.slice(start, end);
}, [page, currentDrivers]);

// For futureDrivers table pagination
const items2 = useMemo(() => {
  const start = (page2 - 1) * rowsPerPage2;
  const end = start + rowsPerPage2;
  return futureDrivers.slice(start, end);
}, [page2, futureDrivers]);


  
  useEffect(() => {
    function handleClickOutside(event) {
      if (isAccordionOpen && accordionRef.current && !accordionRef.current.contains(event.target)) {
        setIsAccordionOpen(false); // Close the accordion if clicked outside
      }
    }
  
    // Add event listener when accordion is open
    if (isAccordionOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
  
    // Cleanup the event listener when component unmounts or accordion closes
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAccordionOpen]);
  const handleDeleteClick = (driver) => {
    setSelectedDriverForDeletion(driver);
    setOpenDialog(true);  // Open modal
  };
  
  const handleDeleteDriver = async () => {
    if (!selectedDriverForDeletion || !selectedDriverForDeletion._id) return;
    const token = localStorage.getItem('userToken');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cars/${car._id}/drivers/assignment/${selectedDriverForDeletion._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete driver assignment');
  
      // Refresh the car data to reflect changes
      const updatedCarsList = await refreshCars();
      const updatedCar = updatedCarsList.find(c => c._id === car._id);
      if (updatedCar) {
        setCar(updatedCar);
        onCarUpdate(updatedCar);
      }
    } catch (error) {
      console.error('Deletion failed:', error);
    } finally {
      setOpenDialog(false);  // Close modal
    }
  };
  useEffect(() => {
    setPage(1); // Ensure pagination starts at page 1
  }, []);
  // Function to render cells based on the column key
  const renderCell = useCallback((driver, columnKey) => {
    const formatDate = (date) => {
      const options = { day: 'numeric', month: 'short', year: 'numeric' };
      return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
    };
  
    console.log("renderCell",driver)
  
    switch (columnKey) {
      case "name":
        return (
          <User
            avatarProps={{ radius: "lg", src: `https://api.dynamofleet.com/uploads/${driver.picture}` }}
            name={driver.name}
          />
        );
      case "from":
        return formatDate(driver.from);
      case "till":
        return formatDate(driver.till);
      case "action": // Render the edit icon
        return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
          <DeleteIcon
            style={{ cursor: 'pointer', width: '17px', height: '17px' ,color: 'red'}}
            onClick={() => handleDeleteClick(driver)}
          />
        </div>
        
        );
      default:
        return driver[columnKey];
    }
  }, [editingDriverId, editFromDate, editTillDate]);
  
    const renderCell2 = useCallback((driver, columnKey) => {
    const formatDate = (date) => {
      const options = { day: 'numeric', month: 'short', year: 'numeric' };
      return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
    };
  
   console.log("renderCell2",driver)
  
    switch (columnKey) {
      case "name":
        return (
          <User
            avatarProps={{ radius: "lg", src: `https://api.dynamofleet.com/uploads/${driver.picture}` }}
            name={driver.name}
          />
        );
      case "from":
        return formatDate(driver.from);
      case "till":
        return formatDate(driver.till);
      case "action": // Render the edit icon
        return (
          <div style={{ display: 'flex', gap: '10px' }}>
         
         
          <DeleteIcon
            style={{ cursor: 'pointer', width: '20px', height: '20px' }}
            onClick={() => handleDeleteClick(driver)}
          />
     

          </div>
        );
      default:
        return driver[columnKey];
    }
  }, [editingDriverId, editFromDate, editTillDate]);
  

  return (
    <div className={isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}>
       <Button onClick={toggleAccordion} size="sm" radius="sm" className={` ${isAccordionOpen ?"bg-cyan-900":"bg-cyan-600"} text-white flex items-center`}>
        <DownCircleOutlined className={`mr-0 transition-transform ${isAccordionOpen ? 'rotate-0' : 'rotate-180'}`} />
        {isAccordionOpen ? 'Assign New Driver' : 'Assign New Driver'}
      </Button>

      <div className={`w-full mt-1 mb-2 overflow-hidden transition-all duration-700 ease-in-out ${isAccordionOpen ? 'animate-slide-in-right max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="relative p-4 border border-gray-300 rounded-md space-y-4">
       
          <div className="flex flex-row space-x-1">
            <div className="w-1/4">
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="From"
                onChange={handleFromDateChange}
                className="w-full"
              />
            </div>
            <div className="w-1/4">
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="To"
                onChange={handleTillDateChange}
                className="w-full"
              />
            </div>
            <div className="w-1/4">
              <Select
                style={{ width: '100%' }}
                value={selectedDriverId || undefined}
                onChange={setSelectedDriverId}
                placeholder="Select a driver"
                allowClear
              >
                {availableDrivers.map(driver => (
                  <Select.Option key={driver._id} value={driver._id}>
                    {driver.firstName} {driver.lastName}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div className="w-1/4">
              <Button onClick={handleAssignDriver} size="sm" radius="sm" className="ml-20 bg-cyan-500 text-white">
                Assign driver
              </Button>
            </div>
          </div>
        </div>
      </div>
     
      <Table
        aria-label="Current Drivers Table"
        className={`${theme === 'dark' ? 'dark' : 'light'} ${theme === 'dark' ? 'text-white' : 'black'}`}
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={Math.ceil(currentDrivers.length / rowsPerPage)}
              onChange={(page) => setPage(page)}
            />
          </div>
        }
      >
        <TableHeader columns={columns}>
          {(column) => <TableColumn key={column.uid}>{column.name}</TableColumn>}
        </TableHeader>
        <TableBody items={items}>
          {(driver) => (
            <TableRow key={driver._id}>
              {(columnKey) => <TableCell>{renderCell(driver, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Table
        aria-label="Current Drivers Table"
        className={`${theme === 'dark' ? 'dark' : 'light'} mt-10 ${theme === 'dark' ? 'text-white' : 'black'}`}
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page2}
              total={Math.ceil(futureDrivers.length / rowsPerPage2)}
              onChange={(page2) => setPage2(page2)}
            />
          </div>
        }
      >
        <TableHeader columns={columns2}>
          {(column) => <TableColumn key={column.uid}>{column.name}</TableColumn>}
        </TableHeader>
        <TableBody items={items2}>
          {(driver) => (
            <TableRow key={driver._id}>
              {(columnKey) => <TableCell>{renderCell2(driver, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal isOpen={openDialog} onClose={() => setOpenDialog(false)}>
  <ModalContent className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
    {(onClose) => (
      <>
        <ModalHeader className="flex flex-col gap-1">Confirm Deletion</ModalHeader>
        <ModalBody>
          <p>Are you sure you want to delete {selectedDriverForDeletion?.name}?</p>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleDeleteDriver}>
            Delete
          </Button>
        </ModalFooter>
      </>
    )}
  </ModalContent>
</Modal>

    </div>
  );
}

export default DriversOfCar;
