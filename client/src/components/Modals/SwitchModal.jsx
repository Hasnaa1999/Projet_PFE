import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Button,
  Typography,
  TextField,
  Switch,
  IconButton,
  Tabs,
  Tab,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { ColorPicker } from "mui-color";
import DeleteIcon from "@mui/icons-material/Delete";

const SwitchModal = ({ open, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [tintColor, setTintColor] = useState("");
  const [highlightColor, setHighlightColor] = useState("");
  const [hideBackground, setHideBackground] = useState(false);
  const [switchState, setSwitchState] = useState(false); // New state for managing switch state
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleSave = () => {
    onSave({
      title,
      tintColor,
      highlightColor,
      hideBackground,
      switchState, // Save switchState
    });
    onClose();
  };

  useEffect(() => {
    if (open) {
      setTitle("");
      setTintColor("");
      setHighlightColor("");
      setHideBackground(false);
      setSwitchState(false);
      setTabIndex(0); // Ensure tabIndex is set to 0 (Basic) on open
    }
  }, [open]);

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
          Edit Switch Widget
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabIndex} onChange={handleTabChange} aria-label="basic tabs example">
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
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
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
                value={highlightColor}
                onChange={(color) => setHighlightColor(color.css.backgroundColor)}
                deferred
                fullWidth
              />
              <Button onClick={() => setHighlightColor("")}>
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
              Hide Background
            </Typography>
            <Switch
              checked={hideBackground}
              onChange={(e) => setHideBackground(e.target.checked)}
              color="primary"
            />
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

export default SwitchModal;
