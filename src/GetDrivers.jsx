import React, { useState,useEffect,useCallback } from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import GeneralDriver from './carscomponents/GeneralDriver';
import DriversOfDriver from './carscomponents/DriversOfDriver';
import Cropper from 'react-easy-crop';
import InvoicesDriver from './carscomponents/InvoicesDriver';
import NoteDriver from './carscomponents/NoteDriver';
import getCroppedImg from './cropImage'; // You'll create this utility function
import TaskDriver from './carscomponents/TaskDriver';
import EquipmentDriver from './carscomponents/EquipmentDriver';
import {EnvironmentOutlined,CompassOutlined,CarTwoTone,IdcardTwoTone} from '@ant-design/icons'
import { useCars, useDrivers } from './CarDriver';
import { useDropzone } from 'react-dropzone';
import { CloudUploadOutlined } from '@ant-design/icons';

import "./GetDrivers.css"
import nopic from "./nopic.png"
function GetDrivers({ driver: initialDriver, closePopup, theme }) {
  const [activeTab, setActiveTab] = useState('General');
  const [driver, setDriver] = useState(initialDriver);
  const token = localStorage.getItem('userToken');
  const stateColors = {
    Active: '#4CAF50',
    Inactive: '#9E9E9E',
    Sick: '#2196F3',
    Holiday: '#FF9800',
    'Over Hours': '#FFEB3B',
    'Work Accident': '#F44336',
   
  };
  const handleDriverUpdate = (updatedDriver) => {
    setDriver(updatedDriver);
  };

  useEffect(() => {
    setDriver(initialDriver); // Update local state when the initialCar prop changes
  }, [initialDriver]);
  const renderTabContent = () => {
    switch (activeTab) {
      case 'General':
        return <GeneralDriver driver={driver} onDriverUpdate={handleDriverUpdate} closePopup={closePopup} theme={theme} />;
      case 'Vehicles':
        return <DriversOfDriver driver={driver}  onDriverUpdate={handleDriverUpdate} theme={theme} closePopup={closePopup}/>;
      case 'Invoices':
        return <InvoicesDriver driver={driver} onDriverUpdate={handleDriverUpdate} theme={theme} closePopup={closePopup}/>;
      case 'Tasks':
        return <TaskDriver driver={driver}  onDriverUpdate={handleDriverUpdate} theme={theme} closePopup={closePopup}/>;
      case 'Notes':
        return <NoteDriver driver={driver}  onDriverUpdate={handleDriverUpdate} theme={theme} closePopup={closePopup}/>;
      case 'Equipment':
        return <EquipmentDriver driver={driver} onDriverUpdate={handleDriverUpdate} theme={theme} closePopup={closePopup}/>;
      default:
        return null;
    }
  };

  const isDarkMode = theme === 'dark';
  const { refreshDrivers } = useDrivers();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  
  const handleCrope = () => {
  
    setImageSrc(null);
  };
  console.log(imageSrc)
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.addEventListener('load', () => setImageSrc(reader.result));
    reader.readAsDataURL(file);
  }, []);
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});
  const handleCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
    refreshDrivers()
  };

  const handleCrop = async () => {
    try {
        const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
        const croppedFile = new File([croppedBlob], `croppedImage_${Date.now()}.jpg`, { type: "image/jpeg" });
  
        const formData = new FormData();
        formData.append('picture', croppedFile);
  
        const updateDriverEndpoint = `${import.meta.env.VITE_BACKEND_URL}/drivers/${driver._id}`;
        console.log("Sending fetch request to update driver...");
        const response = await fetch(updateDriverEndpoint, {
            method: 'PATCH',
            body: formData,
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
  
        if (!response.ok) {
            throw new Error('Something went wrong with the image upload');
        }
  
        const updatedDriver = await response.json();
        // Append a timestamp to the image URL to force refresh and bypass cache
        if (updatedDriver.picture) {
          updatedDriver.picture += `?t=${new Date().getTime()}`;
        }
     
        setDriver(updatedDriver);
        setIsModalVisible(false);
        refreshDrivers()
        console.log("Fetch request sent. Response status: ", response.status);
    } catch (error) {
        console.error("Error updating driver picture:", error);
    }
  };
  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50`}>
      <Card
        className={`rounded-lg shadow-lg max-w-4xl w-full h-[92vh] flex flex-col ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}
      >
        <div className={`flex justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div >
           
        <div className='cargenstatusd'>
            <div className='dd-picture-container' onClick={() => setIsModalVisible(true)}>
                {driver.picture ? (
                    <img src={`${import.meta.env.VITE_BACKEND_URL}/uploads/${driver.picture}`} alt={`${driver.firstName} ${driver.lastName}`} className="dd-driver-img"/>
                ) : <img src={nopic} alt='No picture available' className="dd-driver-img dd-no-pic"/>
                }
            </div>

            {isModalVisible && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-tl-lg rounded-bl-lg rounded-tr-none rounded-br-none shadow-lg w-full max-w-md mx-0 relative min-h-[400px] flex flex-col justify-between items-center">
              <div className="flex justify-start items-start text-left">

                  <h3 className="text-md  font-semibold text-gray-800 mb-6 text-red-900">Change Profile Picture</h3>
                  
                  </div>
                  {!imageSrc && (
                    <div {...getRootProps()} className="border-2 bg-red-100 border-blue-600 p-6 w-[250px] h-[250px] rounded-full text-center flex items-center justify-center transition duration-300 hover:bg-blue-50 cursor-pointer">
                      <input {...getInputProps()} />
                      {isDragActive ? (
                        <p className="text-lg font-semibold text-blue-600 animate-pulse">Drop the files here...</p>
                      ) : (
                        <div className="flex flex-col items-center">
                          <CloudUploadOutlined className="text-gray-600 text-3xl mb-2" />
                          <p className="text-md font-semibold text-gray-600 ">Drag and drop the profile picture here</p>
                        </div>
                      )}
                      
                    </div>
                  )}
                  {imageSrc && (
                    <div className="relative w-full h-80 mb-4 rounded-lg animate-slide-in-bottom">
                      <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onCropComplete={handleCropComplete}
                        onZoomChange={setZoom}
                        cropShape={'round'}
                        showGrid={false}
                      />
                    </div>
                  )}
                  {imageSrc && (
                    <button
                      type="button"
                      className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
                      onClick={handleCrop}
                    >
                      Use this photo
                    </button>
                    
                  )}
                  {imageSrc && (
                    <button
                      type="button"
                      className="w-full bg-blue-500 text-white py-2 mt-3 rounded-md hover:bg-blue-600 transition"
                      onClick={handleCrope}
                    >
                      Upload another photo
                    </button>
                    
                  )}

                  <button
                    className="w-full bg-gray-500 text-white py-2 rounded-md mt-3 hover:bg-gray-600 transition"
                    onClick={() => setIsModalVisible(false)}
                  >
                    Cancel
                  </button>
                </div>
                <div>
                <img
                  src={
                    driver.picture
                      ? `${import.meta.env.VITE_BACKEND_URL}/uploads/${driver.picture}`
                      : nopic
                  }
                  alt={
                    driver.picture
                      ? `${driver.firstName} ${driver.lastName}`
                      : 'No picture available'
                  }
                  className="h-[400px] w-[400px] rounded-tr-lg rounded-br-lg rounded-tl-none rounded-bl-none"
                />
            </div>

              </div>
            )}



            <div className='statusnamenearpic'>
              <div>
            <h2 className=''>{driver.firstName} - {driver.lastName}</h2>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{
                display: 'inline-block',
                width: '15px',
                height: '15px',
                fontWeight: 300,
                borderRadius:"25px",
                marginLeft:"-0px",
                backgroundColor: stateColors[driver.status] || '#000000',
                marginRight: '8px', // Adds some space between the square and the text
              }}></span>
              <h2 className='statusfinali' style={{ color: stateColors[driver.status] || '#000000', display: 'inline',marginLeft:"-2px", }}>{driver.status}</h2>
            </div>
            </div>
            </div>
          </div>

           
          </div>
          <Button flat auto rounded color="warning" onClick={closePopup}>
            Close
          </Button>
        </div>
        <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <nav className="flex justify-center space-x-8 sticky top-0 z-10">
            {['General', 'Vehicles', 'Invoices', 'Tasks', 'Notes', 'Equipment'].map(tab => (
              <button
                key={tab}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-300 ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : `${isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        <CardBody className="overflow-y-auto scrollbar-hide flex-grow">
          <div className="mt-4">
            {renderTabContent()}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default GetDrivers;
