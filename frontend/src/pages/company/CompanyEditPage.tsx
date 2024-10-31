import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Typography } from '@mui/material';
import CompanyForm from '../../components/company/CompanyForm';
import {
  fetchCompanies,
  createCompany,
  updateCompany,
  clearCurrentItems,
} from '../../store/companySlice';
import { RootState } from '../../store';
import { Company } from '../../types/company';

const CompanyEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { companies, loading, error } = useSelector(
    (state: RootState) => state.company
  );

  const currentCompany = companies.find((c) => c.id === id);

  useEffect(() => {
    if (!companies.length) {
      dispatch(fetchCompanies());
    }
    return () => {
      dispatch(clearCurrentItems());
    };
  }, [dispatch]);

  const handleSubmit = async (formData: Partial<Company>) => {
    try {
      if (id) {
        await dispatch(updateCompany({ id, data: formData })).unwrap();
      } else {
        await dispatch(createCompany(formData)).unwrap();
      }
      navigate('/companies');
    } catch (err) {
      console.error('Failed to save company:', err);
    }
  };

  const handleCancel = () => {
    navigate('/companies');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {id ? '회사 정보 수정' : '신규 회사 등록'}
      </Typography>
      <CompanyForm
        initialData={currentCompany}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </Container>
  );
};

export default CompanyEditPage;