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
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useStateContext } from "../../contexts/ContextProvider";
import { ColorPicker } from "mui-color";
import DeleteIcon from "@mui/icons-material/Delete";

const EditChartWidgetModal = ({
  open,
  onClose,
  updateChart,
  onAddChart,
  widgetData,
  widgetId,
}) => {
  const { dataMetric, devices } = useStateContext();
  const [chartTitle, setChartTitle] = useState("Chart for selected metrics");
  const [tabIndex, setTabIndex] = useState(0);
  const [fieldGroups, setFieldGroups] = useState([
    { selectedDevice: "", selectedMetric: "", availableMetrics: [] },
  ]);
  const [chartType, setChartType] = useState("line");
  const [summaryTable, setSummaryTable] = useState(false);
  const [tintColor, setTintColor] = useState("");
  const [valueColor, setValueColor] = useState("");
  const [textColor, setTextColor] = useState("");
  const [timeframe, setTimeframe] = useState("Day");
  const [customFromDate, setCustomFromDate] = useState(new Date());
  const [customToDate, setCustomToDate] = useState(new Date());
  const [unit, setUnit] = useState("");

  useEffect(() => {
    if (widgetData) {
      setChartTitle(widgetData.title || "Chart for selected metrics");
      setChartType(widgetData.chartType || "line");
      setSummaryTable(widgetData.summaryTable || false);
      setTintColor(widgetData.tintColor || "");
      setValueColor(widgetData.valueColor || "");
      setTextColor(widgetData.textColor || "");
      setTimeframe(widgetData.timeframe || "Day");
      setCustomFromDate(new Date(widgetData.fromDate));
      setCustomToDate(new Date(widgetData.toDate));
      setUnit(widgetData.unit || "");

      const metric = dataMetric.find(
        (m) => m.metric_id === widgetData.metric.metric_id
      );
      if (metric) {
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

  const handleChartTypeChange = (event) => {
    setChartType(event.target.value);
  };

  const handleSummaryTableChange = (event) => {
    setSummaryTable(event.target.checked);
  };

  const handleUnitChange = (event) => {
    setUnit(event.target.value);
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

  const removeFieldGroup = (index) => {
    setFieldGroups(fieldGroups.filter((_, i) => i !== index));
  };

  const calculateDatesBasedOnTimeframe = (timeframe) => {
    const now = new Date();
    let fromDate = new Date();
    let toDate = new Date();

    switch (timeframe) {
      case "Hour":
        fromDate.setHours(fromDate.getHours() - 1);
        break;
      case "Day":
        fromDate.setDate(fromDate.getDate() - 1);
        break;
      case "Week":
        fromDate.setDate(fromDate.getDate() - 7);
        break;
      case "Month":
        fromDate.setMonth(fromDate.getMonth() - 1);
        break;
      default:
        throw new Error(`Unsupported timeframe: ${timeframe}`);
    }

    return {
      calculatedFromDate: fromDate.toISOString(),
      calculatedToDate: toDate.toISOString(),
    };
  };

  const handleSave = () => {
    const aggregatedMetrics = fieldGroups
      .map((group) => {
        const metric = group.availableMetrics.find(
          (m) => m.name === group.selectedMetric
        );
        return metric
          ? { name: metric.name, metric_id: metric.metric_id }
          : null;
      })
      .filter((metric) => metric);

    let finalFromDate, finalToDate;
    if (timeframe === "Custom") {
      finalFromDate = customFromDate;
      finalToDate = customToDate;
    } else {
      const { calculatedFromDate, calculatedToDate } =
        calculateDatesBasedOnTimeframe(timeframe);
      finalFromDate = calculatedFromDate;
      finalToDate = calculatedToDate;
    }

    const finalChartData = {
      title: chartTitle,
      metrics: aggregatedMetrics,
      chartType,
      summaryTable,
      timeframe,
      fromDate: finalFromDate,
      toDate: finalToDate,
      tintColor,
      valueColor,
      textColor,
      unit,
    };

    if (widgetId) {
      updateChart(widgetId, finalChartData);
    } else {
      onAddChart(finalChartData, chartType);
    }
    onClose();
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
          {widgetId ? "Edit Chart Widget" : "Create Chart Widget"}
        </Typography>

        <Box
          sx={{
            width: "100%",
            height: 150,
            border: "1px dashed grey",
            background: tintColor || "white",
            marginBottom: 2,
            padding: 2,
          }}
        >
          <Typography variant="h6" display="block" gutterBottom>
            Preview
          </Typography>
          {/* You can add a preview of the chart here */}
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
            <Tab label="Timeframe" />
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

                <Typography variant="subtitle1" gutterBottom>
                  Kind
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <label sx={{ mr: 2 }}>
                    <input
                      type="radio"
                      name="chartKind"
                      value="line"
                      checked={chartType === "line"}
                      onChange={handleChartTypeChange}
                    />
                    Line Chart
                  </label>
                  <label sx={{ mr: 2 }}>
                    <input
                      type="radio"
                      name="chartKind"
                      value="area"
                      checked={chartType === "area"}
                      onChange={handleChartTypeChange}
                    />
                    Area Chart
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="chartKind"
                      value="bar"
                      checked={chartType === "bar"}
                      onChange={handleChartTypeChange}
                    />
                    Bar Chart
                  </label>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={summaryTable}
                        onChange={handleSummaryTableChange}
                        name="summaryTable"
                        color="primary"
                      />
                    }
                    label="Summary Table"
                  />
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Unit
                  </Typography>
                  <TextField
                    fullWidth
                    value={unit}
                    onChange={handleUnitChange}
                    variant="outlined"
                    sx={{ bgcolor: "white" }}
                  />
                </Box>
              </Box>
            ))}
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() =>
                setFieldGroups([
                  ...fieldGroups,
                  { selectedDevice: "", selectedMetric: "", availableMetrics: [] },
                ])
              }
            >
              + Add
            </Button>
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
          </Box>
        )}
        {tabIndex === 3 && (
          <Box sx={{ marginTop: 2 }}>
            <FormControl component="fieldset">
              <RadioGroup
                row
                value={timeframe}
                onChange={(event) => setTimeframe(event.target.value)}
              >
                <FormControlLabel value="Hour" control={<Radio />} label="Hour" />
                <FormControlLabel value="Day" control={<Radio />} label="Day" />
                <FormControlLabel value="Week" control={<Radio />} label="Week" />
                <FormControlLabel value="Month" control={<Radio />} label="Month" />
                <FormControlLabel value="Custom" control={<Radio />} label="Custom" />
              </RadioGroup>
            </FormControl>

            {timeframe === "Custom" && (
              <Box key={Date.now()} sx={{ display: "flex", gap: 2, mt: 2 }}>
                <TextField
                  label="From"
                  type="date"
                  value={customFromDate}
                  onChange={(e) => setCustomFromDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Until"
                  type="date"
                  value={customToDate}
                  onChange={(e) => setCustomToDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            )}
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

export default EditChartWidgetModal;
