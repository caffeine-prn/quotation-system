import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Typography } from '@mui/material';
import ProductForm from '../../components/company/ProductForm';
import {
  fetchCompanies,
  fetchProducts,
  createProduct,
  updateProduct,
  clearCurrentItems,
} from '../../store/companySlice';
import { RootState } from '../../store';
import { Product } from '../../types/company';

const ProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { products, companies, loading, error } = useSelector(
    (state: RootState) => state.company
  );

  const currentProduct = products.find((p) => p.id === id);

  useEffect(() => {
    dispatch(fetchCompanies());
    if (!products.length) {
      dispatch(fetchProducts());
    }
    return () => {
      dispatch(clearCurrentItems());
    };
  }, [dispatch]);

  const handleSubmit = async (formData: Partial<Product>) => {
    try {
      if (id) {
        await dispatch(updateProduct({ id, data: formData })).unwrap();
      } else {
        await dispatch(createProduct(formData)).unwrap();
      }
      navigate('/products');
    } catch (err) {
      console.error('Failed to save product:', err);
    }
  };

  const handleCancel = () => {
    navigate('/products');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {id ? '제품 정보 수정' : '신규 제품 등록'}
      </Typography>
      <ProductForm
        initialData={currentProduct}
        companies={companies}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </Container>
  );
};

export default ProductEditPage;