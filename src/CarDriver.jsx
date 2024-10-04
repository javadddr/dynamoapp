import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CarDriverContext = createContext();

export const useCars = () => {
  const context = useContext(CarDriverContext);
  if (!context) {
    throw new Error('useCars must be used within a CarDriverProvider');
  }
  return context.carsContext;
};

export const useDrivers = () => {
  const context = useContext(CarDriverContext);
  if (!context) {
    throw new Error('useDrivers must be used within a CarDriverProvider');
  }
  return context.driversContext;
};

export const CarDriverProvider = ({ children }) => {
  const [cars, setCars] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const refreshCars = useCallback(async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cars`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCars(data);
        return data;
      } else {
        throw new Error(`Error fetching cars: ${response.statusText}`);
      }
    } catch (error) {
      console.error(error);
      // Handle the error
    }
  }, []);

  const refreshDrivers = useCallback(async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/drivers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const fetchedDrivers = await response.json();
        setDrivers(fetchedDrivers);
      } else {
        throw new Error(`Error fetching drivers: ${response.statusText}`);
      }
    } catch (error) {
      console.error(error);
      // Handle the error
    }
  }, []);

  const updateCarStatusInContext = useCallback((carId, newStatus) => {
    const updatedCars = cars.map(car => {
      if (car._id === carId) {
        return { ...car, state: newStatus };
      }
      return car;
    });
    setCars(updatedCars);
  }, [cars]);
 
  const updateDriverStatusInContext = useCallback((driverId, newStatus) => {
    const updatedDrivers = drivers.map(driver => {
      if (driver._id === driverId) {
        return { ...driver, status: newStatus };
      }
      return driver;
    });
    setDrivers(updatedDrivers); // Use setDrivers here
  }, [drivers]);
  

  useEffect(() => {
    refreshCars();
    refreshDrivers();
  }, [refreshCars, refreshDrivers]);

  const carsContext = {
    cars,
    refreshCars,
    updateCarStatusInContext
  };

  const driversContext = {
    drivers,
    refreshDrivers,
    updateDriverStatusInContext
  };

  return (
    <CarDriverContext.Provider value={{ carsContext, driversContext }}>
      {children}
    </CarDriverContext.Provider>
  );
};
