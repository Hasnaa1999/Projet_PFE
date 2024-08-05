import React from "react";
import { Card, CardMedia, CardActionArea } from "@mui/material";

const ImageWidget = ({ data }) => {
  if (!data || !data.image) return null; // Check if data and image exist

  const imageStyle = {
    objectFit: data.imageSize === "cover" ? "cover" : "contain",
    width: "100%",
    height: "180px", // Example fixed height
    backgroundColor: data.backgroundVisibility ? "transparent" : "grey", // Default background
    ...(data.tintColor && { background: data.tintColor }), // Apply tint color if available
  };

  const handleImageClick = () => {
    if (data.link) {
      if (data.openInNewTab) {
        window.open(data.link, "_blank"); // Open the link in a new tab
      } else {
        window.location.href = data.link; // Open the link in the same tab
      }
    }
  };

  return (
    <CardActionArea onClick={handleImageClick} style={{ cursor: "pointer" }}>
      <CardMedia
        component="img"
        style={imageStyle}
        image={data.image}
        alt="Loaded Image"
      />
    </CardActionArea>
  );
};

export default ImageWidget;
