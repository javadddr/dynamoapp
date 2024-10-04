import React, { useState,useRef, useMemo, useCallback,useEffect } from "react";
import { useCars, useDrivers } from '../CarDriver';
import { Button } from '@nextui-org/react';
import { DownCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import { Alert } from 'antd';

import Barforgeneral from  "./Barforgeneral"
import { Card, Col, Row,Space } from 'antd';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import { DeleteIcon } from "./DeleteIcon";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Pagination } from "@nextui-org/react";
import { Input, Select, DatePicker } from 'antd';
function InvoicesDriver({theme, driver: propDriver, onDriverUpdate}) {
 
  const isDarkMode = theme === 'dark';
  const { Option } = Select;
  const [driver, setDriver] = useState(propDriver); // New state to manage Driver data

  const { drivers, refreshDrivers } = useDrivers();
 
  const [openDialog, setOpenDialog] = useState(false);
  const [invoices, setInvoices] = useState(driver.invoices || []);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const title="Invoice"
  const toggleAccordion = () => {
    setIsAccordionOpen(prev => !prev); // Toggle accordion open/close
  };
  const [errorMessage, setErrorMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false); 

 
  
  let totalInvoiceSum = 0;
  let totalInvoiceCount = 0;
  
  let maxDriver = null;
  let minDriver = null;
  let maxAverage = -Infinity;
  let minAverage = Infinity;
  
  drivers.forEach(driver => {
    const invoices = driver.invoices;
    const driverInvoiceSum = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const driverInvoiceCount = invoices.length;
    
    totalInvoiceSum += driverInvoiceSum;
    totalInvoiceCount += driverInvoiceCount;
    
    const driverAverage = driverInvoiceSum / driverInvoiceCount;

    
    // Track max and min car
    if (driverAverage > maxAverage) {
      maxAverage = driverAverage;
      maxDriver = driver;
    }
  
    if (driverAverage < minAverage) {
      minAverage = driverAverage;
      minDriver = driver;
    }
  });
  
  const totalAverageInvoice = totalInvoiceSum / totalInvoiceCount;
  const invoicesi = driver.invoices;

  // Calculate total and average for this car's invoices
  const totalAmount = invoicesi.reduce((sum, invoice) => sum + invoice.amount, 0);
  const averageAmount = invoicesi.length > 0 ? totalAmount / invoicesi.length : 0;

// Auto-dismiss alert after 10 seconds
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
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewInvoice({ ...newInvoice, [name]: value });
  };
  const [newInvoice, setNewInvoice] = useState({
    invoiceNumber: '',
    invoiceType: 'Maintenance',
    for: '',
    date: '',
    amount: '',
    currency: 'USD',
  });
  console.log(newInvoice.date)
  const addInvoice = async () => {
    setIsAccordionOpen(false);
    if (!newInvoice.invoiceNumber || !newInvoice.invoiceType || !newInvoice.for || !newInvoice.date || !newInvoice.amount || !newInvoice.currency) {
      setErrorMessage("Please fill in all fields before submitting.");
      return; // Stop submission if any field is missing
    }
  
    const token = localStorage.getItem('userToken');

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/drivers/${driver._id}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          invoiceType: newInvoice.type,
          invoiceNumber: newInvoice.invoiceNumber,
          for: newInvoice.for,
          date: newInvoice.date,
          currency: newInvoice.currency,
          amount: newInvoice.amount,
          
        }),
      });
  
      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(`Failed to add invoice: ${errorMsg}`);
      }
  
      const updatedDrivero = await response.json();
      console.log(updatedDrivero)
      // Find the updated car by ID
      const updatedDriver = updatedDrivero.driver; // Accessing the driver directly

      console.log(updatedDriver)
      if (updatedDriver) {
        setInvoices(updatedDriver.invoices);
        setDriver(updatedDriver);
        onDriverUpdate(updatedDriver);
       
      }
  
      // Reset the invoice form if needed
      setNewInvoice({
        invoiceNumber: '',
        invoiceType: 'Maintenance',
        for: '',
        date: new Date().toISOString().split("T")[0],
        amount: '',
        currency: 'USD',
      });
      setIsAccordionOpen(false); // Close accordion on successful assignment
  
    } catch (error) {
      console.error(error);
    }
  };
  const getChartDataByMonth = (invoices) => {
    const monthlyData = {};
  
    invoices.forEach((invoice) => {
      const date = new Date(invoice.date);
      const monthNumber = date.getMonth(); // Get the month as a number (0-11)
      const month = date.toLocaleString('default', { month: 'long' });
  
      if (!monthlyData[monthNumber]) {
        monthlyData[monthNumber] = { month, amount: 0 };
      }
  
      monthlyData[monthNumber].amount += invoice.amount;
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
  const chartData = getChartDataByMonth(driver.invoices);

  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 3;

  const totalPages = Math.ceil(invoices.length / rowsPerPage);
  const paginatedInvoices = invoices.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const promptDeleteInvoice = (invoiceId) => {
    setInvoiceToDelete(invoiceId);
    setOpenDialog(true);  // Open modal

  };
  const confirmDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    const token = localStorage.getItem('userToken');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/drivers/${driver._id}/invoices/${invoiceToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) throw new Error('Failed to delete invoice');
      
      setInvoices(invoices.filter(invoice => invoice._id !== invoiceToDelete));
      if (response.ok) {
        const updatedDriversList = await response.json();
       
        const updatedDrivers = updatedDriversList.driver; 

      
        setOpenDialog(false);
        if (updatedDrivers) 
        setDriver(updatedDrivers); // Update the local state with the updated car
        onDriverUpdate(updatedDrivers);
 
      
      }
   
    } catch (error) {
      console.error(error);
      
    }finally {
      setOpenDialog(false);  // Close modal
    }
 
  };


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
        {isAccordionOpen ? 'Creat New Invoice' : 'Creat New Invoice'}
      </Button>

      <div className={`w-full mt-1 mb-2 overflow-hidden transition-all duration-700 ease-in-out ${isAccordionOpen ? 'animate-slide-in-right max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>

        <div className="relative p-4 border border-gray-300 rounded-md space-y-4">
       
          <div className="flex flex-row space-x-1">

          <div className='w-5/6'>
        
            <div className="w-2/4">
              <div className="flex">
              <p className="text-gray-500">Invoice type: </p>
              <Select name="invoiceType" className=" shadow-md ml-2" value={newInvoice.invoiceType} onChange={value => handleInputChange({ target: { name: 'invoiceType', value } })}>
                <Option value="Maintenance">Maintenance</Option>
                <Option value="Fuel">Fuel</Option>
                <Option value="Lease">Lease</Option>
                <Option value="Insurance">Insurance</Option>
                <Option value="Other">Other</Option>
              </Select>
              </div>
              </div>
              <Input
                name="invoiceNumber"
                value={newInvoice.invoiceNumber}
                onChange={handleInputChange}
                placeholder="Invoice Number"
                className="text-sm w-[139px] h-[31px] border border-blue-300 rounded-sm px-3 py-2 m-2 ml-0 text-gray-800 font-normal shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
              />

              <Input
                name="for"
                value={newInvoice.for}
                onChange={handleInputChange}
                placeholder="For"
                className="text-sm w-[139px] h-[31px] border border-blue-300 rounded-sm px-3 py-2 m-2 ml-0 text-gray-800 font-normal shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
              />

              <DatePicker 
                name="date" 
                value={newInvoice.date ? moment(newInvoice.date, 'YYYY-MM-DD') : null} 
                onChange={(date, dateString) => handleInputChange({ target: { name: 'date', value: dateString } })} 
                className=" shadow-md"
              />

            <Input
                name="amount"
                value={newInvoice.amount}
                onChange={handleInputChange}
                placeholder="Amount"
                type="number"
                className="text-sm w-[139px] h-[31px] border border-blue-300 rounded-sm px-3 py-2 m-2  text-gray-800 font-normal shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
              />


              <Select className=" shadow-md" name="currency" value={newInvoice.currency} onChange={value => handleInputChange({ target: { name: 'currency', value } })}>
                <Option value="USD">USD</Option>
                <Option value="EUR">EUR</Option>
                <Option value="GBP">GBP</Option>
                <Option value="AUD">AUD</Option>
                <Option value="CAD">CAD</Option>
                <Option value="CHF">CHF</Option>
                <Option value="JPY">JPY</Option>
                <Option value="NZD">NZD</Option>
                <Option value="CNH">CNH</Option>
                <Option value="HKD">HKD</Option>
              </Select>


            </div>
            <div className="w-1/6">
              <Button onClick={addInvoice} size="sm" radius="sm" className="ml-9 bg-cyan-500 text-white">
                Creat Invoice
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between mb-3">
      <Space direction="horizental" className="flex flex-col justify-start mb-2" size={16}>
   
    <Card
      size="small"
      title={<span style={{ color: 'orange' }}>All the drivers</span>}
      bordered={!isDarkMode}
      hoverable={true}
      className="text-orange-700"
      style={{
        width: 300,
        backgroundColor: isDarkMode ? '#1f1f1f' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
      }}
    >
      <p className="text-orange-700">Total Average: <span className="text-blue-500 font-bold">{totalAverageInvoice.toFixed(0)}</span> </p>
      <p className="text-orange-700">Highest invoice amount: <span className="text-blue-500 font-bold">{maxAverage.toFixed(0)}</span></p>
      <p className="text-orange-700">Lowest invoice amount: <span className="text-blue-500 font-bold">{minAverage.toFixed(0)}</span></p>
    </Card>
    <Card
      size="small"
      title={<span style={{ color: 'orange' }}>This Driver: {driver.firstName}</span>}
     
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
      <Table
        aria-label="Invoices table"
        css={{
          height: "auto",
          minWidth: "100%",
        }}
        className={`${theme === 'dark' ? 'dark' : 'light'} ${theme === 'dark' ? 'text-white' : 'black'}`}
      >
        <TableHeader>
          <TableColumn>Invoice Number</TableColumn>
          <TableColumn>Invoice Type</TableColumn>
          <TableColumn>What is it for?</TableColumn>
          <TableColumn>Invoice Date</TableColumn>
          <TableColumn>Invoice Amount</TableColumn>
          <TableColumn>Action</TableColumn>
        </TableHeader>
        <TableBody>
          {paginatedInvoices.map((invoice, index) => (
            <TableRow key={index}>
              <TableCell>{invoice.invoiceNumber}</TableCell>
              <TableCell>{invoice.invoiceType}</TableCell>
              <TableCell>{invoice.for}</TableCell>
              <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
              <TableCell>{`${invoice.amount} ${invoice.currency}`}</TableCell>
              <TableCell>
              <DeleteIcon 
            
                style={{ cursor: 'pointer', width: '17px', height: '17px' ,color: 'red'}}
          
                onClick={() => promptDeleteInvoice(invoice._id)} 
              />

              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
  <Pagination
    total={totalPages}
    initialPage={currentPage}
    onChange={(page) => handlePageChange(page)}
    size="sm"
  />
      </div>

<Modal isOpen={openDialog} onClose={() => setOpenDialog(false)}>
  <ModalContent className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
    {(onClose) => (
      <>
        <ModalHeader className="flex flex-col gap-1">Confirm Deletion</ModalHeader>
        <ModalBody>
          <p>Are you sure you want to delete this invoice?</p>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={confirmDeleteInvoice}>
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

export default InvoicesDriver

