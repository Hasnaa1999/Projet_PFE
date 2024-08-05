import React, { useCallback, useEffect, useState } from "react";
import WidgetModal from "../components/WidgetModal.jsx";
import LineChart from "./Charts/LineChart.jsx";
import AreaChart from "./Charts/AreaChart.jsx";
import BarChart from "./Charts/BarChart.jsx";
import BooleanWidget from "./Widgets/BooleanWidget.jsx";
import ValueWidget from "./Widgets/ValueWidget.jsx";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import WidgetContainer from "./WidgetContainer.jsx";
import { getNextPosition, generateLayout } from "./widgetHelpers.jsx";
import { WidgetTypes } from "./constants.js";
import ImageWidget from "./Widgets/ImageWidget.jsx";
import TextWidget from "./Widgets/TextWidget.jsx";
import MapWidget from "./Widgets/MapWidget.jsx";
import TableWidget from "./Widgets/TableWidget.jsx";
import SliderWidget from "./Widgets/SliderWidget.jsx";
import IframeWidget from "./Widgets/IframeWidget.jsx";
import ImageMapWidget from "./Widgets/ImageMapWidget.jsx";
import { useStateContext } from "../contexts/ContextProvider";
import HeadlineWidget from "./Widgets/HeadlineWidget.jsx";
import BooleanModal from "../components/Modals/BooleanModal.jsx";
import ValueModal from "../components/Modals/ValueModal.jsx";
import HeadlineModal from "../components/Modals/HeadlineModal.jsx";
import IframeModal from "../components/Modals/IframeModal.jsx";
import ImageMapModal from "../components/Modals/ImageMapModal.jsx";
import ImageModal from "../components/Modals/ImageModal.jsx";
import MapModal from "../components/Modals/MapModal.jsx";
import SliderModal from "../components/Modals/SliderModal.jsx";
import TableModal from "../components/Modals/TableModal.jsx";
import TextModal from "../components/Modals/TextModal.jsx";
import EditChartWidgetModal from "../components/Modals/EditChartWidgetModal.jsx";
import HistogramChart from "./Charts/HistogramChart.jsx";
import PieModal from "../components/Modals/PieModal.jsx";
import PieWidget from "./Widgets/PieWidget.jsx";
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
        widgetWidth="400px"
        widgetHeight="300px"
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

const Dashboard = () => {
  const { dataMetric, setDataMetric } = useStateContext();
  const [counter, setCounter] = useState(0);
  const [widgets, setWidgets] = useState([]);
  const [layout, setLayout] = useState([]);
  const [modalState, setModalState] = useState({
    open: false,
    type: null,
    widgetId: null,
    widgetData: null,
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await fetch("/api/jsonModel");
        const jsonModel = await response.json();
        setWidgets(jsonModel.panels || []);
        setLayout(jsonModel.layout.widgetPositions || []);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, []);

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
      dashboardTitle: "Dashboard",
      uid: "default-dashboard-id",
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

  const handleAddWidget = useCallback(
    (widgetData, widgetType) => {
      const widgetDefaults = {
        [WidgetTypes.LINE]: { width: 6, height: 3 },
        [WidgetTypes.AREA]: { width: 6, height: 3 },
        [WidgetTypes.BAR]: { width: 6, height: 3 },
        [WidgetTypes.HISTOGRAM]: { width: 6, height: 3 },
        [WidgetTypes.BOOLEAN]: { width: 4, height: 2 },
        [WidgetTypes.VALUE]: { width: 4, height: 2 },
        [WidgetTypes.HEADLINE]: { width: 4, height: 2 },
        [WidgetTypes.MAP]: { width: 6, height: 4 },
        [WidgetTypes.SLIDER]: { width: 6, height: 3 },
        [WidgetTypes.IFRAME]: { width: 6, height: 4 },
        [WidgetTypes.IMAGEMAP]: { width: 6, height: 4 },
        [WidgetTypes.TABLE]: { width: 6, height: 4 },
        [WidgetTypes.TEXT]: { width: 4, height: 4 },
        [WidgetTypes.IMAGE]: { width: 6, height: 4 },
        [WidgetTypes.PIE]: { width: 6, height: 3 },
      };

      const { width, height } = widgetDefaults[widgetType] || {
        width: 6,
        height: 3,
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

  const handleAddChart = useCallback(
    (widgetData, widgetType) => {
      let widgetWidth = 6;
      let widgetHeight;

      switch (widgetType) {
        case WidgetTypes.LINE:
        case WidgetTypes.AREA:
        case WidgetTypes.BAR:
          widgetHeight = 3;
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

  return (
    <>
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
        onAddText={(textData) => handleAddWidget(textData, WidgetTypes.TEXT)}
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
        onAddPie={(pieData) =>
          handleAddWidget(pieData, WidgetTypes.PIE)
        }
      />
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
    </>
  );
};

export default Dashboard;
