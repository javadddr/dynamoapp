import React, { useState, useEffect,useRef ,useCallback} from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination } from "@nextui-org/react";
import { styled } from '@mui/material/styles';
import { useCars, useDrivers } from './CarDriver';
import { Tooltip } from 'antd';
import {EditIcon} from "./carscomponents/EditIcon";
import { Card, CardBody, Button } from '@nextui-org/react';
import { Input } from 'antd'
import Stack from '@mui/material/Stack';
import Loading from './Loading'; // Adjust the path as necessary
import "./Equipments.css";
import plusi from "./plusi.svg"
import { unparse } from 'papaparse';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { DeleteIcon } from "./carscomponents/DeleteIcon";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";

import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

import { Snackbar, Alert } from '@mui/material';
const FileUploadContainer = styled('div')(({ theme, isDragActive }) => ({
  border: '2px dashed #eeeeee',
  background: isDragActive ? '#e3f2fd' : 'none', // Change background color when dragging
  padding: theme.spacing(2),
  width: 575,
  textAlign: 'center',
  marginBottom: theme.spacing(2),
  cursor: 'pointer',
  transition: 'background-color 0.2s ease-in-out',
}));

const fineTypes = [
  { category: 'For Vehicle', label: 'Equipment for Vehicle', value: 'carEquipment' },
  { category: 'For Vehicle', label: 'Equipment for Working', value: 'workEquipment' },
  { category: 'For Driver', label: 'Clothing', value: 'Clothing' },
  { category: 'For Driver', label: 'Other', value: 'Other' },
];

const currencies = [
  { label: 'USD', symbol: '$' },
  { label: 'GBP', symbol: '£' },
  { label: 'JPY', symbol: '¥' },
  { label: 'EUR', symbol: '€' },
  { label: 'BRL', symbol: 'R$' },
  { label: 'MXN', symbol: '$' },
  { label: 'AUD', symbol: 'A$' },
  { label: 'CAD', symbol: 'C$' },
  { label: 'NZD', symbol: 'NZ$' },
  { label: 'ARS', symbol: '$' },
  { label: 'CHF', symbol: 'CHF' },
  { label: 'THB', symbol: '฿' },
  { label: 'HKD', symbol: 'HK$' },
  { label: 'TRY', symbol: '₺' },
];


const fineForOptions = [
  { label: 'Car', value: 'car' },
  { label: 'Driver', value: 'driver' },
];

const Equipments = ({theme}) => {
  const [allEq, setAllEq] = useState([]); // Step 1: Define allEq state
  console.log("fines",allEq)
  const [driverEq, setDriverEq] = useState([]);
  const [carEq, setCarEq] = useState([]);
  let isDarkMode; 

  if (theme === 'dark') {
    isDarkMode = true; // Set to true if theme is 'dark'
  } else {
    isDarkMode = false; // Set to false otherwise
  }
  const [form, setForm] = useState({
    itemId: '',
    type: '', //'Clothing', 'Other','carEquipment', 'workEquipment'
    name: '',
    description: '',
    costPerUnit: '',
    vendor: '',
    buyingUrl: '',
  });
  
  const [currentPage, setCurrentPage] = useState(1); // Current page state
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [accordionExpanded, setAccordionExpanded] = useState(false); // Start expanded
  const [openDialog, setOpenDialog] = useState(false);
 
  const [currency, setCurrency] = useState(currencies[0]); // Default to USD
  const finesPerPage = 5; // Fines per page

  // Calculate the range of fines to display
  const startIndex = (currentPage - 1) * finesPerPage;
  const selectedFines = allEq.slice(startIndex, startIndex + finesPerPage);

  // Total number of pages
  const totalPages = Math.ceil(allEq.length / finesPerPage);


  useEffect(() => {
    setLoading(true); 
    const fetchData = async () => {
      await fetchDriverEq();
      await fetchCarEq();
    };
    fetchData().finally(() => setLoading(false));
  }, []);
  const [selectedEquipment, setSelectedEquipment] = useState({ id: null, type: null });

  // Step 2: Combine driverEq and carEq whenever they change
  useEffect(() => {
    setAllEq([...driverEq, ...carEq]);
  }, [driverEq, carEq]);
  const handleDeleteClick = (id, type) => {
    setSelectedEquipment({ id, type }); // Store id and type of the selected equipment
   
    setOpenDialog(true); // Open the confirmation dialog
  };
  
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
   
  };
  // Function to delete the selected equipment based on its type
const deleteEquipment = async (id, type) => {

  const token = localStorage.getItem('userToken');
  const endpoint = type === 'carEquipment' || type === 'workEquipment' 
    ? `${import.meta.env.VITE_BACKEND_URL}/carEquipments/${id}` 
    : `${import.meta.env.VITE_BACKEND_URL}/driverEquipments/${id}`;

  try {
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error('Failed to delete equipment');
    }

    // Refetch equipment lists to update UI
    fetchDriverEq();
    fetchCarEq();
    setOpenDialog(false); // Close the dialog
    setSnackbarInfo({ open: true, message: 'Equipment deleted successfully.', severity: 'success' });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    setSnackbarInfo({ open: true, message: 'Error deleting equipment.', severity: 'error' });
  }
};
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  // Adjust the snackbarInfo state to manage the snackbar's open state, message, and severity
  const [snackbarInfo, setSnackbarInfo] = useState({ open: false, message: '', severity: '' });



  const handleFileRemove = (event) => {
    event.preventDefault(); // Prevent default behavior
    event.stopPropagation(); // Stop the event from bubbling up
    setForm({ ...form, file: null });
  };
 
  useEffect(() => {
    setLoading(true); 
    fetchDriverEq();
    fetchCarEq();
    
  }, []);

  const fetchDriverEq = async () => {
    const token = localStorage.getItem('userToken');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/driverEquipments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch fines');
      }
      const data = await response.json();
      setDriverEq(data);
      setLoading(false); 
    } catch (error) {
      console.error('Error fetching fines:', error);
    }
  };
  const fetchCarEq = async () => {
    const token = localStorage.getItem('userToken');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/carEquipments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch fines');
      }
      const data = await response.json();
      setCarEq(data);
      setLoading(false); 
    } catch (error) {
      console.error('Error fetching fines:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // For numeric fields, parse the value. Otherwise, store the string value.
    const newValue = type === 'number' ? Number(value) : value;
    setForm({ ...form, [name]: newValue });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, file: e.target.files[0] });
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const token = localStorage.getItem('userToken');
  
    // Instead of using FormData, directly use the form object for JSON.stringify
    const data = JSON.stringify(form);

    let endpoint;
    if (['carEquipment', 'workEquipment'].includes(form.type)) {
        endpoint = `${import.meta.env.VITE_BACKEND_URL}/carEquipments`;
    } else if (['Clothing', 'Other'].includes(form.type)) {
        endpoint = `${import.meta.env.VITE_BACKEND_URL}/driverEquipments`;
    }

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json', // Specify JSON content type
            },
            body: data,
        });

        if (!response.ok) {
            throw new Error('Failed to submit form');
        }
        setAccordionExpanded(false); 
        setSnackbarInfo({ open: true, message: 'Equipment submitted successfully.', severity: 'success' });
        fetchDriverEq();
        fetchCarEq();
        setForm({
          itemId: '',
          type: '', //'Clothing', 'Other','carEquipment', 'workEquipment'
          name: '',
          description: '',
          costPerUnit: '',
          vendor: '',
          buyingUrl: '',
        });
        setIsFormVisible(!isFormVisible)
    } catch (error) {
        console.error('Error submitting form:', error);
        // Handle error, possibly updating UI to notify user of failure
    } finally {
        setLoading(false);
    }
};

  




  // Function to close the snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarInfo(prev => ({ ...prev, open: false }));
  };

  const GroupHeader = styled('div')(({ theme }) => ({
    display: 'flex', // Set display to flex
    justifyContent: 'flex-start', // Align content to the start
    alignItems: 'center', // Center-align items vertically
    textAlign: 'center', // Center-align text
    backgroundColor: theme.palette.mode === 'light' ? '#f0f8ff' : '#0f4c75', // Very light blue background
    color: theme.palette.mode === 'light' ? '#007bff' : '#bbdefb', // Blue text color
    fontWeight: theme.typography.fontWeightMedium,
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    width: '250px', // Ensure it takes the full width available
  }));
  
  const styles = {
    table: {
        width: '100%',
        borderCollapse: 'separate',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        fontSize: "14px",
      
        borderSpacing: '0',
    },
  
};
  
  const GroupItems = styled('ul')(({ theme }) => ({
    padding: 0,
    '& li': {
      paddingLeft: theme.spacing(2),
    },
  }));
  
  const exportToCSV = () => {
    const csvData = allEq.map(eq => ({
        Type: eq.type,
        Description: eq.description,
        Name: eq.name,
        CostPerUnit: eq.costPerUnit + ' ' + currency.symbol, // Include the currency symbol
        Vendor: eq.vendor,
        BuyingUrl: eq.buyingUrl,
    }));
    // Use unparse to convert JSON to CSV
    const csv = unparse(csvData, { header: true });
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "equipment_data.csv");
};

  // Function to convert your data to Excel and trigger the download
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(allEq.map(eq => ({
      Type: eq.type,
      Description: eq.description,
      Name: eq.name,
      CostPerUnit: eq.costPerUnit,
      Vendor: eq.vendor,
      BuyingUrl: eq.buyingUrl,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Equipment Data");
    XLSX.writeFile(wb, "equipment_data.xlsx");
  };

    if (loading) {
      return <Loading />; // Show loading component while data is being fetched
    }
    const userRoles = localStorage.getItem('userRoles');  
  return (
    <div className={`pl-3 pr-3  h-screen ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
       <div className={`flex justify-items-end justify-end  ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
   
       <div className={userRoles === 'user' ? "hidddenforuserdfj" : "containerPPOLmm"}>
      <Button className="mt-3 mb-3 mr-4 w-[180px] shadow-xl "  color="primary" variant="shadow" radius="sm" size="md" onClick={() => setIsFormVisible(!isFormVisible)}>
      <img src={plusi} alt="Add" style={{width:'14%' }} />
      Add New Equipment
    </Button>
    </div>
      </div>

      
      
      {isFormVisible && (
    <Dialog open={isFormVisible} onClose={handleCloseDialog} className=' p-0 m-0' >
    <DialogTitle className={` ${isDarkMode ? 'bg-gray-200 text-black' : 'bg-white text-blue-600 text-md'}`}>Add New Equipment</DialogTitle>
    <DialogContent className={`${isDarkMode ? 'bg-gray-200 text-black' : 'bg-white text-black'}`}>  
<form onSubmit={handleSubmit} className={`h-[450px] p-0 m-0 w-[400px] ${isDarkMode ? 'bg-gray-200 text-black' : 'bg-white text-black'}`}>

<div className="isufinvvb mb-1">
        <div className={`text-sm text-black `}>Item ID:</div>
 <Input
  className='border-slate-300 text-sm p-3 m-0'
  name="itemId"
  type="number"
  placeholder="Item ID"
  value={form.itemId}
  onChange={handleChange}
  required
  
  style={{ width: '220px', height: '35px',borderRadius:'5px' }} // Set custom width and height
/>

</div>

<div className="isufinvvb mb-1 ">
        <div className={`text-sm text-black`}>Equipment type:</div>

  <select
    id="type-combo-box"
    value={form.type}
    onChange={(e) => {
      setForm({ ...form, type: e.target.value });
    }}
    required
    style={{ width: '220px', height: '35px',borderRadius:'5px' }}
    className='border-slate-300 text-sm'
  >
    {fineTypes.map((option) => (
      <optgroup key={option.category} label={option.category}>
        <option value={option.value}>{option.label}</option>
      </optgroup>
    ))}
  </select>
</div>

<div className="isufinvvb mb-1 ">
        <div className={`text-sm text-black`}>Name:</div>
  <input
    id="name"
    name="name"
    type="text"
    placeholder="Name"
    value={form.name}
    onChange={handleChange}
    required
    style={{ width: '220px', height: '35px',borderRadius:'5px' }}
    className='border-slate-300 text-sm'
  />
</div>


<div className="isufinvvb mb-1 ">
        <div className={`text-sm text-black`}>Description:</div>
  <input
    id="description"
    name="description"
    type="text"
    placeholder="Description"
    value={form.description}
    onChange={handleChange}
    style={{ width: '220px', height: '35px',borderRadius:'5px' }}
    className='border-slate-300 text-sm'
  />
</div>


<div className="isufinvvb mb-1 ">
        <div className={`text-sm text-black`}>Cost per unit:</div>
    
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span>{currency.symbol}</span>
      <input
        type="number"
        id="costPerUnit"
        name="costPerUnit"
        value={form.costPerUnit}
        onChange={handleChange}
        required
        style={{ width: '150px', height: '35px',borderRadius:'5px' }}
        className='border-slate-300 text-sm'
      />
 
 
  <div style={{ margin: '0 8px', width: 'auto' }}>
  
    <select
      id="currencySelect"
      value={currency.label}
      onChange={(e) => setCurrency(currencies.find(c => c.label === e.target.value))}
      style={{ width: '30px', height: '35px',borderRadius:'5px' }}
      className='border-slate-300 text-sm'
    >
      {currencies.map((option) => (
        <option key={option.label} value={option.label}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
  </div>
</div>


<div className="isufinvvb mb-1 ">
        <div className={`text-sm text-black`}>Vendor:</div>
  <input
    id="vendor"
    name="vendor"
    type="text"
    placeholder="Vendor"
    value={form.vendor}
    onChange={handleChange}
    style={{ width: '220px', height: '35px',borderRadius:'5px' }}
      className='border-slate-300 text-sm'
  />
</div>


   



  
<div className="isufinvvb ">
        <div className={`text-sm text-black`}>Buying URL:</div>
  <input
    id="buyingUrl"
    name="buyingUrl"
    type="text"
    placeholder="Buying URL"
    value={form.buyingUrl}
    onChange={handleChange}
    style={{ width: '220px', height: '35px',borderRadius:'5px' }}
    className='border-slate-300 text-sm'
  />
</div>

   <div className='pt-24 flex justify-items-center justify-between'>
   <Button  style={{ border: 'none', cursor: 'pointer', marginLeft: '10px' }}
          color="danger" variant="flat"
         size="md" onClick={() => setIsFormVisible(!isFormVisible)}>Cancel</Button>
 
   <Button   color="success" variant="flat"
         size="md" type="submit">
      Submit
    </Button>


  
   </div>
</form>
</DialogContent>

</Dialog>



















      )}
      <div className='exportisod'>
      <Button onClick={exportToCSV} color="warning"  className='ml-4'>
      Download CSV
      </Button>
      <Button  onClick={exportToExcel} color="secondary" style={{ marginLeft: '10px' }}>
      Download xlsx
      </Button>
      </div>


      <Table
      aria-label="Equipment Table"
      className={`p-3 pb-0 min-h-[280px] ${isDarkMode ? 'dark' : 'light'}`}
      css={{
        height: "auto",
        minWidth: "100%",
      }}
    >
      <TableHeader>
        <TableColumn>Type</TableColumn>
        <TableColumn>Description</TableColumn>
        <TableColumn>Name</TableColumn>
        <TableColumn>Cost Per Unit</TableColumn>
        <TableColumn>Vendor</TableColumn>
        <TableColumn>Buying Url</TableColumn>
        <TableColumn>Action</TableColumn>
      </TableHeader>
      <TableBody>
        {selectedFines.map((fine) => (
          <TableRow key={fine._id}>
            <TableCell>
              {fine.type === "workEquipment"
                ? "Equipment for Work"
                : fine.type === "carEquipment"
                ? "Equipment for Vehicle"
                : fine.type}
            </TableCell>
            <TableCell
            style={{
              maxWidth: '200px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            <Tooltip title={fine.description} placement="topLeft">
                        <span>{fine.description}</span>
                      </Tooltip>
            </TableCell>

            <TableCell>{fine.name}</TableCell>
            <TableCell>{fine.costPerUnit}</TableCell>
            <TableCell>{fine.vendor}</TableCell>
            <TableCell
  style={{
    maxWidth: '200px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }}
>
  {fine.buyingUrl ? (
    <Tooltip
      content={fine.buyingUrl}
      placement="topStart" // Adjust placement as needed
      css={{ whiteSpace: "normal" }} // Allows tooltip content to wrap
    >
      <a
        href={fine.buyingUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          textDecoration: 'none',
          color: 'blue',
          cursor: 'pointer',
          display: 'block',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {fine.buyingUrl}
      </a>
    </Tooltip>
  ) : (
    'N/A'
  )}
</TableCell>

            <TableCell className='flex justify-items-center justify-center' css={{ textAlign: "center"  }}>
              
            <DeleteIcon onClick={() => handleDeleteClick(fine.itemId, fine.type)}  style={{ cursor: 'pointer', width: '17px', height: '17px' ,color: 'red'}} />
           
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>


    <div className='flex justify-items-center justify-center mt-0'>
      <Pagination
        total={totalPages}
        page={currentPage}
        onChange={(page) => setCurrentPage(page)}
        color="secondary"
        size="md"
      />
      </div>



      <Snackbar open={snackbarInfo.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarInfo.severity} sx={{ width: '100%' }}>
          {snackbarInfo.message}
        </Alert>
      </Snackbar>
  
<Modal isOpen={openDialog} onClose={handleCloseDialog}>
    <ModalContent  className={` ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}>
        {(onClose) => (
            <>
                <ModalHeader className="flex flex-col gap-1">Confirm Deletion</ModalHeader>
                <ModalBody>
                    <p>Are you sure you want to delete this equipment?</p>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" variant="light" onPress={handleCloseDialog}>
                        Cancel
                    </Button>
                    <Button color="danger" onPress={() => deleteEquipment(selectedEquipment.id, selectedEquipment.type)}>
                        Delete
                    </Button>
                </ModalFooter>
            </>
        )}
    </ModalContent>
</Modal>
    </div>
  );
};

export default Equipments;


