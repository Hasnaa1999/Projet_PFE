import React from "react";
import { Box, Typography } from "@mui/material";
import { Pie } from "react-chartjs-2";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";

const PieWidget = ({ title, metric, fieldGroups, tintColor, labelColor, titleColor }) => {
  const colors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#FF9F40",
    "#4BC0C0",
    "#9966FF",
  ];

  const pieData = {
    labels: fieldGroups.map((group) => group.selectedDevice || ""),
    datasets: [
      {
        label: title,
        data: fieldGroups.map((group) => group.lastMetricValue || 0),
        backgroundColor: colors.slice(0, fieldGroups.length),
        hoverBackgroundColor: colors.slice(0, fieldGroups.length),
      },
    ],
  };

  const pieOptions = {
    plugins: {
      legend: {
        display: true,
        position: "right",
        labels: {
          font: {
            size: 12,
          },
          color: labelColor || "#000000",
          boxWidth: 20,
          padding: 10,
        },
        maxWidth: 300,
        wrapText: true,
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const metric = fieldGroups[tooltipItem.dataIndex].metricName;
            return ` ${metric}: ${tooltipItem.raw}`;
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <Box
      sx={{
        my: 2,
        bgcolor: tintColor || "#ffffff",
        p: 1,
        borderRadius: 2,
      }}
    >
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          textAlign: "center",
          color: titleColor || "#000000",
        }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          height: 200,
        }}
      >
        <Pie data={pieData} options={pieOptions} />
      </Box>
    </Box>
  );
};

export default PieWidget;
