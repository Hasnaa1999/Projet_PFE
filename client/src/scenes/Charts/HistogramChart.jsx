// HistogramChart.js
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import React from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import moment from 'moment';

const colors = [
  "rgb(58, 196, 224)",  // Color for first metric
  "rgb(64, 161, 71)",   // Color for second metric
  "rgb(194, 121, 12)",  // Color for third metric
  "rgb(99, 81, 150)",   // Color for fourth metric
  "rgb(17, 145, 105)",  // Color for fifth metric
  "rgb(196, 74, 14)",   // Color for sixth metric

];

const HistogramChart = ({ data }) => {
  // Create a dataset for each metric with its own color and label
  const datasets = data.metrics.map((metric, index) => ({
    label: metric.metricName,
    data: [{ x: '', y: metric.latestValue }], // Use an object with x and y properties
    backgroundColor: colors[index % colors.length],
    borderColor: colors[index % colors.length],
    borderWidth: 1,
  }));

  // Define chartData using the datasets array
  const chartData = {
    labels: [''], // Single blank label since we have one bar per dataset
    datasets: datasets,
  };

  const options = {
    scales: {
      y: {
        display: data.showXGrid,
        beginAtZero: true,
        ticks: {
          display: data.showYAxis,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top', // Show the legend at the top
      },
      title: {
        display: true,
        text: data.title, // Use the title from the passed data
      },
      tooltip: {
        enabled: true,
        mode: 'point',
        position: 'nearest',
        intersect: false,
        callbacks: {
          label: (context) => {
            // Assuming your dataset has a property `timestamp`
            const metric = data.metrics[context.datasetIndex];
            const value = context.parsed.y;
            const timestamp = metric.timestamp;
            // Format the date and time as needed
            const formattedTime = moment(timestamp).format('MMMM D, YYYY h:mm A');
            return `${metric.metricName}: ${value} (${formattedTime})`;
          },
        },
      },
    },
  };

  return (
    <Box sx={{ background: data.tintColor }}>
      <Bar data={chartData} options={options} />
      <Box sx={{ marginTop: '20px' }}> {/* Separated box for summary table */}
        <Typography variant="h6">Summary</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Metric</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.metrics.map((metric, index) => (
              <TableRow key={index}>
                <TableCell>{metric.metricName}</TableCell>
                <TableCell>{metric.latestValue}</TableCell>
                <TableCell>{moment(metric.timestamp).format('MMMM D, YYYY h:mm A')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};

export default HistogramChart;
