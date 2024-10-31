import React, { useState, useRef } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import { priceTableService } from '../../services/priceTableService';

interface PriceTableImportProps {
  companyId: number;
  open: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export const PriceTableImport: React.FC<PriceTableImportProps> = ({
  companyId,
  open,
  onClose,
  onImportComplete,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [validFrom, setValidFrom] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [validUntil, setValidUntil] = useState('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      try {
        const preview = await priceTableService.previewImport(
          companyId,
          selectedFile
        );
        setPreviewData(preview.preview);
        setError(null);
      } catch (error: any) {
        setError(error.response?.data?.detail || 'Failed to preview file');
        setPreviewData([]);
      }
    }
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      await priceTableService.importPriceTables(
        companyId,
        file,
        validFrom,
        validUntil || undefined
      );
      onImportComplete();
      handleClose();
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to import price tables');
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewData([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Import Price Tables</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <Button
            variant="outlined"
            onClick={() => fileInputRef.current?.click()}
            sx={{ mb: 2 }}
          >
            Select Excel File
          </Button>
          {file && <Typography sx={{ ml: 2 }}>{file.name}</Typography>}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Valid From"
            type="date"
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Valid Until"
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {previewData.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Preview (First 5 rows)
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Unit Price</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.Name}</TableCell>
                      <TableCell>{row.Unit}</TableCell>
                      <TableCell>{row['Unit price']}</TableCell>
                      <TableCell>{row.Description}</TableCell>
                      <TableCell>{row['비고']}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleImport}
          variant="contained"
          disabled={!file || !validFrom}
        >
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
};