import React, { useEffect, useState } from 'react';
import { AiOutlineMenu } from 'react-icons/ai';
import { Breadcrumbs, Link, Typography, Button } from '@mui/material';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { useStateContext } from '../contexts/ContextProvider';
import WidgetModal from './WidgetModal';

const NavButton = ({ title, customFunc, icon, color, dotColor }) => (
  <button
    type="button"
    onClick={customFunc}
    style={{ color: "#29a3cf"}}
    className='relative text-xl rounded-full p-3 hover:bg-light-gray'
  >
    <span
      style={{ background: dotColor }}
      className='absolute inline-flex rounded-full h-2 w-2 right-2 top-2'
    />
    {icon}
  </button>
);

const Navbar = () => {
  const { activeMenu, setActiveMenu, screenSize, setScreenSize } = useStateContext();
  const location = useLocation();
  const [widgetModalOpen, setWidgetModalOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (screenSize <= 900) {
      setActiveMenu(false);
    } else {
      setActiveMenu(true);
    }
  }, [screenSize]);

  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    return (
      <Breadcrumbs aria-label="breadcrumb" separator="›" className="ml-4">
        <Link color="inherit" component={RouterLink} to="/">
          Home
        </Link>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          return isLast ? (
            <Typography color="textPrimary" key={to}>
              {value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ')}
            </Typography>
          ) : (
            <Link color="inherit" component={RouterLink} to={to} key={to}>
              {value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ')}
            </Link>
          );
        })}
      </Breadcrumbs>
    );
  };

  const handleAddWidget = (widgetData, widgetType) => {
    console.log("Widget added", widgetData, widgetType);
    // Implement your logic for adding a widget
  };

  return (
    <div className='flex justify-between items-center p-2 md:mx-6 relative'>
      <div className='flex items-center'>
        <NavButton
          title="Menu"
          customFunc={() => setActiveMenu((prevActiveMenu) => !prevActiveMenu)}
          color="#03C9D7"
          icon={<AiOutlineMenu />}
        />
        {generateBreadcrumbs()}
      </div>

  
    </div>
  );
};

export default Navbar;
