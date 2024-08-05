import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Box,
  Button,
  Typography,
  IconButton,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  Tabs,
  Tab,
  Switch,
  Select,
  MenuItem,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useStateContext } from "../../contexts/ContextProvider";
import "ol/ol.css";
import { Map, View } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM } from "ol/source";
import { Point } from "ol/geom";
import { Vector as VectorSource } from "ol/source";
import { Feature } from "ol";
import { fromLonLat } from "ol/proj";
import { Style, Icon } from "ol/style";
import Overlay from "ol/Overlay";
import { ColorPicker } from "mui-color";
import DeleteIcon from "@mui/icons-material/Delete";
import { defaults as defaultControls } from 'ol/control';

const MapModal = ({ open, onClose, onAddMap, onUpdateMap, widgetData, widgetId }) => {
  const { devices } = useStateContext();
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [deviceLinks, setDeviceLinks] = useState({});
  const [tabIndex, setTabIndex] = useState(0);
  const [mapTitle, setMapTitle] = useState("Map");
  const [locations, setLocations] = useState([]);
  const [startLocation, setStartLocation] = useState({ lat: 0, long: 0 });
  const [useManualStartLocation, setUseManualStartLocation] = useState(false);
  const [zoom, setZoom] = useState(0);
  const [mapStyle, setMapStyle] = useState("Light");
  const [tintColor, setTintColor] = useState("");

  const mapElement = useRef(null);
  const mapRef = useRef(null);
  const popupElement = useRef(null);
  const popupContent = useRef(null);

  useEffect(() => {
    if (widgetData) {
      // Set data for editing
      setSelectedDevices(widgetData.selectedDevices || []);
      setDeviceLinks(widgetData.deviceLinks || {});
      setMapTitle(widgetData.mapTitle || "Map");
      setLocations(widgetData.locations || []);
      setStartLocation(widgetData.startLocation || { lat: 0, long: 0 });
      setUseManualStartLocation(widgetData.useManualStartLocation || false);
      setZoom(widgetData.zoom || 0);
      setMapStyle(widgetData.mapStyle || "Light");
      setTintColor(widgetData.tintColor || "");
    }
  }, [widgetData]);

  useEffect(() => {
    if (open && !widgetData) {
      // Reset state for new map
      setSelectedDevices([]);
      setDeviceLinks({});
      setMapTitle("Map");
      setLocations([]);
      setStartLocation({ lat: 0, long: 0 });
      setUseManualStartLocation(false);
      setZoom(0);
      setMapStyle("Light");
      setTintColor("");
    }
  }, [open, widgetData]);

  const handleStartLocationChange = (field, value) => {
    setStartLocation((prev) => ({ ...prev, [field]: value }));
  };

  const handleManualStartLocationToggle = (event) => {
    setUseManualStartLocation(event.target.checked);
  };

  const handleZoomChange = (event) => {
    setZoom(event.target.value);
  };

  const handleStyleChange = (event) => {
    setMapStyle(event.target.value);
  };

  const handleTitleChange = (event) => {
    setMapTitle(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleDeviceToggle = (deviceName) => {
    setSelectedDevices((prevSelectedDevices) =>
      prevSelectedDevices.includes(deviceName)
        ? prevSelectedDevices.filter((name) => name !== deviceName)
        : [...prevSelectedDevices, deviceName]
    );
  };

  const handleLinkChange = (deviceName, event) => {
    setDeviceLinks({
      ...deviceLinks,
      [deviceName]: event.target.value,
    });
  };

  const handleSave = () => {
    const locations = devices
      .filter((device) => selectedDevices.includes(device.name))
      .map((device) => ({
        lat: device.location.lat,
        long: device.location.long,
        link: deviceLinks[device.name] || "",
        name: device.name,
      }));

    const mapData = {
      selectedDevices,
      deviceLinks,
      mapTitle,
      locations,
      mapStyle,
      startLocation,
      useManualStartLocation,
      zoom,
      tintColor,
    };

    if (widgetId) {
      onUpdateMap(widgetId, mapData);
    } else {
      onAddMap(mapData);
    }
    onClose();
  };

  const getTileSource = () => {
    switch (mapStyle) {
      case "Dark":
        return new OSM({
          url: "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        });
      case "Outdoors":
        return new OSM({
          url: "https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png",
        });
      case "Satellite":
        return new OSM({
          url: "https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png",
        });
      case "Streets":
        return new OSM({
          url: "https://{a-c}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png",
        });
      default:
        return new OSM();
    }
  };

  useEffect(() => {
    if (open) {
      if (!mapRef.current && mapElement.current) {
        mapRef.current = new Map({
          target: mapElement.current,
          layers: [
            new TileLayer({
              source: getTileSource(),
            }),
          ],
          view: new View({
            center: fromLonLat(
              useManualStartLocation
                ? [Number(startLocation.long), Number(startLocation.lat)]
                : [0, 0]
            ),
            zoom: Number(zoom),
          }),
          controls: defaultControls({ zoom: false, attribution: false }),
        });
      }

      const flattenedLocations = locations.flat();

      if (flattenedLocations.length > 0 && mapRef.current) {
        const validLocations = flattenedLocations.filter(
          (loc) =>
            loc &&
            loc.lat !== null &&
            loc.long !== null &&
            !isNaN(Number(loc.lat)) &&
            !isNaN(Number(loc.long))
        );

        if (validLocations.length > 0) {
          const features = validLocations.map((loc) => {
            const feature = new Feature({
              geometry: new Point(
                fromLonLat([Number(loc.long), Number(loc.lat)])
              ),
            });
            feature.set("name", loc.name);
            feature.set("link", loc.link);
            return feature;
          });

          const vectorSource = new VectorSource({ features });
          const vectorLayer = new VectorLayer({
            source: vectorSource,
            style: new Style({
              image: new Icon({
                src: `${process.env.PUBLIC_URL}/icon.png`,
                scale: 0.04,
              }),
            }),
          });

          mapRef.current
            .getLayers()
            .getArray()
            .slice(1)
            .forEach((layer) => mapRef.current.removeLayer(layer));
          mapRef.current.addLayer(vectorLayer);
          mapRef.current.getView().fit(vectorSource.getExtent(), {
            padding: [50, 50, 50, 50],
            maxZoom: 10,
          });

          const popup = new Overlay({
            element: popupElement.current,
            positioning: "bottom-center",
            stopEvent: false,
            offset: [0, -20],
          });
          mapRef.current.addOverlay(popup);

          mapRef.current.on("pointermove", (event) => {
            const feature = mapRef.current.forEachFeatureAtPixel(
              event.pixel,
              (feature) => feature
            );
            if (feature) {
              const coordinates = feature.getGeometry().getCoordinates();
              const name = feature.get("name");
              if (name) {
                popupContent.current.innerHTML = name;
                popupContent.current.style.display = "block";
                popup.setPosition(coordinates);
              } else {
                popupContent.current.style.display = "none";
                popup.setPosition(undefined);
              }
            } else {
              popupContent.current.style.display = "none";
              popup.setPosition(undefined);
            }
          });

          mapRef.current.on("click", (event) => {
            mapRef.current.forEachFeatureAtPixel(event.pixel, (feature) => {
              const link = feature.get("link");
              if (link) {
                window.open(link, "_blank");
              }
            });
          });
        } else {
          console.error("No valid locations to display on the map.");
        }
      }
    }
  }, [open, locations]);

  useEffect(() => {
    if (mapRef.current && useManualStartLocation) {
      mapRef.current
        .getView()
        .setCenter(
          fromLonLat([Number(startLocation.long), Number(startLocation.lat)])
        );
      mapRef.current.getView().setZoom(Number(zoom));
    }
  }, [useManualStartLocation, startLocation, zoom]);

  useEffect(() => {
    const newLocations = devices
      .filter((device) => selectedDevices.includes(device.name))
      .map((device) => ({
        lat: device.location.lat,
        long: device.location.long,
        link: deviceLinks[device.name] || "",
        name: device.name,
      }));
    setLocations(newLocations);
  }, [selectedDevices, deviceLinks, devices]);

  useEffect(() => {
    if (mapRef.current) {
      const tileLayer = new TileLayer({
        source: getTileSource(),
      });
      mapRef.current.getLayers().setAt(0, tileLayer);
    }
  }, [mapStyle]);

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
          {widgetId ? "Edit Map Widget" : "Create Map Widget"}
        </Typography>

        <Box
          sx={{
            width: "100%",
            height: 200,
            border: "1px dashed grey",
            background: tintColor || "white",
            marginBottom: 2,
            padding: 2,
          }}
        >
          <div ref={mapElement} style={{ width: "100%", height: "100%" }} />
          <div ref={popupElement} className="ol-popup">
            <div
              ref={popupContent}
              style={{
                backgroundColor: "white",
                padding: "5px",
                borderRadius: "5px",
                border: "1px solid black",
                fontSize: "14px",
                fontWeight: "bold",
                textAlign: "center",
                display: "none",
              }}
            ></div>
          </div>
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
              value={mapTitle}
              onChange={handleTitleChange}
              variant="outlined"
            />
          </Box>
        )}
        {tabIndex === 1 && (
          <FormGroup sx={{ width: "100%", mb: 3, marginTop: 2 }}>
            {devices.map((device) => (
              <div
                key={device.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedDevices.includes(device.name)}
                      onChange={() => handleDeviceToggle(device.name)}
                    />
                  }
                  label={device.name}
                  sx={{ flex: 1 }}
                />
                {selectedDevices.includes(device.name) && (
                  <TextField
                    value={deviceLinks[device.name] || ""}
                    onChange={(event) => handleLinkChange(device.name, event)}
                    placeholder="Enter link"
                    size="small"
                    sx={{ ml: 2, flex: 2 }}
                  />
                )}
              </div>
            ))}
          </FormGroup>
        )}
        {tabIndex === 2 && (
          <Box sx={{ marginTop: 2 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={useManualStartLocation}
                    onChange={handleManualStartLocationToggle}
                  />
                }
                label="Manual start location"
              />
              {useManualStartLocation && (
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      label="Start Latitude"
                      value={startLocation.lat}
                      onChange={(e) =>
                        handleStartLocationChange("lat", e.target.value)
                      }
                      fullWidth
                      sx={{ marginTop: 2 }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      label="Start Longitude"
                      value={startLocation.long}
                      onChange={(e) =>
                        handleStartLocationChange("long", e.target.value)
                      }
                      fullWidth
                      sx={{ marginTop: 2 }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      label="Zoom"
                      type="number"
                      value={zoom}
                      onChange={handleZoomChange}
                      fullWidth
                      sx={{ marginTop: 2 }}
                    />
                  </Box>
                </Box>
              )}
              <Box sx={{ marginTop: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Tint Color
                </Typography>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, p: 1 }}
                >
                  <ColorPicker
                    value={tintColor}
                    onChange={(color) =>
                      setTintColor(color.css.backgroundColor)
                    }
                    deferred
                    fullWidth
                  />
                  <Button onClick={() => setTintColor("")}>
                    <DeleteIcon />
                  </Button>
                </Box>
                <Typography variant="subtitle1" gutterBottom>
                  Style
                </Typography>
                <Select fullWidth value={mapStyle} onChange={handleStyleChange}>
                  <MenuItem value="Light">Light</MenuItem>
                  <MenuItem value="Dark">Dark</MenuItem>
                  <MenuItem value="Outdoors">Outdoors</MenuItem>
                  <MenuItem value="Satellite">Satellite</MenuItem>
                  <MenuItem value="Streets">Streets</MenuItem>
                </Select>
              </Box>
            </FormGroup>
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

export default MapModal;
