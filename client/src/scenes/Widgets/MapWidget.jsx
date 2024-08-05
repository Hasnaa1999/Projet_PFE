

import React, { useEffect, useRef, useState } from 'react';
import {
    
    Box,
    
  } from "@mui/material";
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Icon } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import Overlay from 'ol/Overlay';
import { defaults as defaultControls } from 'ol/control';

const MapWidget = ({ locations, mapStyle, startLocation, useManualStartLocation, zoom, tintColor }) => {
  const mapElement = useRef(null);
  const mapRef = useRef(null);
  const popupElement = useRef(null);
  const popupContent = useRef(null);

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
  }, [mapStyle, useManualStartLocation, startLocation, zoom]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.getView().setCenter(fromLonLat([Number(startLocation.long), Number(startLocation.lat)]));
      mapRef.current.getView().setZoom(Number(zoom));
    }
  }, [startLocation, zoom, useManualStartLocation]);

  useEffect(() => {
    const flattenedLocations = locations.flat();

    if (flattenedLocations && flattenedLocations.length > 0 && mapRef.current) {
      const validLocations = flattenedLocations.filter(loc =>
        loc && loc.lat !== null && loc.long !== null && !isNaN(Number(loc.lat)) && !isNaN(Number(loc.long))
      );

      if (validLocations.length > 0) {
        const features = validLocations.map(loc => {
          const feature = new Feature({
            geometry: new Point(fromLonLat([Number(loc.long), Number(loc.lat)]))
          });
          feature.set('name', loc.name);
          feature.set('link', loc.link);
          return feature;
        });

        const vectorSource = new VectorSource({ features });
        const vectorLayer = new VectorLayer({
          source: vectorSource,
          style: new Style({
            image: new Icon({
              src: `${process.env.PUBLIC_URL}/icon.png`,
              scale: 0.04,
            })
          })
        });

        mapRef.current.getLayers().getArray().slice(1).forEach(layer => mapRef.current.removeLayer(layer)); // Remove previous layers
        mapRef.current.addLayer(vectorLayer);
        mapRef.current.getView().fit(vectorSource.getExtent(), {
          padding: [50, 50, 50, 50],
          maxZoom: 10
        });

        // Create and add popup overlay
        const popup = new Overlay({
          element: popupElement.current,
          positioning: 'bottom-center',
          stopEvent: false,
          offset: [0, -20],
        });
        mapRef.current.addOverlay(popup);

        mapRef.current.on('pointermove', (event) => {
          const feature = mapRef.current.forEachFeatureAtPixel(event.pixel, (feature) => feature);
          if (feature) {
            const coordinates = feature.getGeometry().getCoordinates();
            const name = feature.get('name');
            if (name) {
              popupContent.current.innerHTML = name;
              popupContent.current.style.display = 'block';
              popup.setPosition(coordinates);
            } else {
              popupContent.current.style.display = 'none';
              popup.setPosition(undefined);
            }
          } else {
            popupContent.current.style.display = 'none';
            popup.setPosition(undefined);
          }
        });

        mapRef.current.on('click', (event) => {
          mapRef.current.forEachFeatureAtPixel(event.pixel, (feature) => {
            const link = feature.get('link');
            if (link) {
              window.open(link, '_blank');
            }
          });
        });

      } else {
        console.error("No valid locations to display on the map.");
      }
    }
  }, [locations]);

  return (
    <Box
      sx={{
        width: "100%",
        height: 400,
       
        background: tintColor || "white",
        marginBottom: 1,
        padding: 1,
      }}
    >
      <div ref={mapElement} style={{ width: "100%", height: "100%" }} />
      <div ref={popupElement} className="ol-popup">
        <div
          ref={popupContent}
          style={{
            backgroundColor: "white",
            padding: "2px",
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
  );
};

export default MapWidget;




