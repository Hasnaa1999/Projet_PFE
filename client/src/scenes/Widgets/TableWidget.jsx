import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, FormControl, Select, MenuItem, Pagination } from '@mui/material';
import { useStateContext } from '../../contexts/ContextProvider';

const TableWidget = ({ columns, tintColor, columnsColor, lignesColor, paginationOption, devicesPerPage: initialDevicesPerPage}) => {
  const { devices, dataMetric } = useStateContext();
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [devicesPerPage, setDevicesPerPage] = useState(initialDevicesPerPage ||10);

  useEffect(() => {
    const fetchData = () => {
      const newRows = devices.map(device => {
        const row = { device: device.name };
        columns.forEach(column => {
          if (column.type === 'Meta') {
            if (column.fieldName === 'location') {
              const { lat, long } = device.location;
              row[column.fieldName] = lat !== null && long !== null ? `Lat: ${lat}, Long: ${long}` : 'N/A';
            } else {
              row[column.fieldName] = device[column.dataKey];
            }
          } else if (column.type === 'Measurement') {
            const deviceMetricIds = device.metrics
              .filter(m => m.name === column.fieldName)
              .map(m => m.metric_id);

            const latestMetric = dataMetric
              .filter(m => deviceMetricIds.includes(m.metric_id))
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

            row[column.fieldName] = latestMetric ? latestMetric.value : 'N/A';
          }
        });
        return row;
      });
      setRows(newRows);
    };

    if (devices.length > 0 && dataMetric.length > 0) {
      fetchData();
    }
  }, [columns, devices, dataMetric]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleDevicesPerPageChange = (event) => {
    setDevicesPerPage(event.target.value);
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * devicesPerPage;
  const endIndex = startIndex + devicesPerPage;
  const paginatedRows = rows.slice(startIndex, endIndex);

  const showPagination =
    paginationOption === "Always" ||
    (paginationOption === "Auto" && rows.length > devicesPerPage);

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          maxWidth: 800, 
          margin: 'auto', 
          marginTop: 2, 
          boxShadow: 'none', // Remove inner box shadow
          background: tintColor || "white",
        }}
      >
        <Table aria-label="dynamic device table">
          <TableHead>
            <TableRow>
              {Array.isArray(columns) && columns.map((column, index) => (
                <TableCell
                  key={index}
                  
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: columnsColor || "black",
                    }}
                  >
                    {column.title}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.isArray(columns) && columns.map((column, colIndex) => (
                  <TableCell
                    key={colIndex}
                    sx={{
                     
                      color: lignesColor || "black",
                    }}
                  >
                    {typeof row[column.fieldName] === "object"
                      ? JSON.stringify(row[column.fieldName])
                      : row[column.fieldName]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
       
      </TableContainer>
      {rows.length > 0 && showPagination && (
        <Box
          sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}
        >
          <Pagination
            count={Math.ceil(rows.length / devicesPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            size="small"
          />
          <FormControl sx={{ minWidth: 120 }}>
            <Select
              value={devicesPerPage}
              onChange={handleDevicesPerPageChange}
              sx={{
                width: "100px",
                height: "30px",
              }}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}
     
    </>
  );
};

export default TableWidget;
