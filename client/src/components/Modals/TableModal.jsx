import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  IconButton,
  TextField,
  FormControl,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  InputLabel,
  Pagination,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PushPinIcon from "@mui/icons-material/PushPin";
import { useStateContext } from "../../contexts/ContextProvider";
import { ColorPicker } from "mui-color";
import DeleteIcon from "@mui/icons-material/Delete";

const TableModal = ({ open, onClose, onAddTable, onUpdateTable, widgetData, widgetId }) => {
  const { dataMetric, devices } = useStateContext();

  const [deviceTitle, setDeviceTitle] = useState("Device");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [tabIndex, setTabIndex] = React.useState(0);
  const [fieldGroups, setFieldGroups] = useState([
    { columnType: "Meta", fields: ["Name", "Location"], selectedField: "Name" },
  ]);
  const [tableTitle, setTableTitle] = useState("Table");
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [devicesPerPage, setDevicesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationOption, setPaginationOption] = useState("Auto"); // New state for pagination option
  const [tintColor, setTintColor] = useState("");
  const [columnsColor, setColumnsColor] = useState("");
  const [lignesColor, setLignesColor] = useState("");

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleTitleChange1 = (event) => {
    setDeviceTitle(event.target.value);
  };

  const handleSave = () => {
    const columns = fieldGroups.map((group) => ({
      title: group.selectedField,
      type: group.columnType,
      fieldName: group.selectedField,
      dataKey: group.columnType === "Meta" ? group.selectedField.toLowerCase() : "value",
    }));
    const tableData = {
      columns,
      tableTitle,
      tintColor,
      columnsColor,
      lignesColor,
      devicesPerPage,
      paginationOption,
    };
    if (widgetId) {
      onUpdateTable(widgetId, tableData);
    } else {
      onAddTable(tableData);
    }
    onClose();
  };

  const handleFieldChange = (index, event) => {
    const updatedFieldGroups = [...fieldGroups];
    updatedFieldGroups[index].selectedField = event.target.value;
    setFieldGroups(updatedFieldGroups);
    updateColumns(updatedFieldGroups); // Update columns when field changes
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleTitleChange = (event) => {
    setTableTitle(event.target.value);
  };

  const filteredDevices = devices.filter((device) =>
    device.name.toLowerCase().includes(searchTerm)
  );

  const handleColumnTypeChange = (index, newColumnType) => {
    const updatedFieldGroups = fieldGroups.map((group, idx) => {
      if (idx === index) {
        let updatedFields = [];
        if (newColumnType === "Measurement") {
          const metricNames = Array.from(
            new Set(dataMetric.map((metric) => metric.metric_name))
          );
          updatedFields = metricNames;
        } else if (newColumnType === "Meta") {
          const fieldAttributes = ["Name", "Location"];
          updatedFields = fieldAttributes;
        }
        return {
          ...group,
          columnType: newColumnType,
          fields: updatedFields,
          selectedField: updatedFields[0],
        };
      }
      return group;
    });
    setFieldGroups(updatedFieldGroups);
    updateColumns(updatedFieldGroups); // Update columns when column type changes
  };

  const handleAddClick = () => {
    setFieldGroups([
      ...fieldGroups,
      {
        columnType: "Meta",
        fields: ["Name", "Location"],
        selectedField: "Name",
      },
    ]);
  };

  const removeFieldGroup = (index) => {
    setFieldGroups(fieldGroups.filter((_, i) => i !== index));
    updateColumns(fieldGroups.filter((_, i) => i !== index)); // Update columns when a field group is removed
  };

  const updateColumns = (fieldGroups) => {
    const columns = fieldGroups.map((group) => ({
      title: group.selectedField,
      type: group.columnType,
      fieldName: group.selectedField,
      dataKey:
        group.columnType === "Meta"
          ? group.selectedField.toLowerCase()
          : "value",
    }));
    setColumns(columns);
  };

  useEffect(() => {
    const fetchData = () => {
      const newRows = devices.map((device) => {
        const row = { device: device.name };
        columns.forEach((column) => {
          if (column.type === "Meta") {
            if (column.fieldName === "location") {
              const { lat, long } = device.location;
              row[column.fieldName] =
                lat !== null && long !== null
                  ? `Lat: ${lat}, Long: ${long}`
                  : "N/A";
            } else {
              row[column.fieldName] = device[column.dataKey];
            }
          } else if (column.type === "Measurement") {
            // Find the latest metric value for the device
            const deviceMetricIds = device.metrics
              .filter((m) => m.name === column.fieldName)
              .map((m) => m.metric_id);

            const latestMetric = dataMetric
              .filter((m) => deviceMetricIds.includes(m.metric_id))
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

            row[column.fieldName] = latestMetric ? latestMetric.value : "N/A";
          }
        });
        return row;
      });
      setRows(newRows);
    };

    if (devices.length > 0 && dataMetric.length > 0 && columns.length > 0) {
      fetchData();
    }
  }, [columns, devices, dataMetric]);

  useEffect(() => {
    if (open) {
      if (widgetData) {
        setDeviceTitle(widgetData.deviceTitle || "Device");
        setTableTitle(widgetData.tableTitle || "Table");
        setTintColor(widgetData.tintColor || "");
        setColumnsColor(widgetData.columnsColor || "");
        setLignesColor(widgetData.lignesColor || "");
        setDevicesPerPage(widgetData.devicesPerPage || 10);
        setPaginationOption(widgetData.paginationOption || "Auto");

        const initialFieldGroups = widgetData.columns.map((column) => ({
          columnType: column.type,
          fields: column.type === "Meta" ? ["Name", "Location"] : Array.from(new Set(dataMetric.map((metric) => metric.metric_name))),
          selectedField: column.title,
        }));

        setFieldGroups(initialFieldGroups);
        setColumns(widgetData.columns);
      } else {
        setDeviceTitle("Device");
        setTableTitle("Table");
        setTintColor("");
        setColumnsColor("");
        setLignesColor("");
        setDevicesPerPage(10);
        setPaginationOption("Auto");
        setFieldGroups([
          {
            columnType: "Meta",
            fields: ["Name", "Location"],
            selectedField: "Name",
          },
        ]);
        setColumns([]);
      }
      setCurrentPage(1); // Reset to the first page when modal opens
    }
  }, [open, widgetData, dataMetric]);

  const handleClose = () => {
    setDeviceTitle("Device");
    setSearchTerm("");
    setFieldGroups([
      {
        columnType: "Meta",
        fields: ["Name", "Location"],
        selectedField: "Name",
      },
    ]);
    setTableTitle("Table");
    setRows([]);
    setColumns([]);
    setCurrentPage(1); // Reset to the first page when modal opens
    setDevicesPerPage(10);
    setPaginationOption("Auto");
    setTintColor("");
    setColumnsColor("");
    setLignesColor("");

    onClose(); // Appel de la fonction onClose passée en prop
  };

  const handleDevicesPerPageChange = (event) => {
    setDevicesPerPage(event.target.value);
    setCurrentPage(1); // Reset to the first page when modal opens
  };
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };
  const handlePaginationOptionChange = (event) => {
    setPaginationOption(event.target.value);
  };

  const startIndex = (currentPage - 1) * devicesPerPage;
  const endIndex = startIndex + devicesPerPage;
  const paginatedRows = rows.slice(startIndex, endIndex);

  const showPagination =
    paginationOption === "Always" ||
    (paginationOption === "Auto" && rows.length > devicesPerPage);

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,

          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
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

        <Typography variant="h6" component="h2">
          {widgetId ? "Edit Table" : "Create Table"}
        </Typography>

        <Box
          sx={{
            width: "100%",
            height: 180, // Définissez la hauteur souhaitée de l'aperçu
            border: "1px dashed  grey", // #ccc
            background: "white",
            marginBottom: 2, // Ajout d'un espace en bas
            padding: 2,
            overflow: "hidden", // Ensure the preview is scrollable if it overflows
          }}
        >
          <TableContainer
            component={Paper}
            sx={{
              maxWidth: "100%",
              maxHeight: 120, // Limit the height of the table container
              overflowY: "auto", // Make it scrollable if needed
              boxShadow: "none", // Remove inner box shadow
              background: tintColor || "white",
            }}
          >
            <Table aria-label="dynamic device table">
              <TableHead>
                <TableRow>
                  {columns.map((column, index) => (
                    <TableCell
                      key={index}
                      sx={{ padding: "4px", fontSize: "0.75rem" }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: columnsColor || " black",
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
                    {columns.map((column, colIndex) => (
                      <TableCell
                        key={colIndex}
                        sx={{
                          padding: "4px",
                          fontSize: "0.75rem",
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
          {rows.length > 0 && fieldGroups.length > 0 && showPagination && (
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
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            aria-label="basic tabs example"
          >
            <Tab label="Basic" />
            <Tab label="Columns" />
            <Tab label="Appearance" />
          </Tabs>
        </Box>

        {tabIndex === 0 && (
          <Box sx={{ marginTop: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Title
            </Typography>
            <TextField
              fullWidth
              value={tableTitle}
              onChange={handleTitleChange}
              variant="outlined"
            />
          </Box>
        )}
        {tabIndex === 1 && (
          <Box sx={{ maxHeight: "400px", overflowY: "auto", my: 2 }}>
            {fieldGroups.map((group, index) => (
              <Box
                key={index}
                sx={{
                  bgcolor: "#f5f5f5",
                  p: 2,
                  my: 1,
                  border: "1px solid #e0e0e0",
                  borderRadius: "4px",
                  position: "relative",
                }}
              >
                <IconButton
                  onClick={() => removeFieldGroup(index)}
                  sx={{ position: "absolute", right: 8, top: 8 }}
                >
                  <Close />
                </IconButton>

                <ToggleButtonGroup
                  value={group.columnType}
                  exclusive
                  onChange={(e, newColumnType) =>
                    handleColumnTypeChange(index, newColumnType)
                  }
                  aria-label="column type"
                  sx={{
                    display: "block",
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 2,
                    mt: 2,
                  }}
                >
                  <ToggleButton value="Meta" aria-label="meta" sx={{ mr: 1 }}>
                    <PushPinIcon />
                    &nbsp;Meta
                  </ToggleButton>
                  <ToggleButton value="Measurement" aria-label="measurement">
                    <AssessmentIcon />
                    &nbsp;Measurement
                  </ToggleButton>
                </ToggleButtonGroup>
                <FormControl fullWidth sx={{ mt: 2, backgroundColor: "#fff " }}>
                  <TextField
                    select
                    label="Select Field"
                    value={group.selectedField}
                    onChange={(event) => handleFieldChange(index, event)}
                    variant="outlined"
                  >
                    {group.fields.map((field, idx) => (
                      <MenuItem key={idx} value={field}>
                        {field}
                      </MenuItem>
                    ))}
                  </TextField>
                </FormControl>
              </Box>
            ))}
            <Button variant="contained" onClick={handleAddClick} sx={{ mt: 2 }}>
              + Add Column
            </Button>
          </Box>
        )}

        {tabIndex === 2 && (
          <Box sx={{ marginTop: 2 }}>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Devices per page</InputLabel>
              <Select
                value={devicesPerPage}
                onChange={handleDevicesPerPageChange}
                label="Devices per page"
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Show pagination</InputLabel>
              <Select
                value={paginationOption}
                onChange={handlePaginationOptionChange}
                label="Show pagination"
              >
                <MenuItem value="Auto">Auto</MenuItem>
                <MenuItem value="Always">Always</MenuItem>
                <MenuItem value="Never">Never</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Tint Color
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 1 }}>
              <ColorPicker
                value={tintColor}
                onChange={(color) => setTintColor(color.css.backgroundColor)}
                deferred
                fullWidth
              />
              <Button onClick={() => setTintColor("")}>
                <DeleteIcon />
              </Button>
            </Box>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Columns Color
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 1 }}>
              <ColorPicker
                value={columnsColor}
                onChange={(color) => setColumnsColor(color.css.backgroundColor)}
                deferred
                fullWidth
              />
              <Button onClick={() => setColumnsColor("")}>
                <DeleteIcon />
              </Button>
            </Box>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Lignes Color
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 1 }}>
              <ColorPicker
                value={lignesColor}
                onChange={(color) => setLignesColor(color.css.backgroundColor)}
                deferred
                fullWidth
              />
              <Button onClick={() => setLignesColor("")}>
                <DeleteIcon />
              </Button>
            </Box>
          </Box>
        )}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button variant="text" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} sx={{ ml: 2 }}>
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default TableModal;
