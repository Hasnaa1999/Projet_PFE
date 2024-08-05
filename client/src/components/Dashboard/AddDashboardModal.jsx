import React, { useState } from 'react';
import { Modal, Box, Typography, Button, TextField, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 1,
  width: 500,
};

const AddDashboardModal = ({ isOpen, onClose, onAdd }) => {
  const [dashboardName, setDashboardName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(dashboardName); // Utilisez la fonction passée via props
    setDashboardName(''); // Réinitialisez pour la prochaine ouverture
    onClose(); // Fermez le modal
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ color: 'black', mb: 2 }}>
          Add Dashboard
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            id="dashboardName"
            label="Name"
            variant="outlined"
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" sx={{ bgcolor: '#1976D2', '&:hover': { bgcolor: '#1976D2' } }}>
            Add Dashboard
          </Button>
        </form>
      </Box>
    </Modal>
  );
};
export default AddDashboardModal;