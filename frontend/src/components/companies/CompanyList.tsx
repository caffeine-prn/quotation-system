import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
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
  TablePagination,
  IconButton,
  Chip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { companyService, Company } from '../../services/companyService';
import { CompanyDialog } from './CompanyDialog';

export const CompanyList: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const history = useHistory();

  const fetchCompanies = async () => {
    try {
      const data = await companyService.getCompanies({
        skip: page * rowsPerPage,
        limit: rowsPerPage,
      });
      setCompanies(data);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (company?: Company) => {
    setSelectedCompany(company || null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCompany(null);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await companyService.deleteCompany(id);
        fetchCompanies();
      } catch (error) {
        console.error('Failed to delete company:', error);
      }
    }
  };

  const handleSave = async (data: Partial<Company>) => {
    try {
      if (selectedCompany) {
        await companyService.updateCompany(selectedCompany.id, data);
      } else {
        await companyService.createCompany(data as Omit<Company, 'id' | 'products' | 'media_types'>);
      }
      handleCloseDialog();
      fetchCompanies();
    } catch (error) {
      console.error('Failed to save company:', error);
    }
  };

  const handleViewDetails = (company: Company) => {
    history.push(`/companies/${company.id}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" component="h1">
          Companies
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Company
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Contact Person</TableCell>
              <TableCell>Contact Email</TableCell>
              <TableCell>Contact Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Products</TableCell>
              <TableCell>Media Types</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell>{company.name}</TableCell>
                <TableCell>{company.contact_person || '-'}</TableCell>
                <TableCell>{company.contact_email || '-'}</TableCell>
                <TableCell>{company.contact_phone || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={company.is_active ? 'Active' : 'Inactive'}
                    color={company.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{company.products?.length || 0}</TableCell>
                <TableCell>{company.media_types?.length || 0}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleViewDetails(company)}
                  >
                    <BusinessIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(company)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(company.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={-1}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <CompanyDialog
        open={openDialog}
        company={selectedCompany}
        onClose={handleCloseDialog}
        onSave={handleSave}
      />
    </Box>
  );
};