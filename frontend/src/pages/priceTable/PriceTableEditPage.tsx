import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Typography } from '@mui/material';
import PriceTableForm from '../../components/priceTable/PriceTableForm';
import {
  fetchPriceTableById,
  createPriceTable,
  updatePriceTable,
  clearCurrentPriceTable,
} from '../../store/priceTableSlice';
import { RootState } from '../../store';
import { PriceTable } from '../../types/priceTable';

const PriceTableEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentPriceTable, loading, error } = useSelector(
    (state: RootState) => state.priceTables
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchPriceTableById(id));
    }
    return () => {
      dispatch(clearCurrentPriceTable());
    };
  }, [dispatch, id]);

  const handleSubmit = async (formData: Partial<PriceTable>) => {
    try {
      if (id) {
        await dispatch(updatePriceTable({ id, data: formData })).unwrap();
      } else {
        await dispatch(createPriceTable(formData)).unwrap();
      }
      navigate('/price-tables');
    } catch (err) {
      console.error('Failed to save price table:', err);
    }
  };

  const handleCancel = () => {
    navigate('/price-tables');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {id ? '단가표 수정' : '단가표 등록'}
      </Typography>
      <PriceTableForm
        initialData={currentPriceTable}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </Container>
  );
};

export default PriceTableEditPage;