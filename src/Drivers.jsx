import React, { useState,useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-easy-crop';
import plusi from "./plusi.svg"
import getCroppedImg from './cropImage'; // You'll create this utility function
import 'react-datepicker/dist/react-datepicker.css';
import { useCars, useDrivers } from './CarDriver';
import './Vehicles.css';
import './Drivers.css'
import { Select } from 'antd';
import Dkanban from './Dkanban';
import { Button } from '@nextui-org/react';
function Drivers({cars,refreshCars, theme, updateDriverStatusInContext}) {
  const [showModal, setShowModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [activeStatuses, setActiveStatuses] = useState(['Active', 'Inactive', 'Sick', 'Holiday', 'Over Hours', 'Work Accident']); 
 
  const [uploadedFileName, setUploadedFileName] = useState("");
  const { drivers,refreshDrivers } = useDrivers(); // Assuming this gives you the drivers list
  const hasDrivers = drivers && drivers.length > 0;
  // Inside your Drivers component
const [crop, setCrop] = useState({ x: 0, y: 0 });
const [zoom, setZoom] = useState(1); // Control zoom level
const [croppedAreaPixels, setCroppedAreaPixels] = useState(null); // Details for cropping
const [previewUrl, setPreviewUrl] = useState(null); // Preview URL for the cropped image
// Inside your Drivers component
const [isCropperVisible, setIsCropperVisible] = useState(false); // Add this state
const capacity = parseInt(localStorage.getItem('capacity'), 10);
  const createdAtDays = parseInt(localStorage.getItem('createdAtDays'), 10);

  const shouldShowAddVehicle = createdAtDays <= 14 || (drivers.length < capacity*3 && createdAtDays > 14);
const [driverData, setDriverData] = useState({
  status: '',
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  address: '',
  startDate: new Date(),
  endDate: new Date(),
  driverLicenseCheck: [{
    date: new Date(),
    licensePhoto: '',
    statuses: [{
      status: 'Not Enrolled',
   
    }],
  }],
  driverNote: [],
  driverArea: [],
  equipments: {
    clothing: [],
    other: []
  },
  // Ensure you have a field for storing the picture if you're handling file uploads
  picture: null,
});



  const token = localStorage.getItem('userToken');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDriverData({ ...driverData, [name]: value });
  };

  const handleStartDateChange = (newStartDate) => {
    let newEndDate = driverData.endDate;
    if(newStartDate > newEndDate) {
      newEndDate = newStartDate;
    }
    setDriverData({
      ...driverData,
      startDate: newStartDate,
      endDate: newEndDate,
    });
  };
  
  const handleEndDateChange = (newEndDate) => {
    setDriverData({ ...driverData, endDate: newEndDate });
  };
  
  
  const handleCrop = async () => {
    const croppedBlob = await getCroppedImg(previewUrl, croppedAreaPixels);
    const croppedFile = new File([croppedBlob], "croppedImage.jpg", { type: "image/jpeg" });
    // Generate a preview URL for the blob
    setUploadedFileName(croppedFile.name);
    const croppedImageUrl = URL.createObjectURL(croppedBlob);
    // Update state to reflect the new cropped image
    setPreviewUrl(croppedImageUrl); // For display purposes, might not be necessary depending on your implementation
    setDriverData({ ...driverData, picture: croppedFile }); // Update driverData with the cropped image
    setIsCropperVisible(false); // Hide the cropper
};

const removeUploadedFile = () => {
  setUploadedFileName(""); // Clear the file name
  setDriverData({ ...driverData, picture: null }); // Clear the file from driver data
  setPreviewUrl(null); // Clear the preview
  setIsCropperVisible(false); // Ensure cropper is not visible
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
  
    // Append simple fields
    formData.append('status', driverData.status);
    formData.append('firstName', driverData.firstName);
    formData.append('lastName', driverData.lastName);
    formData.append('address', driverData.address);
    formData.append('email', driverData.email);
    formData.append('mobile', driverData.mobile);
    formData.append('startDate', driverData.startDate);
    formData.append('endDate', driverData.endDate);
  
  
    // Append complex fields as stringified JSON
    formData.append('driverLicenseCheck', JSON.stringify(driverData.driverLicenseCheck));
    formData.append('driverNote', JSON.stringify(driverData.driverNote));
    formData.append('driverArea', JSON.stringify(driverData.driverArea));
    
    // Append file
    if (driverData.picture) {
      formData.append('picture', driverData.picture);
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/drivers`, {
        method: 'POST',
        headers: {
          
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Something went wrong with driver creation');
      }
      await refreshDrivers();
      setShowModal(false);
      setShowNotification(true);
       // Hide the notification after 3 seconds
  setTimeout(() => {
    setShowNotification(false);
  }, 3000);

      removeUploadedFile()
      // Reset form to initial state
      setDriverData({
        status: '',
        firstName: '',
        lastName: '',
        email: '',
        address:'',
        mobile: '',
        startDate: new Date(),
        endDate: new Date(),
        driverLicenseCheck: [{
          date: new Date(),
          licensePhoto: '',
          statuses: [{
            status: 'Not Enrolled',
          
          }],
        }],
        driverNote: [],
        driverArea: [],
        equipments: {
          clothing: [],
          other: []
        }
      });
      // Resetting crop-related states
setCrop({ x: 0, y: 0 }); // Reset crop position
setZoom(1); // Reset zoom level
setCroppedAreaPixels(null); // Reset crop details
setPreviewUrl(null); // Reset preview URL
setIsCropperVisible(false); 
    } catch (error) {
      console.error("Error adding driver:", error);
    }
  };
  const handleFileChange = (e) => {
    setDriverData({ ...driverData, picture: e.target.files[0] });
  };
  const onDrop = useCallback((acceptedFiles) => {
    // Assuming you only want the first file if multiple files are dropped
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setDriverData({ ...driverData, picture: file });
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);
      setIsCropperVisible(true);
    }
  }, [driverData]);
  const userRoles = localStorage.getItem('userRoles'); 
 
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});

  return (
    <div style={{ backgroundColor: theme === 'dark' ? '#141b27' : '#FFFFFF'}}>
    <div>
    <div className={userRoles === 'user' ? "hidddenforuserdfj" : "vehicles-container"}>
    {shouldShowAddVehicle && (
    <Button 
          className={`addimg ${!hasDrivers ? 'highlight-button' : ''} mt-3 mb-3 mr-4 w-[180px] shadow-xl`} 
          onClick={() => setShowModal(true)}
        >
        <img src={plusi} alt="Add" style={{width:'12%',marginRight: "8px" }} />Add New Driver
      </Button>
 )}

      {showNotification && (
        <div className="notificationP show">
          New Driver was created
          <div className="loading-line"></div>
        </div>
      )}

      {showModal && (
        <div className="driverModal">
          <div className="driverModalContent">
          <label className='Addvehicle' htmlFor="Add vehicle">Add Driver</label>
            <form onSubmit={handleSubmit}>
              <div className="form-group-state">

                <label htmlFor="state">State</label>
                <Select
                  name="status"
                  value={driverData.status}
                  onChange={(value) => setDriverData({ ...driverData, status: value })}
                  required
                  placeholder="Select State"
                  style={{
                    width: '58.4%', // Adjust the width as needed
                  }}
                >
                  <Select.Option value="Active">Active</Select.Option>
                  <Select.Option value="Inactive">Inactive</Select.Option>
                  <Select.Option value="Sick">Sick</Select.Option>
                  <Select.Option value="Holiday">Holiday</Select.Option>
                  <Select.Option value="Over Hours">Over Hours</Select.Option>
                  <Select.Option value="Work Accident">Work Accident</Select.Option>
                </Select>


              </div>
              <div className="form-group-state">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={driverData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group-state">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={driverData.lastName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group-state">
                <label htmlFor="address">Address(Location)</label>
                <input
                  type="text"
                  name="address"
                  value={driverData.address}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group-state">
                <label htmlFor="email">Email</label>
                <input
                  type="text"
                  name="email"
                  value={driverData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group-state">
                <label htmlFor="mobile">Mobile</label>
                <input
                  type="text"
                  name="mobile"
                  value={driverData.mobile}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group-state">
                <label>Start Date</label>
                <input 
                  type="date"
                  name="startDate"
                  value={driverData.startDate.toISOString().split('T')[0]} // Format date as yyyy-MM-dd
                  onChange={(e) => handleStartDateChange(new Date(e.target.value))} // Create new Date from input
                  required
                  style={{fontSize:"13px",height:"38px",border:"2px solid #E5E7EB",borderRadius: "5px",padding: "5px 7px"}}
                />
              </div>
              <div className="form-group-state">
                <label>End Date</label>
                <input 
                  type="date"
                  name="endDate"
                  value={driverData.endDate.toISOString().split('T')[0]} // Format the date to YYYY-MM-DD
                  min={driverData.startDate.toISOString().split('T')[0]} // Set minimum selectable date
                  onChange={(e) => handleEndDateChange(new Date(e.target.value))} // Create new Date from input
                  style={{fontSize:"13px", height:"38px",border:"2px solid #E5E7EB",borderRadius: "5px",padding: "5px 7px"}}
                />
              </div>



  
                <div className="form-group-state">
        <label>Picture</label>
        <div {...getRootProps()} className="dropzone">
          <input {...getInputProps()} />
          {
            isDragActive ?
              <p>Drop the files here ...</p> :
              <p>Drag and drop here, or click here to select the file</p>
          }
        </div>
     
      </div>
      {uploadedFileName && (
    <div className="uploaded-file-info">
      <button className="remove-file-button" onClick={removeUploadedFile}>X</button>
      {uploadedFileName}
      
    </div>
  )}
      {previewUrl && isCropperVisible && (
  <div className="crop-container">
    <Cropper
      image={previewUrl}
      crop={crop}
      zoom={zoom}
      aspect={1}
      onCropChange={setCrop}
      onCropComplete={(croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
      }}
      onZoomChange={setZoom}
    />
    <button type="button" className="crop-button" onClick={handleCrop}>Crop Image</button>

  </div>
)}
              <div className='btnbothcd'>
             
              <button id="closepp"  onClick={() => setShowModal(false)}>Cancel</button>
              <button id="closeppd" type="submit" >Create Driver</button>
             
              </div>
           
            </form>
          </div>
        </div>
      )}
    </div>
     <div>
   
     </div>
     </div>
     <Dkanban 
        cars={cars} 
        drivers={drivers} 
        setActiveStatuses={setActiveStatuses} 
        theme={theme} 
        updateDriverStatusInContext={updateDriverStatusInContext}
        activeStatuses={activeStatuses} 
      
      />
     </div>
  );
}

export default Drivers;


