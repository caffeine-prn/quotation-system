import React from 'react';
import { Container, Paper, Tab, Tabs, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import CompanyList from '../../components/company/CompanyList';
import ProductList from '../../components/company/ProductList';

const CompanyPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = React.useState(
    location.pathname === '/companies' ? 0 : 1
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    navigate(newValue === 0 ? '/companies' : '/products');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleTabChange}>
            <Tab label="회사 관리" />
            <Tab label="제품 관리" />
          </Tabs>
        </Box>
        <Box sx={{ py: 2 }}>
          {value === 0 ? <CompanyList /> : <ProductList />}
        </Box>
      </Paper>
    </Container>
  );
};

export default CompanyPage;