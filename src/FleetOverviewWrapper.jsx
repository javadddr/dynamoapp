import React from 'react';
import { useCars, useDrivers } from './CarDriver';
import FleetOverview from './FleetOverview';

const FleetOverviewWrapper = (theme) => {
  const { cars } = useCars();
  const { drivers } = useDrivers();

  return <FleetOverview cars={cars} theme={theme} drivers={drivers} />;
};

export default FleetOverviewWrapper;
