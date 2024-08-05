import React, { useState } from "react";
import { Modal, Box, Typography, Grid, Button } from "@mui/material";
import {
  BarChartOutlined,
  CheckBox,
  Close,
  Image,
  Map,
  MapSharp,
  ShortTextOutlined,
  ShowChart,
  SlideshowRounded,
  SwitchAccessShortcut,
  TableRowsSharp,
  ViewHeadlineSharp,
  
} from "@mui/icons-material";
import PieChartIcon from "@mui/icons-material/PieChart";
import TableModal from "./Modals/TableModal";
import HistogramWidgetModal from "./Modals/HistogramWidgetModal";
import WidgetOptionCard from "./WidgetOptionCard";
import EditChartWidgetModal from "./Modals/EditChartWidgetModal";
import HeadlineModal from "./Modals/HeadlineModal";
import BooleanModal from "./Modals/BooleanModal";
import ValueModal from "./Modals/ValueModal";
import ImageModal from "./Modals/ImageModal";
import TextModal from "./Modals/TextModal";
import MapModal from "./Modals/MapModal";
import IframeModal from "./Modals/IframeModal";
import SliderModal from "./Modals/SliderModal";
import SwitchModal from "./Modals/SwitchModal";
import ImageMapModal from "./Modals/ImageMapModal";
import { useStateContext } from "../contexts/ContextProvider";
import PieModal from "./Modals/PieModal";
import AddIcon from '@mui/icons-material/Add';

const modalComponents = {
  EditChartWidgetModal,
  HistogramWidgetModal,
  HeadlineModal,
  BooleanModal,
  ValueModal,
  TableModal,
  ImageModal,
  TextModal,
  MapModal,
  SliderModal,
  IframeModal,
  SwitchModal,
  ImageMapModal,
  PieModal,
};

const WidgetModal = ({
  onAddChart,
  onClose,
  onAddWidget,
  onAddHistogram,
  onAddHeadline,
  onAddBoolean,
  onAddValue,
  onAddTable,
  onAddImage,
  onAddText,
  onAddMap,
  onAddSlider,
  onAddIframe,
  onAddSwitch,
  onAddImageMap,
  onAddPie,
}) => {
  const { dataMetric, devices } = useStateContext();
  const [open, setOpen] = useState(false);
  const [modalState, setModalState] = useState({ type: null, isOpen: false });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const openModal = (type) => setModalState({ type, isOpen: true });
  const closeModal = () => setModalState({ type: null, isOpen: false });

  const widgetOptions = [
    {
      title: "Boolean",
      description: "Displays a boolean state",
      Icon: CheckBox,
      modalType: "BooleanModal",
    },
    {
      title: "Chart",
      description: "Displays a chart",
      Icon: ShowChart,
      modalType: "EditChartWidgetModal",
    },
    {
      title: "Pie Chart",
      description: "Displays a pie chart",
      Icon: PieChartIcon,
      modalType: "PieModal",

    },
    {
      title: "Headline",
      description: "Displays a headline",
      Icon: ViewHeadlineSharp,
      modalType: "HeadlineModal",
    },
    {
      title: "Histogram",
      description: "Displays a histogram",
      Icon: BarChartOutlined,
      modalType: "HistogramWidgetModal",
    },
    {
      title: "Map",
      description: "Displays a map",
      Icon: Map,
      modalType: "MapModal",
    },
    {
      title: "Table",
      description: "Displays a table of data",
      Icon: TableRowsSharp,
      modalType: "TableModal",
    },
    {
      title: "Text",
      description: "Displays a text widget",
      Icon: ShortTextOutlined,
      modalType: "TextModal",
    },
    {
      title: "Value",
      description: "Displays a measurement",
      Icon: CheckBox,
      modalType: "ValueModal",
    },
    {
      title: "Switch",
      description: "Displays a switch widget",
      Icon: SwitchAccessShortcut,
      modalType: "SwitchModal",
    },
    {
      title: "Slider",
      description: "Displays a slider",
      Icon: SlideshowRounded,
      modalType: "SliderModal",
    },
    {
      title: "Image",
      description: "Displays a static image",
      Icon: Image,
      modalType: "ImageModal",
    },
    {
      title: "Image Map",
      description: "Displays interactive diagrams",
      Icon: MapSharp,
      modalType: "ImageMapModal",
    },
    {
      title: "Iframe",
      description: "Displays an Iframe",
      Icon: MapSharp,
      modalType: "IframeModal",
    },
  ];

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    overflow: "auto",
    maxHeight: "80vh",
    display: "flex",
    flexDirection: "column",
  };

  const ModalComponent = modalState.type
    ? modalComponents[modalState.type]
    : null;

  return (
    <>
      <Box
        sx={{
          display: "fixed",
          justifyContent: "flex-end",
          padding: "10px",
          position: "fixed",
          top: "0",
          right: "0",
        }}
      >
        <Button
          onClick={handleOpen}
          variant="contained"
          sx={{
            position: "fixed",
            
            padding: "10px 20px",
            width: "fit-content",
            height: "48px",
            marginRight: "250px",
            marginTop: "10px",
            fontSize: "1rem",
            borderRadius: "24px", // Round the edges
            backgroundColor: "#2596be", // Light blue color
            background: "linear-gradient(145deg, #2596be, #29a3cf)", // Gradient background
            boxShadow: "5px 5px 10px #bfbfbf, -5px -5px 10px #ffffff", // 3D shadow effect
            color: "#fff", // Text color
            "&:hover": {
              backgroundColor: "#29a3cf", // Slightly darker shade for hover effect
            },
           
          }}
          startIcon={<AddIcon sx={{ color: "#fff" }} />} 
        >
          Add Widget
        </Button>
      </Box>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Grid container spacing={2}>
            {widgetOptions.map((option, index) => (
              <WidgetOptionCard
                key={index}
                title={option.title}
                description={option.description}
                Icon={option.Icon}
                onClick={() => openModal(option.modalType)}
              />
            ))}
          </Grid>
        </Box>
      </Modal>

      {ModalComponent && (
        <ModalComponent
          open={modalState.isOpen}
          onClose={closeModal}
          onWidgetModalClose={handleClose}
          {...{
            onAddChart,
            onAddWidget,
            onAddHistogram,
            onAddHeadline,
            onAddBoolean,
            onAddValue,
            onAddTable,
            onAddImage,
            onAddText,
            onAddMap,
            onAddSlider,
            onAddIframe,
            onAddSwitch,
            onAddImageMap,
            onAddPie,
          }}
        />
      )}
    </>
  );
};

export default WidgetModal;
