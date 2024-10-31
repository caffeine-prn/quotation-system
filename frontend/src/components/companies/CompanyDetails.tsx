import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Divider,
  Grid,
  Button,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { companyService, Company } from '../../services/companyService';
import { ProductList } from './ProductList';
import { MediaTypeList } from './MediaTypeList';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`company-tabpanel-${index}`}
      aria-labelledby={`company-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const CompanyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const fetchCompany = async () => {
    try {
      const data = await companyService.getCompany(parseInt(id));
      setCompany(data);
    } catch (error) {
      console.error('Failed to fetch company details:', error);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!company) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              {company.name}
            </Typography>
            {company.description && (
              <Typography color="textSecondary" paragraph>
                {company.description}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <Typography>
              <strong>Contact Person:</strong> {company.contact_person || '-'}
            </Typography>
            <Typography>
              <strong>Email:</strong> {company.contact_email || '-'}
            </Typography>
            <Typography>
              <strong>Phone:</strong> {company.contact_phone || '-'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Products" />
          <Tab label="Media Types" />
        </Tabs>
        <Divider />

        <TabPanel value={tabValue} index={0}>
          <ProductList
            companyId={parseInt(id)}
            products={company.products}
            onUpdate={fetchCompany}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <MediaTypeList
            companyId={parseInt(id)}
            mediaTypes={company.media_types}
            onUpdate={fetchCompany}
          />
        </TabPanel>
      </Paper>
    </Box>
  );
};