import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  IconButton,
  TextField,
  Switch,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useStateContext } from "../../contexts/ContextProvider"; // Adjust the path as necessary
import { ColorPicker } from "mui-color";
import DeleteIcon from "@mui/icons-material/Delete";

const ValueModal = ({
  open,
  onClose,
  onAddValue,
  onUpdateValue,
  widgetData,
  widgetId,
  openOnSecondTab,
}) => {
  const { dataMetric, devices } = useStateContext(); // Import dataMetric and devices from context

  const [chartTitle, setChartTitle] = useState("Value for Selected Metrics");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("");
  const [lastValue, setLastValue] = useState(null);
  const [fieldGroups, setFieldGroups] = useState([
    { selectedDevice: "", selectedMetric: "", availableMetrics: [] },
  ]);
  const [timeSinceUpdate, setTimeSinceUpdate] = useState("");
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date()); // State to store the last update time
  const [latestMetricValue, setLatestMetricValue] = useState(null); // State to store the latest metric value
  const [tintColor, setTintColor] = useState("");
  const [valueColor, setValueColor] = useState("");
  const [textColor, setTextColor] = useState("");
  const [tabIndex, setTabIndex] = useState(0);
  const [hideLastUpdate, setHideLastUpdate] = useState(false); // New state for hiding last update
  const [unit, setUnit] = useState("");

  useEffect(() => {
    if (widgetData) {
      setChartTitle(widgetData.title || "Value for Selected Metrics");
      setTintColor(widgetData.tintColor || "");
      setValueColor(widgetData.valueColor || "");
      setTextColor(widgetData.textColor || "");
      setHideLastUpdate(widgetData.hideLastUpdate || false);

      const metric = dataMetric.find(
        (m) => m.metric_id === widgetData.metric.metric_id
      );
      if (metric) {
        setLatestMetricValue(widgetData.metric);
        setFieldGroups([
          {
            selectedDevice:
              devices.find((device) =>
                device.metrics.some(
                  (metric) => metric.metric_id === widgetData.metric.metric_id
                )
              )?.name || "",
            selectedMetric: metric.metric_name,
            availableMetrics:
              devices.find((device) =>
                device.metrics.some(
                  (metric) => metric.metric_id === widgetData.metric.metric_id
                )
              )?.metrics || [],
          },
        ]);
      }
    }
  }, [widgetData, dataMetric, devices]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleTitleChange = (event) => {
    setChartTitle(event.target.value);
  };

  const updateFieldGroup = (index, field, value) => {
    let newFieldGroups = [...fieldGroups];

    if (field === "selectedDevice") {
      const device = devices.find((device) => device.name === value);
      const availableMetrics = device ? device.metrics : [];
      newFieldGroups[index] = {
        ...newFieldGroups[index],
        selectedDevice: value,
        availableMetrics,
        selectedMetric: "", // Reset the selected metric
      };
    } else if (field === "selectedMetric") {
      newFieldGroups[index].selectedMetric = value;
      const metric = newFieldGroups[index].availableMetrics.find(
        (m) => m.name === value
      );
      const metricId = metric?.metric_id;
      const lastValue = getLastMetricValue(metricId);
      newFieldGroups[index].lastMetricValue = lastValue;
      setLatestMetricValue({ metric_name: value, value: lastValue });
    }

    setFieldGroups(newFieldGroups);
  };

  const getLastMetricValue = (metricId) => {
    const metrics = dataMetric.filter((m) => m.metric_id === metricId);
    if (metrics.length > 0) {
      metrics.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return metrics[0].value;
    }
    return null;
  };

  const handleSave = () => {
    const metric = dataMetric.find(
      (m) => m.metric_name === fieldGroups[0].selectedMetric
    );

    if (metric) {
      const latestMetricValue = getLastMetricValue(metric.metric_id);

      if (latestMetricValue) {
        const valueData = {
          title: chartTitle,
          metric: {
            name: metric.metric_name,
            value: latestMetricValue,
            metric_id: metric.metric_id,
          },
          lastUpdate: new Date().toISOString(),
          tintColor,
          textColor,
          valueColor,
          hideLastUpdate, // Include hideLastUpdate state
          unit,
        };
        if (widgetId) {
          onUpdateValue(widgetId, valueData);
        } else {
          onAddValue(valueData);
        }
      } else {
        console.error("No metric data found for the selection.");
      }
    } else {
      console.error("Selected metric is not found in the metrics data.");
    }
    onClose();
  };

  // This effect runs when the component mounts and data updates
  useEffect(() => {
    setLastUpdateTime(new Date()); // Reset the last update time when data updates
  }, [dataMetric]); // Dependency array includes data to run the effect when data updates

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

  // Reset the text when the modal is opened
  useEffect(() => {
    if (open) {
      if (!widgetData) {
        setFieldGroups([
          { selectedDevice: "", selectedMetric: "", availableMetrics: [] },
        ]);
        setTimeSinceUpdate("");
        setLatestMetricValue(null);
        setTintColor("");
        setValueColor("");
        setTextColor("");
        setHideLastUpdate(false);
        setUnit("");
      }
      if (openOnSecondTab) {
        setTabIndex(1); // Open the second tab if the prop is true
      }
    }
  }, [open, widgetData, openOnSecondTab]);

  // This function is called when the modal is closed to ensure the text is reset
  const handleClose = () => {
    setFieldGroups([
      { selectedDevice: "", selectedMetric: "", availableMetrics: [] },
    ]);
    setTimeSinceUpdate("");
    setLatestMetricValue(null);
    setTintColor("");
    setValueColor("");
    setTextColor("");
    setHideLastUpdate(false);
    setUnit("");
    onClose(); // Call the onClose function passed as a prop
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <Close />
        </IconButton>

        <Typography variant="h6" component="h2">
          {widgetId ? "Edit Value" : "Create Value"}
        </Typography>

        <Box
          sx={{
            width: "100%",
            height: 150, // Set the desired height for the preview
            border: "1px dashed grey", // #ccc
            background: tintColor || "white",
            marginBottom: 2, // Add space at the bottom
            padding: 2,
          }}
        >
          {latestMetricValue && (
            <>
              <Typography
                variant="h6"
                display="block"
                gutterBottom
                sx={{ color: textColor || "black" }}
              >
                {latestMetricValue.metric_name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', color: valueColor || "black" }}>
        <Typography variant="h5">
          {typeof latestMetricValue.value === "number"
            ? latestMetricValue.value.toFixed(2)
            : latestMetricValue.value}
        </Typography>
        {unit && (
          <Typography variant="h5" sx={{ marginLeft: 1 }}>
            {unit}
          </Typography>
        )}
      </Box>
              {!hideLastUpdate && (
                <Typography variant="caption" display="block">
                  {timeSinceUpdate}
                </Typography>
              )}
            </>
          )}
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            aria-label="basic tabs example"
          >
            <Tab label="Basic" />
            <Tab label="Data" />
            <Tab label="Appearance" />
          </Tabs>
        </Box>

        {tabIndex === 0 && (
          <Box sx={{ marginTop: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Title
            </Typography>
            <TextField
              fullWidth
              value={chartTitle}
              onChange={handleTitleChange}
              variant="outlined"
            />
          </Box>
        )}
        {tabIndex === 1 && (
          <Box
            sx={{
              maxHeight: "400px",
              overflowY: "auto",
              my: 2,
            }}
          >
            {fieldGroups.map((group, index) => (
              <Box
                key={index}
                sx={{
                  bgcolor: "#f5f5f5",
                  p: 2,
                  my: 1,
                  border: "1px solid #e0e0e0",
                  borderRadius: "4px",
                  position: "relative",
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  Device
                </Typography>
                <select
                  value={group.selectedDevice}
                  onChange={(e) =>
                    updateFieldGroup(index, "selectedDevice", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginBottom: "10px",
                    border: "1px solid #ccc",
                  }}
                >
                  <option value="" disabled>
                    Select device
                  </option>
                  {devices.map((device, deviceIndex) => (
                    <option key={deviceIndex} value={device.name}>
                      {device.name}
                    </option>
                  ))}
                </select>

                <Typography variant="subtitle1" gutterBottom>
                  Metrics
                </Typography>
                <select
                  value={group.selectedMetric}
                  onChange={(e) =>
                    updateFieldGroup(index, "selectedMetric", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginBottom: "10px",
                    border: "1px solid #ccc",
                  }}
                >
                  <option value="" disabled>
                    Select metric
                  </option>
                  {group.availableMetrics?.map((metric, metricIndex) => (
                    <option key={metricIndex} value={metric.name}>
                      {metric.name}
                    </option>
                  ))}
                </select>
              </Box>
            ))}
          </Box>
        )}
        {tabIndex === 2 && (
          <Box sx={{ marginTop: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Text Color
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 1 }}>
              <ColorPicker
                value={textColor}
                onChange={(color) => setTextColor(color.css.backgroundColor)}
                deferred
                fullWidth
              />
              <Button onClick={() => setTextColor("")}>
                <DeleteIcon />
              </Button>
            </Box>
            <Typography variant="subtitle1" gutterBottom>
              Value Color
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 1 }}>
              <ColorPicker
                value={valueColor}
                onChange={(color) => setValueColor(color.css.backgroundColor)}
                deferred
                fullWidth
              />
              <Button onClick={() => setValueColor("")}>
                <DeleteIcon />
              </Button>
            </Box>
            <Typography variant="subtitle1" gutterBottom>
              Tint Color
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 1 }}>
              <ColorPicker
                value={tintColor}
                onChange={(color) => setTintColor(color.css.backgroundColor)}
                deferred
                fullWidth
              />
              <Button onClick={() => setTintColor("")}>
                <DeleteIcon />
              </Button>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Unit
              </Typography>
              <TextField
                fullWidth
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                variant="outlined"
              />
            </Box>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Hide lastUpdate
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 1 }}>
              <Switch
                checked={hideLastUpdate}
                onChange={(e) => setHideLastUpdate(e.target.checked)}
                color="primary"
              />
            </Box>
          </Box>
        )}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button variant="text" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} sx={{ ml: 2 }}>
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ValueModal;