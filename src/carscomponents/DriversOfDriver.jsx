import React, { useState, useEffect } from 'react';
import { useCars } from '../CarDriver';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Button } from "@nextui-org/react";
import Loading from '../Loading'; 
import { DeleteIcon } from "./DeleteIcon";
import "./DriversOfDriver.css";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import { Card, Col, Row,Space } from 'antd';

import { FieldTimeOutlined } from '@ant-design/icons';
function DriversOfDriver({ driver: propDriver, onDriverUpdate, onDeleted, theme, updateDriverStatusInContext, closePopup }) {
  const { cars } = useCars();
  const currentDate = new Date();
  const [driver, setDriver] = useState(propDriver); // New state to manage Driver data
  const [statusRecords, setStatusRecords] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [curentCars, setCurentCars] = useState([]);
  const [futureCars, setFutureCars] = useState([]);
  const [page, setPage] = useState(1); // Pagination starts from page 1
  const [rowsPerPage] = useState(5); // Fixed rows per page
  const [loading, setLoading] = useState(false);
  const [statusDurations, setStatusDurations] = useState({});
  console.log(statusDurations)
  useEffect(() => {
    const sortedStatusRecords = statusRecords.sort((a, b) => new Date(a.from) - new Date(b.from));
  
    // Calculate durations for each status
    const durations = sortedStatusRecords.reduce((acc, record, index) => {
      const nextRecord = sortedStatusRecords[index + 1];
      const from = new Date(record.from);
      const to = nextRecord ? new Date(nextRecord.from) : new Date();
      const duration = parseFloat(((to - from) / (1000 * 60 * 60 * 24)).toFixed(1));
      acc[record.status] = (acc[record.status] || 0) + duration;
      return acc;
    }, {});
  
    // Calculate total duration
    const totalDuration = sortedStatusRecords.length > 0
      ? parseFloat(((new Date() - new Date(sortedStatusRecords[0].from)) / (1000 * 60 * 60 * 24)).toFixed(1))
      : 0;
  
    // Calculate percentage of total for each status
    let durationsWithPercentage = Object.entries(durations).reduce((acc, [status, duration]) => {
      acc[status] = {
        duration: duration || 0, // ensure duration is a number, fallback to 0 if undefined
        percentage: totalDuration > 0 ? ((duration / totalDuration) * 100).toFixed(1) : 0
      };
      
      return acc;
    }, {});
  
    // Check if the sum of percentages exceeds 100%
    const totalPercentages = Object.values(durationsWithPercentage).reduce((total, { percentage }) => total + parseFloat(percentage), 0);
    if (totalPercentages > 100) {
      // Scale down each percentage proportionally
      durationsWithPercentage = Object.entries(durationsWithPercentage).reduce((acc, [status, data]) => {
        const scaledPercentage = (data.percentage / totalPercentages) * 100;
        acc[status] = {
          duration: data.duration,
          percentage: scaledPercentage.toFixed(1)
        };
        return acc;
      }, {});
    }
  
    setStatusDurations({ ...durationsWithPercentage, total: totalDuration });
  }, [statusRecords]);
  useEffect(() => {
    setLoading(true); // Set loading to true at the start of the effect
    
    const fetchStatusRecords = async () => {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/statusRecords/statusByDriver/${propDriver._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.ok) {
        const data = await response.json();
      
        setStatusRecords(data);
        // No setLoading(false) here because we still need to process the data
      } else {
        console.error("Failed to fetch status records");
        setLoading(false); // Stop loading if the fetch fails
      }
    };
  
    fetchStatusRecords();
  }, [propDriver._id]); // This effect runs on mount and whenever propDriver._id changes
  
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    setLoading(true); // Start loading

    // Process all assignments
    const allAssignments = cars.flatMap(car => car.drivers
      .filter(d => d.driverId.toString() === propDriver._id)
      .map(driverAssignment => ({
        internalName: car.general.internalName,
        carId: car._id,
        from: new Date(driverAssignment.from),
        till: driverAssignment.till ? new Date(driverAssignment.till) : 'Current',
        category: categorizeAssignment(driverAssignment.from, driverAssignment.till),
        carState: car.state,
        driverStatus: propDriver.status
      }))
    );

    // Filter into respective categories
    const filteredHistoryCars = allAssignments.filter(assignment => assignment.category === 'History Cars');
    const filteredCurrentCars = allAssignments.filter(assignment => assignment.category === 'Current Car');
    const filteredFutureCars = allAssignments.filter(assignment => assignment.category === 'Future Cars');

    // Set the states for current, future, and history cars
    setAssignments(filteredHistoryCars); // This will display the history cars by default in the table
    setCurentCars(filteredCurrentCars);  // Store the current cars
    setFutureCars(filteredFutureCars);   // Store the future cars

    setLoading(false); // End loading after data is processed

  }, [cars, propDriver]);
  function categorizeAssignment(from, till) {
    const fromDate = new Date(from);
    const tillDate = till ? new Date(till) : new Date();
    if (fromDate <= currentDate && (!till || tillDate >= currentDate)) {
      return 'Current Car';
    } else if (fromDate > currentDate) {
      return 'Future Cars';
    } else if (till && new Date(till) < currentDate) {
      return 'History Cars';
    }
  }

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = page * rowsPerPage;
  const paginatedAssignments = assignments.slice(startIndex, endIndex);

  if (loading) {
    return <Loading />;
  }

  const colorsforcarstate = {
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
  const [selectedDriverForDeletion, setSelectedDriverForDeletion] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);


  return (
    <div>
      <div className="flex justify-between mb-3">
        <div>
        <Space direction="horizental" className="flex flex-col justify-start mb-2" size={16}>
    
      <Card
        size="small"
        title={<span style={{ color: isDarkMode?'#fff':'black'  }}>Driver's Timeline</span>}
        bordered={!isDarkMode}
        hoverable={true}
        className={`${isDarkMode?'text-green-300':'text-neutral-600'}`}
        style={{
          width: 300,
          backgroundColor: isDarkMode ? '#1f1f1f' : '#fff',
          color: isDarkMode ? '#fff' : '#000',
        }}
      >
        <p className={`${isDarkMode?'text-green-300':'text-neutral-600'}`}>
  Total working days: <span className="text-amber-800 font-bold">
    {statusDurations.total || '0'} days
  </span>
</p>
<p className={`${isDarkMode?'text-green-300':'text-neutral-600'}`}>
  Total active days: <span className="text-amber-800 font-bold">
    {statusDurations.Active?.duration?.toFixed(1) || '0'} days
  </span>
</p>
<p className={`${isDarkMode?'text-green-300':'text-neutral-600'}`}>
  Total holidays: <span className="text-amber-800 font-bold">
    {statusDurations.Holiday?.duration?.toFixed(1) || '0'} days
  </span>
</p>
<p className={`${isDarkMode?'text-green-300':'text-neutral-600'}`}>
  Total inactive days: <span className="text-amber-800 font-bold">
    {statusDurations.Inactive?.duration?.toFixed(1) || '0'} days
  </span>
</p>
<p className={`${isDarkMode?'text-green-300':'text-neutral-600'}`}>
  Total sick days: <span className="text-amber-800 font-bold">
    {statusDurations.Sick?.duration?.toFixed(1) || '0'} days
  </span>
</p>
<p className={`${isDarkMode?'text-green-300':'text-neutral-600'}`}>
  Total Over-Hour days: <span className="text-amber-800 font-bold">
    {statusDurations["Over Hours"]?.duration?.toFixed(1) || '0'} days
  </span>
</p>
<p className={`${isDarkMode?'text-green-300':'text-neutral-600'}`}>
  Total Work-Accident days: <span className="text-amber-800 font-bold">
    {statusDurations["Work Accident"]?.duration?.toFixed(1) || '0'} days
  </span>
</p>


      </Card>
      
    </Space>
    </div>
    <div>
    <Space direction="horizental" className="flex flex-col justify-start mb-2" size={16}>
    
    <Card
      size="small"
      title={<span style={{ color: isDarkMode?'#fff':'black'  }}>Current vehicle</span>}
      bordered={!isDarkMode}
      hoverable={true}
      className={`${isDarkMode?'text-green-300':'text-neutral-600'}`}
      style={{
        width: 300,
        backgroundColor: isDarkMode ? '#1f1f1f' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
      }}
    >
      {curentCars.length === 0 ? (
  <p className={`${isDarkMode ? 'text-green-300' : 'text-neutral-600'}`}>No vehicle</p>
) : (
  curentCars.slice(0, 2).map((car, index) => (
    <p key={index} className={`${isDarkMode ? 'text-green-300' : 'text-neutral-600'} flex justify-between`}>
      {car.internalName} <FieldTimeOutlined /> Period: {new Date(car.from).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - {new Date(car.till).toLocaleDateString('en-GB', { day: '2-digit', month: 'long' })}
    </p>
  ))
)}

      
  



    </Card>
    <Card
      size="small"
      title={<span style={{ color: isDarkMode?'#fff':'black'  }}>Future vehicle</span>}
      bordered={!isDarkMode}
      hoverable={true}
      className={`${isDarkMode?'text-green-300':'text-neutral-600'}`}
      style={{
        width: 300,
        backgroundColor: isDarkMode ? '#1f1f1f' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
      }}
    >
   {futureCars.length === 0 ? (
  <p className={`${isDarkMode ? 'text-green-300' : 'text-neutral-600'}`}>No vehicle</p>
) : (
  futureCars.slice(0, 2).map((car, index) => (
    <p key={index} className={`${isDarkMode ? 'text-green-300' : 'text-neutral-600'} flex justify-between`}>
      {car.internalName} <FieldTimeOutlined /> Period: {new Date(car.from).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - {new Date(car.till).toLocaleDateString('en-GB', { day: '2-digit', month: 'long' })}
    </p>
  ))
)}




    </Card>
  </Space>
      </div>
      </div>
      <div className="maindriverwithstatus">
        <Table aria-label="Driver Assignments Table" className={`${isDarkMode ? "dark" : "light"} w-full`} >
          <TableHeader>
            <TableColumn>Assigned Time</TableColumn>
            <TableColumn>Car Name</TableColumn>
            <TableColumn>From</TableColumn>
            <TableColumn>Till</TableColumn>
            <TableColumn>Car State</TableColumn>
          </TableHeader>
          <TableBody items={paginatedAssignments}>
            {(assignment) => (
              <TableRow key={`${assignment.internalName}-${assignment.from.getTime()}-${assignment.till instanceof Date ? assignment.till.getTime() : 'current'}`}>
                <TableCell>{assignment.category}</TableCell>
                <TableCell>{assignment.internalName}</TableCell>
                <TableCell>{assignment.from.toLocaleDateString()}</TableCell>
                <TableCell>{assignment.till instanceof Date ? assignment.till.toLocaleDateString() : assignment.till}</TableCell>
                <TableCell>
                  <span 
                    style={{ 
                      backgroundColor: colorsforcarstate[assignment.carState]?.color || 'transparent',
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '0.3rem', 
                      color: '#fff'
                    }}>
                    {colorsforcarstate[assignment.carState]?.label || assignment.carState}
                  </span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex justify-center my-4">
          <Pagination
            page={page}
            total={Math.ceil(assignments.length / rowsPerPage)}
            onChange={(newPage) => {
              setPage(newPage); // Correctly update the page
            }}
            showControls
            isCompact
            showShadow
            color="danger"
            className={`${isDarkMode ? "dark" : "light"}`}
          />
        </div>
      </div>
      <Modal isOpen={openDialog} onClose={() => setOpenDialog(false)}>
  <ModalContent className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
    {(onClose) => (
      <>
        <ModalHeader className="flex flex-col gap-1">Confirm Deletion</ModalHeader>
        <ModalBody>
          <p>Are you sure you want to remove {driver.firstName}?</p>
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

export default DriversOfDriver;
