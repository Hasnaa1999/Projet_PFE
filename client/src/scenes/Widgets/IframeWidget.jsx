import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { Edit } from "@mui/icons-material";

const IframeWidget = ({ title, source, tintColor, onEdit }) => {
  return (
    <Box
      sx={{
        bgcolor: tintColor || "transparent",
        padding: 2,
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: 400,
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        {title}
      </Typography>
      <iframe
        src={source}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        title="Iframe Preview"
      />
  
    </Box>
  );
};

export default IframeWidget;
