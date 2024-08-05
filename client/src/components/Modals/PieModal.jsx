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
import { useStateContext } from "../../contexts/ContextProvider";
import { ColorPicker } from "mui-color";
import DeleteIcon from "@mui/icons-material/Delete";
import { Pie } from "react-chartjs-2";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import dataDevice from "../../assets/dataDevice.json";
import dataMetric from "../../assets/dataMetric.json";

const PieModal = ({ open, onClose, onAddPie, onUpdatePie, widgetData, widgetId }) => {
  const [pieTitle, setPieTitle] = useState("Pie for Selected Metrics");
  const [fieldGroups, setFieldGroups] = useState([
    {
      selectedDevice: "",
      selectedMetric: "",
      lastMetricValue: null,
      metricName: "",
    },
  ]);
  const [tintColor, setTintColor] = useState("");
  const [titleColor, setTitleColor] = useState("");
  const [labelColor, setLabelColor] = useState("");
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    if (widgetData) {
      // Load data for editing
      setPieTitle(widgetData.title || "Pie for Selected Metrics");
      setFieldGroups(widgetData.fieldGroups || [
        {
          selectedDevice: "",
          selectedMetric: "",
          lastMetricValue: null,
          metricName: "",
        },
      ]);
      setTintColor(widgetData.tintColor || "");
      setTitleColor(widgetData.titleColor || "");
      setLabelColor(widgetData.labelColor || "");
    }
  }, [widgetData]);

  useEffect(() => {
    if (open && !widgetData) {
      // Reset state for new pie chart
      setPieTitle("Pie for Selected Metrics");
      setFieldGroups([
        {
          selectedDevice: "",
          selectedMetric: "",
          lastMetricValue: null,
          metricName: "",
        },
      ]);
      setTintColor("");
      setTitleColor("");
      setLabelColor("");
    }
  }, [open, widgetData]);

  const getLastMetricValue = (metricId) => {
    const metrics = dataMetric.metrics.filter((m) => m.metric_id === metricId);
    if (metrics.length > 0) {
      metrics.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return metrics[0].value;
    }
    return null;
  };

  const updateFieldGroup = (index, field, value) => {
    let newFieldGroups = [...fieldGroups];

    if (field === "selectedDevice") {
      const device = dataDevice.devices.find((device) => device.name === value);
      const availableMetrics = device ? device.metrics : [];
      newFieldGroups[index] = {
        ...newFieldGroups[index],
        selectedDevice: value,
        availableMetrics,
        selectedMetric: "",
        metricName: "",
      };
    } else if (field === "selectedMetric") {
      newFieldGroups[index].selectedMetric = value;
      const metric = newFieldGroups[index].availableMetrics.find(
        (m) => m.name === value
      );
      const metricId = metric?.metric_id;
      const lastValue = getLastMetricValue(metricId);
      newFieldGroups[index].lastMetricValue = lastValue;
      newFieldGroups[index].metricName = metric?.name || "";
    }

    setFieldGroups(newFieldGroups);
  };

  const handleAddClick = () => {
    setFieldGroups([
      ...fieldGroups,
      {
        selectedDevice: "",
        selectedMetric: "",
        lastMetricValue: null,
        metricName: "",
      },
    ]);
  };

  const removeFieldGroup = (index) => {
    setFieldGroups(fieldGroups.filter((_, i) => i !== index));
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleTitleChange = (event) => {
    setPieTitle(event.target.value);
  };

  const handleSave = () => {
    const metric = fieldGroups.map((group) => ({
      name: group.metricName,
      value: group.lastMetricValue,
    }));

    const pieData = {
      title: pieTitle,
      metric,
      tintColor,
      labelColor,
      titleColor,
      fieldGroups,
    };

    if (widgetId) {
      onUpdatePie(widgetId, pieData);
    } else {
      onAddPie(pieData);
    }
    onClose();
  };

  const handleClose = () => {
    setPieTitle("Pie for Selected Metrics");
    setFieldGroups([
      {
        selectedDevice: "",
        selectedMetric: "",
        lastMetricValue: null,
        metricName: "",
      },
    ]);
    setTintColor("");
    setTitleColor("");
    setLabelColor("");
    onClose();
  };

  const colors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#FF9F40",
    "#4BC0C0",
    "#9966FF",
  ];

  const pieData = {
    labels: fieldGroups.map((group) => group.selectedDevice || ""),
    datasets: [
      {
        label: pieTitle,
        data: fieldGroups.map((group) => group.lastMetricValue || 0),
        backgroundColor: colors.slice(0, fieldGroups.length),
        hoverBackgroundColor: colors.slice(0, fieldGroups.length),
      },
    ],
  };

  const pieOptions = {
    plugins: {
      legend: {
        display: true,
        position: "right",
        labels: {
          font: {
            size: 12,
          },
          color: labelColor || "#000000",
          boxWidth: 30,
          padding: 10,
        },
        maxWidth: 300,
        wrapText: true,
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const metric = fieldGroups[tooltipItem.dataIndex].metricName;
            return ` ${metric}: ${tooltipItem.raw}`;
          },
        },
      },
    },
    maintainAspectRatio: false,
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
          {widgetId ? "Edit Pie Chart" : "Create Pie Chart"}
        </Typography>

        <Box
          sx={{
            border: "1px dashed grey",
            my: 2,
            bgcolor: tintColor || "#ffffff",
            p: 2,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              textAlign: "center",
              color: titleColor || "#000000",
            }}
          >
            {pieTitle}
          </Typography>
          <Box
            sx={{
              height: 300,
            }}
          >
            {fieldGroups.some((group) => group.lastMetricValue !== null) && (
              <Pie data={pieData} options={pieOptions} />
            )}
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
              value={pieTitle}
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
                  {dataDevice.devices.map((device, deviceIndex) => (
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
            <Typography variant="subtitle1" gutterBottom>
              Label Color
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 1 }}>
              <ColorPicker
                value={labelColor}
                onChange={(color) => setLabelColor(color.css.backgroundColor)}
                deferred
                fullWidth
              />
              <Button onClick={() => setLabelColor("")}>
                <DeleteIcon />
              </Button>
            </Box>
            <Typography variant="subtitle1" gutterBottom>
              Title Color
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 1 }}>
              <ColorPicker
                value={titleColor}
                onChange={(color) => setTitleColor(color.css.backgroundColor)}
                deferred
                fullWidth
              />
              <Button onClick={() => setTitleColor("")}>
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

export default PieModal;
