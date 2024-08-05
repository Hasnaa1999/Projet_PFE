import React, { useState, useEffect } from "react";
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
  FormControlLabel,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useStateContext } from "../../contexts/ContextProvider";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";
import moment from "moment";
import { ColorPicker } from "mui-color";
import DeleteIcon from "@mui/icons-material/Delete";

const HistogramWidgetModal = ({ open, onClose, onAddHistogram }) => {
  const { dataMetric, devices } = useStateContext();
  const [chartTitle, setChartTitle] = useState(
    "Histogram for Selected Metrics"
  );
  const [tabIndex, setTabIndex] = useState(0);
  const [fieldGroups, setFieldGroups] = useState([
    { selectedDevice: "", selectedMetric: "", availableMetrics: [] },
  ]);

  const [showYAxis, setShowYAxis] = useState(true);
  const [showXGrid, setShowXGrid] = useState(true);
  const [tintColor, setTintColor] = useState("");

  const [latestMetricData, setLatestMetricData] = useState([]);

  useEffect(() => {
    const data = fieldGroups.map((group) => {
      const metricObj = dataMetric
        .filter((metric) => metric.metric_name === group.selectedMetric)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

      return {
        metricName: group.selectedMetric,
        latestValue: metricObj ? metricObj.value : null,
        timestamp: metricObj ? metricObj.timestamp : null,
      };
    });
    setLatestMetricData(data);
  }, [fieldGroups, dataMetric]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleTitleChange = (event) => {
    setChartTitle(event.target.value);
  };

  const handleSave = () => {
    const latestMetricData = fieldGroups.map((group) => {
      const metricObj = dataMetric
        .filter((metric) => metric.metric_name === group.selectedMetric)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

      return {
        metricName: group.selectedMetric,
        latestValue: metricObj ? metricObj.value : null,
        timestamp: metricObj ? metricObj.timestamp : null,
      };
    });

    onAddHistogram({
      title: chartTitle,
      metrics: latestMetricData,
      device: fieldGroups.map((group) => group.selectedDevice),
      tintColor,
      showXGrid,
      showYAxis
    });

    onClose();
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
    }

    setFieldGroups(newFieldGroups);
  };

  const handleAddClick = () => {
    setFieldGroups([
      ...fieldGroups,
      { selectedDevice: "", selectedMetric: "", chartType: "line" },
    ]);
  };

  const removeFieldGroup = (index) => {
    setFieldGroups(fieldGroups.filter((_, i) => i !== index));
  };
  const colors = [
    "rgb(58, 196, 224)", // Color for first metric
    "rgb(64, 161, 71)", // Color for second metric
    "rgb(194, 121, 12)", // Color for third metric
    "rgb(99, 81, 150)", // Color for fourth metric
    "rgb(17, 145, 105)", // Color for fifth metric
    "rgb(196, 74, 14)", // Color for sixth metric
    // Add more colors if you have more than six metrics
  ];

  const datasets = latestMetricData.map((metric, index) => ({
    label: metric.metricName,
    data: [{ x: "", y: metric.latestValue }], // Use an object with x and y properties
    backgroundColor: colors[index % colors.length],
    borderColor: colors[index % colors.length],
    borderWidth: 1,
  }));

  const chartData = {
    labels: [""], // Single blank label since we have one bar per dataset
    datasets: datasets,
  };

  const options = {
    scales: {
      y: {
        display: showXGrid,
        beginAtZero: true,
        ticks: {
          display: showYAxis,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        position: "top", // Show the legend at the top
      },
      title: {
        display: true,
        text: chartTitle, // Use the title from the state
      },
      tooltip: {
        enabled: true,
        mode: "point",
        position: "nearest",
        intersect: false,
        callbacks: {
          label: (context) => {
            const metric = latestMetricData[context.datasetIndex];
            const value = context.parsed.y;
            const timestamp = metric.timestamp;
            const formattedTime = moment(timestamp).format(
              "MMMM D, YYYY h:mm A"
            );
            return `${metric.metricName}: ${value} (${formattedTime})`;
          },
        },
      },
    },
  };

  return (
    <Modal open={open} onClose={onClose}>
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
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <Close />
        </IconButton>

        <Typography variant="h6" component="h2">
          Create Histogram
        </Typography>
        <Box sx={{ marginTop: 2 }}>
          <Box
            sx={{
              width: "100%",
              height: "250px",
              border: "1px dashed grey",
              background: tintColor,
            }}
          >
            <Bar data={chartData} options={options} />
          </Box>
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
                <IconButton
                  onClick={() => removeFieldGroup(index)}
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                  }}
                >
                  <Close />
                </IconButton>
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
            <Button variant="contained" sx={{ mt: 2 }} onClick={handleAddClick}>
              + Add
            </Button>
          </Box>
        )}
        {tabIndex === 2 && (
          <Box sx={{ marginTop: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showYAxis}
                  onChange={() => setShowYAxis(!showYAxis)}
                />
              }
              label="Show Y Axis"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showXGrid}
                  onChange={() => setShowXGrid(!showXGrid)}
                />
              }
              label="Show X Grid"
            />
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
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
          </Box>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button variant="text" onClick={onClose}>
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

export default HistogramWidgetModal;
