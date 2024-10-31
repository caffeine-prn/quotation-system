import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Grid,
  Paper,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { quotationService, QuotationData } from '../../services/quotationService';
import { QuotationActions } from './QuotationActions';

interface QuotationFormProps {
  initialData?: QuotationData;
  mode: 'create' | 'edit';
}

export const QuotationForm: React.FC<QuotationFormProps> = ({ initialData, mode }) => {
  const history = useHistory();
  const { id } = useParams<{ id?: string }>();
  const [customers, setCustomers] = useState<any[]>([]);
  const [priceTables, setPriceTables] = useState<any[]>([]);
  const [formData, setFormData] = useState<QuotationData>({
    customer_id: 0,
    project_description: '',
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [],
    discount_amount: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
    // Fetch customers and price tables
    // These would be actual API calls in a real application
    const fetchData = async () => {
      // const customersData = await customerService.getCustomers();
      // const priceTablesData = await priceTableService.getPriceTables();
      // setCustomers(customersData);
      // setPriceTables(priceTablesData);
    };
    fetchData();
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'create') {
        await quotationService.createQuotation(formData);
      } else {
        await quotationService.updateQuotation(parseInt(id!), formData);
      }
      history.push('/quotations');
    } catch (error) {
      console.error('Failed to save quotation:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          price_table_id: 0,
          quantity: 1,
          unit_price: 0,
          discount_amount: 0,
        },
      ],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          return { ...item, [field]: value };
        }
        return item;
      }),
    }));
  };

  const calculateTotal = () => {
    const itemsTotal = formData.items.reduce(
      (sum, item) => sum + (item.quantity * item.unit_price - (item.discount_amount || 0)),
      0
    );
    return itemsTotal - (formData.discount_amount || 0);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {mode === 'create' ? 'New Quotation' : 'Edit Quotation'}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Customer</InputLabel>
              <Select
                value={formData.customer_id}
                onChange={(e) => handleInputChange(e as any)}
                name="customer_id"
                label="Customer"
              >
                {customers.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Valid Until"
              type="date"
              name="valid_until"
              value={formData.valid_until}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Project Description"
              multiline
              rows={4}
              name="project_description"
              value={formData.project_description}
              onChange={handleInputChange}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Items</Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddItem}
            variant="outlined"
            size="small"
          >
            Add Item
          </Button>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Unit Price</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Total</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <FormControl fullWidth size="small">
                      <Select
                        value={item.price_table_id}
                        onChange={(e) =>
                          handleItemChange(index, 'price_table_id', e.target.value)
                        }
                      >
                        {priceTables.map((priceTable) => (
                          <MenuItem key={priceTable.id} value={priceTable.id}>
                            {priceTable.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, 'quantity', parseInt(e.target.value))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      value={item.unit_price}
                      onChange={(e) =>
                        handleItemChange(index, 'unit_price', parseFloat(e.target.value))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      value={item.discount_amount}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          'discount_amount',
                          parseFloat(e.target.value)
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('ko-KR', {
                      style: 'currency',
                      currency: 'KRW',
                    }).format(item.quantity * item.unit_price - (item.discount_amount || 0))}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Total Discount"
              type="number"
              name="discount_amount"
              value={formData.discount_amount}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" align="right">
              Total:{' '}
              {new Intl.NumberFormat('ko-KR', {
                style: 'currency',
                currency: 'KRW',
              }).format(calculateTotal())}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
        {mode === 'edit' && <QuotationActions quotationId={parseInt(id!)} />}
        <Box>
          <Button onClick={() => history.push('/quotations')}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {mode === 'create' ? 'Create' : 'Save'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};