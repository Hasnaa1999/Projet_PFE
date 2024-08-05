//BooleanWidget
import React, { useEffect, useState } from "react";
import { Typography, Box } from "@mui/material";

const BooleanWidget = ({ data }) => {
  const [timeSinceUpdate, setTimeSinceUpdate] = useState("");
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date()); // State to store the last update time

  // This effect runs when the component mounts and data updates
  useEffect(() => {
    setLastUpdateTime(new Date()); // Reset the last update time when data updates
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
  }, [lastUpdateTime]); // Dependency array includes lastUpdateTime

  return (
    <Box sx={{ background: data.tintColor || "white" }}>
      {data.metric && (
        <>
          <Typography
            variant="h6"
            display="block"
            gutterBottom
            sx={{ color: data.textColor || "black" }}
          >
            {data.metric.name}
          </Typography>
          <Typography variant="h5" sx={{ color: data.valueColor || "black" }}>
            {data.metric.value ? "1" : "0"}
          </Typography>
          {!data.hideLastUpdate && (
          <Typography variant="caption" display="block">
            {timeSinceUpdate}
          </Typography>
           )}
        </>
      )}
    </Box>
  );
};

export default BooleanWidget;
