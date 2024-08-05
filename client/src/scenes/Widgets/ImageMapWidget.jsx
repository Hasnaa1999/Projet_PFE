import React from "react";
import { Box, Tooltip } from "@mui/material";

const ImageMapWidget = ({ data }) => {
  if (!data || !data.image) return null;

  const handleIconClick = (link) => {
    if (link) {
      window.open(link, "_blank");
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: 270,
        my: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: data.tintColor || "#fafafa",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <>
        <img
          src={data.image}
          alt="Preview"
          style={{
            position: "absolute",
            top: `${data.imagePosition.top}px`,
            left: `${data.imagePosition.left}px`,
            cursor: "pointer",
            transform: `scale(${data.zoom})`,
            transformOrigin: "center center",
            width: "100%",
            height: 270,
          }}
        />
        {data.iconPositions.map((pos, index) => (
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
              sx={{
                position: "absolute",
                top: `${pos.y}%`,
                left: `${pos.x}%`,
                width: `${pos.iconSize}px`,
                height: `${pos.iconSize}px`,
                backgroundColor: data.iconColor || "black",
                borderRadius: data.iconShape === "circle" ? "50%" : "0%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: data.textColor || "white",
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
      </>
    </Box>
  );
};

export default ImageMapWidget;
