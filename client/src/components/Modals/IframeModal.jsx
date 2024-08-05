import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Button,
  Typography,
  TextField,
  IconButton,
  Tab,
  Tabs,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { ColorPicker } from "mui-color";

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false; // Return false if the URL is invalid
  }
}

const IframeModal = ({ open, onClose, onAddIframe, onUpdateIframe, widgetData, widgetId }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [tintColor, setTintColor] = useState("");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (widgetData) {
      setEditMode(true);
      setTitle(widgetData.title || "");
      setSource(widgetData.source || "");
      setTintColor(widgetData.tintColor || "");
    } else {
      setEditMode(false);
    }
  }, [widgetData]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleSourceChange = (e) => {
    const url = e.target.value;
    setSource(url);
    if (!isValidUrl(url) && url !== "") {
      console.error("Invalid URL"); // Log or notify the user only if the URL is non-empty but invalid
    }
  };

  // Reset the state when the modal is opened
  useEffect(() => {
    if (open && !widgetData) {
      setTitle("");
      setSource("");
      setTintColor("");
    }
  }, [open, widgetData]);

  // This function is called when the modal is closed to ensure the state is reset
  const handleClose = () => {
    setTitle("");
    setSource("");
    setTintColor("");
    onClose(); // Call the onClose function passed as a prop
  };

  const handleSave = () => {
    if (isValidUrl(source)) {
      const iframeData = { title, source, tintColor };
      if (editMode && widgetId) {
        onUpdateIframe(widgetId, iframeData);
      } else {
        onAddIframe(iframeData);
      }
      onClose();
    } else {
      console.error("Cannot save: Invalid URL");
    }
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
          {editMode ? "Edit Iframe Widget" : "Create Iframe Widget"}
        </Typography>
        <Box
          sx={{
            width: "100%",
            height: 200,
            border: "1px dashed grey",
            background: tintColor,
            marginBottom: 2,
          }}
        >
          <iframe
            src={source}
            width="100%"
            height="100%"
            title="Iframe Preview"
            style={{ border: "none" }}
          />
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            aria-label="basic tabs example"
          >
            <Tab label="Basics" />
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
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="outlined"
            />
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Source
            </Typography>
            <TextField
              fullWidth
              placeholder="Source"
              value={source}
              onChange={handleSourceChange}
              variant="outlined"
            />
          </Box>
        )}

        {tabIndex === 1 && (
          <Box sx={{ marginTop: 2 }}>
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

export default IframeModal;
