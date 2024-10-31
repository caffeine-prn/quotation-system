import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  LinearProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { ImportPreview, ImportResult } from '../../types/priceTable';
import PriceTableMappingForm from './PriceTableMappingForm';
import PriceTablePreview from './PriceTablePreview';

interface PriceTableImportProps {
  onImportComplete: (result: ImportResult) => void;
  onCancel: () => void;
}

const steps = ['파일 선택', '필드 매핑', '미리보기 및 확인'];

const PriceTableImport: React.FC<PriceTableImportProps> = ({
  onImportComplete,
  onCancel,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      setError('Please select an Excel file (.xlsx or .xls)');
      return;
    }

    setFile(selectedFile);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await fetch('/api/price-tables/preview', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Failed to preview file');
      
      const previewData: ImportPreview = await response.json();
      setPreview(previewData);
      setActiveStep(1);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to preview file');
    }
  };

  const handleMappingComplete = (mappings: { [key: string]: string }) => {
    if (!preview) return;
    
    setPreview({
      ...preview,
      mappings,
    });
    setActiveStep(2);
  };

  const handleImport = async () => {
    if (!file || !preview) return;

    setImporting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mappings', JSON.stringify(preview.mappings));

      const response = await fetch('/api/price-tables/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Import failed');

      const result: ImportResult = await response.json();
      onImportComplete(result);
    } catch (err) {
      setError(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              ref={fileInputRef}
            />
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              엑셀 파일 선택
            </Button>
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              .xlsx 또는 .xls 파일만 지원됩니다.
            </Typography>
          </Box>
        );

      case 1:
        return preview ? (
          <PriceTableMappingForm
            headers={preview.headers}
            onComplete={handleMappingComplete}
            onBack={() => setActiveStep(0)}
          />
        ) : null;

      case 2:
        return preview ? (
          <PriceTablePreview
            preview={preview}
            onConfirm={handleImport}
            onBack={() => setActiveStep(1)}
            disabled={importing}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        단가표 Import
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {importing && <LinearProgress sx={{ mb: 2 }} />}

      {renderStepContent()}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} disabled={importing}>
          취소
        </Button>
      </Box>
    </Paper>
  );
};

export default PriceTableImport;