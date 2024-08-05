import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Button,
  Typography,
  Tab,
  Tabs,
  TextField,
  Slider,
  FormGroup,
  FormControlLabel,
  Switch,
  FormControl,
  Radio,
  RadioGroup,
  FormLabel,
  IconButton,
} from "@mui/material";
import { TabContext, TabPanel } from "@mui/lab";
import { useStateContext } from "../../contexts/ContextProvider";
import DeleteIcon from "@mui/icons-material/Delete";
import { ColorPicker } from "mui-color";
import { Close } from "@mui/icons-material";
import GaugeChart from "react-gauge-chart";

const SliderModal = ({ open, onClose, onAddSlider, onUpdateSlider, widgetData, widgetId, openOnSecondTab }) => {
  const { dataMetric, devices } = useStateContext();
  const [sliderValue, setSliderValue] = useState(0);
  const [tabValue, setTabValue] = useState("1");
  const [title, setTitle] = useState("");
  const [valueFrom, setValueFrom] = useState(0);
  const [valueTo, setValueTo] = useState(100);
  const [stepValue, setStepValue] = useState(1);
  const [unit, setUnit] = useState("");
  const [tintColor, setTintColor] = useState("");
  const [highlightColor, setHighlightColor] = useState("");
  const [showRange, setShowRange] = useState(false);
  const [orientation, setOrientation] = useState("horizontal");
  const [showGaugeConfig, setShowGaugeConfig] = useState(false);
  const [gaugeMin, setGaugeMin] = useState(0);
  const [gaugeMax, setGaugeMax] = useState(100);
  const [gaugeAVG, setGaugeAVG] = useState(50);
  const [fieldGroups, setFieldGroups] = useState([
    { selectedDevice: "", selectedMetric: "", availableMetrics: [], metricName: "" },
  ]);

  useEffect(() => {
    setGaugeAVG((parseInt(gaugeMin, 10) + parseInt(gaugeMax, 10)) / 2);
  }, [gaugeMin, gaugeMax]);

  useEffect(() => {
    if (widgetData) {
      setTitle(widgetData.title || "");
      setTintColor(widgetData.tintColor || "");
      setHighlightColor(widgetData.highlightColor || "");
      setValueFrom(widgetData.valueFrom || 0);
      setValueTo(widgetData.valueTo || 100);
      setStepValue(widgetData.stepValue || 1);
      setUnit(widgetData.unit || "");
      setShowRange(widgetData.showRange || false);
      setOrientation(widgetData.orientation || "horizontal");
      setShowGaugeConfig(widgetData.showGaugeConfig || false);
      setGaugeMin(widgetData.gaugeSettings?.gaugeMin || 0);
      setGaugeMax(widgetData.gaugeSettings?.gaugeMax || 100);
      setSliderValue(widgetData.sliderValue || 0);

      if (widgetData.fieldGroups && widgetData.fieldGroups.length > 0) {
        const group = widgetData.fieldGroups[0];
        setFieldGroups([{
          selectedDevice: devices.find((device) => device.metrics.some((metric) => metric.metric_id === group.selectedMetric))?.name || "",
          selectedMetric: group.selectedMetric,
          availableMetrics: devices.find((device) => device.metrics.some((metric) => metric.metric_id === group.selectedMetric))?.metrics || [],
          metricName: group.metricName || ""
        }]);
      }
    }
  }, [widgetData, devices]);

  const handleChange = (event, newValue) => {
    setSliderValue(newValue);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getLastMetricValue = (metricId) => {
    const metrics = dataMetric.filter((m) => m.metric_id === metricId);
    if (metrics.length > 0) {
      metrics.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return metrics[0].value;
    }
    return null;
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
      setSliderValue(lastValue || 0);
    }

    setFieldGroups(newFieldGroups);
  };

  const handleAddClick = () => {
    setFieldGroups([
      ...fieldGroups,
      { selectedDevice: "", selectedMetric: "", chartType: "line", metricName: "" },
    ]);
  };

  const handleSave = () => {
    const metric = dataMetric.find(
      (m) => m.metric_name === fieldGroups[0].selectedMetric
    );

    if (metric) {
      const latestMetricValue = getLastMetricValue(metric.metric_id);

      if (latestMetricValue !== null) {
        const sliderData = {
          title,
          sliderValue,
          valueFrom,
          valueTo,
          stepValue,
          unit,
          tintColor,
          highlightColor,
          showRange,
          orientation,
          fieldGroups,
          gaugeSettings: {
            gaugeMin,
            gaugeMax,
            gaugeAVG,
            unit,
            sliderValue,
          },
          showGaugeConfig,
        };
        if (widgetId) {
          onUpdateSlider(widgetId, sliderData);
        } else {
          onAddSlider(sliderData);
        }
      } else {
        console.error("No metric data found for the selection.");
      }
    } else {
      console.error("Selected metric is not found in the metrics data.");
    }
    onClose();
  };

  useEffect(() => {
    if (open) {
      if (!widgetData) {
        setFieldGroups([
          { selectedDevice: "", selectedMetric: "", availableMetrics: [] },
        ]);
        setTitle("");
        setValueFrom(0);
        setValueTo(100);
        setStepValue(1);
        setUnit("");
        setTintColor("");
        setHighlightColor("");
        setShowRange(false);
        setOrientation("horizontal");
        setGaugeMin(0);
        setGaugeMax(100);
        setGaugeAVG(50);
        setSliderValue(0);
        setShowGaugeConfig(false);
      }
      if (openOnSecondTab) {
        setTabValue("2");
      }
    }
  }, [open, widgetData, openOnSecondTab]);

  const handleClose = () => {
    setFieldGroups([
      { selectedDevice: "", selectedMetric: "", availableMetrics: [] },
    ]);
    setTitle("");
    setValueFrom(0);
    setValueTo(100);
    setStepValue(1);
    setUnit("");
    setTintColor("");
    setHighlightColor("");
    setShowRange(false);
    setOrientation("horizontal");
    setGaugeMin(0);
    setGaugeMax(100);
    setGaugeAVG(50);
    setSliderValue(0);
    setShowGaugeConfig(false);

    onClose();
  };

  const removeFieldGroup = (index) => {
    setFieldGroups(fieldGroups.filter((_, i) => i !== index));
  };

  const marks = [
    {
      value: parseInt(valueFrom, 10),
      label: `${valueFrom}`,
    },
    {
      value: parseInt(valueTo, 10),
      label: `${valueTo}`,
    },
  ];

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
          {widgetId ? "Edit Slider" : "Create Slider"}
        </Typography>
        <Box
          sx={{
            my: 2,
            bgcolor: tintColor,
            display: "flex",
            flexDirection: orientation === "vertical" ? "column" : "column",
            alignItems: "center",
            justifyContent: "center",
            height: orientation === "vertical" ? 140 : "auto",
            width: orientation === "horizontal" ? "100%" : "auto",
          }}
        >
          {!showGaugeConfig ? (
            <>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ textAlign: "center" }}
              >
                {sliderValue} {unit}
              </Typography>
              <Slider
                value={sliderValue}
                onChange={handleChange}
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
                    top: "-20px",
                    left: "-120px",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                  }}
                >
                  {fieldGroups[0].metricName}
                </Typography>
              )}
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
                  {gaugeAVG}
              </Typography>
              <GaugeChart
                id="gauge-chart"
                nrOfLevels={30}
                colors={["#FF5F6D", "#FFC371"]}
                arcWidth={0.3}
                percent={(sliderValue - gaugeMin) / (gaugeMax - gaugeMin)}
                textColor="#000000"
                minValue={gaugeMin}
                maxValue={gaugeMax}
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
                <Typography variant="caption">{gaugeMin}</Typography>
                <Typography variant="caption">{gaugeMax}</Typography>
              </Box>
            </Box>
          )}
        </Box>
        <TabContext value={tabValue}>
          <Box sx={{ borderBottom: 1, borderColor: "divider", width: "100%" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="basic tabs example"
            >
              <Tab label="Basics" value="1" />
              <Tab label="Device and Field" value="2" />
              <Tab label="Appearance" value="3" />
              <Tab label="Gauge" value="4" />
            </Tabs>
          </Box>
          <TabPanel value="1" sx={{ width: "100%" }}>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="outlined"
            />
          </TabPanel>
          <TabPanel value="2" sx={{ width: "100%" }}>
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
            </Box>
            <Button variant="contained" sx={{ mt: 2 }} onClick={handleAddClick}>
              + Add
            </Button>
            <Box sx={{ marginTop: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Value From
              </Typography>
              <TextField
                fullWidth
                value={valueFrom}
                onChange={(e) => setValueFrom(e.target.value)}
                type="number"
                variant="outlined"
              />
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Value To
              </Typography>
              <TextField
                fullWidth
                value={valueTo}
                onChange={(e) => setValueTo(e.target.value)}
                type="number"
                variant="outlined"
              />
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Step
              </Typography>
              <TextField
                fullWidth
                value={stepValue}
                onChange={(e) => setStepValue(e.target.value)}
                type="number"
                variant="outlined"
              />
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
          </TabPanel>
          <TabPanel value="3" sx={{ width: "100%" }}>
            <Typography variant="subtitle3" gutterBottom>
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
            <Typography variant="subtitle3" gutterBottom>
              Highlight Color
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 1 }}>
              <ColorPicker
                value={highlightColor}
                onChange={(color) => setHighlightColor(color.css.backgroundColor)}
                deferred
                fullWidth
              />
              <Button onClick={() => setHighlightColor("")}>
                <DeleteIcon />
              </Button>
            </Box>
            <Typography variant="subtitle3" gutterBottom>
              Show Range
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={showRange}
                    onChange={(e) => setShowRange(e.target.checked)}
                  />
                }
              />
            </FormGroup>
            <FormControl component="fieldset">
              <FormLabel component="legend">Orientation</FormLabel>
              <RadioGroup
                row
                aria-label="orientation"
                name="orientation"
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
              >
                <FormControlLabel
                  value="horizontal"
                  control={<Radio />}
                  label="Horizontal"
                />
                <FormControlLabel
                  value="vertical"
                  control={<Radio />}
                  label="Vertical"
                />
              </RadioGroup>
            </FormControl>
          </TabPanel>
          <TabPanel value="4" sx={{ width: "100%" }}>
            <Box sx={{ p: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showGaugeConfig}
                    onChange={(e) => setShowGaugeConfig(e.target.checked)}
                  />
                }
                label="Gauge Configuration"
              />
              {showGaugeConfig && (
                <Box>
                  <TextField
                    label="Min Value"
                    type="number"
                    fullWidth
                    value={gaugeMin}
                    onChange={(e) => setGaugeMin(e.target.value)}
                    sx={{ mt: 2 }}
                  />
                  <TextField
                    label="Max Value"
                    type="number"
                    fullWidth
                    value={gaugeMax}
                    onChange={(e) => setGaugeMax(e.target.value)}
                    sx={{ mt: 2 }}
                  />
                  <TextField
                    label="Unit"
                    fullWidth
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    sx={{ mt: 2 }}
                  />
                  <TextField
                    label="Current Value"
                    type="number"
                    fullWidth
                    value={sliderValue}
                    sx={{ mt: 2 }}
                  />
                </Box>
              )}
            </Box>
          </TabPanel>
        </TabContext>
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

export default SliderModal;
