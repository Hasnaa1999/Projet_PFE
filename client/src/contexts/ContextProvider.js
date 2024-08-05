import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const StateContext = createContext();

export const ContextProvider = ({ children }) => {
  const [dataMetric, setDataMetric] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [devices, setDevices] = useState([]);
  const [activeMenu, setActiveMenu] = useState(true);
  const [screenSize, setScreenSize] = useState(undefined);
  const [dashboards, setDashboards] = useState(() => {
    const savedDashboards = localStorage.getItem("dashboards");
    return savedDashboards ? JSON.parse(savedDashboards) : [];
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMetrics = useCallback(async () => {
    try {
      const metricsData = await import('../assets/dataMetric.json');
      setDataMetric(metricsData.metrics || []);
    } catch (err) {
      setError(err);
    }
  }, []);

  const loadDevices = useCallback(async () => {
    try {
      const devicesData = await import('../assets/dataDevice.json');
      setDevices(devicesData.devices || []);
    } catch (err) {
      setError(err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadMetrics(), loadDevices()]);
      setIsLoading(false);
    };
    loadData();
  }, [loadMetrics, loadDevices]);

  return (
    <StateContext.Provider value={{
      dataMetric,
      devices,
      setMetrics,
      setDevices,
      isLoading,
      error,
      activeMenu,
      setActiveMenu,
      screenSize,
      setScreenSize,
      dashboards,
      setDashboards,
    }}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
