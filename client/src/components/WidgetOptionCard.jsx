import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';

const WidgetOptionCard = ({ title, description, Icon, onClick }) => {
  return (
    <Grid item xs={12} md={6}>
      <Card
        sx={{
          display: 'flex',
          flexGrow: 1,
          alignItems: 'center',
          boxShadow: 'none', // Removes shadow
          border: '1px solid rgba(0, 0, 0, 0.3)', // Adds border
          borderRadius: '9px', // Adjusts border radius
          '&:hover': {
            boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.1)',
          },
        }}
        onClick={() => onClick && onClick()} // Invoke onClick if provided
      >
        <Icon fontSize="large" sx={{ mr: 2, ml: 2 }} />
        <CardContent>
          <Typography
            gutterBottom
            variant="h5"
            sx={{ fontFamily: 'Inter, sans-serif' }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: '15px' }}
          >
            {description}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default WidgetOptionCard;
