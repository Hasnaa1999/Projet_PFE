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

const TextModal = ({ open, onClose, onAddText, onUpdateText, widgetData, widgetId }) => {
  const [textTitle, setTextTitle] = useState("");
  const [error, setError] = useState(""); // State for storing error message
  const [tabIndex, setTabIndex] = useState(0);
  const [textColor, setTextColor] = useState("");
  const [centerText, setCenterText] = useState(false);
  const [textSize, setTextSize] = useState(24); // Default text size
  const [tintColor, setTintColor] = useState("");

  useEffect(() => {
    if (widgetData) {
      setTextTitle(widgetData.textTitle || "");
      setTextColor(widgetData.textColor || "");
      setCenterText(widgetData.centerText || false);
      setTextSize(widgetData.textSize || 24);
      setTintColor(widgetData.tintColor || "");
    }
  }, [widgetData]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  // Reset text on modal open
  useEffect(() => {
    if (open && !widgetData) {
      setTextTitle("");
      setError(""); // Reset error on modal open
      setTextColor("");
      setCenterText(false);
      setTextSize(24);
      setTintColor("");
    }
  }, [open, widgetData]);

  const handleTitleChange = (event) => {
    setTextTitle(event.target.value);
    if (error) setError(""); // Clear error on input
  };

  const handleSave = () => {
    if (textTitle.trim() === "") {
      setError("Text cannot be empty."); // Set error if text is empty
    } else {
      const textData = {
        textTitle,
        textColor,
        tintColor,
        centerText,
        textSize,
      };
      if (widgetId) {
        onUpdateText(widgetId, textData);
      } else {
        onAddText(textData);
      }
      onClose(); // Close modal after saving
    }
  };

  // This function is called when the modal is closed to ensure the text is reset
  const handleClose = () => {
    setTextTitle("");
    setError(""); // Reset error on close
    setTextColor("");
    setCenterText(false);
    setTextSize(24);
    setTintColor("");
    onClose(); // Call the onClose function passed as a prop
  };

  const handleTextSizeChange = (event, newValue) => {
    setTextSize(newValue);
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
          {widgetId ? "Edit Text Widget" : "Create Text Widget"}
        </Typography>

        <Box
          sx={{
            whiteSpace: "pre-wrap",
            width: "100%",
            height: 150,
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
            {textTitle}
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
              Text
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="New Text"
              value={textTitle}
              onChange={handleTitleChange}
              error={!!error} // Add 'error' prop to indicate error
              helperText={error} // Display error message under text field
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
              Center text
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 1 }}>
              <Switch
                checked={centerText}
                onChange={(e) => setCenterText(e.target.checked)}
                color="primary"
              />
            </Box>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Text size
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

export default TextModal;
