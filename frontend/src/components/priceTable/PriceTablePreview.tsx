import React from 'react';
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
  Typography,
  Alert,
} from '@mui/material';
import { ImportPreview } from '../../types/priceTable';

interface PriceTablePreviewProps {
  preview: ImportPreview;
  onConfirm: () => void;
  onBack: () => void;
  disabled?: boolean;
}

const PriceTablePreview: React.FC<PriceTablePreviewProps> = ({
  preview,
  onConfirm,
  onBack,
  disabled,
}) => {
  const { headers, rows, mappings, validationErrors } = preview;

  const getMappedHeader = (header: string) => {
    const entry = Object.entries(mappings).find(([_, value]) => value === header);
    if (!entry) return header;

    const fieldLabels: { [key: string]: string } = {
      name: '품목명',
      unit: '단위',
      unitPrice: '단가',
      mediaType: '매체 유형',
      description: '설명',
      note: '비고',
      category: '카테고리',
    };

    return `${fieldLabels[entry[0]] || entry[0]} (${header})`;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        데이터 미리보기
      </Typography>

      {validationErrors && validationErrors.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {validationErrors.length}개의 오류가 발견되었습니다.
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ mb: 3, maxHeight: 400 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              {headers.map((header) => (
                <TableCell key={header}>{getMappedHeader(header)}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                sx={{
                  backgroundColor: validationErrors?.some(
                    (error) => error.row === rowIndex
                  )
                    ? 'error.light'
                    : 'inherit',
                }}
              >
                <TableCell>{rowIndex + 1}</TableCell>
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {validationErrors && validationErrors.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            오류 목록
          </Typography>
          {validationErrors.map((error, index) => (
            <Alert key={index} severity="error" sx={{ mb: 1 }}>
              행 {error.row + 1}, {error.column}: {error.message}
            </Alert>
          ))}
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack} disabled={disabled}>
          이전
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={disabled || (validationErrors && validationErrors.length > 0)}
        >
          가져오기
        </Button>
      </Box>
    </Box>
  );
};

export default PriceTablePreview;