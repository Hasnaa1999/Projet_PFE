import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { SiShopware } from 'react-icons/si';
import { MdOutlineCancel } from 'react-icons/md';
import { RxDashboard } from "react-icons/rx";
import { FaPlus } from "react-icons/fa";
import { useStateContext } from '../contexts/ContextProvider';
import AddDashboardModal from './Dashboard/AddDashboardModal';
import './style.css';
import logo from '../assets/image.png'; // Make sure the path is correct

const Sidebar = () => {
  const { activeMenu, setActiveMenu, screenSize, dashboards, setDashboards } = useStateContext();
  const [isDashboardModalOpen, setIsDashboardModalOpen] = React.useState(false);

  const handleAddDashboard = (dashboardName) => {
    const newDashboard = {
      id: Math.random().toString(36).substr(2, 9), // Cela crée un identifiant simple.
      name: dashboardName,
      iconName: 'RxDashboard',
    };
    const updatedDashboards = [...dashboards, newDashboard];
    setDashboards(updatedDashboards);
    localStorage.setItem("dashboards", JSON.stringify(updatedDashboards));
    setIsDashboardModalOpen(false);
  };

  const handleCloseSideBar = () => {
    if (activeMenu && screenSize <= 900) {
      setActiveMenu(false);
    }
  };

  const openDashboardModal = () => setIsDashboardModalOpen(true);

  return (
    <div className="ml-3 h-screen md:overflow-hidden overflow-auto md:hover:overflow-auto pb-10">
      {activeMenu && (
        <>
          <div className="flex justify-between items-center">
            <Link to="/" onClick={handleCloseSideBar} className="items-center gap-3 ml-3 mt-4 flex text-xl font-extrabold tracking-tight dark:text-white text-slate-900">
              <img src={logo} alt="Logo" className="h-8 w-auto" /> {/* Replace the text with an image */}
            </Link>
            <button type="button" onClick={handleCloseSideBar} className="text-xl rounded-full p-3 hover:bg-light-gray mt-4 block md:hidden">
              <MdOutlineCancel />
            </button>
          </div>
          <div className="mt-10">
            <p className='text-gray-400 m-3 mt-4 uppercase'>Dashboard</p>
            <NavLink to="/dashboard" className='dashboard-hover flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg text-md text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-light-gray m-2'>
              <RxDashboard />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="#" onClick={openDashboardModal} className='dashboard-hover flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg text-md text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-light-gray m-2 justify-start'>
              <FaPlus />
              <span>Add dashboard</span>
            </NavLink>
            {dashboards.map((dashboard) => (
              <NavLink key={dashboard.id} to={`/dashboard/${dashboard.id}`} className='dashboard-hover flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg text-md text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-light-gray m-2'>
                <RxDashboard />
                <span>{dashboard.name}</span>
              </NavLink>
            ))}
          </div>
        </>
      )}
      <AddDashboardModal isOpen={isDashboardModalOpen} onClose={() => setIsDashboardModalOpen(false)} onAdd={handleAddDashboard} />
    </div>
  );
};

export default Sidebar;
