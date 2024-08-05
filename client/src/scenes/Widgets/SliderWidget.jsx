import React, { useEffect, useState } from 'react';
import { Box, Typography, Slider } from '@mui/material';
import GaugeChart from 'react-gauge-chart';

const SliderWidget = ({ sliderValue, title, unit, orientation, valueFrom, valueTo, stepValue, tintColor, highlightColor, showRange ,fieldGroups,
    gaugeSettings,
    showGaugeConfig,}) => {
    const marks = showRange ? [
        {
            value: parseInt(valueFrom, 10),
            label: `${valueFrom}`,
        },
        {
            value: parseInt(valueTo, 10),
            label: `${valueTo}`,
        },
    ] : [];

    const [timeSinceUpdate, setTimeSinceUpdate] = useState("");
    const [lastUpdateTime, setLastUpdateTime] = useState(new Date()); // State to store the last update time
  
    // This effect runs when the component mounts and data updates
    useEffect(() => {
      setLastUpdateTime(new Date()); // Reset the last update time when data updates
    }, [sliderValue, title, unit, orientation, valueFrom, valueTo, stepValue, tintColor, highlightColor, showRange ,fieldGroups,
        gaugeSettings,
        showGaugeConfig]); // Dependency array includes data to run the effect when data updates
  
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
        <Box
          sx={{
            my: 2,
            bgcolor: tintColor,
            display: "flex",
            flexDirection: orientation === "vertical" ? "column" : "column",
            alignItems: "center", // This centers the slider in the box vertically
            justifyContent: "center", // This centers the slider in the box horizontally
            height: orientation === "vertical" ? 140 : "auto", // Increase height for vertical orientation
            width: orientation === "horizontal" ? "100%" : "auto", // Increase width for horizontal if needed
          }}
        >
           <Typography
        variant="subtitle1"
        gutterBottom
        sx={{
          textAlign: 'left', // Aligns text to the left
          width: '100%', // Ensures it spans the full width available
          mt: 0, // Margin top set to 0
          mb: 4, // Margin bottom for space below the text
          ml: 0, // Margin left set to 0 to stick to the left
          mr: 0, // Margin right set to 0 (can adjust as needed)
          color: highlightColor,
        }}
      >
        {title}
      </Typography>

          {!showGaugeConfig ? (
            <>
           
              <Typography
                variant="h6"
                gutterBottom
                sx={{ textAlign: "center" }}
              >
                {sliderValue} {unit ? unit : ""}
              </Typography>
              <Slider
                value={sliderValue}
               
                aria-labelledby="input-slider"
                orientation={orientation}
                min={parseInt(valueFrom, 10) || 0}
                max={parseInt(valueTo, 10) || 100}
                step={parseInt(stepValue, 10) || 1}
                marks={showRange ? marks : []}
                sx={{
                  color: highlightColor,
                  "& .MuiSlider-track": { backgroundColor: highlightColor },
                  "& .MuiSlider-thumb": { backgroundColor: highlightColor },
                  "& .MuiSlider-rail": { opacity: 0.5 },
                }}
              />
            </>
          ) : (
            <Box position="relative">
               {fieldGroups[0].metricName && (
            <Typography
              variant="subtitle2"
              sx={{
                position: "absolute",
                top: "-50px",
                left: "-25px",
                fontSize: "0.8rem",
                fontWeight: "bold",
              }}
            >
              {fieldGroups[0].metricName} 
            </Typography>
          )}
          <Typography variant="caption" display="block"
          sx={{
            position: "absolute",
            top: "-30px",
            left: "-20px",
            fontSize: "0.8rem",
            
          }}
          >
            {timeSinceUpdate}
          </Typography>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  position: "absolute",
                  top: "-17%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  textAlign: "center",
                }}
              >
                 {gaugeSettings.gaugeAVG} 
              </Typography>
              <GaugeChart
                id="gauge-chart"
                nrOfLevels={30}
                colors={["#FF5F6D", "#FFC371"]}
                arcWidth={0.3}
                percent={(sliderValue - gaugeSettings.gaugeMin) / (gaugeSettings.gaugeMax - gaugeSettings.gaugeMin)}
                textColor="#000000"
                minValue={gaugeSettings.gaugeMin}
                maxValue={gaugeSettings.gaugeMax}
                
                
                // avgValue={gaugeAVG}
                formatTextValue={() => sliderValue.toString()}
              />
               {unit && (
                <Box position="absolute" top="60%" left="48.5%" transform="translateX(-50%)">
                  <Typography variant="body2" sx={{ textAlign: "center" }}>
                    {unit}
                  </Typography>
                </Box>
              )}
              <Box
                position="absolute"
                top="75%"
                left="0"
                width="100%"
                display="flex"
                justifyContent="space-between"
                px={2}
              >
                <Typography variant="caption">{gaugeSettings.gaugeMin}</Typography>
                <Typography variant="caption">{gaugeSettings.gaugeMax}</Typography>
              </Box>
            </Box>
          )}
        </Box>
    );
};

export default SliderWidget;
