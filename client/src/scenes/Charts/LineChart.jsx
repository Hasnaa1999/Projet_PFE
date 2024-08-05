import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "chartjs-adapter-date-fns";
import moment from "moment";
import { useStateContext } from "../../contexts/ContextProvider";

const colors = [
  "rgb(103, 206, 227)",
  "rgb(149, 204, 147)",
  "rgb(232, 182, 107)",
  "rgb(175, 167, 199)",
  "rgb(113, 201, 170)",
  "rgb(182, 115, 82)",
];

const LineChart = ({ metrics, timeframeData, title, showSummaryTable, unit }) => {
  const { dataMetric, isLoading, error, devices } = useStateContext();
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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data: {error.message}</div>;
  if (!filteredMetrics.length) return <div>No data to display</div>;

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
      backgroundColor: color,
      tension: 0.1, // Slight tension for smoother lines
      borderWidth: 1.5, // Line thickness
      pointRadius: 0, // Remove point dots
      pointHitRadius: 10, // Increase hit radius for better interaction
      pointHoverRadius: 0, // Remove hover dots
      fill: false,
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
          <Line data={chartData} options={options} />
        </div>
      ) : (
        <div>No data to display</div>
      )}
      {showSummaryTable && (
        <div style={{ marginTop: "20px" }}>
          <div style={{ overflowY: "auto", maxHeight: "200px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ddd", color: "#003366" }}>
                  <th style={{ width: "20%", textAlign: "left", paddingLeft: "12px" }}>Metric</th>
                  <th style={{ width: "20%", textAlign: "left", paddingLeft: "12px" }}>Device</th>
                  <th style={{ width: "15%", textAlign: "left", paddingLeft: "12px" }}>Min ({unit})</th>
                  <th style={{ width: "15%", textAlign: "left", paddingLeft: "12px" }}>Max ({unit})</th>
                  <th style={{ width: "20%", textAlign: "left", paddingLeft: "12px" }}>Mean ({unit})</th>
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
                    <td style={{ paddingLeft: "12px" }}>{row.min.toFixed(2)} {unit}</td>
                    <td style={{ paddingLeft: "12px" }}>{row.max.toFixed(2)} {unit}</td>
                    <td style={{ paddingLeft: "12px" }}>{row.mean.toFixed(2)} {unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LineChart;
