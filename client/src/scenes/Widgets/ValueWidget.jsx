import React, { useEffect, useState } from "react";
import { Typography, Box } from "@mui/material";

const ValueWidget = ({ data }) => {
  const [timeSinceUpdate, setTimeSinceUpdate] = useState("");
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date(data.lastUpdate)); // State to store the last update time

  // This effect runs when the component mounts and data updates
  useEffect(() => {
    setLastUpdateTime(new Date(data.lastUpdate)); // Set the last update time based on the provided data
  }, [data]); // Dependency array includes data to run the effect when data updates

  useEffect(() => {
    const updateTimeSince = () => {
      const now = new Date();
      const minutesPassed = Math.round((now - lastUpdateTime) / (1000 * 60));
      setTimeSinceUpdate(`${minutesPassed} minutes ago`);
    };

    // Immediately update time since last update
    updateTimeSince();

    // Update every minute
    const interval = setInterval(updateTimeSince, 30000);

    // Cleanup function to clear the interval
    return () => clearInterval(interval);
  }, [lastUpdateTime]);

  return (
    <Box
      sx={{
        background: data.tintColor || "white",
        padding: "5px",
        borderRadius: "8px",

        textAlign: "left", // Align text to the left
      }}
    >
      {data.metric && (
        <>
          <Typography
            variant="subtitle2"
            display="block"
            gutterBottom
            sx={{ color: data.textColor || "black", fontWeight: "bold" }}
          >
            {data.metric.name}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.5rem',
              color: data.valueColor || "black",
            }}
          >
            <Typography
              variant="h3" // Increase the size to h3
              gutterBottom
              sx={{ color: data.valueColor || "black", fontWeight: "bold" }}
            >
              {typeof data.metric.value === "number"
                ? data.metric.value.toFixed(1) // Adjust precision as needed
                : data.metric.value}
            </Typography>
            {data.unit && (
              <Typography variant="h3" sx={{ color: data.valueColor || "black" }}>
                {data.unit}
              </Typography>
            )}
          </Box>
          {!data.hideLastUpdate && (
            <Typography variant="caption" display="block" sx={{ color: "#9e9e9e" }}>
              {timeSinceUpdate}
            </Typography>
          )}
        </>
      )}
    </Box>
  );
};

export default ValueWidget;
