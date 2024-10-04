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



function EquipmentDriver({theme, driver: propDriver, onDriverUpdate}) {
  const isDarkMode = theme === 'dark';
  const [driver, setDriver] = useState(propDriver);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [equipments, setEquipments] = useState({ clothing: [], other: [] });
  console.log("equipments1",equipments)
  useEffect(() => {
    fetchEquipments();
  }, [setEquipments]);
  const [openDialog, setOpenDialog] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);
 
  const toggleAccordion = () => {
    setIsAccordionOpen(prev => !prev); // Toggle accordion open/close
  };

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
  const { drivers, refreshDrivers } = useDrivers();
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
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/driverEquipments`, {
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
    fetchEquipments()
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

  const fetchEquipments = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/drivers/${driver._id}/equipment`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
  
      if (!response.ok) throw new Error('Failed to fetch equipments');
      const data = await response.json();
 
  
      const transformData = (data) => {
        const { clothing, other } = data;
  
        const calculateCost = (itemName, quantity) => {
          const matchedEquipment = allEquipments.find(equipment => equipment.name === itemName);
          return matchedEquipment ? matchedEquipment.costPerUnit * quantity : 0; // Default to 0 if no match
        };
  
        const transformedCarEquipment = clothing.map(equipment => ({
          ...equipment,
          type: "clothing",
          cost: calculateCost(equipment.item, equipment.quantity), // Calculate cost
        }));
  
        const transformedWorkEquipment = other.map(equipment => ({
          ...equipment,
          type: "other",
          cost: calculateCost(equipment.item, equipment.quantity), // Calculate cost
        }));
  
        // Combine both arrays into one
        return [...transformedCarEquipment, ...transformedWorkEquipment];
      };
  
      const transformedData = transformData(data);
      setEquipments(transformedData);
      setDisplayedData(transformedData.slice(0, 5));
      setHasMore(transformedData.length > 5);
    } catch (error) {
      console.error('Error fetching equipments:', error);
    }
  };
//   const costs = equipments.map(equipment => equipment.cost);

// console.log(costs)


  const addEquipment = async (e) => {
    e.preventDefault();
    if (!newEquipment.type || !newEquipment.item || !newEquipment.quantity || !newEquipment.date || !newEquipment.deliveredBy) {
      setErrorMessage("Please fill in all fields before submitting.");
      return; // Stop submission if any field is missing
    }
 
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/drivers/${driver._id}/equipment`, {
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

      const updatedDrivesList = await response.json();

      // Find the updated car by ID
      const updatedDriver = updatedDrivesList.driver; // Accessing the driver directly

  
  
      if (updatedDriver) {
       
        setDriver(updatedDriver);
        onDriverUpdate(updatedDriver);
      }
  
    } catch (error) {
      console.error('Error adding equipment:', error);
     
    }
  };



  const loadMoreData = () => {

    setLoading(true);
    fetchEquipments();
    setTimeout(() => {
      const newEquipments = [...equipments.clothing, ...equipments.other];
      setDisplayedData(newEquipments.slice(0, displayedData.length + 5)); // Load 5 more items
      setHasMore(newEquipments.length > displayedData.length + 5);
      setLoading(false);
    }, 1000);
  };
  console.log("equipments2",equipments)
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
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/drivers/${driver._id}/equipment/${equipmentToDelete._id}?type=${equipmentToDelete.type}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
  
      if (!response.ok) throw new Error('Failed to delete equipment');
      const updatedNoteequipmet = await response.json(); 
    
      setDriver(updatedNoteequipmet.driver);
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
  let driverCount = 0;  // Count of cars
  
  let maxDriver = null;
  let minDriver = null;
  let maxSumCost = -Infinity;
  let minSumCost = Infinity;
 
  drivers.forEach(driver => {
    const driverEquipments = [...driver.equipments.clothing, ...driver.equipments.other];

    // Calculate the sum of costs for this car
    const driverTotalCost = driverEquipments.reduce((sum, equipment) => sum + equipment.cost, 0);
    
    totalCostSum += driverTotalCost;
    driverCount++;
  
    // Track max car based on total sum cost
    if (driverTotalCost > maxSumCost) {
      maxSumCost = driverTotalCost;
      maxDriver = driver;
    }
  
    // Track min car, but exclude cars with a zero total cost
    if (driverTotalCost > 0 && driverTotalCost < minSumCost) {
      minSumCost = driverTotalCost;
      minDriver = driver;
    }
  });
  
  // Calculate the average of all cars' equipment costs
  const averageDriverCost = totalCostSum / driverCount;
  
 

  const driverEquipments = [...driver.equipments.clothing, ...driver.equipments.other];

  // Calculate total amount for this car's equipment
  const totalAmount = driverEquipments.reduce((sum, equipment) => sum + equipment.cost, 0);
  
  // Calculate average amount for this car's equipment
  const averageAmount = driverEquipments.length > 0 ? totalAmount / driverEquipments.length : 0;
  

  
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
  const chartData = getChartDataByMonthForEquipment([...driver.equipments.clothing, ...driver.equipments.other]);
  

  

  
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
                  <Option value="clothing">Clothing</Option>
                  <Option value="other">Other</Option>
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
      <p className="text-orange-700">Total Average: <span className="text-blue-500 font-bold">{averageDriverCost.toFixed(0)}</span> </p>
      <p className="text-orange-700">Highest invoice amount: <span className="text-blue-500 font-bold">{maxSumCost.toFixed(0)}</span></p>
      <p className="text-orange-700">Lowest invoice amount: <span className="text-blue-500 font-bold">{minSumCost.toFixed(0)}</span></p>
    </Card>
    <Card
      size="small"
      title={<span style={{ color: 'orange' }}>This driver: {driver.firstName}</span>}
     
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
      {/* <p className="text-orange-700">Average cost per invoice: <span className="text-blue-500 font-bold">{averageCosto.toFixed(0)}</span></p>
      <p className="text-orange-700">Sum costs: <span className="text-blue-500 font-bold">{totalCosto.toFixed(0)}</span></p> */}
  
    
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
              <TableCell>{equipment.type === 'clothing' ? 'Clothing' : 'Other'}</TableCell>
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

export default EquipmentDriver


