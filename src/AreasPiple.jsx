import React,{useState} from 'react';
import { Card, CardBody, Button } from "@nextui-org/react";
import "./Areas.css";
import {Chip} from "@nextui-org/react";
import GetCars from './GetCars';
import { useCars } from './CarDriver';
import { DeleteIcon } from "./carscomponents/DeleteIcon"; // Import DeleteIcon
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
function AreasPiple({ cars,theme, areas, deleteEquipment,isDarkMode }) {
 console.log(theme)
  const getCarsByArea = (areaName) => {
    return cars.filter((car) => car.area === areaName);
  };
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  console.log(isDarkMode)
  const { refreshCars } = useCars();
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialog2, setOpenDialog2] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  // Function to handle when the car is dropped into a new area
  const handleSaveClick = async (carId, newArea) => {
    const updateData = { area: newArea };
    const token = localStorage.getItem('userToken');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cars/${carId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update the car');
      }

      const updatedCar = await response.json();
      refreshCars(); // Refresh cars after update

      console.log('Car updated successfully!');
    } catch (error) {
      console.error('Error updating car:', error);
    }
  };

  const handleDeleteCarArea = async (carId) => {
    const updateData = { area: null };
    const token = localStorage.getItem('userToken');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cars/${carId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update the car');
      }

      const updatedCar = await response.json();
      refreshCars(); // Refresh cars after update

      console.log('Car area removed successfully!');
    } catch (error) {
      console.error('Error removing car area:', error);
    }
  };

  // Function to handle drag start
  const handleDragStart = (event, car) => {
    event.dataTransfer.setData("carId", car._id);
  };

  // Function to handle drop on the area
  const handleDrop = (event, areaName) => {
    event.preventDefault();
    const carId = event.dataTransfer.getData("carId");
    handleSaveClick(carId, areaName); // Update the car's area when dropped
  };

  // Allow drop by preventing default behavior
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Function to handle delete click for an area
  const handleDeleteClick = (areaId) => {
    if (window.confirm('Are you sure you want to delete this area?')) {
      deleteEquipment(areaId);
    }
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
   
  };
  const handleCloseDialog2 = () => {
    setOpenDialog2(false);
   
  };
 
  const handleCarPictureClick = (event, car) => {
    event.stopPropagation();
    setSelectedCar(car);
  };
  return (
    <div>
      <div className={`flex pb-3 justify-between ml-3 mr-3 `}>

        <div className='flex flex-col'>
          <Button color="primary" variant="flat" className='mb-2'>Vehicles without area</Button>
          <div className="pipelinearea shadow border-slate-300 h-[560px]"    style={{ backgroundColor: isDarkMode ? '#47515E' : 'white' }}>
     
      <div className="carsarea flex flex-wrap gap-4" >
        {cars
          .filter(car => !car.area || car.area.trim() === "") // Filters both null and empty string values
          .map((car) => (
            <Card
              key={car._id}
              className="car-itemarea"
              isPressable
              isDraggable
              draggable
              onDragStart={(event) => handleDragStart(event, car)}
            >
              <CardBody className="car-card-body">
                <div className="car-info">
                  {car.general.internalName || 'No Name'}
                </div>
              </CardBody>
            </Card>
          ))}
      </div>
          </div>
        </div>
        <div className='flex flex-col justify-items-center ml-3'>
        <Button color="success" variant="flat" className='mb-2 '>Areas</Button>
          <div className="pipeline-containerarea">
      {areas.map((area) => {
        const carsInArea = getCarsByArea(area.areaName);  // Fetch cars for the current area

        return (
          <div
            key={area._id}
            className="pipelinearea shadow border-slate-300 overflow-hidden flex "
            style={{ backgroundColor: isDarkMode ? '#47515E' : 'white' }}
            onDrop={(event) => handleDrop(event, area.areaName)}
            onDragOver={handleDragOver}
          >
            <Chip
                       variant="flat"

           
              color="secondary"
              size="lg"
              className="area-header pt-2 relative dark h-[45px] mb-1"
            >
              <div className='rounded-md text-sm p-2 pt-2 mb-3 w-[250px] h-[50px]'>
                {/* Display the area name and number of cars */}
                <h2 className='text-gray-900 flex'>
                  <h2 className={`font-bold mr-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{area.areaName}</h2> ({carsInArea.length} {carsInArea.length === 1 ? 'vehicle' : 'vehicles'})
                </h2>
                <h2 className='text-xs text-gray-500'>{area.areaLocation}</h2>
              </div>
              
              {/* Delete Icon for the area */}
              <DeleteIcon
                className="absolute top-3 right-2"
                style={{ cursor: 'pointer', width: '22px', height: '22px', color: 'red' }}
                onClick={() => {
                  setSelectedAreaId(area._id);  // Set the selected area ID
                  setOpenDialog(true);  // Open modal
                }} 
              />
            </Chip>

            {/* Scrollable cars area only if there are more than 6 cars */}
            <div
              className={`carsarea p-2 ml-0 overflow-y-scroll scrollbar-hidden ${carsInArea.length > 6 ? 'scrollable' : ''}`}
              style={{
                maxHeight: carsInArea.length > 6 ? '250px' : 'auto',
                overflowY: carsInArea.length > 6 ? 'scroll' : 'visible',
              }}
            >
           {carsInArea.length > 0 ? (
  carsInArea.map((car) => (
    <div key={car._id} className="relative">
      {/* Delete Icon */}
      <DeleteIcon
        className="absolute top-[5px] right-[5px] z-40"
        style={{ cursor: 'pointer', width: '17px', height: '17px', color: 'red' }}
        onClick={() => {
          setSelectedCarId(car._id); // Set the selected car ID
          setOpenDialog2(true); // Open the second modal
        }}
      />

      {/* Card */}
      <Card
        className={`car-itemarea flex ${isDarkMode ? 'dark' : ''}`}
        isPressable
        isDraggable
        draggable
        onDragStart={(event) => handleDragStart(event, car)}
        onClick={(event) => handleCarPictureClick(event, car)}
      >
        <CardBody>
          <div className="flex justify-center" style={{ alignItems: 'center' }}>
            <div className="w-[80px]">
              {car.general.internalName || 'No Name'}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  ))
) : (
  <p className="text-gray-200">No vehicle in this area</p>
)}

            </div>
          </div>
        );
      })}
          </div>
        </div>


      </div>

    <Modal isOpen={openDialog} onClose={handleCloseDialog} className={` ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}>
    <ModalContent>
        {(onClose) => (
            <>
                <ModalHeader className="flex flex-col gap-1">Confirm Deletion</ModalHeader>
                <ModalBody>
                    <p>Are you sure you want to delete this area?</p>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" variant="light" onPress={handleCloseDialog}>
                        Cancel
                    </Button>
                    <Button 
                  color="danger" 
                  onPress={() => {
                    deleteEquipment(selectedAreaId);  // Use selected area ID
                    handleCloseDialog();
                  }}
                >
                  Delete
                </Button>


                </ModalFooter>
            </>
        )}
    </ModalContent>
    </Modal>
    <Modal isOpen={openDialog2} onClose={handleCloseDialog2} className={` ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}>
        <ModalContent>
            {(onClose) => (
                <>
                    <ModalHeader className="flex flex-col gap-1">Confirm Deletion</ModalHeader>
                    <ModalBody>
                        <p>Are you sure you want to delete this vehicle from this area?</p>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" variant="light" onPress={handleCloseDialog2}>
                            Cancel
                        </Button>
                        <Button 
                        color="danger" 
                        onPress={() => {
                          handleDeleteCarArea(selectedCarId);  // Use selected car ID
                          handleCloseDialog2();  // Close the modal after deleting the car
                        }}
                      >
                        Delete
                      </Button>



                    </ModalFooter>
                </>
            )}
        </ModalContent>
    </Modal>
    {selectedCar && (
      <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedCar(null)}>
        <div onClick={(e) => e.stopPropagation()}>
          <GetCars car={selectedCar} theme={theme} closePopup={() => setSelectedCar(null)} />
        </div>
      </div>
    )}
    </div>
    
  );
}

export default AreasPiple;
