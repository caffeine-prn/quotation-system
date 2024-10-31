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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  fetchProducts,
  deleteProduct,
  setProductFilter,
} from '../../store/companySlice';
import { RootState } from '../../store';
import { useNavigate } from 'react-router-dom';

const ProductList: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    products,
    companies,
    loading,
    error,
    productFilter,
  } = useSelector((state: RootState) => state.company);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch, productFilter]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setProductFilter({ ...productFilter, search: event.target.value }));
  };

  const handleCompanyChange = (event: any) => {
    dispatch(setProductFilter({
      ...productFilter,
      companyId: event.target.value || undefined,
    }));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('정말로 이 제품을 삭제하시겠습니까?')) {
      dispatch(deleteProduct(id));
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/products/${id}/edit`);
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">제품 관리</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/products/new')}
        >
          제품 등록
        </Button>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          label="검색"
          variant="outlined"
          size="small"
          value={productFilter.search || ''}
          onChange={handleSearch}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>회사</InputLabel>
          <Select
            value={productFilter.companyId || ''}
            label="회사"
            onChange={handleCompanyChange}
          >
            <MenuItem value="">전체</MenuItem>
            {companies.map((company) => (
              <MenuItem key={company.id} value={company.id}>
                {company.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>제품명</TableCell>
              <TableCell>제품 코드</TableCell>
              <TableCell>회사</TableCell>
              <TableCell>카테고리</TableCell>
              <TableCell>상태</TableCell>
              <TableCell>등록일</TableCell>
              <TableCell width={100}>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  등록된 제품이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.code}</TableCell>
                  <TableCell>
                    {companies.find(c => c.id === product.companyId)?.name}
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    {product.status === 'ACTIVE' ? '활성' : '비활성'}
                  </TableCell>
                  <TableCell>
                    {new Date(product.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(product.id)}
                      title="수정"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(product.id)}
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
    </Box>
  );
};

export default ProductList;