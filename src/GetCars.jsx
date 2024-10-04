import React, { useState,useEffect } from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import GeneralCar from './carscomponents/GeneralCar';
import DriversOfCar from './carscomponents/DriversOfCar';
import InvoicesCar from './carscomponents/InvoicesCar';
import NoteCar from './carscomponents/NoteCar';

import TaskCar from './carscomponents/TaskCar';
import EquipmentCar from './carscomponents/EquipmentCar';
import {EnvironmentOutlined,CompassOutlined,CarTwoTone,IdcardTwoTone} from '@ant-design/icons'

function GetCars({ car: initialCar, closePopup, theme }) {
  const [activeTab, setActiveTab] = useState('General');
  const [car, setCar] = useState(initialCar);
  const handleCarUpdate = (updatedCar) => {
    setCar(updatedCar);
  };

  useEffect(() => {
    setCar(initialCar); // Update local state when the initialCar prop changes
  }, [initialCar]);
  const renderTabContent = () => {
    switch (activeTab) {
      case 'General':
        return <GeneralCar car={car} onCarUpdate={handleCarUpdate} closePopup={closePopup} theme={theme} />;
      case 'Drivers':
        return <DriversOfCar drivers={car.drivers} car={car} onCarUpdate={handleCarUpdate} theme={theme} closePopup={closePopup}/>;
      case 'Invoices':
        return <InvoicesCar invoices={car.invoices} car={car} onCarUpdate={handleCarUpdate} theme={theme} />;
      case 'Tasks':
        return <TaskCar tasks={car.tasks} car={car} onCarUpdate={handleCarUpdate} theme={theme}/>;
      case 'Notes':
        return <NoteCar notes={car.notes} car={car} onCarUpdate={handleCarUpdate} theme={theme}/>;
      case 'Equipment':
        return <EquipmentCar equipment={car.equipment} car={car} onCarUpdate={handleCarUpdate} theme={theme} />;
      default:
        return null;
    }
  };

  const isDarkMode = theme === 'dark';

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50`}>
      <Card
        className={`rounded-lg shadow-lg max-w-4xl w-full h-[92vh] flex flex-col ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}
      >
        <div className={`flex justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div >
            <h2 className="text-xl font-semibold"><CarTwoTone  /> {car.general?.internalName} <IdcardTwoTone /> {car.general?.licensePlate}</h2>
            <p className="flex justify-start"><CompassOutlined className='mr-1' /> {car.state || 'Unknown'} <EnvironmentOutlined className='mr-1 ml-1'/> {car.area || 'No Area'}</p>
           
          </div>
          <Button flat auto rounded color="warning" onClick={closePopup}>
            Close
          </Button>
        </div>
        <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <nav className="flex justify-center space-x-8 sticky top-0 z-10">
            {['General', 'Drivers', 'Invoices', 'Tasks', 'Notes', 'Equipment'].map(tab => (
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

export default GetCars;
