import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, Container, Typography } from '@mui/material';
import QuotationForm from '../../components/quotation/QuotationForm';
import { quotationService } from '../../services/quotationService';
import { fetchQuotations } from '../../store/quotationSlice';
import { Quotation } from '../../types/quotation';

const QuotationEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [quotation, setQuotation] = useState<Quotation | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuotation = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await quotationService.getQuotationById(id);
        setQuotation(data);
      } catch (err) {
        setError('Failed to load quotation');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadQuotation();
  }, [id]);

  const handleSubmit = async (formData: Partial<Quotation>) => {
    try {
      setLoading(true);
      if (id) {
        await quotationService.updateQuotation(id, formData);
      } else {
        await quotationService.createQuotation(formData as Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>);
      }
      dispatch(fetchQuotations());
      navigate('/quotations');
    } catch (err) {
      setError('Failed to save quotation');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/quotations');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {id ? '견적서 수정' : '견적서 생성'}
        </Typography>
        <QuotationForm
          initialData={quotation}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Box>
    </Container>
  );
};

export default QuotationEdit;