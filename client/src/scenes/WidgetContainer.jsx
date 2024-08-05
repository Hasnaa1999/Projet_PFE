import React from 'react';
import { Box, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import { CopyAll, Edit } from '@mui/icons-material';

const WidgetContainer = ({ children, widgetId, widgetType, widgetData, handleDuplicate, handleEdit, handleClose }) => {
  return (
    <Box
      sx={{
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#fff',
        position: 'relative',
        margin: '20px',
        overflow: 'hidden' // Ensure child elements do not overflow
      }}
      className="draggable-handle"
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          display: 'flex',
          gap: '4px',
          padding: '8px',
          zIndex: 1000, // Ensure the icons are on top
          backgroundColor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent background
        }}
        className="cancel-drag"
      >
        <IconButton size="small" onClick={() => handleDuplicate(widgetId)}>
          <CopyAll fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => handleEdit(widgetId, widgetType, widgetData)}>
          <Edit fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => handleClose(widgetId)}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      {children}
    </Box>
  );
};

export default WidgetContainer;
