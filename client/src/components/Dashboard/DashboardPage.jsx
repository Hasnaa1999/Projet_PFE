import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Modal,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import WidgetModal from "../WidgetModal";
import { useStateContext } from "../../contexts/ContextProvider";
import { generateLayout, getNextPosition } from "../../scenes/widgetHelpers";
import { WidgetTypes } from "../../scenes/constants";
import LineChart from "../../scenes/Charts/LineChart";
import AreaChart from "../../scenes/Charts/AreaChart";
import BarChart from "../../scenes/Charts/BarChart";
import HistogramChart from "../../scenes/Charts/HistogramChart";
import BooleanWidget from "../../scenes/Widgets/BooleanWidget";
import ValueWidget from "../../scenes/Widgets/ValueWidget";
import ImageWidget from "../../scenes/Widgets/ImageWidget";
import TextWidget from "../../scenes/Widgets/TextWidget";
import MapWidget from "../../scenes/Widgets/MapWidget";
import SliderWidget from "../../scenes/Widgets/SliderWidget";
import IframeWidget from "../../scenes/Widgets/IframeWidget";
import ImageMapWidget from "../../scenes/Widgets/ImageMapWidget";
import WidgetContainer from "../../scenes/WidgetContainer";
import HeadlineWidget from "../../scenes/Widgets/HeadlineWidget";
import TableWidget from "../../scenes/Widgets/TableWidget";
import { updateDashboardName, deleteDashboard } from "./DashboardFunctions";
import { Close } from "@mui/icons-material";
import EditChartWidgetModal from "../Modals/EditChartWidgetModal";
import TextModal from "../Modals/TextModal";
import TableModal from "../Modals/TableModal";
import SliderModal from "../Modals/SliderModal";
import MapModal from "../Modals/MapModal";
import ImageModal from "../Modals/ImageModal";
import ImageMapModal from "../Modals/ImageMapModal";
import IframeModal from "../Modals/IframeModal";
import HeadlineModal from "../Modals/HeadlineModal";
import ValueModal from "../Modals/ValueModal";
import BooleanModal from "../Modals/BooleanModal";
import PieWidget from "../../scenes/Widgets/PieWidget";
import TelegramIcon from '@mui/icons-material/Telegram';
import EditIcon from '@mui/icons-material/Edit';
import PieModal from "../Modals/PieModal";
import CheckIcon from '@material-ui/icons/Check';


const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  border: "2px solid #fff",
  boxShadow: 24,
  p: 4,
};

const ResponsiveGridLayout = WidthProvider(Responsive);

const gridStyle = {
  backgroundSize: "100% 100%", // Adjust to make grid lines extend to container size
};

const createWidgetComponent = (widget) => {
  const widgetComponents = {
    [WidgetTypes.LINE]: (
      <LineChart
        metrics={widget.data}
        timeframeData={widget.timeframeData}
        title={widget.title}
        showSummaryTable={widget.summaryTable}
      />
    ),
    [WidgetTypes.AREA]: (
      <AreaChart
        metrics={widget.data}
        timeframeData={widget.timeframeData}
        title={widget.title}
        showSummaryTable={widget.summaryTable}
      />
    ),
    [WidgetTypes.BAR]: (
      <BarChart
        metrics={widget.data}
        timeframeData={widget.timeframeData}
        title={widget.title}
        showSummaryTable={widget.summaryTable}
      />
    ),
    [WidgetTypes.BOOLEAN]: <BooleanWidget data={widget.data} />,
    [WidgetTypes.VALUE]: <ValueWidget data={widget.data} />,
    [WidgetTypes.IMAGE]: <ImageWidget data={widget.data} />,
    [WidgetTypes.TEXT]: <TextWidget data={widget.data} />,
    [WidgetTypes.MAP]: (
      <MapWidget
        locations={widget.data.locations}
        mapStyle={widget.data.mapStyle}
        startLocation={widget.data.startLocation}
        useManualStartLocation={widget.data.useManualStartLocation}
        zoom={widget.data.zoom}
        tintColor={widget.data.tintColor}
      />
    ),
    [WidgetTypes.SLIDER]: (
      <SliderWidget
        sliderValue={widget.data.sliderValue}
        title={widget.data.title}
        unit={widget.data.unit}
        orientation={widget.data.orientation}
        valueFrom={widget.data.valueFrom}
        valueTo={widget.data.valueTo}
        stepValue={widget.data.stepValue}
        tintColor={widget.data.tintColor}
        highlightColor={widget.data.highlightColor}
        showRange={widget.data.showRange}
        fieldGroups={widget.data.fieldGroups}
        gaugeSettings={widget.data.gaugeSettings}
        showGaugeConfig={widget.data.showGaugeConfig}
      />
    ),
    [WidgetTypes.IFRAME]: (
      <IframeWidget
        title={widget.data.title}
        source={widget.data.source}
        tintColor={widget.data.tintColor}
      />
    ),
    [WidgetTypes.HEADLINE]: <HeadlineWidget data={widget.data} />,
    [WidgetTypes.IMAGEMAP]: <ImageMapWidget data={widget.data} />,
    [WidgetTypes.TABLE]: (
      <TableWidget
        columns={widget.data.columns}
        tintColor={widget.data.tintColor}
        columnsColor={widget.data.columnsColor}
        lignesColor={widget.data.lignesColor}
        paginationOption={widget.data.paginationOption}
        devicesPerPage={widget.data.devicesPerPage}
      />
    ),
    [WidgetTypes.HISTOGRAM]: <HistogramChart data={widget.data} />,
    [WidgetTypes.PIE]: (
      <PieWidget
        title={widget.data.title}
        metric={widget.data.metric}
        tintColor={widget.data.tintColor}
        labelColor={widget.data.labelColor}
        fieldGroups={widget.data.fieldGroups}
        titleColor={widget.data.titleColor}
      />
    ),
  };

  return widgetComponents[widget.type] || null;
};

const DashboardPage = () => {
  const { dashboardId } = useParams();
  const navigate = useNavigate();
  const { dashboards, setDashboards } = useStateContext();
  const [dashboard, setDashboard] = useState({ widgets: [], layout: [] });
  const [counter, setCounter] = useState(0);
  const [widgets, setWidgets] = useState([]);
  const [layout, setLayout] = useState([]);
  const [booleanWidgetData, setBooleanWidgetData] = useState(null);
  const { dataMetric, setDataMetric } = useStateContext();
  const [valueWidgetData, setValueWidgetData] = useState(null);
  const [newName, setNewName] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null); // For dropdown menu
  const [exportMessage, setExportMessage] = useState(""); // Add state for export message
  const [openSnackbar, setOpenSnackbar] = useState(false); // State for Snackbar

  const handleOpenEditModal = () => setIsEditModalOpen(true);
  const handleCloseEditModal = () => setIsEditModalOpen(false);

  const [modalState, setModalState] = useState({
    open: false,
    type: null,
    widgetId: null,
    widgetData: null,
  });

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    // Load dashboard data from localStorage if it exists
    const storedDashboard = localStorage.getItem(dashboardId);
    if (storedDashboard) {
      const parsedDashboard = JSON.parse(storedDashboard);
      setWidgets(parsedDashboard.widgets || []);
      setLayout(parsedDashboard.layout || []);
      setDashboard(parsedDashboard);
    }
  }, [dashboardId]);

  useEffect(() => {
    // Save dashboard data to localStorage on changes
    if (dashboard && dashboardId) {
      localStorage.setItem(dashboardId, JSON.stringify({ ...dashboard, widgets, layout }));
    }
  }, [dashboard, widgets, layout, dashboardId]);

  const handleImportDashboard = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target.result);
          if (
            importedData.name &&
            importedData.widgets &&
            importedData.layout
          ) {
            // Then set the new imported data
            setDashboard({ name: importedData.name });
            setWidgets(importedData.widgets);
            setLayout(importedData.layout);
            updateJsonModel(importedData.widgets, importedData.layout);
          } else {
            console.error("Invalid imported data format");
          }
        } catch (error) {
          console.error("Error parsing imported data:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExportDashboard = () => {
    if (widgets.length === 0) {
      setExportMessage("The dashboard contains no widgets to export.");
      setOpenSnackbar(true);
      return;
    }

    const dashboardData = {
      name: dashboard.name,
      widgets: widgets,
      layout: layout,
    };

    const fileData = JSON.stringify(dashboardData, null, 2);
    const blob = new Blob([fileData], { type: "application/json" });

    // Use the File System Access API to prompt the user to choose a file name and location
    if (window.showSaveFilePicker) {
      const options = {
        suggestedName: `${dashboard.name}_dashboard.json`,
        types: [
          {
            description: "JSON Files",
            accept: { "application/json": [".json"] },
          },
        ],
      };

      window
        .showSaveFilePicker(options)
        .then((fileHandle) => {
          fileHandle.createWritable().then((writable) => {
            writable.write(blob).then(() => {
              writable.close();
              setExportMessage("Dashboard exported successfully.");
              setOpenSnackbar(true);
            });
          });
        })
        .catch((err) => {
          console.error("Error saving file:", err);
        });
    } else {
      // Fallback for browsers that do not support the File System Access API
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${dashboard.name}_dashboard.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    handleCloseMenu();
  };

  const onLayoutChange = (newLayout) => {
    setLayout(newLayout);
    updateJsonModel(widgets, newLayout);
  };

  const handleRemoveWidget = useCallback(
    (widgetId) => {
      const newWidgets = widgets.filter((widget) => widget.id !== widgetId);
      const newLayout = layout.filter((l) => l.i !== widgetId);
      setWidgets(newWidgets);
      setLayout(newLayout);
      updateJsonModel(newWidgets, newLayout);
    },
    [widgets, layout]
  );

  const handleDuplicate = useCallback(
    (widgetId) => {
      const widgetToDuplicate = widgets.find(
        (widget) => widget.id === widgetId
      );
      const widgetLayout = layout.find((l) => l.i === widgetId);

      if (!widgetToDuplicate || !widgetLayout) {
        console.error("Widget or layout not found");
        return;
      }

      const newWidgetId = `widget-${counter}`;
      const newWidget = { ...widgetToDuplicate, id: newWidgetId };
      const newWidgetLayout = {
        ...widgetLayout,
        i: newWidgetId,
        y: widgetLayout.y + 1,
      };

      setWidgets((prevWidgets) => [...prevWidgets, newWidget]);
      setLayout((prevLayout) => [...prevLayout, newWidgetLayout]);
      setCounter((prevCounter) => prevCounter + 1);
    },
    [widgets, layout, counter]
  );

  const handleEdit = (widgetId, widgetType, widgetData) => {
    setModalState({ open: true, type: widgetType, widgetId, widgetData });
  };
  const handleClose = () => {
    setIsEditModalOpen(false);
  };

  const closeModal = () => {
    setModalState({
      open: false,
      type: null,
      widgetId: null,
      widgetData: null,
    });
  };

  const updateJsonModel = async (updatedWidgets, updatedLayout) => {
    const jsonModel = {
      dashboardTitle: dashboard.name || "Dashboard",
      uid: dashboard.id || "default-dashboard-id",
      refreshInterval: "300",
      panels: updatedWidgets,
      layout: {
        columns: 12,
        widgetPositions: updatedLayout,
      },
    };

    try {
      const response = await fetch("http://localhost:3001/api/jsonModel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonModel, null, 2),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      console.log("File updated successfully");
    } catch (error) {
      console.error("Error saving file:", error);
    }
  };
  
  const handleUpdateDashboard = () => {
    const updatedDashboards = updateDashboardName(
      dashboards,
      dashboardId,
      newName
    );
    setDashboards(updatedDashboards);
    localStorage.setItem("dashboards", JSON.stringify(updatedDashboards));
    handleCloseEditModal();
  };

  const handleDeleteDashboard = () => {
    const updatedDashboards = deleteDashboard(dashboards, dashboardId);
    setDashboards(updatedDashboards);
    localStorage.setItem("dashboards", JSON.stringify(updatedDashboards));
    navigate("/");
  };

  useEffect(() => {
    const foundDashboard = dashboards.find((d) => d.id === dashboardId);
    if (foundDashboard) {
      console.log("Dashboard Found:", foundDashboard); // Pour vérifier les données reçues
      setDashboard({
        widgets: Array.isArray(foundDashboard.widgets)
          ? foundDashboard.widgets
          : [],
        layout: Array.isArray(foundDashboard.layout)
          ? foundDashboard.layout
          : [],
        name: foundDashboard.name || "Default Name", // Assurez-vous que 'name' est bien défini
        id: foundDashboard.id || "default-dashboard-id",
      });
    } else {
      console.error("No dashboard found with id:", dashboardId);
    }
  }, [dashboardId, dashboards]);

  const handleAddChart = useCallback(
    (widgetData, widgetType) => {
      let widgetWidth = 6;
      let widgetHeight;

      switch (widgetType) {
        case WidgetTypes.LINE:
        case WidgetTypes.AREA:
        case WidgetTypes.BAR:
          widgetHeight = 4;
          break;
        case WidgetTypes.HISTOGRAM:
        case WidgetTypes.MAP:
          widgetHeight = 4;
          break;
        case WidgetTypes.BOOLEAN:
        case WidgetTypes.VALUE:
        case WidgetTypes.HEADLINE:
          widgetHeight = 2;
          break;
        default:
          widgetHeight = 4;
          break;
      }

      const newLayout = generateLayout(
        {
          id: `widget-${counter}`,
          type: widgetType,
          data: widgetData.metrics,
          title: widgetData.title,
          timeframeData: {
            timeframe: widgetData.timeframe,
            fromDate: widgetData.fromDate,
            toDate: widgetData.toDate,
          },
          summaryTable: widgetData.summaryTable, // Include summaryTable here
          w: widgetWidth,
          h: widgetHeight,
        },
        layout,
        12
      );
      setWidgets((prevWidgets) => [
        ...prevWidgets,
        {
          id: `widget-${counter}`,
          type: widgetType,
          data: widgetData.metrics,
          title: widgetData.title,
          timeframeData: {
            timeframe: widgetData.timeframe,
            fromDate: widgetData.fromDate,
            toDate: widgetData.toDate,
          },
          summaryTable: widgetData.summaryTable, // Include summaryTable here
        },
      ]);
      setLayout(newLayout);
      setCounter((prevCounter) => prevCounter + 1);
    },
    [counter, layout]
  );

  const handleAddWidget = useCallback(
    (widgetData, widgetType) => {
      const widgetDefaults = {
        [WidgetTypes.LINE]: { width: 6, height: 4 },
        [WidgetTypes.AREA]: { width: 6, height: 4 },
        [WidgetTypes.BAR]: { width: 6, height: 4 },
        [WidgetTypes.HISTOGRAM]: { width: 6, height: 4 },
        [WidgetTypes.BOOLEAN]: { width: 6, height: 2 },
        [WidgetTypes.VALUE]: { width: 6, height: 2 },
        [WidgetTypes.HEADLINE]: { width: 6, height: 2 },
        [WidgetTypes.MAP]: { width: 6, height: 4 },
        [WidgetTypes.SLIDER]: { width: 6, height: 4 },
        [WidgetTypes.IFRAME]: { width: 6, height: 4 },
        [WidgetTypes.IMAGEMAP]: { width: 6, height: 4 },
        [WidgetTypes.TABLE]: { width: 6, height: 4 },
        [WidgetTypes.TEXT]: { width: 4, height: 4 },
        [WidgetTypes.IMAGE]: { width: 6, height: 4 },
        [WidgetTypes.PIE]: { width: 6, height: 3 },
      };

      const { width, height } = widgetDefaults[widgetType] || {
        width: 6,
        height: 4,
      };

      const position = getNextPosition(layout, width, 12);
      const newWidgetId = `widget-${counter}`;

      const newWidget = {
        id: newWidgetId,
        type: widgetType,
        data: widgetData,
        x: position.x,
        y: position.y,
        w: width,
        h: height,
        isDraggable: true,
        isResizable: true,
      };

      setWidgets((prevWidgets) => [...prevWidgets, newWidget]);
      setLayout((prevLayout) => [
        ...prevLayout,
        { ...newWidget, i: newWidgetId },
      ]);
      setCounter((prevCounter) => prevCounter + 1);
    },
    [counter, layout]
  );

  const updateMetrics = (newMetric) => {
    setDataMetric((prevDataMetrics) => {
      const updatedMetrics = prevDataMetrics.metrics.map((metric) =>
        metric.metric_id === newMetric.metric_id
          ? { ...metric, ...newMetric }
          : metric
      );
      return { ...prevDataMetrics, metrics: updatedMetrics };
    });
  };

  const findLatestMetricValue = (metricId) => {
    const sortedMetrics = dataMetric
      .filter((m) => m.metric_id === metricId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return sortedMetrics.length > 0 ? sortedMetrics[0] : null;
  };

  const handleUpdateWidget = (widgetId, updatedData) => {
    setWidgets((prevWidgets) =>
      prevWidgets.map((widget) =>
        widget.id === widgetId ? { ...widget, data: updatedData } : widget
      )
    );
    closeModal();
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      widgets.forEach((widget) => {
        if (widget.data.metric) {
          const latestMetricValue = findLatestMetricValue(
            widget.data.metric.metric_id
          );
          if (
            latestMetricValue &&
            new Date(latestMetricValue.timestamp) >
              new Date(widget.data.lastUpdate)
          ) {
            handleUpdateWidget(widget.id, {
              ...widget.data,
              metric: {
                name: latestMetricValue.metric_name,
                value: latestMetricValue.value,
                metric_id: latestMetricValue.metric_id,
              },
              lastUpdate: latestMetricValue.timestamp,
            });
          }
        }
      });
    }, 3000);

    return () => clearInterval(intervalId);
  }, [widgets]);

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box sx={{ padding: "20px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h4" gutterBottom>
          {dashboard.name}
        </Typography>
        <Box
          sx={{
            display: "flex",

            alignItems: "center",
            position: "absolute",
            top: "20px",
            right: "20px",
            zIndex: 1000,
          }}
        >
<Button
  variant="contained"
  onClick={handleOpenMenu}
  sx={{
    position: "fixed",
    top: "19px",
    right: "230px",
    marginRight: "240px",
    width: "fit-content",
    height: "48px",
    marginTop: "0",
    fontSize: "1rem",
    borderRadius: "24px", // Round the edges
    backgroundColor: "#2596be", // Light blue color
    background: "linear-gradient(145deg, #2596be, #29a3cf)", // Gradient background
    boxShadow: "5px 5px 10px #bfbfbf, -5px -5px 10px #ffffff", // 3D shadow effect
    color: "#fff", // Text color
    "&:hover": {
      backgroundColor: "#29a3cf", // Slightly darker shade for hover effect
    },
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
  startIcon={<TelegramIcon sx={{ color: "#fff" }} />}
>
  Data Transfer
  <input
    type="file"
    accept=".json"
    hidden
    onChange={handleImportDashboard}
  />
</Button>

<Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center", // Ajustement de l'ancrage horizontal
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center", // Ajustement du point de transformation
            }}
          >
            <MenuItem
              onClick={() => {
                document.querySelector('input[type="file"]').click();
                handleCloseMenu();
              }}
             
            >
              Import dashboard
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleExportDashboard();
                handleCloseMenu(); // Fermer le menu après le clic
              }}
              
            >
              Export dashboard
            </MenuItem>
          </Menu>
          <Button
            variant="contained"
            onClick={handleOpenEditModal}
            sx={{
              marginRight: "18px",
              width: "fit-content",
              height: "48px",
              marginTop: "0",
              fontSize: "1rem",
              // position: "fixed",
              top: "0",
              right: "20px",
              zIndex: 1000,
              height: "48px",
              borderRadius: "24px", // Round the edges
              backgroundColor: "#2596be", // Light blue color
              background: "linear-gradient(145deg, #2596be, #29a3cf)", // Gradient background
              boxShadow: "5px 5px 10px #bfbfbf, -5px -5px 10px #ffffff", // 3D shadow effect
              color: "#fff", // Text color
              "&:hover": {
                backgroundColor: "#29a3cf", // Slightly darker shade for hover effect
              },
            }}
            startIcon={<EditIcon sx={{ color: "#fff" }} />} 
          >
            Edit Dashboard 
          </Button>

          {modalState.open && (
            <>
              {modalState.type === WidgetTypes.BOOLEAN && (
                <BooleanModal
                  open={modalState.open}
                  onClose={closeModal}
                  onAddBoolean={handleAddWidget}
                  onUpdateBoolean={handleUpdateWidget}
                  widgetData={modalState.widgetData}
                  widgetId={modalState.widgetId}
                  openOnSecondTab={true}
                />
              )}
              {modalState.type === WidgetTypes.VALUE && (
                <ValueModal
                  open={modalState.open}
                  onClose={closeModal}
                  onAddValue={handleAddWidget}
                  onUpdateValue={handleUpdateWidget}
                  widgetData={modalState.widgetData}
                  widgetId={modalState.widgetId}
                  openOnSecondTab={true}
                />
              )}
              {modalState.type === WidgetTypes.HEADLINE && (
                <HeadlineModal
                  open={modalState.open}
                  onClose={closeModal}
                  onAddHeadline={handleAddWidget}
                  onUpdateHeadline={handleUpdateWidget}
                  widgetData={modalState.widgetData}
                  widgetId={modalState.widgetId}
                />
              )}
              {modalState.type === WidgetTypes.IFRAME && (
                <IframeModal
                  open={modalState.open}
                  onClose={closeModal}
                  onAddIframe={handleAddWidget}
                  onUpdateIframe={handleUpdateWidget}
                  widgetData={modalState.widgetData}
                  widgetId={modalState.widgetId}
                  openOnSecondTab={true}
                />
              )}
              {modalState.type === WidgetTypes.IMAGEMAP && (
                <ImageMapModal
                  open={modalState.open}
                  onClose={closeModal}
                  onAddImageMap={handleAddWidget}
                  onUpdateImageMap={handleUpdateWidget}
                  widgetData={modalState.widgetData}
                  widgetId={modalState.widgetId}
                  openOnSecondTab={true}
                />
              )}
              {modalState.type === WidgetTypes.IMAGE && (
                <ImageModal
                  open={modalState.open}
                  onClose={closeModal}
                  onAddImage={handleAddWidget}
                  onUpdateImage={handleUpdateWidget}
                  widgetData={modalState.widgetData}
                  widgetId={modalState.widgetId}
                  openOnSecondTab={true}
                />
              )}
              {modalState.type === WidgetTypes.MAP && (
                <MapModal
                  open={modalState.open}
                  onClose={closeModal}
                  onAddMap={handleAddWidget}
                  onUpdateMap={handleUpdateWidget}
                  widgetData={modalState.widgetData}
                  widgetId={modalState.widgetId}
                  openOnSecondTab={true}
                />
              )}
               {modalState.type === WidgetTypes.PIE && (
                <PieModal
                  open={modalState.open}
                  onClose={closeModal}
                  onAddPie={handleAddWidget}
                  onUpdatePie={handleUpdateWidget}
                  widgetData={modalState.widgetData}
                  widgetId={modalState.widgetId}
                  openOnSecondTab={true} 
                />
              )}
              {modalState.type === WidgetTypes.SLIDER && (
                <SliderModal
                  open={modalState.open}
                  onClose={closeModal}
                  onAddSlider={handleAddWidget}
                  onUpdateSlider={handleUpdateWidget}
                  widgetData={modalState.widgetData}
                  widgetId={modalState.widgetId}
                  openOnSecondTab={true}
                />
              )}
              {modalState.type === WidgetTypes.TABLE && (
                <TableModal
                  open={modalState.open}
                  onClose={closeModal}
                  onAddTable={handleAddWidget}
                  onUpdateTable={handleUpdateWidget}
                  widgetData={modalState.widgetData}
                  widgetId={modalState.widgetId}
                  openOnSecondTab={true}
                />
              )}
              {modalState.type === WidgetTypes.TEXT && (
                <TextModal
                  open={modalState.open}
                  onClose={closeModal}
                  onAddText={handleAddWidget}
                  onUpdateText={handleUpdateWidget}
                  widgetData={modalState.widgetData}
                  widgetId={modalState.widgetId}
                  openOnSecondTab={true}
                />
              )}
              {(modalState.type === WidgetTypes.LINE ||
                modalState.type === WidgetTypes.AREA ||
                modalState.type === WidgetTypes.BAR) && (
                <EditChartWidgetModal
                  open={modalState.open}
                  onClose={closeModal}
                  updateChart={handleUpdateWidget}
                  onAddChart={handleAddChart}
                  widgetData={modalState.widgetData}
                  widgetId={modalState.widgetId}
                  openOnSecondTab={true}
                />
              )}
            </>
          )}

          <WidgetModal
            onAddChart={(chartData, chartType) =>
              handleAddChart(chartData, chartType)
            }
            onAddHistogram={(histogramData) =>
              handleAddWidget(histogramData, WidgetTypes.HISTOGRAM)
            }
            onAddBoolean={(booleanData) =>
              handleAddWidget(booleanData, WidgetTypes.BOOLEAN)
            }
            onAddValue={(valueData) =>
              handleAddWidget(valueData, WidgetTypes.VALUE)
            }
            onAddImage={(imageData) =>
              handleAddWidget(imageData, WidgetTypes.IMAGE)
            }
            onAddText={(textData) =>
              handleAddWidget(textData, WidgetTypes.TEXT)
            }
            onAddMap={(mapData) => handleAddWidget(mapData, WidgetTypes.MAP)}
            onAddTable={(tableData) =>
              handleAddWidget(tableData, WidgetTypes.TABLE)
            }
            onAddSlider={(sliderData) =>
              handleAddWidget(sliderData, WidgetTypes.SLIDER)
            }
            onAddIframe={(iframeData) =>
              handleAddWidget(iframeData, WidgetTypes.IFRAME)
            }
            onAddHeadline={(headlineData) =>
              handleAddWidget(headlineData, WidgetTypes.HEADLINE)
            }
            onAddImageMap={(imageMapData) =>
              handleAddWidget(imageMapData, WidgetTypes.IMAGEMAP)
            }
            onAddPie={(pieData) => handleAddWidget(pieData, WidgetTypes.PIE)}
          />
        </Box>
      </Box>
      <ResponsiveGridLayout
        className="layout"
        layout={layout}
        onLayoutChange={onLayoutChange}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
        margin={[10, 10]}
        containerPadding={[5, 5]}
        draggableHandle=".draggable-handle"
        style={gridStyle}
        compactType={null}
        preventCollision={true}
        isResizable={true}
        resizeHandles={["se"]}
        draggableCancel=".cancel-drag"
      >
        {widgets.map((widget) => (
          <div
            key={widget.id}
            data-grid={layout.find((l) => l.i === widget.id)}
          >
            <WidgetContainer
              widgetId={widget.id}
              widgetType={widget.type}
              widgetData={widget.data}
              handleDuplicate={handleDuplicate}
              handleEdit={handleEdit}
              handleClose={handleRemoveWidget}
            >
              {createWidgetComponent(widget)}
            </WidgetContainer>
          </div>
        ))}
      </ResponsiveGridLayout>
      {/* Snackbar for export message */}
      <Box
        sx={{
          zIndex: 1300,
        }}
      >
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }} // Positionnement en bas à droite
        >
          {exportMessage === "The dashboard contains no widgets to export." ? (
            <Alert severity="error" sx={{ width: "400px", height: "50px" }}>
              The dashboard contains no widgets to export.
            </Alert>
          ) : exportMessage === "Dashboard exported successfully." ? (
            <Alert
              icon={<CheckIcon fontSize="inherit" />}
              severity="success"
              sx={{ width: "400px", height: "50px" }}
            >
              Dashboard exported successfully.
            </Alert>
          ) : (
            <Alert severity="info" sx={{ width: "400px", height: "50px" }}>
              {exportMessage}
            </Alert>
          )}
        </Snackbar>
      </Box>

      {/* 
     Edit Dashboard Name     */}
      <Modal
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
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
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Edit Dashboard
          </Typography>
          <TextField
            fullWidth
            label="New Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            margin="normal"
          />
          <Button
            variant="contained"
            onClick={handleUpdateDashboard}
            sx={{ mr: 1 }}
          >
            Update
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleDeleteDashboard}
          >
            Delete
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default DashboardPage;
