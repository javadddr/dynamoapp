import React, { useState, useEffect } from 'react';

const Data = ({ setLoading, setData }) => {
  const token = localStorage.getItem('userToken');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const finesPromise = fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fines`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }).then(response => {
          if (!response.ok) throw new Error('Failed to fetch fines');
          return response.json();
        });

        const statusRecordsPromise = fetch(`${import.meta.env.VITE_BACKEND_URL}/api/statusRecords/statusByCreator`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }).then(response => {
          if (!response.ok) throw new Error('Failed to fetch status records');
          return response.json();
        });

        const [fines, statusRecords] = await Promise.all([finesPromise, statusRecordsPromise]);

        // Process the data as required
        const driverCosts = fines.reduce((acc, fine) => {
          if (fine.driverName && fine.cost != null) {
            acc[fine.driverName] = (acc[fine.driverName] || 0) + fine.cost;
          }
          return acc;
        }, {});

        const topDrivers = Object.entries(driverCosts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, cost], index) => ({
            name: name.length > 10 ? `${name.substring(0, 10)}...` : name,
            cost,
            color: ['#4CAF50', '#2196F3', '#FF5722', '#FFC107', '#e9b0ef'][index % 5],
          }));

        let statusDurationSum = {};
        const currentDate = new Date();
        statusRecords.forEach(record => {
          const startDate = new Date(record.from);
          const endDate = record.to ? new Date(record.to) : currentDate;
          const durationDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
          if (!statusDurationSum[record.status]) statusDurationSum[record.status] = 0;
          statusDurationSum[record.status] += Math.round(durationDays);
        });

        const summarizedStatuses = Object.entries(statusDurationSum).map(([label, value]) => ({ label, value }));

        const statusCategories = ['Active', 'Inactive', 'Sick', 'Holiday', 'Over Hours', 'Work Accident'];
        const monthlyStatusDurations = new Map();
        statusRecords.forEach(record => {
          const startDate = new Date(record.from);
          const endDate = record.to ? new Date(record.to) : new Date();
          const durationDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
          const monthKey = `${startDate.getUTCFullYear()}-${String(startDate.getUTCMonth() + 1).padStart(2, '0')}-01`;
          if (!monthlyStatusDurations.has(monthKey)) {
            monthlyStatusDurations.set(monthKey, { totalDays: 0, counts: Array(statusCategories.length).fill(0) });
          }
          const statusIndex = statusCategories.indexOf(record.status);
          if (statusIndex !== -1) {
            const monthData = monthlyStatusDurations.get(monthKey);
            monthData.totalDays += durationDays;
            monthData.counts[statusIndex] += durationDays;
            monthlyStatusDurations.set(monthKey, monthData);
          }
        });

        const monthlyData = Array.from(monthlyStatusDurations).map(([date, { totalDays, counts }]) => ({
          date,
          labels: statusCategories,
          values: counts.map(count => totalDays > 0 ? parseFloat(((count / totalDays) * 100).toFixed(1)) : 0),
        }));

        setData({
          topDrivers,
          summarizedStatuses,
          statusDuringTimeForDrivers: monthlyData,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setLoading, setData, token]);

  return null;
};

export default Data;
