import React from "react";
import { Typography, Box } from "@mui/material";

const TextWidget = ({ data }) => {
  if (!data) {
    return null; // Render nothing if data is undefined
  }

  return (
    <Box
      sx={{
        whiteSpace: "pre-wrap",
        width: "100%",
        height: 150, // Définissez la hauteur souhaitée de l'aperçu
        // border: "1px dashed  grey", // #ccc
        background: data.tintColor || "white",
        marginBottom: 2, // Ajout d'un espace en bas
        padding: 2, // Ajout de padding pour l'espace intérieur
        display: "flex",
        alignItems: "center",
        justifyContent: data.centerText ? "center" : "flex-start", // Ajout de l'alignement du texte
        overflowY: "auto", // Ajout du défilement vertical
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: data.textColor || "black",
          fontSize: data.textSize,
        }}
      >
        {data.textTitle}
      </Typography>
    </Box>
  );
};

export default TextWidget;
