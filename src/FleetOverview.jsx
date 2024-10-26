import React,{useState,useEffect} from 'react'
import "./FleetOverview.css"
import Piei from './Piei';
import LiniTwoSec from './LiniTwoSec';

import Tablei from './Tablei';

import TwoBar from './TwoBar';
import TablePic from './TablePic';
import Bari from './Bari';
import ThreeBar from './ThreeBar';
import { startOfWeek, addWeeks, format } from 'date-fns';

const FleetOverview = ({ cars, drivers,theme }) => {

  const [activeVehiclesCount, setActiveVehiclesCount] = useState(0);
  const [activeVehiclesCount2, setActiveVehiclesCount2] = useState(0);
  const activepercar=((activeVehiclesCount/cars.length)*100).toFixed(0)
  const activeperdriver=((activeVehiclesCount2/drivers.length)*100).toFixed(0)
  const [statusCounts, setStatusCounts] = useState({});
  const [statusCounts2, setStatusCounts2] = useState({});
  const [licenseCheckStatusCounts, setLicenseCheckStatusCounts] = useState({});
  const [licenseCheckStatusCounts2, setLicenseCheckStatusCounts2] = useState({})
  const [chartData1, setChartData1] = useState([]);
  const [fines, setFines] = useState([]);
  const [chartDataPie, setChartDataPie] = useState([]);
  const [equipmentData, setEquipmentData] = useState([]);
  const [areasPerformance, setAreasPerformance] = useState([]);

  useEffect(() => {
    const vehicleStatusCounts = cars.reduce((acc, car) => {
      const { state } = car;
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {});
    setStatusCounts(vehicleStatusCounts);

    const licenseStatusCounts = cars.reduce((acc, car) => {
      // Iterate over each car's license checks
      car.carLicenseCheck.forEach(check => {
        // Check if the statuses array is not empty
        if (check.statuses.length > 0) {
          // Get the most recent status (assuming the last status in the array is the most recent one)
          const mostRecentStatus = check.statuses[check.statuses.length - 1].status;
          // Increment the count for this status in the accumulator object
          acc[mostRecentStatus] = (acc[mostRecentStatus] || 0) + 1;
        }
      });
      return acc;
    }, {});
    
    
    setLicenseCheckStatusCounts(licenseStatusCounts);
    setActiveVehiclesCount(vehicleStatusCounts['Active'] || 0);
  }, [cars]);
  useEffect(() => {
    const driverStatusCounts = drivers.reduce((acc, driver) => {
      const { status } = driver;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    setStatusCounts2(driverStatusCounts);
   
    const licenseStatusCounts = drivers.reduce((acc, driver) => {
      // Iterate over each driver's license checks
      driver.driverLicenseCheck.forEach(check => {
        // Check if the statuses array is not empty
        if (check.statuses.length > 0) {
          // Get the most recent status (assuming the last status in the array is the most recent one)
          const mostRecentStatus = check.statuses[check.statuses.length - 1].status;
          // Increment the count for this status in the accumulator object
          acc[mostRecentStatus] = (acc[mostRecentStatus] || 0) + 1;
        }
      });
      return acc;
    }, {});
    
    setLicenseCheckStatusCounts2(licenseStatusCounts);
    setActiveVehiclesCount2(driverStatusCounts['Active'] || 0);
  }, [drivers]);

  useEffect(() => {
    const extractDate = (dateStr) => dateStr ? dateStr.slice(0, 10) : null;

    const carDates = cars.map(car => extractDate(car.general?.activeInFleetSinceDate) || extractDate(car.createdAt));
    const driverDates = drivers.map(driver => extractDate(driver.startDate) || extractDate(driver.createdAt));
    
    const allDates = Array.from(new Set([...carDates, ...driverDates])).filter(Boolean).sort();

    const dailyData = allDates.reduce((acc, date) => {
      acc[date] = { Drivers: 0, Vehicles: 0 };
      return acc;
    }, {});

    cars.forEach(car => {
      const date = extractDate(car.general?.activeInFleetSinceDate) || extractDate(car.createdAt);
      if (date) dailyData[date].Vehicles++;
    });

    drivers.forEach(driver => {
      const date = extractDate(driver.startDate) || extractDate(driver.createdAt);
      if (date) dailyData[date].Drivers++;
    });

    let cumulativeDrivers = 0;
    let cumulativeVehicles = 0;

    const formattedData = allDates.map(date => {
      cumulativeDrivers += dailyData[date].Drivers;
      cumulativeVehicles += dailyData[date].Vehicles;
      const driverRatio = cumulativeVehicles === 0 ? 0 : cumulativeDrivers / cumulativeVehicles;

      return {
        date,
        Driver: cumulativeDrivers,
        Vehicles: cumulativeVehicles,
        DriverRation: driverRatio.toFixed(1)
      };
    });

    // Add current date if not present
    const currentDate = new Date().toISOString().slice(0, 10);
    if (formattedData.length === 0 || formattedData[formattedData.length - 1].date !== currentDate) {
      const lastData = formattedData.length > 0 ? formattedData[formattedData.length - 1] : { Driver: 0, Vehicles: 0 };
      formattedData.push({
        date: currentDate,
        Driver: lastData.Driver,
        Vehicles: lastData.Vehicles,
        DriverRation: (lastData.Driver / lastData.Vehicles).toFixed(1)
      });
    }

    setChartData1(formattedData);
  }, [cars, drivers]);
  
///////pie

const [statusDurationSumCars, setStatusDurationSumCars] = useState({});
useEffect(() => {
  const fetchStatusRecordsForAllCars = async () => {
    const token = localStorage.getItem('userToken');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/carStatusRecords/statusByCreator`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch status records for cars');
      }

      const allStatusRecords = await response.json();
    
      let statusDurationSum = {};
      const currentDate = new Date();

      allStatusRecords.forEach((record) => {
        const startDate = new Date(record.from);
        const endDate = record.to ? new Date(record.to) : currentDate;
        const durationDays = (endDate - startDate) / (1000 * 60 * 60 * 24);

        if (!statusDurationSum[record.status]) {
          statusDurationSum[record.status] = 0;
        }
        statusDurationSum[record.status] += Math.round(durationDays);
      });

      const summarizedStatuses = Object.entries(statusDurationSum).map(([label, value]) => ({
        label,
        value,
      }));

      setStatusDurationSumCars(summarizedStatuses);

      const totalValue = summarizedStatuses.reduce((sum, { value }) => sum + value, 0);
      const pieData = summarizedStatuses.map(({ label, value }) => ({
        browser: label,
        visitors: Number(((value / totalValue) * 100).toFixed(1)),
        fill: `var(--color-${label.replace(/\s+/g, '')})`,
      }));

      setChartDataPie(pieData);
     
    } catch (error) {
      console.error('Error fetching status records for cars:', error);
    }
  };

  fetchStatusRecordsForAllCars();
}, [cars]);
const chartConfig = {
  visitors: {
    label: "Status",
  },
  Active: {
    label: "Active",
    color: "hsl(var(--chart-2))",
  },
  Inactive: {
    label: "Inactive",
    color: "hsl(var(--chart-1))",
  },
  Incoming: {
    label: "Incoming",
    color: "hsl(var(--chart-3))",
  },
  Outgoing: {
    label: "Outgoing",
    color: "hsl(var(--chart-4))",
  },
  Transferring: {
    label: "Transferring",
    color: "hsl(var(--chart-5))",
  },
  Repairing: {
    label: "Repairing",
    color: "#d0a9a4",
  },
  "NoDriver": {
    label: "No Driver",
    color: "#c7c7ff",
  },
};
const title1="Status of the Vehicles (%)"
const title2="Status of the Drivers (%)"

////PIE 2
const [chartDataPieDrivers, setChartDataPieDrivers] = useState([]);
const [statusDurationSum, setStatusDurationSum] = useState([]);
const [statusDuringTimeForDrivers, setStatusDuringTimeForDrivers] = useState([]);
const [loadingDrivers, setLoadingDrivers] = useState(false);


useEffect(() => {
  setLoadingDrivers(true);

  const fetchStatusRecordsForAllDrivers = async () => {
    const token = localStorage.getItem('userToken');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/statusRecords/statusByCreator`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch status records for drivers');
      }

      const statusRecords = await response.json();

      // First part: Calculate the summarized status durations
      let statusDurationSum = {}; // To hold the sum of days for each status
      const currentDate = new Date();

      statusRecords.forEach(record => {
        const startDate = new Date(record.from);
        const endDate = record.to ? new Date(record.to) : currentDate; // Use 'to' date if available, else use current date
        const durationDays = (endDate - startDate) / (1000 * 60 * 60 * 24);

        if (!statusDurationSum[record.status]) {
          statusDurationSum[record.status] = 0;
        }
        statusDurationSum[record.status] += Math.round(durationDays);
      });

      const summarizedStatuses = Object.entries(statusDurationSum).map(([label, value]) => ({
        label,
        value
      }));

      setStatusDurationSum(summarizedStatuses); // Keep this for wherever you're using it

      // Calculate the data for the pie chart
      const totalValue = summarizedStatuses.reduce((sum, { value }) => sum + value, 0);
      const pieData = summarizedStatuses.map(({ label, value }) => ({
        browser: label,
        visitors: Number(((value / totalValue) * 100).toFixed(1)),
        fill: `var(--color-${label.replace(/\s+/g, '')})`,
      }));

      setChartDataPieDrivers(pieData); // Set the pie chart data for drivers

      // Second part: Detailed weekly breakdown for visualization
      const statusCategories = ['Active', 'Inactive', 'Sick', 'Holiday', 'Over Hours', 'Work Accident']; // Your driver status categories
      const weeklyStatusDurations = new Map(); // To track durations per week

      statusRecords.forEach(record => {
        const startDate = new Date(record.from);
        const endDate = record.to ? new Date(record.to) : new Date(); // Current date if 'to' is not available
        const durationDays = (endDate - startDate) / (1000 * 60 * 60 * 24); // Convert milliseconds to days

        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
          const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Get the start of the week (Monday)
          const weekKey = format(weekStart, 'yyyy-MM-dd'); // Format as YYYY-MM-DD

          if (!weeklyStatusDurations.has(weekKey)) {
            weeklyStatusDurations.set(weekKey, { totalDays: 0, counts: Array(statusCategories.length).fill(0) });
          }

          const statusIndex = statusCategories.indexOf(record.status);

          if (statusIndex !== -1) {
            const weekData = weeklyStatusDurations.get(weekKey);
            weekData.totalDays += 1;
            weekData.counts[statusIndex] += 1;
            weeklyStatusDurations.set(weekKey, weekData);
          }
        }
      });

      // Convert the Map to an array and sort by date
      const weeklyData = Array.from(weeklyStatusDurations)
        .map(([date, { totalDays, counts }]) => ({
          date,
          labels: statusCategories,
          values: counts.map(count => totalDays > 0 ? parseFloat(((count / totalDays) * 100).toFixed(0)) : 0)
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date

      setStatusDuringTimeForDrivers(weeklyData); // New state for weekly breakdown data

    } catch (error) {
      console.error("Error fetching status records for drivers:", error);
    } finally {
      setLoadingDrivers(false);
    }
  };

  fetchStatusRecordsForAllDrivers();
}, [drivers]);



const chartConfigo = {
  visitors: {
    label: "Status",
  },
  Active: {
    label: "Active",
    color: "hsl(var(--chart-2))",
  },
  Inactive: {
    label: "Inactive",
    color: "hsl(var(--chart-1))",
  },
  Sick: {
    label: "Sick",
    color: "hsl(var(--chart-3))",
  },
  Holiday: {
    label: "Holiday",
    color: "hsl(var(--chart-4))",
  },
  OverHours: {
    label: "Over Hours",
    color: "hsl(var(--chart-5))",
  },
  WorkAccident: {
    label: "Work Accident",
    color: "#d0a9a4",
  },
  
};
/////equip
const processEquipmentData = (cars, drivers) => {
  const carEquipment = cars.flatMap(car => 
    car.equipment.carEquipment.map(item => ({
      type: 'For Vehicles',
      item: item.item,
      quantity: item.quantity,
      cost: item.cost
    })).concat(
      car.equipment.workEquipment.map(item => ({
        type: 'For Working',
        item: item.item,
        quantity: item.quantity,
        cost: item.cost
      }))
    )
  );

  const driverEquipment = drivers.flatMap(driver =>
    driver.equipments.clothing.map(item => {
      const matchingEquipment = allEquipments.find(eq => eq.name === item.item);
      return {
        type: 'Driver Clothing',
        item: item.item,
        quantity: item.quantity,
        cost: matchingEquipment ? matchingEquipment.costPerUnit : 0 // Default to 0 if no match
      };
    }).concat(
      driver.equipments.other.map(item => {
        const matchingEquipment = allEquipments.find(eq => eq.name === item.item);
       
        return {
          type: 'For Drivers',
          item: item.item,
          quantity: item.quantity,
          cost: matchingEquipment ? matchingEquipment.costPerUnit : 0 // Default to 0 if no match
          
        };
      
      })
      
    )
    
  );
  

  const combinedEquipment = [...carEquipment, ...driverEquipment];

  const aggregatedEquipment = combinedEquipment.reduce((acc, curr) => {
    const existingItem = acc.find(item => item.type === curr.type && item.item === curr.item);
    if (existingItem) {
      existingItem.quantity += curr.quantity;
      existingItem.cost += curr.cost;
    } else {
      acc.push({ ...curr });
    }
    return acc;
  }, []);

  // Add keys starting from 1
  const equipmentWithKeys = aggregatedEquipment.map((item, index) => ({
    key: index + 1,
    ...item
  }));

  return equipmentWithKeys;
};

useEffect(() => {
  const equipment = processEquipmentData(cars, drivers);
  setEquipmentData(equipment);
}, [cars, drivers]);

/////line dy


/////twobar
const chartConfigp = {
  views: {
    label: "Status",
  },
  Active: {
    label: "Active",
    color: "hsl(var(--chart-1))",
  },
  Inactive: {
    label: "Inactive",
    color: "hsl(var(--chart-2))",
  },
  Sick: {
    label: "Sick",
    color: "hsl(var(--chart-3))",
  },
  Holiday: {
    label: "Holiday",
    color: "hsl(var(--chart-4))",
  },
  'Over Hours': {
    label: "Over Hours",
    color: "hsl(var(--chart-5))",
  },
  'Work Accident': {
    label: "Work Accident",
    color: "blue",
  },
};
const labels = ["Active", "Inactive", "Sick", "Holiday", "Over Hours", "Work Accident"];


////secound two bar
const [statusDuringTimeForCars, setStatusDuringTimeForCars] = useState([]);


const labelso = ["Active", "Inactive", "Incoming", "Outgoing", "Transferring", "Repairing", "No Driver"];

useEffect(() => {


  const fetchStatusRecordsForAllCars = async () => {
    const token = localStorage.getItem('userToken');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/carStatusRecords/statusByCreator`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch status records for cars');
      }

      const statusRecords = await response.json();

      // First part: Calculate the summarized status durations
      let statusDurationSum = {}; // To hold the sum of days for each status
      const currentDate = new Date();

      statusRecords.forEach(record => {
        const startDate = new Date(record.from);
        const endDate = record.to ? new Date(record.to) : currentDate; // Use 'to' date if available, else use current date
        const durationDays = (endDate - startDate) / (1000 * 60 * 60 * 24);

        if (!statusDurationSum[record.status]) {
          statusDurationSum[record.status] = 0;
        }
        statusDurationSum[record.status] += Math.round(durationDays);
      });

      const summarizedStatuses = Object.entries(statusDurationSum).map(([label, value]) => ({
        label,
        value
      }));

      setStatusDurationSum(summarizedStatuses); // Keep this for wherever you're using it

      // Calculate the data for the pie chart
      const totalValue = summarizedStatuses.reduce((sum, { value }) => sum + value, 0);
      const pieData = summarizedStatuses.map(({ label, value }) => ({
        browser: label,
        visitors: Number(((value / totalValue) * 100).toFixed(1)),
        fill: `var(--color-${label.replace(/\s+/g, '')})`,
      }));

     

      // Second part: Detailed weekly breakdown for visualization
      const statusCategories = ['Active', 'Inactive', 'Incoming', 'Outgoing', 'Transferring', 'Repairing', 'No Driver']; // Your car status categories
      const weeklyStatusDurations = new Map(); // To track durations per week

      statusRecords.forEach(record => {
        const startDate = new Date(record.from);
        const endDate = record.to ? new Date(record.to) : new Date(); // Current date if 'to' is not available
        const durationDays = (endDate - startDate) / (1000 * 60 * 60 * 24); // Convert milliseconds to days

        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
          const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Get the start of the week (Monday)
          const weekKey = format(weekStart, 'yyyy-MM-dd'); // Format as YYYY-MM-DD

          if (!weeklyStatusDurations.has(weekKey)) {
            weeklyStatusDurations.set(weekKey, { totalDays: 0, counts: Array(statusCategories.length).fill(0) });
          }

          const statusIndex = statusCategories.indexOf(record.status);

          if (statusIndex !== -1) {
            const weekData = weeklyStatusDurations.get(weekKey);
            weekData.totalDays += 1;
            weekData.counts[statusIndex] += 1;
            weeklyStatusDurations.set(weekKey, weekData);
          }
        }
      });

      // Convert the Map to an array and sort by date
      const weeklyData = Array.from(weeklyStatusDurations)
        .map(([date, { totalDays, counts }]) => ({
          date,
          labels: statusCategories,
          values: counts.map(count => totalDays > 0 ? parseFloat(((count / totalDays) * 100).toFixed(0)) : 0)
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date

      setStatusDuringTimeForCars(weeklyData); // New state for weekly breakdown data

    } catch (error) {
      console.error("Error fetching status records for cars:", error);
    } finally {

    }
  };

  fetchStatusRecordsForAllCars();
}, [cars]);



const chartConfigw = {
  views: {
    label: "Status",
  },
  Active: {
    label: "Active",
    color: "hsl(var(--chart-1))",
  },
  Inactive: {
    label: "Inactive",
    color: "hsl(var(--chart-2))",
  },
  Incoming: {
    label: "Incoming",
    color: "hsl(var(--chart-3))",
  },
  Outgoing: {
    label: "Outgoing",
    color: "hsl(var(--chart-4))",
  },
  Transferring: {
    label: "Transferring",
    color: "hsl(var(--chart-5))",
  },
  Repairing: {
    label: "Repairing",
    color: "#D0A9A4",
  },
  'No Driver': {
    label: "No Driver",
    color: "blue",
  },
};

///table eq
const [rows, setRows] = useState([]);
useEffect(() => {
  const calculatedRows = drivers.map((driver, index) => {
    const equipmentCost = driver.equipments.clothing.reduce((acc, item) => acc + item.cost, 0) + 
                           driver.equipments.other.reduce((acc, item) => acc + item.cost, 0);

    const invoiceAmount = driver.invoices.reduce((acc, invoice) => acc + invoice.amount, 0);
  
    // Calculate the total cost by adding equipmentCost and invoiceAmount
    const totalCost = (equipmentCost || 0) + (invoiceAmount || 0);



    
    return {
      id: index + 1,
      firstName: driver.firstName,
      lastName: driver.lastName,
      "Total cost": totalCost,
      value: { Equipments_Cost: equipmentCost || 0, Invoices: invoiceAmount || 0 },
      tag: driver.status,
      pic: driver.picture
    };
  });

  setRows(calculatedRows);
}, [drivers]);

const colorsta = {
  Active: 'hsl(var(--chart-2))',
  Inactive: '#9E9E9E',
  Sick: 'hsl(var(--chart-1))',
  Holiday: '#FF9800',
  'Over Hours': '#FFEB3B',
  'Work Accident': '#F44336',
};

////fines

  // Define the fetchFines function
  
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
  
      // Calculate the sum of costs for unique drivers and get the top 5
      const driverCosts = data.reduce((acc, fine) => {
        if (fine.driverName && fine.cost != null) {
          acc[fine.driverName] = (acc[fine.driverName] || 0) + fine.cost;
        }
        return acc;
      }, {});
  
      const topDrivers = Object.entries(driverCosts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, cost], index) => {
          // Check if the name length is more than 10 characters
          const formattedName = name.length > 10 ? `${name.substring(0, 10)}...` : name;
          return {
            name: formattedName,
            cost,

          };
        });
  
      setFines(topDrivers);
    
    } catch (error) {
      console.error('Error fetching fines:', error);
    } finally {
    
    }
    
  };
  useEffect(() => {
    fetchFines();
  
  }, []);

  const title="Top 5 Drivers with most fines"

  useEffect(() => {
    const areaData = {};
    const currentTime = new Date().getTime(); // Current time in milliseconds
  
    // Filter cars that have an area and drivers assigned
    const filteredCars = cars.filter(
      car => car.area && Array.isArray(car.drivers) && car.drivers.length > 0
    );
  

  
    // Iterate over each filtered car
    filteredCars.forEach(car => {
      const area = car.area;
      
      // Initialize area data if not already present
      if (!areaData[area]) {
        areaData[area] = { Vehicles: 0, Drivers: 0 };
      }
      
      areaData[area].Vehicles += 1;
  
      // Iterate over each driver of the car
      car.drivers.forEach(driver => {
        // Parse 'from' and 'till' dates
        const fromTime = driver.from ? new Date(driver.from).getTime() : 0;
        const tillTime = driver.till ? new Date(driver.till).getTime() : Infinity;
  
        // Only count drivers where the current time is between 'fromTime' and 'tillTime'
        if (fromTime <= currentTime && currentTime <= tillTime) {
          areaData[area].Drivers += 1;
        }
      });
    });
  
    // Convert areaData object into an array for setting the state
    const areaDataArray = Object.entries(areaData).map(([area, value]) => ({
      area,
      Vehicles: value.Vehicles,
      Drivers: value.Drivers,
    }));
  
    // Set the areasPerformance state with the structured data
    setAreasPerformance(areaDataArray);
  
  }, [cars]);
  
  //////
  const [allEquipments, setAllEquipments] = useState([]);
  console.log("allEquipments",allEquipments)
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const fetchAllEquipments = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/driverEquipments`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch equipments');
        const data = await response.json();
        setAllEquipments(data);
      
      } catch (error) {
        console.error('Error fetching equipments:', error);
      }
    };
    
    fetchAllEquipments();
  }, []);
  

  return (
    <div style={{ backgroundColor: theme.theme === 'dark' ? '#141C26' : '#f5f8fa'}}>
    <div className="mainfleeto" style={{ backgroundColor: theme.theme === 'dark' ? '#141C26' : '#f5f8fa'}}>
      <div className='maindashdd'>
          <div className="kpi-container">
          <div className="kpi w-[70%] md:w-[17%] animate-slide-up" style={{ backgroundColor: theme.theme === 'dark' ? '#020917' : '#FFFFFF' }}>

          <div style={{ borderBottom:"1px solid #9d9a9a", paddingBottom:"3px", marginBottom:"9px", color: theme.theme === 'dark' ? '#FFFFFF' : '#011e3d' }}>Vehicles</div>
          <div className="kpi-title" style={{ color: theme.theme === 'dark' ? '#F28E2C' : '#738499' }}>Total Vehicles</div>
          <div className="kpi-value" style={{ color: theme.theme === 'dark' ? '#bad030' : '#011e3d' }}>{cars.length}</div>
          <div className="kpi-title" style={{ color: theme.theme === 'dark' ? '#F28E2C' : '#738499' }}>Active Vehicles</div>
          <div className="kpi-value" style={{ color: theme.theme === 'dark' ? '#bad030' : '#011e3d' }}>{activeVehiclesCount}</div>
          <div className="kpi-subtext"><span style={{ color: "#27ce88", backgroundColor: theme.theme === 'dark' ? '#020917' : '#e1faee', width: "100%", textAlign: "center", padding: "5px", borderRadius: "5px" }}>  {isNaN(activepercar) ? 0 : activepercar}% Active</span></div>
          <div className="greenSquarey"></div>
          <div className="greenSquare2y"></div>
            </div>
            <div className="kpi w-[90%] md:w-[32%] animate-slide-up delay-400" style={{ backgroundColor: theme.theme === 'dark' ? '#020917' : '#FFFFFF' }}>
            <div style={{ borderBottom:"1px solid #9d9a9a",paddingBottom:"3px",marginBottom:"9px",color: theme.theme === 'dark' ? '#FFFFFF' : '#011e3d'}}>Vehicles Status</div>

              
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status} className='sisisokl'>
                    <div className='DOIROSBB' style={{color: theme.theme === 'dark' ? '#F28E2C' : '#738499',}}>{status}</div> <div className='nshrotil' style={{color: theme.theme === 'dark' ? '#bad030' : '#011e3d'}}> {count}</div>
                  </div>
                ))}
                  <div className="greenSquarey"></div>
          <div className="greenSquare2y"></div>
            </div>
            <div className="kpi w-[90%] md:w-[32%] animate-slide-up delay-200" style={{ backgroundColor: theme.theme === 'dark' ? '#020917' : '#FFFFFF' }}>
            <div style={{ borderBottom:"1px solid #9d9a9a",paddingBottom:"3px",marginBottom:"9px",color: theme.theme === 'dark' ? '#FFFFFF' : '#011e3d'}}>Drivers</div>
              <div className="kpi-title" style={{color: theme.theme === 'dark' ? '#F28E2C' : '#738499',}}>Total Drivers</div>
              <div className="kpi-value"  style={{color: theme.theme === 'dark' ? '#bad030' : '#011e3d'}}>{drivers.length}</div>
              
              <div className="kpi-title" style={{color: theme.theme === 'dark' ? '#F28E2C' : '#738499'}}>Active Drivers</div>
              <div className="kpi-value"  style={{color: theme.theme === 'dark' ? '#bad030' : '#011e3d'}}>{activeVehiclesCount2}</div>
              <div className="kpi-subtext"> <span style={{color:"#27ce88",backgroundColor:theme.theme === 'dark' ? '#020917' : '#e1faee',width:"100%",textAlign:"center",padding:"5px",borderRadius:"5px"}}>{isNaN(activeperdriver) ? 0 : activeperdriver}% Active</span></div>
              <div className="greenSquarey"></div>
          <div className="greenSquare2y"></div>
            </div>
           
            <div className="kpi w-[90%] md:w-[32%] animate-slide-up delay-600" style={{ backgroundColor: theme.theme === 'dark' ? '#020917' : '#FFFFFF' }}>
            <div style={{ borderBottom:"1px solid #9d9a9a",paddingBottom:"3px",marginBottom:"9px",color: theme.theme === 'dark' ? '#FFFFFF' : '#011e3d'}}>Driver Status</div>

              
                {Object.entries(statusCounts2).map(([status, count]) => (
                  <div key={status} className='sisisokl'>
                    <div className='DOIROSBB' style={{color: theme.theme === 'dark' ? '#F28E2C' : '#738499',}}>{status}</div> <div className='nshrotil'style={{color: theme.theme === 'dark' ? '#bad030' : '#011e3d'}}> {count}</div>
                  </div>
                ))}
                  <div className="greenSquarey"></div>
          <div className="greenSquare2y"></div>
            </div>
            <div className="kpi w-[90%] md:w-[32%] animate-slide-up delay-800" style={{ backgroundColor: theme.theme === 'dark' ? '#020917' : '#FFFFFF' }}>
            <div style={{ borderBottom:"1px solid #9d9a9a",paddingBottom:"3px",marginBottom:"9px",color: theme.theme === 'dark' ? '#FFFFFF' : '#011e3d'}}>Inspection Check</div>


              
                {Object.entries(licenseCheckStatusCounts).map(([status, count]) => (
                  <div key={status} className='sisisokl'>
                    <div className='DOIROSBB'style={{color: theme.theme === 'dark' ? '#F28E2C' : '#738499',}}>{status === "No or expired inspection" ? "No or expired" : status}</div> 
                    <div className='nshrotil' style={{color: theme.theme === 'dark' ? '#bad030' : '#011e3d'}}> {count}</div>
                  </div>
                ))}
                  <div className="greenSquarey"></div>
          <div className="greenSquare2y"></div>
            </div>
            <div className="kpi w-[90%] md:w-[32%] animate-slide-up delay-1000" style={{ backgroundColor: theme.theme === 'dark' ? '#020917' : '#FFFFFF' }}>
          <div style={{ borderBottom:"1px solid #9d9a9a",paddingBottom:"3px",marginBottom:"9px",color: theme.theme === 'dark' ? '#FFFFFF' : '#011e3d'}}>License Check</div>
            
              {Object.entries(licenseCheckStatusCounts2).map(([status, count]) => (
                <div key={status} className='sisisokl'>
                  <div className='DOIROSBB' style={{color: theme.theme === 'dark' ? '#F28E2C' : '#738499',}}>{status} </div> <div className='nshrotil' style={{color: theme.theme === 'dark' ? '#bad030' : '#011e3d'}}>{count}</div>
                </div>
              ))}
                <div className="greenSquarey"></div>
        <div className="greenSquare2y"></div>
          </div>
        </div>
      </div>
     
    
  
      <LiniTwoSec theme={theme} chartData={chartData1}/>
      <div className="flex flex-col md:flex-row md:w-[80%] w-[93%] justify-between">
        <Piei chartData={chartDataPie} theme={theme.theme} chartConfig={chartConfig} title={title1} />
        <Piei chartData={chartDataPieDrivers} theme={theme.theme} chartConfig={chartConfigo} title={title2}/>
        <div className={`w-[90%] md:w-[60%]  font-sans ml-3 mt-4 ${
      theme.theme === 'dark' ? 'dark' : 'light'
    }`}>
<Tablei users={equipmentData} theme={theme.theme}/>
</div>
      </div>
  
  
     
    </div>
    <div className='w-[88%] ml-[6%]  mt-5 shadow-2xl '>
    <TwoBar theme={theme.theme} originalData={statusDuringTimeForDrivers} originalData1={statusDuringTimeForCars} chartConfig1={chartConfigw} chartConfig={chartConfigp} labels={labels} labels1={labelso} titleo={"Drivers"} titleo1={"Vehicles"}/>
    </div>

      <div className='flex w-[88%] ml-[6%]  mt-5  '>
      <div className='flex w-[58%]  mr-[5%] '>
       <TablePic rows={rows} colorsta={colorsta} theme={theme.theme}/>
       </div>
       <ThreeBar data={fines} theme={theme.theme} title={title}/>
      </div>
   
      <div className='  pb-5 flex'>
<Bari chartData={areasPerformance} theme={theme.theme}/>

</div>
    </div>
  )
}

export default FleetOverview
