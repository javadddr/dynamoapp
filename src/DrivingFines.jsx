import React, { useState, useEffect,useRef ,useCallback} from 'react';
import { Tooltip } from 'antd';
import { Card, CardBody, Button } from '@nextui-org/react';
import { Input, Select, DatePicker } from 'antd';
import { useDropzone } from 'react-dropzone';
import Barforgeneral from './carscomponents/Barforgeneral';
import ThreeBar from './ThreeBar';
import moment from 'moment';
import Barcost from './Barcost';
import { styled } from '@mui/material/styles';
import { useCars, useDrivers } from './CarDriver';
import { DeleteIcon } from "./carscomponents/DeleteIcon";
import {EditIcon} from "./carscomponents/EditIcon";
import Loading from './Loading'; // Adjust the path as necessary
import { unparse } from 'papaparse';
import { saveAs } from 'file-saver';
import plusi from "./plusi.svg"
import * as XLSX from 'xlsx';
import "./DrivingFines.css"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  User,
  Pagination
} from "@nextui-org/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";

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
  { label: 'Speeding', value: 'speeding' },
  { label: 'Wrong Parking', value: 'wrong parking' },
  { label: 'Seat Belt Violations', value: 'seat belt violations' },
  { label: 'Running Red Lights or Stop Signs', value: 'running red lights or stop signs' },
  { label: 'DUI/DWI', value: 'DUI/DWI' },
  { label: 'Distracted Driving', value: 'distracted driving' },
  { label: 'Reckless Driving', value: 'reckless driving' },
  { label: 'Driving Without a Valid License or With a Suspended License', value: 'driving without license or with suspended license' },
  { label: 'Failure to Yield', value: 'failure to yield' },
  { label: 'Expired Registration or Inspection', value: 'expired registration or inspection' },
  { label: 'Improper Turns', value: 'improper turns' },
  { label: 'Driving Without Insurance', value: 'driving without insurance' },
  { label: 'Tailgating', value: 'tailgating' },
  { label: 'Illegal Lane Changes', value: 'illegal lane changes' },
  { label: 'Driving Too Slowly', value: 'driving too slowly' },
  { label: 'Vehicle Equipment Violations', value: 'vehicle equipment violations' },
];
const fineStatuses = [
  { label: 'Open', value: 'open' },
  { label: 'Discarded', value: 'discarded' },
  { label: 'Paid', value: 'paid' },
];

const getFineTypeLabel = (typeValue) => {
  const type = fineTypes.find((fineType) => fineType.value === typeValue);
  return type ? type.label : typeValue; // Fallback to the value if no match is found
};

const fineForOptions = [
  { label: 'Vehicle', value: 'car' },
  { label: 'Driver', value: 'driver' },
];

const DrivingFines = ({theme}) => {
  const [fines, setFines] = useState([]);
  console.log("fines",fines)
  const { Option } = Select;
  const [currentPage, setCurrentPage] = useState(1); // Current page state
const [editingFineId, setEditingFineId] = useState(null);
console.log(editingFineId)
const [tempFor, setTempFor] = useState("");
const [tempStatus, setTempStatus] = useState("");

let isDarkMode; 

if (theme === 'dark') {
  isDarkMode = true; // Set to true if theme is 'dark'
} else {
  isDarkMode = false; // Set to false otherwise
}
// State to store the temporary description value during editing
const [tempDescription, setTempDescription] = useState("");

  const [form, setForm] = useState({
    issueDate: null,
    occureDate: null,
    description: '',
    for: '',
    type: '',
    cost: '',
    driverName: '',
    carName: '',
    dueDate: null,
    status: '',
    issuedFrom: '',
    location: '',
    file: null,
  });
  

  const finesPerPage = 5; // Fines per page

  // Calculate the range of fines to display
  const startIndex = (currentPage - 1) * finesPerPage;
  const selectedFines = fines.slice(startIndex, startIndex + finesPerPage);

  // Total number of pages
  const totalPages = Math.ceil(fines.length / finesPerPage);


  const [accordionExpanded, setAccordionExpanded] = useState(false); // Start expanded
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFineId, setSelectedFineId] = useState(null);
  const handleDeleteClick = (fineId) => {
    setSelectedFineId(fineId);
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFineId(null); // Reset selected fine ID
  };
  const [isFormVisible, setIsFormVisible] = useState(false); // State to control form visibility

  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  // Adjust the snackbarInfo state to manage the snackbar's open state, message, and severity
  const [snackbarInfo, setSnackbarInfo] = useState({ open: false, message: '', severity: '' });

  // Function to programmatically click the hidden file input
  const handleFileButtonClick = (event) => {
    event.stopPropagation(); // Prevent the dropzone from triggering
    fileInputRef.current.click(); // Click the file input using the ref
  };

  const handleFileRemove = (event) => {
    event.preventDefault(); // Prevent default behavior
    event.stopPropagation(); // Stop the event from bubbling up
    setForm({ ...form, file: null });
  };
  const { cars, refreshCars } = useCars();
  const { drivers, refreshDrivers } = useDrivers();
 
  useEffect(() => {
    refreshDrivers();
  }, []);
  useEffect(() => {
    refreshCars();
  }, []);
  useEffect(() => {
    setLoading(true); 
    fetchFines();
    
  }, []);

  const fetchFines = async () => {
    const token = localStorage.getItem('userToken');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fines`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch fines');
      }
      const data = await response.json();
      setFines(data);
      setLoading(false); 
    } catch (error) {
      console.error('Error fetching fines:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, file: e.target.files[0] });
  };
  const carOptions = cars.map(car => ({
    label: `${car.general.internalName} (${car.general.licensePlate})`,
    value: `${car.general.internalName}`, // Adjust this based on what your server expects
  }));
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const token = localStorage.getItem('userToken');
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fines`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      fetchFines(); // Refresh the fines list
      // Reset the form
      setForm({
        issueDate: '',
        occureDate: '',
        description: '',
        for: '',
        type: '',
        driverName: '',
        carName: '',
        dueDate: '',
        cost:'',
        status: '',
        issuedFrom: '',
        location: '',
        file: null,
      });
      setIsFormVisible(false);
      
      setAccordionExpanded(false); // Close the accordion
      setSnackbarInfo({ open: true, message: 'Fine submitted successfully.', severity: 'success' });
    } catch (error) {
      setSnackbarInfo({ open: true, message: 'Error submitting fine.', severity: 'error' });
    } finally {
     
    }
  };

  const handleChangeDate = () => {
    setEditingFineId(null)
  };


  const onDrop = useCallback((acceptedFiles) => {
    // Handle file drop
    setForm({ ...form, file: acceptedFiles[0] });
  }, [form]);
 
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });


  const driverOptions = drivers.map(driver => ({
    label: `${driver.firstName} ${driver.lastName}`,
    value: `${driver.firstName} ${driver.lastName}`, // Use ID or any unique property if available
  }));

  // Function to close the snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarInfo(prev => ({ ...prev, open: false }));
  };
  const getStatusStyle = (status) => {
    switch (status) {
      case 'paid':
        return {
          color: 'black',
       
          borderRadius: '30px',
          padding: '5px',
          background: '#bcf7e0',
        
          justifyContent:'center',
          textAlign:'center',
        };
      case 'open':
        return {
          color: 'black',
    
          borderRadius: '30px',
          padding: '5px',
          background: '#e4fcbb',
         
          justifyContent:'center',
          textAlign:'center',
        };
      case 'discarded':
        return {
          color: 'black',
        
          borderRadius: '30px',
          padding: '5px',
          background: '#d5d6d2',
      
          justifyContent:'center',
          textAlign:'center',
        };
      default:
        return {};
    }
  };
  
  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  const handleDeleteFine = async () => {
    if (!selectedFineId) return;
    const token = localStorage.getItem('userToken');

    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fines/${selectedFineId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      fetchFines()
      setOpenDialog(false); // Close the dialog
      setSnackbarInfo({ open: true, message: 'Fine deleted successfully.', severity: 'success' });
    } catch (error) {
      setSnackbarInfo({ open: true, message: 'Error deleting fine.', severity: 'error' });
    }
    setSelectedFineId(null);
  };
  const exportToCSV = () => {
    const csvData = fines.map(fine => ({
      OccurDate: new Date(fine.occureDate).toLocaleDateString(),
      DueDate: new Date(fine.dueDate).toLocaleDateString(),
      Description: fine.description,
      For: fine.for,
      DriverName: fine.driverName,
      CarName: fine.carName,
      Status: fine.status,
      IssuedFrom: fine.issuedFrom,
      Location: fine.location,
      File: fine.file ? `${import.meta.env.VITE_BACKEND_URL}/${fine.file}` : 'No File'
    }));
  
    const csv = unparse(csvData, { header: true });
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "fines.csv");
  };
  
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(fines.map(fine => ({
      OccurDate: new Date(fine.occureDate).toLocaleDateString(),
      DueDate: new Date(fine.dueDate).toLocaleDateString(),
      Description: fine.description,
      For: fine.for,
      DriverName: fine.driverName,
      CarName: fine.carName,
      Status: fine.status,
      IssuedFrom: fine.issuedFrom,
      Location: fine.location,
      File: fine.file ? `${import.meta.env.VITE_BACKEND_URL}/${fine.file}` : 'No File'
    })));
  
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fines Data");
    XLSX.writeFile(wb, "fines.xlsx");
  };
  
  const handleEditClick = (fineId, description, forValue, status) => {
    setEditingFineId(fineId);
    setTempDescription(description);
    setTempFor(forValue);
    setTempStatus(status); // Initialize the temp status
  };
  
  const handleSaveEdit = async (fineId) => {
    // Prepare the data to be sent to the backend
    const updatedFine = {
      description: tempDescription,
      for: tempFor,
      status: tempStatus, // Include the updated 'for' value
    };
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fines/${fineId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Include your auth token here if needed
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
        },
        body: JSON.stringify(updatedFine),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update fine');
      }
  
      const updatedData = await response.json();
  
      // Update the fine in the local state to reflect the change
      setFines(fines.map(fine => fine._id === fineId ? { ...fine, description: tempDescription, for: tempFor, status: tempStatus } : fine));
  
      // Reset editing state
      setEditingFineId(null);
      setTempDescription("");
      setTempFor(""); 
      // Optionally show a success message
      setSnackbarInfo({ open: true, message: 'Fine updated successfully.', severity: 'success' });
  
    } catch (error) {
      console.error('Error updating fine:', error);
      // Optionally show an error message
      setSnackbarInfo({ open: true, message: 'Error updating fine.', severity: 'error' });
    }
  };
  
    if (loading) {
      return <Loading />; 
    }
    const userRoles = localStorage.getItem('userRoles');  
    const toggleModal = () => setIsFormVisible(!isFormVisible);
    const closeModal = (event) => {
      // Prevent the modal from closing if the user clicks inside the modal container
      if (event.target === event.currentTarget) {
        setIsFormVisible(false);
      }
    };
    
 


    
    const firstColumnStyle3 = {
      width: '210px',
      maxWidth: '210px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
     
    };
    const firstColumnStyle4 = {
      wrap: 'nowrap',
      width: '120px',
      maxWidth: '120px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
     
    };
    const filteredFine = fines.find((fine) => fine._id === editingFineId);
    console.log("filteredFine",filteredFine)
    const calculateMonthlyCosts = (fines) => {
      // Initialize an object to store the cost sums per month
      const monthlyData = {};
  
      // Iterate over the fines array
      fines.forEach((fine) => {
        // Extract the createdAt and cost fields
        const createdAt = new Date(fine.occureDate);
        const cost = fine.cost;
  
        // Get the month in 'Month' format (e.g., "September")
        const month = createdAt.toLocaleString('default', { month: 'long' });
  
        // Add or accumulate the cost to the corresponding month
        if (!monthlyData[month]) {
          monthlyData[month] = { month, amount: 0 };
        }
        monthlyData[month].amount += cost;
      });
  
      // Convert the object to an array and sort by month
      const sortedChartData = Object.keys(monthlyData)
        .map((key) => ({
          month: monthlyData[key].month,
          desktop: monthlyData[key].amount,
        }))
        .sort((a, b) => new Date(`1 ${a.month} 2000`) - new Date(`1 ${b.month} 2000`)); // Sort months based on their order
  
      return sortedChartData;
    };
    const title="Fine"
    const chartData = calculateMonthlyCosts(fines);
    const title2="Fine Costs vs Drivers"
    const title3="Fine Costs vs Vehicles"


    //NOW FOR SECOUND CHART
    const calculateCostsByDriver = (fines) => {
      // Initialize an object to store the cost sums per driver
      const driverData = {};
  
      // Iterate over the fines array
      fines.forEach((fine) => {
        // Extract the driverName and cost fields
        const driverName = fine.driverName;
        const cost = fine.cost;
  
        // Add or accumulate the cost for the corresponding driver
        if (!driverData[driverName]) {
          driverData[driverName] = { driverName, amount: 0 };
        }
        driverData[driverName].amount += cost;
      });
  
      // Convert the object to an array and sort by amount (cost) in descending order
      const sortedDriverData = Object.keys(driverData)
        .map((key) => ({
          browser: driverData[key].driverName,
          visitors: driverData[key].amount,
        }))
        .sort((a, b) => b.visitors - a.visitors) // Sort by cost in descending order
        .slice(0, 5); // Get the top 5 drivers
  
      // Add color based on the index (or you can use different logic if needed)
      const colors = [
        "var(--color-chrome)",
        "var(--color-safari)",
        "var(--color-firefox)",
        "var(--color-edge)",
        "var(--color-other)",
      ];
  
      // Add the fill property with colors
      const top5DriversWithColor = sortedDriverData.map((driver, index) => ({
        ...driver,
        fill: colors[index] || "var(--color-default)",
      }));
  
      return top5DriversWithColor;
    };
  
    const driverData = calculateCostsByDriver(fines);
    console.log(driverData)

    const calculateCostsByCar = (fines) => {
      // Initialize an object to store the cost sums per car
      const carData = {};
  
      // Iterate over the fines array
      fines.forEach((fine) => {
        // Extract the carName and cost fields
        const carName = fine.carName;
        const cost = fine.cost;
  
        // Add or accumulate the cost for the corresponding car
        if (!carData[carName]) {
          carData[carName] = { carName, amount: 0 };
        }
        carData[carName].amount += cost;
      });
  
      // Convert the object to an array and sort by amount (cost) in descending order
      const sortedCarData = Object.keys(carData)
        .map((key) => ({
          browser: carData[key].carName,
          visitors: carData[key].amount,
        }))
        .sort((a, b) => b.visitors - a.visitors) // Sort by cost in descending order
        .slice(0, 5); // Get the top 5 cars
  
      // Add color based on the index (or you can use different logic if needed)
      const colors = [
        "var(--color-chrome)",
        "var(--color-safari)",
        "var(--color-firefox)",
        "var(--color-edge)",
        "var(--color-other)",
      ];
  
      // Add the fill property with colors
      const top5CarsWithColor = sortedCarData.map((car, index) => ({
        ...car,
        fill: colors[index] || "var(--color-default)",
      }));
  
      return top5CarsWithColor;
    };
  
    const carData = calculateCostsByCar(fines);



    let openFinesCount = 0;
let discardedFinesCount = 0;
let paidFinesCount = 0;

// Loop through the fines array and count based on the status
fines.forEach((fine) => {
  if (fine.status === "open") {
    openFinesCount++;
  } else if (fine.status === "discarded") {
    discardedFinesCount++;
  } else if (fine.status === "paid") {
    paidFinesCount++;
  }
});
  return (
    
    <div className={`h-screen ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
       <div className={`flex justify-items-end justify-end  ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <div className={userRoles === 'user' ? "hidddenforuserdfj" : "containerPPOLmm"}>
      <Button className="mt-3 mb-3 mr-4 w-[180px] shadow-xl" color="primary" variant="shadow" radius="sm" size="md" onClick={toggleModal}>
        <img src={plusi} alt="Add" style={{width:'14%' }} />
        Add New Fine
      </Button>
      </div>
      </div>
    
      {isFormVisible && (
        <div className={`modal-backdrop1 `} onClick={closeModal}>
        <div className={`modal-container1  ${isDarkMode ? 'bg-gray-200 text-white' : 'bg-white text-black'}`}>
      <form onSubmit={handleSubmit} className='formfineop'>
        <div className='typdatefinevvb' style={{width: '100%'}}>
        <div className="text-lg text-blue-600 font-semibold">
        Add New Fine
        </div>
        <div className="isufinvvb">
        <div className={`text-sm text-black`}>Type:</div>
 
  <Select
      id="type-combo-box"
      name="type"
      value={form.type || undefined} // 'undefined' ensures the placeholder shows up if no value is selected
      onChange={(value) => handleChange({ target: { name: 'type', value } })} // Handle change for AntD Select
      placeholder="Select Fine Type"
      style={{ width: '250px', height: '35px', margin: '8px' }}
  
    >
      {fineTypes.map((option) => (
        <Option  key={option.value} value={option.value}>
          {option.label}
        </Option>
      ))}
    </Select>
</div>

      <div>

  <div className="isufinvvb">
  <div className={`text-sm text-black`}>Issue date:</div>
    
         <DatePicker 
                name="issueDate " 
                value={form.issueDate || ''}
                onChange={(newValue) => {
                  handleChange({ target: { name: 'issueDate', value: newValue } }); }}
                className="mr-2 w-[251px]"
              />
        </div>
        <div className="isufinvvb">
  <div className={`text-sm text-black`}>Occur date:</div>
 
     <DatePicker 
                name="occureDate " 
                value={form.occureDate || ''}
                onChange={(newValue) => {
                  handleChange({ target: { name: 'occureDate', value: newValue } }); }}
                  className="mr-2 w-[251px]"
              />
        </div>
        <div className="isufinvvb">
          <div className={`text-sm text-black`}>Due date:</div>
            <DatePicker 
                name="dueDate" 
                value={form.dueDate }
                onChange={(newValue) => {
                  handleChange({ target: { name: 'dueDate', value: newValue } }); }}
                  className="mr-2 w-[251px]"
              />
        </div>
          <div className="isufinvvb">
  <div className={`text-sm text-black`}>Description:</div>
  <input
    type="text"
    id="description"
    name="description"
    value={form.description || ''}
    onChange={handleChange}
    required
    style={{ width: '250px', height: '35px', margin: '8px',border:'1px solid #d8d8d8',borderRadius:'5px' }}
  />
</div>

<div className="isufinvvb">
  <div className={`text-sm text-black`}>Amount (Cost):</div>
  <input
    type="number"
    id="cost"
    name="cost"
    value={form.cost || ''}
    onChange={handleChange}
    required
    style={{ width: '250px', height: '35px', margin: '8px',border:'1px solid #d8d8d8',borderRadius:'5px' }}
    min="0" // Optional: Ensures that only non-negative values are entered
  />
</div>

     
      </div>
        </div>

        <div className='typdatefinevvb' style={{width: '100%'}}>
        <div className="isufinvvb">
  <div className={`text-sm text-black`}>Issued For:</div>
  <Select
      id="for-combo-box"
      name="for"
      value={form.for || undefined} // 'undefined' ensures the placeholder shows up if no value is selected
      onChange={(value) => handleChange({ target: { name: 'for', value } })} // Handle change for AntD Select
      placeholder="Select Issued For"
      style={{ width: '250px', height: '35px', margin: '8px' }}
    >
      {fineForOptions.map((option) => (
        <Option key={option.value} value={option.value}>
          {option.label}
        </Option>
      ))}
    </Select>
</div>

<div className="isufinvvb">
  <div className={`text-sm text-black`}>Driver Name:</div>
  <Select
      id="driver-name-select"
      name="driverName"
      value={form.driverName || undefined} // 'undefined' shows the placeholder if no value is selected
      onChange={(value) => handleChange({ target: { name: 'driverName', value } })} // Mimic an event object for compatibility
      placeholder="Select Driver"
      style={{ width: '250px', height: '35px', margin: '8px' }}
      required
    >
      {driverOptions.map((option) => (
        <Option key={option.value} value={option.value}>
          {option.label}
        </Option>
      ))}
    </Select>
</div>

<div className="isufinvvb">
  <div className={`text-sm text-black`}>Vehicle Name:</div>
  <Select
      id="vehicle-name-select"
      name="carName"
      value={form.carName || undefined} // 'undefined' shows the placeholder if no value is selected
      onChange={(value) => handleChange({ target: { name: 'carName', value } })} // Mimic an event object for compatibility
      placeholder="Select Vehicle"
      style={{ width: '250px', height: '35px', margin: '8px' }}
      required
    >
      {carOptions.map((option) => (
        <Option key={option.value} value={option.value}>
          {option.label}
        </Option>
      ))}
    </Select>
</div>
<div className="isufinvvb">
  <div className={`text-sm text-black`}>Status:</div>
  <Select
      id="status-select"
      name="status"
      value={form.status || undefined} // 'undefined' shows the placeholder if no value is selected
      onChange={(value) => handleChange({ target: { name: 'status', value } })} // Mimic an event object for compatibility
      placeholder="Select Status"
      style={{ width: '250px', height: '35px', margin: '8px' }}
      required
    >
      {fineStatuses.map((status) => (
        <Option key={status.value} value={status.value}>
          {status.label}
        </Option>
      ))}
    </Select>
</div>

<div className="isufinvvb">
  <div className={`text-sm text-black`}>Which place issued the fine:</div>
  <input
    type="text"
    id="issuedFrom"
    name="issuedFrom"
    value={form.issuedFrom || ''}
    onChange={handleChange}
    
    style={{ width: '250px', height: '35px', margin: '8px',border:'1px solid #d8d8d8',borderRadius:'5px' }}
  />
</div>

<div className="isufinvvb">
  <div className={`text-sm text-black`}>Location of the incident:</div>
  <input
    type="text"
    id="location"
    name="location"
    value={form.location || ''}
    onChange={handleChange}
  
    style={{ width: '250px', height: '35px', margin: '8px',border:'1px solid #d8d8d8',borderRadius:'5px' }}
  />
</div>

        </div>
    
        <div className='typdatefine1o' style={{width: '93%',marginTop:'15px'}}>
          
        <FileUploadContainer {...getRootProps()} isDragActive={isDragActive}>
        <input
            {...getInputProps()}
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {form.file ? (
            <>
              <p>{form.file.name}</p>
              <Button
                  variant="flat" 
                  color="danger"
                  onClick={(e) => {
                    e.preventDefault(); // Prevent any default action.
                    e.stopPropagation(); // Stop event propagation to prevent triggering any parent event handlers.
                    handleFileRemove(e); // Call handleFileRemove with the event.
                  }}
                  size="small"
                >
                  Remove
                </Button>

            </>
          ) : (
            <p  className={` mb-4 text-sm text-black`}>Drop a file here, or click on upload file</p>
          )}
          <Button variant="flat" color="secondary"  onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the dropzone click
            fileInputRef.current.click();
          }}>
            Upload File
          </Button>
        </FileUploadContainer>
        
        </div>
        <div className='btnboth' >
        <Button color="danger" variant="flat"  onClick={() => setIsFormVisible(false)}>Close</Button>
                <Button color="success" variant="flat" type="submit">
                  Send fine
                </Button>

              </div>
      </form>
  </div>
  </div>
      )}
      <div className='exportisod'>
     
      </div>
      <div className='flex justify-between'>
           <div>
          <Button onClick={exportToCSV}  color="warning" className='ml-4'>
          Download CSV
          </Button>
          <Button onClick={exportToExcel}  color="secondary" style={{ marginLeft: '10px' }}>
          Download xlsx

          </Button>
          </div>
          <div>
          <Button  color="warning" variant="flat" style={{ marginLeft: '10px' }}>
         Open fines: {openFinesCount}

          </Button>
          <Button  color="danger" variant="flat" style={{ marginLeft: '10px' }}>
         Discarded fines: {discardedFinesCount}

          </Button>
          <Button  color="success" variant="flat" style={{ marginLeft: '10px',marginRight:'15px' }}>
         Paid fines: {paidFinesCount}

          </Button>
          </div>
          </div>
      <div className={`${filteredFine?'visible':"invisible h-0"}  flex justify-items-center justify-center w-[100%] `}>
      <div className={`flex justify-items-center transition duration-300 justify-center mt-2 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}  p-3 rounded-md border-slate-900 shadow-md`}>
        
  {filteredFine ? (
    <tr key={filteredFine._id}>
      {/* Description field */}
      <td style={firstColumnStyle3}>
        <input
          type="text"
          value={tempDescription}
          onChange={(e) => setTempDescription(e.target.value)}
          style={{ width: '95%', height: "30px", fontSize: '12px', padding: '0px',borderRadius:"5px",border:"none",paddingLeft:"4px" }}
          className="form-control"
          required
        />
      </td>
      <td>

      <Select
  id="issuedFor"
  value={tempFor}
  onChange={(value) => setTempFor(value)}
  style={{ fontSize: '12px', padding: '0px' }}
  required
  placeholder="Select Issued For"
>
  <Select.Option value="">Select Issued For</Select.Option>
  {fineForOptions.map((option) => (
    <Select.Option key={option.value} value={option.value}>
      {option.label}
    </Select.Option>
  ))}
</Select>

     
      </td>

      {/* Status select field */}
      <td style={firstColumnStyle4}>
       
      <Select
  value={tempStatus}
  onChange={(value) => setTempStatus(value)}
  style={{ fontSize: '12px', padding: '0px', width: '110px' }}
  required
>
  <Select.Option value="">Select Status</Select.Option>
  {fineStatuses.map((status) => (
    <Select.Option key={status.value} value={status.value}>
      {status.label}
    </Select.Option>
  ))}
</Select>
     
      </td>

      {/* Actions: Save and Delete */}
      <td style={{ textAlign: 'center' }}>
        <Button
         onClick={() => handleSaveEdit(filteredFine._id) }
         variant="flat" 
         color= "success"
         size="sm"
        >
      save
        </Button>
        <Button
      onClick={handleChangeDate }
          style={{ border: 'none', cursor: 'pointer', marginLeft: '10px' }}
          variant="flat" 
         color= "danger"
         size="sm"
        >
       cancel
        </Button>
      </td>
    </tr>
  ) : (
    <tr >
      <td colSpan="4">No fine selected for editing.</td>
    </tr>
  )}
</div>
</div>

     
<Table aria-label="Fines table" bordered  className={`p-3 min-h-[320px] ${isDarkMode ? 'dark' : 'light'}`} >
        <TableHeader >
          <TableColumn>Reason</TableColumn>
          <TableColumn>Occur Date</TableColumn>
          <TableColumn>Due Date</TableColumn>
          <TableColumn>Description</TableColumn>
          <TableColumn>Issued for</TableColumn>
          <TableColumn>Driver Name</TableColumn>
          <TableColumn>Vehicle Name</TableColumn>
          <TableColumn>Cost</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn>File</TableColumn>
          <TableColumn>Action</TableColumn>
        </TableHeader>
        <TableBody >
          {selectedFines.map((fine) => (
            <TableRow key={fine._id} >
              <TableCell
                className=""
                style={{
                  maxWidth: '200px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                <Tooltip
                  title={getFineTypeLabel(fine.type)}
                  placement="topLeft"  // Adjust as needed
                  overlayStyle={{ marginLeft: '100px' }}  // Ensure tooltip is 100px from the left
                >
                  {getFineTypeLabel(fine.type)}
                </Tooltip>
              </TableCell>
              <TableCell>{new Date(fine.occureDate).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(fine.dueDate).toLocaleDateString()}</TableCell>
              <TableCell
                style={{
                  maxWidth: '200px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                <Tooltip
                  title={fine.description}
                  placement="topLeft"  // or "bottomLeft" depending on your preference
                  overlayStyle={{ marginLeft: '100px' }}  // Adjust the tooltip's position relative to the cell
                >
                  {fine.description}
                </Tooltip>
              </TableCell>
              <TableCell>{fine.for === "car" ? "Vehicle" : "Driver"}</TableCell>
              <TableCell>{fine.driverName}</TableCell>
              <TableCell>{fine.carName}</TableCell>
              <TableCell>{fine.cost}</TableCell>
              <TableCell>
                <Chip variant="flat" color={fine.status === "paid" ? "success" : fine.status === "discarded" ? "danger" : "warning"} >
                  {fine.status}
                </Chip>
              </TableCell>
              <TableCell >
                {fine.file ? (
                  <a href={`${import.meta.env.VITE_BACKEND_URL}/fines/${fine.file}`} target="_blank" className='text-blue-700 font-bold'>
                    See File
                  </a>
                ) : (
                  "No File"
                )}
              </TableCell>
              <TableCell className='flex justify-items-center justify-between pl-3 '>
                <EditIcon onClick={() => handleEditClick(fine._id, fine.description, fine.for, fine.status)}  style={{ cursor: 'pointer', width: '17px', height: '17px', color: 'blue' }} />
                <DeleteIcon onClick={() => handleDeleteClick(fine._id)}  style={{ cursor: 'pointer', width: '17px', height: '17px' ,color: 'red'}} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className='flex justify-items-center justify-center mt-2'>
      <Pagination
        total={totalPages}
        page={currentPage}
        onChange={(page) => setCurrentPage(page)}
        color="secondary"
        size="md"
      />
      </div>
    





      
      <Modal isOpen={openDialog} onClose={handleCloseDialog}>
    <ModalContent  className={` ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}>
        {(onClose) => (
            <>
                <ModalHeader className="flex flex-col gap-1">Confirm Deletion</ModalHeader>
                <ModalBody>
                    <p>Are you sure you want to delete this fine?</p>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" variant="light" onPress={handleCloseDialog}>
                        Cancel
                    </Button>
                    <Button color="danger" onPress={handleDeleteFine}>
                        Delete
                    </Button>
                </ModalFooter>
            </>
        )}
    </ModalContent>
</Modal>
<div className='ml-4 mt-3 pb-7 flex justify-items-center justify-center'>
 <Barforgeneral theme={theme} chartData={chartData} title={title}/>

       <Barcost data={driverData} theme={theme} title={title2}/>
       <Barcost data={carData} theme={theme} title={title3}/>

 </div>
    </div>
  );
};

export default DrivingFines;

