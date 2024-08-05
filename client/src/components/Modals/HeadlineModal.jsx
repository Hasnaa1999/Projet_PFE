import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Tabs,
  Tab,
  Switch,
  Slider,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { ColorPicker } from "mui-color";
import DeleteIcon from "@mui/icons-material/Delete";

const HeadlineModal = ({ open, onClose, onAddHeadline, onUpdateHeadline, widgetData, widgetId }) => {
  const [chartTitle, setChartTitle] = useState("New Headline");
  const [tabIndex, setTabIndex] = useState(0);
  const [textColor, setTextColor] = useState("");
  const [centerText, setCenterText] = useState(false);
  const [textSize, setTextSize] = useState(24); // Default text size
  const [tintColor, setTintColor] = useState("");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (widgetData) {
      setEditMode(true);
      setChartTitle(widgetData.chartTitle || "New Headline");
      setTintColor(widgetData.tintColor || "");
      setTextColor(widgetData.textColor || "");
      setCenterText(widgetData.centerText || false);
      setTextSize(widgetData.textSize || 24);
    } else {
      setEditMode(false);
    }
  }, [widgetData]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleTitleChange = (event) => {
    setChartTitle(event.target.value);
  };

  const handleSave = () => {
    const headlineData = {
      chartTitle,
      textColor,
      centerText,
      textSize,
      tintColor,
    };
    if (editMode && widgetId) {
      onUpdateHeadline(widgetId, headlineData);
    } else {
      onAddHeadline(headlineData);
    }
    onClose();
  };

  const handleTextSizeChange = (event, newValue) => {
    setTextSize(newValue);
  };

  // Reset the text when the modal is opened
  useEffect(() => {
    if (open && !widgetData) {
      setChartTitle("New Headline");
      setTintColor("");
      setCenterText(false);
      setTextColor("");
      setTextSize(24);
    }
  }, [open, widgetData]);

  // This function is called when the modal is closed to ensure the text is reset
  const handleClose = () => {
    setChartTitle("New Headline");
    setTintColor("");
    setCenterText(false);
    setTextColor("");
    setTextSize(24);
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
          {editMode ? "Edit Headline Widget" : "Create Headline Widget"}
        </Typography>

        <Box
          sx={{
            width: "100%",
            height: 90,
            border: "1px dashed grey",
            background: tintColor || "white",
            marginBottom: 2,
            padding: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: centerText ? "center" : "flex-start",
            overflowY: "auto",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: textColor || "black",
              fontSize: textSize,
            }}
          >
            {chartTitle}
          </Typography>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            aria-label="basic tabs example"
          >
            <Tab label="Basic" />
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
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Center Text
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 1 }}>
              <Switch
                checked={centerText}
                onChange={(e) => setCenterText(e.target.checked)}
                color="primary"
              />
            </Box>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Text Size
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 1 }}>
              <Slider
                value={textSize}
                onChange={handleTextSizeChange}
                aria-labelledby="text-size-slider"
                valueLabelDisplay="auto"
                min={10}
                max={50}
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

export default HeadlineModal;
