import React from 'react';
import { useCars, useDrivers } from './CarDriver';
import FleetOverview from './FleetOverview';

const FleetOverviewWrapper = (props) => {
  const { theme, lan } = props; // Correctly extract props
  const { cars } = useCars();
  const { drivers } = useDrivers();
  console.log("Theme:", theme); // Logs the theme value
  console.log("Lanyyyy:", lan); // Logs the lan value
  return <FleetOverview cars={cars} lan={lan} theme={theme} drivers={drivers} />;
};

export default FleetOverviewWrapper;
