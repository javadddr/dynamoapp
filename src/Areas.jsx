import React, { useState, useEffect,useRef ,useCallback} from 'react';
import { Input } from 'antd';
import AreasPiple from './AreasPiple';
import { Button } from '@nextui-org/react';
import "./Areas.css";
import Loading from './Loading'; // Adjust the path as necessary
import plusi from "./plusi.svg"
import { unparse } from 'papaparse';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Snackbar, Alert } from '@mui/material';



const Areas = ({cars,theme}) => {
 
  const [form, setForm] = useState({
    areaName: '',
    areaLocation: '', 
  });
  
console.log("cars",cars)
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [accordionExpanded, setAccordionExpanded] = useState(false); // Start expanded
  const [openDialog, setOpenDialog] = useState(false);
  const [areas, setAreas] = useState([]); 
  const [selectedAreaId, setSelectedAreaId] = useState(null); // Correctly defined state for tracking the selected area ID

 
  useEffect(() => {
    setLoading(true); 
    const fetchData = async () => {
    
      await fetchAreas();
    };
    fetchData().finally(() => setLoading(false));
  }, []);



  const handleDeleteClick = (id) => {
    setSelectedAreaId(id); // Set the selected area ID
    setOpenDialog(true);
};

  
  const handleCloseDialog = () => {
    setOpenDialog(false);
   
  };
  // Function to delete the selected equipment based on its type
const deleteEquipment = async (id) => {
 
  const token = localStorage.getItem('userToken');
  const endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/areas/${id}`;
  try {
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error('Failed to delete the area');
    }

    
    fetchAreas();
    setOpenDialog(false); // Close the dialog
    setSnackbarInfo({ open: true, message: 'Area deleted successfully.', severity: 'success' });
  } catch (error) {
    console.error('Error deleting area:', error);
    setSnackbarInfo({ open: true, message: 'Error deleting area.', severity: 'error' });
  }
};

  const [loading, setLoading] = useState(false);
  // Adjust the snackbarInfo state to manage the snackbar's open state, message, and severity
  const [snackbarInfo, setSnackbarInfo] = useState({ open: false, message: '', severity: '' });


 
  useEffect(() => {
    setLoading(true); 
   
    fetchAreas();
    
  }, []);

  const fetchAreas = async () => {
    const token = localStorage.getItem('userToken');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/areas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch fines');
      }
      const data = await response.json();
      setAreas(data);
    
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


  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const token = localStorage.getItem('userToken');
  
    // Instead of using FormData, directly use the form object for JSON.stringify
    const data = JSON.stringify(form);

    const endpoint=`${import.meta.env.VITE_BACKEND_URL}/api/areas`
   

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
        setAccordionExpanded(false); // Close the accordion
        setSnackbarInfo({ open: true, message: 'Area submitted successfully.', severity: 'success' });
    
        fetchAreas();
        setForm({
          areaName: '',
          areaLocation: '', 
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


  
  const exportToCSV = () => {
    const csvData = areas.map(eq => ({
       
        Description: eq.areaLocation,
        Name: eq.areaName,
      
    }));
    // Use unparse to convert JSON to CSV
    const csv = unparse(csvData, { header: true });
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "equipment_data.csv");
};

  // Function to convert your data to Excel and trigger the download
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(areas.map(eq => ({
      Description: eq.areaLocation,
      Name: eq.areaName,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Equipment Data");
    XLSX.writeFile(wb, "equipment_data.xlsx");
  };

    if (loading) {
      return <Loading />; // Show loading component while data is being fetched
    }
    const userRoles = localStorage.getItem('userRoles');  
    console.log(areas)

    let isDarkMode; 

    if (theme === 'dark') {
      isDarkMode = true; // Set to true if theme is 'dark'
    } else {
      isDarkMode = false; // Set to false otherwise
    }







    
  return (
    
    <div className={`mainformfindid w-full h-lvh ml-0 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
     
     <div className={userRoles === 'user' ? "hidddenforuserdfj" : "containerPPOLmm"}>
     <div className={`flex justify-items-end justify-end  ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
    <Button className="mt-3 mb-3 mr-4 w-[180px] shadow-xl" color="primary" variant="shadow" radius="sm" size="md" onClick={() => setIsFormVisible(!isFormVisible)}>
        <img src={plusi} alt="Add" style={{width:'14%' }} />
        Add New Area
      </Button>
      </div>
      </div>
      {isFormVisible && (
<form onSubmit={handleSubmit} className='formfineop h-[100px]'>
  <div className='flex' style={{ width: '100%' }}>
 

<Input
  id="areaName"
  name="areaName" // The name is now "areaName"
  placeholder="Area Name" // Use placeholder instead of label in Ant Design
  value={form.areaName}
  onChange={handleChange}
  required
  style={{
    width: '300px',
    height: '35px',
    border: '1px solid gray', // Gray border
    borderRadius: '5px', 
    marginRight:"10px",
    marginBottom: '1rem'
  }}

/>


<Input
  id="areaLocation"
  name="areaLocation" // The name is now "areaLocation"
  placeholder="Location" // Use placeholder instead of label in Ant Design
  value={form.areaLocation}
  onChange={handleChange}
  style={{
    width: '300px',
    height: '35px',
    border: '1px solid gray', // Gray border
    borderRadius: '5px', // Optional if you want rounded corners
  }}
/>



  </div>

  <div className='typdatefine1o' style={{ width: '100%' }}>

      <Button color="success" variant="flat" type="submit">
        Submit
      </Button>
      <Button color="danger" variant="flat" onClick={() => setIsFormVisible(!isFormVisible)}>
        Cancel
      </Button>
      
  </div>
</form>
)}
    
      <div className={`mainexarjo ml-3 w-[90%] mr-3 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <div className='exportisod mt-6 '>
     
      <Button onClick={exportToCSV}  color="warning" className={`ml-3 ${
          isDarkMode ? 'dark' : 'light'
        }`}>
          Download CSV
          </Button>
          <Button onClick={exportToExcel}  color="secondary" style={{ marginLeft: '10px' }}>
          Download xlsx

          </Button>
    
      </div>
 
      </div>
      <Snackbar open={snackbarInfo.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarInfo.severity} sx={{ width: '100%' }}>
          {snackbarInfo.message}
        </Alert>
      </Snackbar>
   
      <AreasPiple cars={cars} deleteEquipment={deleteEquipment} isDarkMode={isDarkMode} theme={theme} areas={areas}/>
     
    </div>
  );
};

export default Areas;


