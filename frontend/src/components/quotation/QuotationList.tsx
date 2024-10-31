import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
} from '@mui/material';
import { Edit, Delete, PictureAsPdf } from '@mui/icons-material';
import { RootState } from '../../store';
import {
  fetchQuotations,
  deleteQuotation,
  setFilter,
  setSort,
  setPage,
  setPageSize,
} from '../../store/quotationSlice';
import { QuotationStatus, QuotationSort } from '../../types/quotation';
import { quotationService } from '../../services/quotationService';

const QuotationList: React.FC = () => {
  const dispatch = useDispatch();
  const {
    quotations,
    loading,
    error,
    filter,
    sort,
    pagination,
  } = useSelector((state: RootState) => state.quotation);

  useEffect(() => {
    dispatch(fetchQuotations());
  }, [dispatch, filter, sort, pagination.page, pagination.pageSize]);

  // 필터 핸들러
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilter({ ...filter, search: event.target.value }));
  };

  const handleStatusChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    dispatch(setFilter({ ...filter, status: event.target.value as QuotationStatus }));
  };

  // 정렬 핸들러
  const handleSortChange = (field: QuotationSort['field']) => {
    const newDirection = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
    dispatch(setSort({ field, direction: newDirection }));
  };

  // 페이지네이션 핸들러
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    dispatch(setPage(value));
  };

  // 액션 핸들러
  const handleEdit = (id: string) => {
    // TODO: Navigate to edit page
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      dispatch(deleteQuotation(id));
    }
  };

  const handleExportPdf = async (id: string) => {
    try {
      const blob = await quotationService.exportToPdf(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quotation-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export PDF:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {/* 필터 영역 */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={filter.search || ''}
          onChange={handleSearchChange}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filter.status || ''}
            label="Status"
            onChange={handleStatusChange}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="APPROVED">Approved</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* 견적서 목록 테이블 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell onClick={() => handleSortChange('quoteNumber')}>
                Quote #
              </TableCell>
              <TableCell onClick={() => handleSortChange('date')}>
                Date
              </TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Project Description</TableCell>
              <TableCell onClick={() => handleSortChange('totalAmount')}>
                Total Amount
              </TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quotations.map((quotation) => (
              <TableRow key={quotation.id}>
                <TableCell>{quotation.quoteNumber}</TableCell>
                <TableCell>{new Date(quotation.date).toLocaleDateString()}</TableCell>
                <TableCell>{quotation.customer}</TableCell>
                <TableCell>{quotation.projectDescription}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat('ko-KR', {
                    style: 'currency',
                    currency: 'KRW'
                  }).format(quotation.totalAmount)}
                </TableCell>
                <TableCell>{quotation.status}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(quotation.id)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(quotation.id)}>
                    <Delete />
                  </IconButton>
                  <IconButton onClick={() => handleExportPdf(quotation.id)}>
                    <PictureAsPdf />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 페이지네이션 */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={Math.ceil(pagination.total / pagination.pageSize)}
          page={pagination.page}
          onChange={handlePageChange}
        />
      </Box>
    </Box>
  );
};

export default QuotationList;