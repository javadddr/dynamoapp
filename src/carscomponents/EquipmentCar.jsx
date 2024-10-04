import React, { useState,useEffect } from "react";
import { Button } from '@nextui-org/react';
import { useCars, useDrivers } from '../CarDriver';
import { DownCircleOutlined } from '@ant-design/icons';
import { Input, Select, DatePicker } from 'antd';
import { Alert } from 'antd';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@nextui-org/react';
import { DeleteIcon } from './DeleteIcon';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import { Card, Col, Row,Space } from 'antd';
import Barforgeneral from  "./Barforgeneral"



function EquipmentCar({theme, car: propCar, onCarUpdate,equipment}) {
  const isDarkMode = theme === 'dark';
  const [car, setCar] = useState(propCar);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);

  const toggleAccordion = () => {
    setIsAccordionOpen(prev => !prev); // Toggle accordion open/close
  };
  useEffect(() => {
  
    fetchEquipments();
  }, []); // Dependency array ensures fetch is called when driver._id changes
  const { Option } = Select;
  const [showAlert, setShowAlert] = useState(false); 
  const [errorMessage, setErrorMessage] = useState('');
  useEffect(() => {
    if (errorMessage) {
      setShowAlert(true); // Show the alert
      const timer = setTimeout(() => {
        setShowAlert(false); // Hide the alert after 10 seconds
        setErrorMessage(''); // Clear the error message
      }, 4000);
  
      return () => clearTimeout(timer); // Cleanup timeout on unmount
    }
  }, [errorMessage]);
  const { cars, refreshCars } = useCars();
  const token = localStorage.getItem('userToken');
  const [newEquipment, setNewEquipment] = useState({
    type: '', // Default to an empty string to match no selection
    date: '',
    item: '',
    quantity: '',
    deliveredBy: ''
  });

  const [displayedData, setDisplayedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);


  const [allEquipments, setAllEquipments] = useState([]);
  useEffect(() => {
    const fetchAllEquipments = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/carEquipments`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch equipments');
        const data = await response.json();
        setAllEquipments(data);
      } catch (error) {
        console.error('Error fetching equipments:', error);
      }
    };
    
    fetchAllEquipments();
  }, []); // Run once on component mount
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEquipment({ ...newEquipment, [name]: value });
  };

  const [users, setUsers] = useState([]);
 
  useEffect(() => {
    fetchUsers();
  }, []); // Fetch users once component mounts
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  };
  const [equipments, setEquipments] = useState({ carEquipment: [], workEquipment: [] });

const fetchEquipments = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cars/${car._id}/equipment`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to fetch equipments');
    const transformData = (data) => {
      // Extract carEquipment and workEquipment
      const { carEquipment, workEquipment } = data;
    
      // Map over both arrays and add a 'type' field
      const transformedCarEquipment = carEquipment.map(equipment => ({
        ...equipment,
        type: "carEquipment"
      }));
    
      const transformedWorkEquipment = workEquipment.map(equipment => ({
        ...equipment,
        type: "workEquipment"
      }));
    
      // Combine both arrays into one
      const transformedData = [...transformedCarEquipment, ...transformedWorkEquipment];
    
      return transformedData;
    };
    const data = await response.json();
    const transformedData = transformData(data);
    setEquipments(transformedData);


    setDisplayedData(transformedData.slice(0, 5));

    setHasMore(transformedData.length > 5);
  } catch (error) {
    console.error('Error fetching equipments:', error);
  }
};

  const addEquipment = async (e) => {
    e.preventDefault();
    if (!newEquipment.type || !newEquipment.item || !newEquipment.quantity || !newEquipment.date || !newEquipment.deliveredBy) {
      setErrorMessage("Please fill in all fields before submitting.");
      return; // Stop submission if any field is missing
    }
 
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cars/${car._id}/equipment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: newEquipment.type,
          item: newEquipment.item,
          quantity: newEquipment.quantity,
          date: newEquipment.date,
          deliveredBy: newEquipment.deliveredBy,
        }),
        
    });
   
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add equipment');
    }
  
      
      fetchEquipments();
      // Reset the form fields
      setNewEquipment({
        date: '',
        item: '',
        quantity: '',
        deliveredBy: ''
      });
      setIsAccordionOpen(false)
      const updatedCarsList = await refreshCars(); // Assuming refreshCars now returns the updated cars list
  
      // Find the updated car by ID
      const updatedCar = updatedCarsList.find(c => c._id === car._id);
  
      if (updatedCar) {
       
        setCar(updatedCar);
        onCarUpdate(updatedCar);
      }
  
    } catch (error) {
      console.error('Error adding equipment:', error);
     
    }
  };



  const loadMoreData = () => {
    setLoading(true);
    setTimeout(() => {
      const newEquipments = [...equipments.carEquipment, ...equipments.workEquipment];
      setDisplayedData(newEquipments.slice(0, displayedData.length + 5)); // Load 5 more items
      setHasMore(newEquipments.length > displayedData.length + 5);
      setLoading(false);
    }, 1000);
  };

  // Initial loading of the first few items
  useEffect(() => {
    setDisplayedData(displayedData.slice(0, 5)); // Load first 5 items initially
  }, [equipments]);
  const promptDeleteInvoice = (equipment) => {

    setEquipmentToDelete(equipment); // Set the equipment to be deleted
    setOpenDialog(true);  // Open modal
  };
  const title="Equipments"

  const deleteEquipment = async () => {
    if (!equipmentToDelete) return;
   
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cars/${car._id}/equipment/${equipmentToDelete._id}?type=${equipmentToDelete.type}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
  
      if (!response.ok) throw new Error('Failed to delete equipment');
  
      setOpenDialog(false); // Close the dialog
      fetchEquipments(); // Refresh the equipments list
    } catch (error) {
      console.error('Error deleting equipment:', error);
     
    } finally {
      setOpenDialog(false); // Close the dialog
      setEquipmentToDelete(null); // Reset the equipmentToDelete state
    }
  };


  let totalCostSum = 0;  // Sum of all cars' equipment costs
  let carCount = 0;  // Count of cars
  
  let maxCar = null;
  let minCar = null;
  let maxSumCost = -Infinity;
  let minSumCost = Infinity;
  
  cars.forEach(car => {
    const carEquipments = [...car.equipment.carEquipment, ...car.equipment.workEquipment];
    
    // Calculate the sum of costs for this car
    const carTotalCost = carEquipments.reduce((sum, equipment) => sum + equipment.cost, 0);
    
    totalCostSum += carTotalCost;
    carCount++;
  
    // Track max car based on total sum cost
    if (carTotalCost > maxSumCost) {
      maxSumCost = carTotalCost;
      maxCar = car;
    }
  
    // Track min car, but exclude cars with a zero total cost
    if (carTotalCost > 0 && carTotalCost < minSumCost) {
      minSumCost = carTotalCost;
      minCar = car;
    }
  });
  
  // Calculate the average of all cars' equipment costs
  const averageCarCost = totalCostSum / carCount;
  
 

  const carEquipments = [...car.equipment.carEquipment, ...car.equipment.workEquipment];

  // Calculate total amount for this car's equipment
  const totalAmount = carEquipments.reduce((sum, equipment) => sum + equipment.cost, 0);
  
  // Calculate average amount for this car's equipment
  const averageAmount = carEquipments.length > 0 ? totalAmount / carEquipments.length : 0;
  

  
  const getChartDataByMonthForEquipment = (equipments) => {
    const monthlyData = {};
  
    equipments.forEach((equipment) => {
      const date = new Date(equipment.date);
      const monthNumber = date.getMonth(); // Get the month as a number (0-11)
      const month = date.toLocaleString('default', { month: 'long' });
  
      if (!monthlyData[monthNumber]) {
        monthlyData[monthNumber] = { month, amount: 0 };
      }
  
      monthlyData[monthNumber].amount += equipment.cost;
    });
  
    // Convert object to array and sort by monthNumber (key)
    const chartData = Object.keys(monthlyData)
      .map((key) => ({
        month: monthlyData[key].month,
        desktop: monthlyData[key].amount,
      }))
      .sort((a, b) => new Date(`1 ${a.month} 2000`) - new Date(`1 ${b.month} 2000`)); // Sort months based on their order
  
    return chartData;
  };
  
  // Example usage
  const chartData = getChartDataByMonthForEquipment([...car.equipment.carEquipment, ...car.equipment.workEquipment]);
  
  console.log(chartData);
  

  
  return (
    
    <div className={isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}>
        {showAlert && (
            <div className={`fixed top-4 right-4 z-50 w-72 transition-transform transform translate-x-0 animate-slide-in ${isAccordionOpen ? 'animate-slide-in-right max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <Alert
                message={errorMessage}
                type="error"
                showIcon
                closable
                onClose={() => {
                  setShowAlert(false);
                  setErrorMessage('');
                }}
              />
            </div>
          )}
       <Button onClick={toggleAccordion} size="sm" radius="sm" className={` ${isAccordionOpen ?"bg-cyan-900":"bg-cyan-600"} text-white flex items-center`}>
        <DownCircleOutlined className={`mr-0 transition-transform ${isAccordionOpen ? 'rotate-0' : 'rotate-180'}`} />
        {isAccordionOpen ? 'Assign New Equipment' : 'Assign New Equipment'}
      </Button>

      <div className={`w-full mt-1 mb-2 overflow-hidden transition-all duration-700 ease-in-out ${isAccordionOpen ? 'animate-slide-in-right max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>

        <div className="relative p-4 border border-gray-300 rounded-md space-y-4">
       
          <div className="flex flex-row space-x-1">

          <div className='w-5/6'>
        
            <div className="w-2/4">
              <div className="flex">
              <p className="text-gray-500">Equipment type:</p>
              <Select
                  name="type"
                  className="shadow-md ml-2 w-[190px]"
                  value={newEquipment.type || undefined} // Use undefined for an empty value
                  onChange={(value) => handleInputChange({ target: { name: 'type', value } })}
                  placeholder="Select equipment type" // Use placeholder prop
                  style={{
                    color: newEquipment.type ? 'black' : 'gray', // Ensures the selected value is black, otherwise gray
                  }}
                >
                  <Option value="carEquipment">Equipment for Vehicle</Option>
                  <Option value="workEquipment">Equipment for Work</Option>
                </Select>



              </div>
              </div>
            

              <DatePicker 
                name="date" 
                value={newEquipment.date}
                onChange={(newValue) => {
                  handleInputChange({ target: { name: 'date', value: newValue } });
                }}
                className=" shadow-md"
              />
           <Select
              name="item"
              className="shadow-md ml-2 w-[190px]"
              value={newEquipment.item || undefined} // Use undefined for an empty value
              onChange={(value) => handleInputChange({ target: { name: 'item', value } })}
              placeholder="Select item" // Placeholder for item
              style={{
                color: newEquipment.item ? 'black' : 'gray', // Ensures the selected value is black, otherwise gray
              }}
            >
              <Option value="" disabled>Select item</Option> {/* This acts as a placeholder inside the dropdown */}
              {allEquipments
                .filter(equipment => equipment.type && newEquipment.type && equipment.type.toLowerCase() === newEquipment.type.toLowerCase())
                .map((equipment, index) => (
                  <Option key={index} value={equipment.name}>{equipment.name}</Option>
                ))}
            </Select>

            <Input
                name="quantity"
                value={newEquipment.quantity}
                onChange={handleInputChange}
                placeholder="Quantity"
                type="number"
                className="text-sm w-[139px] h-[31px] border border-blue-300 rounded-sm px-3 py-2 m-2  text-gray-800 font-normal shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
              />


              <Select
                name="deliveredBy"
                className="shadow-md ml-2 w-[190px]"
                value={newEquipment.deliveredBy || undefined} // Use undefined for an empty value
                onChange={(value) => handleInputChange({ target: { name: 'deliveredBy', value } })}
                placeholder="Delivered by" // Placeholder text for deliveredBy
                style={{
                  color: newEquipment.deliveredBy ? 'black' : 'gray', // Ensures selected value is black, otherwise gray
                }}
              >
                <Option value="" disabled>Select delivered by</Option> {/* Acts as a placeholder inside the dropdown */}
                {users.map((user, index) => (
                  <Option key={index} value={user.username}>{user.username}</Option>
                ))}
              </Select>



            </div>
            <div className="w-1/6">
            <Button 
              size="sm" 
              radius="sm" 
              className="ml-3 bg-cyan-500 text-white"
              onClick={addEquipment} // Add this onClick handler
            >
              Assign Equipment
            </Button>

            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between mb-3">
      <Space direction="horizental" className="flex flex-col justify-start mb-2" size={16}>

      <Card
      size="small"
      title={<span style={{ color: 'orange' }}>All the vehicles</span>}
      bordered={!isDarkMode}
      hoverable={true}
      className="text-orange-700"
      style={{
        width: 300,
        backgroundColor: isDarkMode ? '#1f1f1f' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
      }}
    >
      <p className="text-orange-700">Total Average: <span className="text-blue-500 font-bold">{averageCarCost.toFixed(0)}</span> </p>
      <p className="text-orange-700">Highest invoice amount: <span className="text-blue-500 font-bold">{maxSumCost.toFixed(0)}</span></p>
      <p className="text-orange-700">Lowest invoice amount: <span className="text-blue-500 font-bold">{minSumCost.toFixed(0)}</span></p>
    </Card>
    <Card
      size="small"
      title={<span style={{ color: 'orange' }}>This vehicles: {car.general.internalName}</span>}
     
      hoverable={true}
      bordered={!isDarkMode}
      style={{
        width: 300,
        height:130,
        backgroundColor: isDarkMode ? '#1f1f1f' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
      }}
    >
      <p></p>
      <p className="text-orange-700">Average cost per invoice: <span className="text-blue-500 font-bold">{averageAmount.toFixed(0)}</span></p>
      <p className="text-orange-700">Sum costs: <span className="text-blue-500 font-bold">{totalAmount.toFixed(0)}</span></p>
  
    
    </Card>
    </Space>
    <Barforgeneral theme={theme} chartData={chartData} title={title}/>
  </div>

      <Table className={`${isDarkMode?"dark":"light"}`} aria-label="Equipments Table" bordered shadow={false}>
        <TableHeader>
          <TableColumn>Type</TableColumn>
          <TableColumn>Date</TableColumn>
          <TableColumn>Item</TableColumn>
          <TableColumn>Quantity</TableColumn>
          <TableColumn>Cost</TableColumn>
          <TableColumn>Delivered By</TableColumn>
          <TableColumn>Active</TableColumn>
        </TableHeader>
        <TableBody>
          {displayedData.map((equipment, index) => (
            <TableRow key={index}>
              <TableCell>{equipment.type === 'carEquipment' ? 'For Vehicle' : 'For Work'}</TableCell>
              <TableCell>{new Date(equipment.date).toLocaleDateString()}</TableCell>
              <TableCell>{equipment.item}</TableCell>
              <TableCell>{equipment.quantity}</TableCell>
              <TableCell>${equipment.cost}</TableCell>
              <TableCell>{equipment.deliveredBy}</TableCell>
              <TableCell>
              <DeleteIcon 
            
                style={{ cursor: 'pointer', width: '17px', height: '17px' ,color: 'red'}}
          
                onClick={() => promptDeleteInvoice(equipment)}
              />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-center p-2">
        {hasMore && (
          <Button onClick={loadMoreData} disabled={loading} auto>
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        )}
      </div>

      <Modal isOpen={openDialog} onClose={() => setOpenDialog(false)}>
  <ModalContent className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
    {(onClose) => (
      <>
        <ModalHeader className="flex flex-col gap-1">Confirm Deletion</ModalHeader>
        <ModalBody>
          <p>Are you sure you want to delete this equipment?</p>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={deleteEquipment} >
            Delete
          </Button>
        </ModalFooter>
      </>
    )}
  </ModalContent>
</Modal>



      </div>
  )
}

export default EquipmentCar
