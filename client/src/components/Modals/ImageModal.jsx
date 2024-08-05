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
  Switch,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  FormGroup,
} from "@mui/material";
import { Close as CloseIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { ColorPicker } from "mui-color";

const ImageModal = ({ open, onClose, onAddImage, onUpdateImage, widgetData, widgetId }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [backgroundVisibility, setBackgroundVisibility] = useState(true);
  const [imageSize, setImageSize] = useState("contain");
  const [link, setLink] = useState("");
  const [tintColor, setTintColor] = useState("");
  const [showLinkField, setShowLinkField] = useState(false);
  const [openInNewTab, setOpenInNewTab] = useState(false);

  useEffect(() => {
    if (widgetData) {
      setSelectedImage(widgetData.image || null);
      setBackgroundVisibility(widgetData.backgroundVisibility !== false);
      setImageSize(widgetData.imageSize || "contain");
      setLink(widgetData.link || "");
      setTintColor(widgetData.tintColor || "");
      setShowLinkField(!!widgetData.link);
      setOpenInNewTab(widgetData.openInNewTab || false);
    }
  }, [widgetData]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setSelectedImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    if (showLinkField && link) {
      if (openInNewTab) {
        window.open(link, "_blank");
      } else {
        window.location.href = link;
      }
    }
  };

  const handleSave = () => {
    const imageData = {
      image: selectedImage,
      imageSize,
      backgroundVisibility,
      link,
      tintColor,
      openInNewTab,
    };
    if (widgetId) {
      onUpdateImage(widgetId, imageData);
    } else {
      onAddImage(imageData);
    }
    onClose();
  };

  useEffect(() => {
    if (open && !widgetData) {
      setSelectedImage(null);
      setBackgroundVisibility(true);
      setImageSize("contain");
      setLink("");
      setTintColor("");
      setShowLinkField(false);
      setOpenInNewTab(false);
    }
  }, [open, widgetData]);

  const handleClose = () => {
    setSelectedImage(null);
    setBackgroundVisibility(true);
    setImageSize("contain");
    setLink("");
    setTintColor("");
    setShowLinkField(false);
    setOpenInNewTab(false);
    onClose();
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
          <CloseIcon />
        </IconButton>

        <Typography variant="h6" component="h2">
          {widgetId ? "Edit Image Widget" : "Create Image Widget"}
        </Typography>

        <Box
          sx={{
            width: "100%",
            height: 180,
            border: "1px dashed grey",
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: backgroundVisibility ? "transparent" : "gray",
            background: tintColor,
          }}
        >
          {selectedImage ? (
            <img
              src={selectedImage}
              alt="Preview"
              style={{
                maxWidth: imageSize === "contain" ? "100%" : "auto",
                maxHeight: imageSize === "contain" ? "100%" : "auto",
                width: imageSize === "cover" ? "100%" : "auto",
                height: imageSize === "cover" ? "100%" : "auto",
                objectFit: imageSize === "cover" ? "cover" : "contain",
                cursor: showLinkField && link ? "pointer" : "default",
              }}
              onClick={handleImageClick}
            />
          ) : (
            "No image uploaded"
          )}
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
            <Button variant="outlined" component="label" sx={{ mb: 2 }}>
              Change
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>
            <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
              <FormLabel component="legend">Size</FormLabel>
              <RadioGroup
                row
                name="size"
                value={imageSize}
                onChange={(e) => setImageSize(e.target.value)}
              >
                <FormControlLabel
                  value="contain"
                  control={<Radio />}
                  label="Contain"
                />
                <FormControlLabel
                  value="cover"
                  control={<Radio />}
                  label="Cover"
                />
              </RadioGroup>
            </FormControl>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={backgroundVisibility}
                    onChange={(e) => setBackgroundVisibility(e.target.checked)}
                  />
                }
                label="Hide background"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={showLinkField}
                    onChange={(e) => setShowLinkField(e.target.checked)}
                  />
                }
                label="Add link"
              />
              {showLinkField && (
                <>
                  <TextField
                    label="Link"
                    variant="outlined"
                    fullWidth
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    margin="normal"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={openInNewTab}
                        onChange={(e) => setOpenInNewTab(e.target.checked)}
                      />
                    }
                    label="Open link in new tab"
                  />
                </>
              )}
            </FormGroup>
          </Box>
        )}

        {tabIndex === 1 && (
          <Box sx={{ marginTop: 2 }}>
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
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{ ml: 2 }}
            disabled={!selectedImage}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ImageModal;
