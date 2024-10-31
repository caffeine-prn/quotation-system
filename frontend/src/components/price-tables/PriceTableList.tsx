import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Typography,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Upload as UploadIcon, Download as DownloadIcon } from '@mui/icons-material';
import { priceTableService, PriceTableItem } from '../../services/priceTableService';
import { PriceTableImport } from './PriceTableImport';

interface PriceTableListProps {
  companyId: number;
}

export const PriceTableList: React.FC<PriceTableListProps> = ({ companyId }) => {
  const [priceTables, setPriceTables] = useState<PriceTableItem[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PriceTableItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    unit_price: 0,
    description: '',
    notes: '',
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: '',
  });

  const fetchPriceTables = async () => {
    try {
      const data = await priceTableService.getPriceTables(companyId, {
        skip: page * rowsPerPage,
        limit: rowsPerPage,
      });
      setPriceTables(data);
    } catch (error) {
      console.error('Failed to fetch price tables:', error);
    }
  };

  useEffect(() => {
    fetchPriceTables();
  }, [page, rowsPerPage, companyId]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (item?: PriceTableItem) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        name: item.name,
        unit: item.unit,
        unit_price: item.unit_price,
        description: item.description || '',
        notes: item.notes || '',
        valid_from: item.valid_from,
        valid_until: item.valid_until || '',
      });
    } else {
      setSelectedItem(null);
      setFormData({
        name: '',
        unit: '',
        unit_price: 0,
        description: '',
        notes: '',
        valid_from: new Date().toISOString().split('T')[0],
        valid_until: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await priceTableService.updatePriceTable(selectedItem.id, formData);
      } else {
        await priceTableService.createPriceTable(companyId, formData);
      }
      handleCloseDialog();
      fetchPriceTables();
    } catch (error) {
      console.error('Failed to save price table:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this price table?')) {
      try {
        await priceTableService.deletePriceTable(id);
        fetchPriceTables();
      } catch (error) {
        console.error('Failed to delete price table:', error);
      }
    }
  };

  const handleExport = async () => {
    try {
      await priceTableService.exportPriceTables(companyId);
    } catch (error) {
      console.error('Failed to export price tables:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Price Tables</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setOpenImportDialog(true)}
          >
            Import
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Price Table
          </Button>
        </Stack>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Unit Price</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Valid From</TableCell>
              <TableCell>Valid Until</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {priceTables.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat('ko-KR', {
                    style: 'currency',
                    currency: 'KRW',
                  }).format(item.unit_price)}
                </TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.notes}</TableCell>
                <TableCell>{item.valid_from}</TableCell>
                <TableCell>{item.valid_until || '-'}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(item)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(item.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={-1}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {selectedItem ? 'Edit Price Table' : 'New Price Table'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                fullWidth
              />
              <TextField
                label="Unit"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                required
                fullWidth
              />
              <TextField
                label="Unit Price"
                type="number"
                value={formData.unit_price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unit_price: parseFloat(e.target.value),
                  })
                }
                required
                fullWidth
              />
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                multiline
                rows={2}
                fullWidth
              />
              <TextField
                label="Notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                multiline
                rows={2}
                fullWidth
              />
              <TextField
                label="Valid From"
                type="date"
                value={formData.valid_from}
                onChange={(e) =>
                  setFormData({ ...formData, valid_from: e.target.value })
                }
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Valid Until"
                type="date"
                value={formData.valid_until}
                onChange={(e) =>
                  setFormData({ ...formData, valid_until: e.target.value })
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedItem ? 'Save' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <PriceTableImport
        companyId={companyId}
        open={openImportDialog}
        onClose={() => setOpenImportDialog(false)}
        onImportComplete={fetchPriceTables}
      />
    </Box>
  );
};