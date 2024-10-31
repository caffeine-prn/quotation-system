import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  TextField,
  IconButton,
  Typography,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  fetchCompanies,
  deleteCompany,
  setCompanyFilter,
  setPage,
} from '../../store/companySlice';
import { RootState } from '../../store';
import { useNavigate } from 'react-router-dom';

const CompanyList: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    companies,
    loading,
    error,
    companyFilter,
    pagination,
  } = useSelector((state: RootState) => state.company);

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch, companyFilter, pagination.page]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setCompanyFilter({ ...companyFilter, search: event.target.value }));
  };

  const handleStatusChange = (event: any) => {
    dispatch(setCompanyFilter({
      ...companyFilter,
      status: event.target.value || undefined,
    }));
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    dispatch(setPage(value));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('정말로 이 회사를 삭제하시겠습니까?')) {
      dispatch(deleteCompany(id));
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/companies/${id}/edit`);
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">회사 관리</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/companies/new')}
        >
          회사 등록
        </Button>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          label="검색"
          variant="outlined"
          size="small"
          value={companyFilter.search || ''}
          onChange={handleSearch}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>상태</InputLabel>
          <Select
            value={companyFilter.status || ''}
            label="상태"
            onChange={handleStatusChange}
          >
            <MenuItem value="">전체</MenuItem>
            <MenuItem value="ACTIVE">활성</MenuItem>
            <MenuItem value="INACTIVE">비활성</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>회사명</TableCell>
              <TableCell>사업자번호</TableCell>
              <TableCell>연락처</TableCell>
              <TableCell>이메일</TableCell>
              <TableCell>상태</TableCell>
              <TableCell>등록일</TableCell>
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
            ) : companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  등록된 회사가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>{company.name}</TableCell>
                  <TableCell>{company.businessNumber}</TableCell>
                  <TableCell>{company.contact}</TableCell>
                  <TableCell>{company.email}</TableCell>
                  <TableCell>
                    {company.status === 'ACTIVE' ? '활성' : '비활성'}
                  </TableCell>
                  <TableCell>
                    {new Date(company.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(company.id)}
                      title="수정"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(company.id)}
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

export default CompanyList;