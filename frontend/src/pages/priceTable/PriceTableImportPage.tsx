import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper } from '@mui/material';
import PriceTableImport from '../../components/priceTable/PriceTableImport';
import { ImportResult } from '../../types/priceTable';

const PriceTableImportPage: React.FC = () => {
  const navigate = useNavigate();

  const handleImportComplete = (result: ImportResult) => {
    if (result.success) {
      // TODO: Show success notification
      navigate('/price-tables');
    }
  };

  const handleCancel = () => {
    navigate('/price-tables');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 2 }}>
        <PriceTableImport
          onImportComplete={handleImportComplete}
          onCancel={handleCancel}
        />
      </Paper>
    </Container>
  );
};

export default PriceTableImportPage;