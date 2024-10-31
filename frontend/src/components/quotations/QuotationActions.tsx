import React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
} from '@mui/icons-material';
import { quotationService } from '../../services/quotationService';

interface QuotationActionsProps {
  quotationId: number;
}

export const QuotationActions: React.FC<QuotationActionsProps> = ({ quotationId }) => {
  const [loading, setLoading] = React.useState<string | null>(null);

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      setLoading(format);
      if (format === 'excel') {
        await quotationService.exportToExcel(quotationId);
      } else {
        await quotationService.exportToPDF(quotationId);
      }
    } catch (error) {
      console.error(`Failed to export as ${format}:`, error);
      // 여기에 에러 처리 (예: 사용자에게 알림)를 추가할 수 있습니다.
    } finally {
      setLoading(null);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <ButtonGroup variant="contained">
        <Button
          startIcon={loading === 'excel' ? <CircularProgress size={20} /> : <ExcelIcon />}
          onClick={() => handleExport('excel')}
          disabled={!!loading}
        >
          Excel로 내보내기
        </Button>
        <Button
          startIcon={loading === 'pdf' ? <CircularProgress size={20} /> : <PdfIcon />}
          onClick={() => handleExport('pdf')}
          disabled={!!loading}
        >
          PDF로 내보내기
        </Button>
      </ButtonGroup>
    </Box>
  );
};