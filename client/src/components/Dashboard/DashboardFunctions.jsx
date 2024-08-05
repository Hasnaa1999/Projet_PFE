export const createNewDashboard = (dashboardName) => {
  return {
    id: Math.random().toString(36).substr(2, 9),
    name: dashboardName,
    iconName: 'RxDashboard'
  };
};

export const getUpdatedDashboardsAfterAddition = (dashboards, newDashboard) => {
  return [...dashboards, newDashboard];
};

export const deleteDashboard = (dashboards, dashboardId) => {
  return dashboards.filter(dashboard => dashboard.id !== dashboardId);
};

export const updateDashboardName = (dashboards, dashboardId, newName) => {
  return dashboards.map(dashboard =>
    dashboard.id === dashboardId ? { ...dashboard, name: newName } : dashboard
  );
};
