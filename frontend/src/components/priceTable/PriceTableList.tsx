import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  TextField,
  Typography,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
} from '@mui/icons-material';
import {
  fetchPriceTables,
  deletePriceTable,
  setFilter,
  setPage,
  setPageSize,
} from '../../store/priceTableSlice';
import { RootState } from '../../store';
import { PriceTable } from '../../types/priceTable';

const PriceTableList: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    priceTables,
    loading,
    error,
    filter,
    pagination,
  } = useSelector((state: RootState) => state.priceTables);

  useEffect(() => {
    dispatch(fetchPriceTables());
  }, [dispatch, filter, pagination.page, pagination.pageSize]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilter({ ...filter, search: event.target.value }));
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    dispatch(setPage(value));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('정말로 이 단가표를 삭제하시겠습니까?')) {
      dispatch(deletePriceTable(id));
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/price-tables/${id}/edit`);
  };

  const handleImport = () => {
    navigate('/price-tables/import');
  };

  const handleExport = async (id: string) => {
    try {
      const response = await fetch(`/api/price-tables/${id}/export`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `price-table-${id}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export price table:', error);
    }
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">단가표 관리</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={handleImport}
            sx={{ mr: 1 }}
          >
            Import
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/price-tables/new')}
          >
            신규 등록
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          label="검색"
          variant="outlined"
          size="small"
          value={filter.search || ''}
          onChange={handleSearch}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>단가표명</TableCell>
              <TableCell>버전</TableCell>
              <TableCell>적용일자</TableCell>
              <TableCell>항목 수</TableCell>
              <TableCell>작성일</TableCell>
              <TableCell>수정일</TableCell>
              <TableCell width={120}>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : priceTables.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  등록된 단가표가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              priceTables.map((priceTable) => (
                <TableRow key={priceTable.id}>
                  <TableCell>{priceTable.name}</TableCell>
                  <TableCell>{priceTable.version}</TableCell>
                  <TableCell>{priceTable.effectiveDate}</TableCell>
                  <TableCell>{priceTable.items.length}</TableCell>
                  <TableCell>
                    {new Date(priceTable.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(priceTable.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(priceTable.id)}
                      title="수정"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleExport(priceTable.id)}
                      title="내보내기"
                    >
                      <CloudDownloadIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(priceTable.id)}
                      title="삭제"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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

export default PriceTableList;