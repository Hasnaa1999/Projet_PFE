import React from "react";
import { Typography, Box } from "@mui/material";

const HeadlineWidget = ({ data }) => {
  if (!data) {
    return null; // Render nothing if data is undefined
  }

  return (
    <Box
      sx={{
        background: data.tintColor || "white",
        display: "flex",
        alignItems: "center",
        justifyContent: data.centerText ? "center" : "flex-start",
        overflowY: "auto",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: data.textColor || "black",
          fontSize: data.textSize,
        }}
      >
        {data.chartTitle}
      </Typography>
    </Box>
  );
};

export default HeadlineWidget;
