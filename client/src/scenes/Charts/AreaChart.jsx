import React, { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useStateContext } from "../../contexts/ContextProvider";
import moment from "moment";
import "chartjs-adapter-date-fns";

// Define a set of colors for the metrics
const colors = [
  "rgb(103, 206, 227)",
  "rgb(149, 204, 147)",
  "rgb(232, 182, 107)",
  "rgb(175, 167, 199)",
  "rgb(113, 201, 170)",
  "rgb(182, 115, 82)",
];

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

const createGradient = (ctx, chartArea, color) => {
  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
  gradient.addColorStop(0, color.replace("rgb", "rgba").replace(")", ", 0.1)")); // almost transparent
  gradient.addColorStop(1, color); // solid color
  return gradient;
};

const AreaChart = ({ metrics, timeframeData, title, showSummaryTable }) => {
  const { dataMetric, isLoading, error, devices } = useStateContext();
  const chartRef = useRef(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filteredMetrics, setFilteredMetrics] = useState([]);
  const [tableHeight, setTableHeight] = useState(0);

  useEffect(() => {
    if (!dataMetric.length || isLoading || error) return;

    const getLatestDateInData = (data) => {
      if (!data.length) return new Date();
      return data.reduce((latest, entry) => {
        const entryDate = new Date(entry.timestamp);
        return entryDate > latest ? entryDate : latest;
      }, new Date(data[0].timestamp));
    };

    const getStartDate = (timeframe, latestDate) => {
      const start = new Date(latestDate);
      switch (timeframe) {
        case "Hour":
          start.setHours(start.getHours() - 1);
          break;
        case "Day":
          start.setDate(start.getDate() - 1);
          break;
        case "Week":
          start.setDate(start.getDate() - 7);
          break;
        case "2W":
          start.setDate(start.getDate() - 14);
          break;
        case "Month":
          start.setMonth(start.getMonth() - 1);
          break;
        case "Custom":
          return new Date(timeframeData.fromDate); // Ensure this matches the correct field
        default:
          start.setDate(start.getDate() - 2);
          break;
      }
      return start;
    };

    const latestDate = dataMetric.length ? getLatestDateInData(dataMetric) : new Date();
    const startDate = getStartDate(timeframeData.timeframe, latestDate);
    const endDate = timeframeData.timeframe === "Custom" ? new Date(timeframeData.toDate) : latestDate;

    setStartDate(startDate);
    setEndDate(endDate);

    const filtered = dataMetric.filter((metric) => {
      const metricDate = new Date(metric.timestamp);
      return metricDate >= startDate && metricDate <= endDate;
    });

    setFilteredMetrics(filtered);
  }, [timeframeData, dataMetric, isLoading, error]);

  useEffect(() => {
    const calculateTableHeight = () => {
      const rowHeight = 40; // Height of each row in the table
      const headerHeight = 40; // Height of the table header
      const numRows = metrics.length;
      const totalHeight = headerHeight + numRows * rowHeight;
      setTableHeight(totalHeight);
    };

    calculateTableHeight();
  }, [metrics.length]);

  useEffect(() => {
    if (chartRef.current && chartRef.current.ctx) {
      const chart = chartRef.current;
      const { ctx, chartArea } = chart;

      if (!chartArea) {
        return;
      }

      // Apply gradients to each dataset
      chart.data.datasets.forEach((dataset, index) => {
        const gradient = createGradient(ctx, chartArea, colors[index % colors.length]);
        dataset.backgroundColor = gradient;
      });

      chart.update();
    }
  }, [filteredMetrics]);

  const datasets = metrics.map((metricObj, index) => {
    const filteredData = filteredMetrics.filter((m) => m.metric_id === metricObj.metric_id).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const color = colors[index % colors.length];

    return {
      label: metricObj.name,
      data: filteredData.map((data) => ({
        x: new Date(data.timestamp),
        y: data.value,
      })),
      borderColor: color,
      fill: true,
      backgroundColor: color, // Temporary color
      tension: 0.4,
      pointRadius: 0,
    };
  });

  const chartData = {
    datasets,
  };

  const getXAxisTimeFormat = (timeframe) => {
    switch (timeframe) {
      case "Hour":
        return { unit: "minute", displayFormats: { minute: "HH:mm" } };
      case "Day":
        return { unit: "day", displayFormats: { day: "MMM d" } };
      case "Week":
      case "2W":
        return { unit: "day", displayFormats: { day: "MMM d" } };
      case "Month":
        return { unit: "week", displayFormats: { week: "MMM d" } };
      case "Custom":
        return { unit: "day", displayFormats: { day: "MMM d" } };
      default:
        return { unit: "day", displayFormats: { day: "MMM d" } };
    }
  };

  const xAxisTimeFormat = getXAxisTimeFormat(timeframeData.timeframe);

  const options = {
    scales: {
      x: {
        type: "time",
        time: {
          unit: xAxisTimeFormat.unit,
          displayFormats: xAxisTimeFormat.displayFormats,
          min: startDate,
          max: endDate,
          tooltipFormat: "MMM d, yyyy HH:mm",
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 20,
          maxRotation: 0,
          minRotation: 0,
        },
        title: {
          display: true,
          text: "Date/Time",
          color: "#666",
        },
      },
      y: {
        title: {
          display: true,
          text: "Value",
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        enabled: true,
        mode: "index",
        position: "nearest",
        intersect: false,
        animation: {
          duration: 0,
        },
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat().format(context.parsed.y);
            }
            return label;
          },
          title: function (tooltipItems) {
            const date = tooltipItems[0].parsed.x;
            return moment(date).format("MMM D, YYYY");
          },
        },
      },
    },
  };

  const hasData = datasets.some((dataset) => dataset.data.length > 0);

  const calculateStats = (data) => {
    const values = data.map(d => d.y);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
    return { min, max, mean };
  };

  const getDeviceNameByMetricId = (metricId) => {
    const device = devices.find((d) => d.metrics.some((m) => m.metric_id === metricId));
    return device ? device.name : "Unknown Device";
  };

  const tableData = datasets.map((dataset, index) => {
    const stats = calculateStats(dataset.data);
    const deviceName = getDeviceNameByMetricId(metrics[index].metric_id);
    return {
      name: dataset.label,
      deviceName,
      min: stats.min,
      max: stats.max,
      mean: stats.mean,
      color: colors[index % colors.length], // Assign corresponding color to each metric
    };
  });

  return (
    <div>
      <h3>{title}</h3>
      {hasData ? (
        <div style={{ height: "300px" }}> {/* Fixed chart height */}
          <Line ref={chartRef} data={chartData} options={options} />
        </div>
      ) : (
        <div>No data to display</div>
      )}
      {showSummaryTable && (
        <div style={{ marginTop: "20px" }}> {/* Separated box for summary table */}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #ddd", color: "#003366" }}>
                <th style={{ width: "30%", textAlign: "left", paddingLeft: "12px" }}>Metric</th>
                <th style={{ width: "20%", textAlign: "left", paddingLeft: "12px" }}>Device</th>
                <th style={{ width: "15%", textAlign: "left", paddingLeft: "12px" }}>Min</th>
                <th style={{ width: "15%", textAlign: "left", paddingLeft: "12px" }}>Max</th>
                <th style={{ width: "20%", textAlign: "left", paddingLeft: "12px" }}>Mean</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ display: "flex", alignItems: "center", paddingLeft: "12px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: "13px",
                        height: "12px",
                        backgroundColor: row.color,
                        marginRight: "8px",
                        borderRadius: "50%",
                      }}
                    ></span>
                    {row.name}
                  </td>
                  <td style={{ paddingLeft: "12px" }}>{row.deviceName}</td>
                  <td style={{ paddingLeft: "12px" }}>{row.min.toFixed(2)}</td>
                  <td style={{ paddingLeft: "12px" }}>{row.max.toFixed(2)}</td>
                  <td style={{ paddingLeft: "12px" }}>{row.mean.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AreaChart;
