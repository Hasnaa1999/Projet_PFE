import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Button,
  Typography,
  TextField,
  IconButton,
  Tabs,
  Tab,
  Tooltip,
  Slider,
  Radio,
  FormControlLabel,
  RadioGroup,
  FormControl,
  FormLabel,
} from "@mui/material";
import {
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { TabContext, TabPanel } from "@mui/lab";
import dataDevice from "../../assets/dataDevice.json";
import dataMetric from "../../assets/dataMetric.json";
import { ColorPicker } from "mui-color";


const ImageMapModal = ({
  open,
  onClose,
  onAddImageMap,
  onUpdateImageMap,
  widgetData,
  widgetId,
}) => {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [tabValue, setTabValue] = useState("1");
  const [isDragging, setIsDragging] = useState(false);
  const [imagePosition, setImagePosition] = useState({ top: 0, left: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [devices] = useState(dataDevice.devices);
  const [iconPositions, setIconPositions] = useState([]);
  const [draggingIcon, setDraggingIcon] = useState(null);
  const [tintColor, setTintColor] = useState("");
  const [iconColor, setIconColor] = useState("");
  const [textColor, setTextColor] = useState("");
  const [iconShape, setIconShape] = useState("circle");
  const [editMode, setEditMode] = useState(false);

  const [fieldGroups, setFieldGroups] = useState([
    {
      selectedDevice: "",
      selectedMetric: "",
      availableMetrics: [],
      metricName: "",
      showPositionFields: false,
      xPosition: "",
      yPosition: "",
      link: "",
      label: "",
      unit: "",
      iconSize: 80, // Set default icon size
    },
  ]);

  useEffect(() => {
    if (widgetData) {
      setEditMode(true);
      setTitle(widgetData.title || "");
      setImage(widgetData.image || null);
      setImagePosition(widgetData.imagePosition || { top: 0, left: 0 });
      setZoom(widgetData.zoom || 1);
      setFieldGroups(widgetData.fieldGroups || [
        {
          selectedDevice: "",
          selectedMetric: "",
          availableMetrics: [],
          metricName: "",
          showPositionFields: false,
          xPosition: "",
          yPosition: "",
          link: "",
          label: "",
          unit: "",
          iconSize: 80, // Set default icon size
        },
      ]);
      setIconPositions(widgetData.iconPositions || []);
      setTintColor(widgetData.tintColor || "");
      setIconColor(widgetData.iconColor || "");
      setTextColor(widgetData.textColor || "");
      setIconShape(widgetData.iconShape || "circle");
    } else {
      setEditMode(false);
    }
  }, [widgetData]);

  useEffect(() => {
    updateIconPositions();
  }, [fieldGroups]);

  const removeFieldGroup = (index) => {
    setFieldGroups(fieldGroups.filter((_, i) => i !== index));
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
        selectedMetric: "", // Reset selected metric
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
    } else {
      newFieldGroups[index][field] = value;
    }

    setFieldGroups(newFieldGroups);
  };

  const getLastMetricValue = (metricId) => {
    const metrics = dataMetric.metrics.filter((m) => m.metric_id === metricId);
    if (metrics.length > 0) {
      metrics.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return metrics[0].value;
    }
    return null;
  };

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      let img = event.target.files[0];
      setImage(URL.createObjectURL(img));
    }
  };

  const handleSave = () => {
    const imageMapData = {
      title,
      image,
      imagePosition,
      zoom,
      fieldGroups,
      iconPositions,
      tintColor,
      iconColor,
      textColor,
      iconShape,
      tabValue,
      offset,
      isDragging,
    };

    if (editMode && widgetId) {
      onUpdateImageMap(widgetId, imageMapData);
    } else {
      onAddImageMap(imageMapData);
    }

    onClose();
  };

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (open && !widgetData) {
      setTitle("");
      setImage(null);
      setIsDragging(false);
      setImagePosition({ top: 0, left: 0 });
      setOffset({ x: 0, y: 0 });
      setZoom(1);
      setIconPositions([]);
      setDraggingIcon(null);
      setTintColor("");
      setIconColor("");
      setTextColor("");
      setIconShape("circle");
      setFieldGroups([
        {
          selectedDevice: "",
          selectedMetric: "",
          availableMetrics: [],
          metricName: "",
          showPositionFields: false,
          xPosition: "",
          yPosition: "",
          link: "",
          label: "",
          unit: "",
          iconSize: 80, // Set default icon size
        },
      ]);
    }
  }, [open, widgetData]);

  const handleClose = () => {
    setTitle("");
    setImage(null);
    setIsDragging(false);
    setImagePosition({ top: 0, left: 0 });
    setOffset({ x: 0, y: 0 });
    setZoom(1);
    setIconPositions([]);
    setDraggingIcon(null);
    setTintColor("");
    setIconColor("");
    setTextColor("");
    setIconShape("circle");
    setFieldGroups([
      {
        selectedDevice: "",
        selectedMetric: "",
        availableMetrics: [],
        metricName: "",
        showPositionFields: false,
        xPosition: "",
        yPosition: "",
        link: "",
        label: "",
        unit: "",
        iconSize: 80, // Set default icon size
      },
    ]);
    onClose();
  };

  const handleMouseDown = (e) => {
    if (draggingIcon === null) {
      setIsDragging(true);
      setOffset({
        x: e.clientX - imagePosition.left,
        y: e.clientY - imagePosition.top,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setImagePosition({
        top: e.clientY - offset.y,
        left: e.clientX - offset.x,
      });
    } else if (draggingIcon !== null) {
      const newIconPositions = [...iconPositions];
      const imageElement = document.querySelector("img");
      const imageRect = imageElement.getBoundingClientRect();

      newIconPositions[draggingIcon].x =
        ((e.clientX - imageRect.left) / imageRect.width) * 100;
      newIconPositions[draggingIcon].y =
        ((e.clientY - imageRect.top) / imageRect.height) * 100;
      setIconPositions(newIconPositions);

      const newFieldGroups = [...fieldGroups];
      newFieldGroups[draggingIcon].xPosition =
        newIconPositions[draggingIcon].x;
      newFieldGroups[draggingIcon].yPosition =
        newIconPositions[draggingIcon].y;
      setFieldGroups(newFieldGroups);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggingIcon(null);
  };

  const handleWheel = (e) => {
    if (e.deltaY < 0) {
      setZoom((prevZoom) => Math.min(prevZoom + 0.1, 3));
    } else {
      setZoom((prevZoom) => Math.max(prevZoom - 0.1, 0.5));
    }
  };

  const handleZoomIn = () => {
    setZoom((prevZoom) => Math.min(prevZoom + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom((prevZoom) => Math.max(prevZoom - 0.1, 0.5));
  };

  const handleAddClick = () => {
    setFieldGroups([
      ...fieldGroups,
      {
        selectedDevice: "",
        selectedMetric: "",
        availableMetrics: [],
        metricName: "",
        showPositionFields: false,
        xPosition: "",
        yPosition: "",
        link: "",
        label: "",
        unit: "",
        iconSize: 80,
      },
    ]);
  };

  const togglePositionFields = (index) => {
    let newFieldGroups = [...fieldGroups];
    newFieldGroups[index].showPositionFields =
      !newFieldGroups[index].showPositionFields;
    setFieldGroups(newFieldGroups);
  };

  const updateIconPositions = () => {
    const positions = fieldGroups
      .filter(
        (group) =>
          group.selectedDevice && (group.selectedMetric || !group.selectedMetric)
      )
      .map((group) => ({
        x: group.xPosition || 50,
        y: group.yPosition || 50,
        value: group.lastMetricValue || "",
        link: group.link,
        label: group.label || group.metricName || group.selectedDevice,
        unit: group.unit,
        iconSize: group.iconSize,
      }));
    setIconPositions(positions);
  };

  const handleIconClick = (link) => {
    if (link) {
      window.open(link, "_blank");
    }
  };

  const handleIconMouseDown = (index, e) => {
    e.stopPropagation();
    setDraggingIcon(index);
    const imageElement = document.querySelector("img");
    const imageRect = imageElement.getBoundingClientRect();

    setOffset({
      x:
        e.clientX -
        (imageRect.left + (iconPositions[index].x / 100) * imageRect.width),
      y:
        e.clientY -
        (imageRect.top + (iconPositions[index].y / 100) * imageRect.height),
    });
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
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" component="h2">
          {editMode ? "Edit Image Map Widget" : "Create Image Map Widget"}
        </Typography>

        <Box
          sx={{
            width: "100%",
            height: 170,
            border: "1px dashed grey",
            my: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: tintColor || "#fafafa",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {image ? (
            <>
              <img
                src={image}
                alt="Preview"
                style={{
                  position: "absolute",
                  top: `${imagePosition.top}px`,
                  left: `${imagePosition.left}px`,
                  cursor: "pointer",
                  transform: `scale(${zoom})`,
                  transformOrigin: "center center",
                  width: "100%",
                  height: 170,
                }}
                onMouseDown={handleMouseDown}
              />
              {iconPositions.map((pos, index) => (
                <Tooltip
                  key={index}
                  title={pos.label}
                  placement="top"
                  arrow
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: "white",
                        color: "black",
                        fontSize: "0.8rem",
                        p: 1,
                        borderRadius: "4px",
                        boxShadow: 1,
                      },
                    },
                    arrow: {
                      sx: {
                        color: "white",
                      },
                    },
                  }}
                >
                  <Box
                    onClick={() => handleIconClick(pos.link)}
                    onMouseDown={(e) => handleIconMouseDown(index, e)}
                    sx={{
                      position: "absolute",
                      top: `${pos.y}%`,
                      left: `${pos.x}%`,
                      width: `${pos.iconSize}px`,
                      height: `${pos.iconSize}px`,
                      backgroundColor: iconColor || "black",
                      borderRadius: iconShape === "circle" ? "50%" : "0%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: textColor || "white",
                      cursor: pos.link ? "pointer" : "default",
                    }}
                  >
                    <div>{pos.value}</div>
                    {pos.unit && (
                      <div style={{ fontSize: "0.75rem" }}>{pos.unit}</div>
                    )}
                  </Box>
                </Tooltip>
              ))}
              <Box
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  borderRadius: "4px",
                  boxShadow: 1,
                  p: 0.5,
                }}
              >
                <IconButton
                  aria-label="zoom-in"
                  onClick={handleZoomIn}
                  sx={{
                    backgroundColor: "white",
                    borderRadius: "4px",
                    width: "26px",
                    height: "26px",
                    p: 0,
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
                <IconButton
                  aria-label="zoom-out"
                  onClick={handleZoomOut}
                  sx={{
                    backgroundColor: "white",
                    borderRadius: "4px",
                    width: "26px",
                    height: "26px",
                    p: 0,
                  }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
              </Box>
            </>
          ) : (
            "No image uploaded"
          )}
        </Box>
        <TabContext value={tabValue}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleChange}
              aria-label="image map tabs"
            >
              <Tab label="Basics" value="1" />
              <Tab label="Data" value="2" />
              <Tab label="Appearance" value="3" />
            </Tabs>
          </Box>
          <TabPanel value="1">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                my: 2,
              }}
            >
              {image ? (
                <Box
                  component="img"
                  src={image}
                  sx={{
                    width: 120,
                    height: 80,
                    borderRadius: "4px",
                    border: "1px solid grey",
                  }}
                  alt="Uploaded"
                />
              ) : (
                <Typography sx={{ color: "red", fontSize: "0.8rem" }}>
                  No image has been uploaded
                </Typography>
              )}
              <Button variant="outlined" component="label">
                Change
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
            </Box>

            <Typography variant="subtitle1" gutterBottom>
              Title
            </Typography>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
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
                    Link
                  </Typography>
                  <TextField
                    fullWidth
                    value={group.link}
                    onChange={(e) =>
                      updateFieldGroup(index, "link", e.target.value)
                    }
                    variant="outlined"
                    placeholder="Enter link"
                    sx={{ mb: 2, bgcolor: "white", height: "45px" }}
                    InputProps={{
                      sx: { height: "45px" },
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Label
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder={group.metricName || "Label"}
                        value={group.label}
                        onChange={(e) =>
                          updateFieldGroup(index, "label", e.target.value)
                        }
                        variant="outlined"
                        sx={{ bgcolor: "white", height: "45px" }}
                        InputProps={{
                          sx: { height: "45px" },
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Unit
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Unit"
                        value={group.unit}
                        onChange={(e) =>
                          updateFieldGroup(index, "unit", e.target.value)
                        }
                        variant="outlined"
                        sx={{ bgcolor: "white", height: "45px" }}
                        InputProps={{
                          sx: { height: "45px" },
                        }}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "left", mt: 2 }}>
                    <Button
                      variant="contained"
                      sx={{
                        color: "white",
                        textTransform: "none",
                      }}
                      onClick={() => togglePositionFields(index)}
                    >
                      Edit Position
                    </Button>
                  </Box>
                  {group.showPositionFields && (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        mt: 2,
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            xPosition
                          </Typography>
                          <TextField
                            fullWidth
                            type="number"
                            value={group.xPosition}
                            onChange={(e) =>
                              updateFieldGroup(
                                index,
                                "xPosition",
                                e.target.value
                              )
                            }
                            variant="outlined"
                            sx={{ bgcolor: "white", height: "45px" }}
                            InputProps={{
                              sx: { height: "45px" },
                            }}
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            yPosition
                          </Typography>
                          <TextField
                            fullWidth
                            type="number"
                            value={group.yPosition}
                            onChange={(e) =>
                              updateFieldGroup(
                                index,
                                "yPosition",
                                e.target.value
                              )
                            }
                            variant="outlined"
                            sx={{ bgcolor: "white", height: "45px" }}
                            InputProps={{
                              sx: { height: "45px" },
                            }}
                          />
                        </Box>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Icon Size: {group.iconSize}
                        </Typography>
                        <Slider
                          value={group.iconSize}
                          onChange={(e, newValue) =>
                            updateFieldGroup(index, "iconSize", newValue)
                          }
                          aria-labelledby="icon-size-slider"
                          valueLabelDisplay="auto"
                          min={10}
                          max={200}
                        />
                      </Box>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
            <Button variant="contained" sx={{ mt: 2 }} onClick={handleAddClick}>
              + Add
            </Button>
          </TabPanel>
          <TabPanel value="3">
            <Typography variant="subtitle3" gutterBottom>
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
            <Typography variant="subtitle3" gutterBottom>
              Icon Color
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 1 }}>
              <ColorPicker
                value={iconColor}
                onChange={(color) => setIconColor(color.css.backgroundColor)}
                deferred
                fullWidth
              />
              <Button onClick={() => setIconColor("")}>
                <DeleteIcon />
              </Button>
            </Box>
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
            <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
              <FormLabel component="legend">Icon Shape</FormLabel>
              <RadioGroup
                row
                name="size"
                value={iconShape}
                onChange={(e) => setIconShape(e.target.value)}
              >
                <FormControlLabel
                  value="circle"
                  control={<Radio />}
                  label="Circle"
                />
                <FormControlLabel
                  value="square"
                  control={<Radio />}
                  label="Square"
                />
              </RadioGroup>
            </FormControl>
          </TabPanel>
        </TabContext>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
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

export default ImageMapModal;
