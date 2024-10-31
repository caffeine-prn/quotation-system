import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Quotation, QuotationItem } from '../../types/quotation';

interface QuotationFormProps {
  initialData?: Quotation;
  onSubmit: (data: Partial<Quotation>) => void;
  onCancel: () => void;
}

const INITIAL_ITEM: QuotationItem = {
  id: '',
  mediaType: '',
  unitPrice: 0,
  quantity: 1,
  discount: 0,
  totalPrice: 0,
};

const QuotationForm: React.FC<QuotationFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<Quotation>>(
    initialData || {
      quoteNumber: '',
      date: new Date().toISOString().split('T')[0],
      validUntil: '',
      customer: '',
      projectDescription: '',
      items: [{ ...INITIAL_ITEM }],
      status: 'PENDING',
    }
  );

  const handleBasicInfoChange = (
    event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name!]: value,
    }));
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
    const newItems = [...(formData.items || [])];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // 단가 계산
    const item = newItems[index];
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    const discount = Number(item.discount) || 0;
    item.totalPrice = quantity * unitPrice * (1 - discount / 100);

    setFormData((prev) => ({
      ...prev,
      items: newItems,
      totalAmount: newItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0),
    }));
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...(prev.items || []), { ...INITIAL_ITEM }],
    }));
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...(formData.items || [])].filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      items: newItems,
      totalAmount: newItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0),
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', p: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          견적서 정보
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="quoteNumber"
              label="Quote Number"
              value={formData.quoteNumber}
              onChange={handleBasicInfoChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="date"
              label="Date"
              type="date"
              value={formData.date}
              onChange={handleBasicInfoChange}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="validUntil"
              label="Valid Until"
              type="date"
              value={formData.validUntil}
              onChange={handleBasicInfoChange}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="customer"
              label="Customer"
              value={formData.customer}
              onChange={handleBasicInfoChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="projectDescription"
              label="Project Description"
              multiline
              rows={3}
              value={formData.projectDescription}
              onChange={handleBasicInfoChange}
              required
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            견적 항목
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddItem}
            sx={{ mb: 2 }}
          >
            항목 추가
          </Button>
        </Box>

        {formData.items?.map((item, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Media Type"
                  value={item.mediaType}
                  onChange={(e) => handleItemChange(index, 'mediaType', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Unit Price"
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Discount (%)"
                  type="number"
                  value={item.discount}
                  onChange={(e) => handleItemChange(index, 'discount', Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Total Price"
                  value={item.totalPrice.toLocaleString()}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={1}>
                <IconButton
                  color="error"
                  onClick={() => handleRemoveItem(index)}
                  disabled={formData.items?.length === 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Paper>
        ))}

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="outlined" onClick={onCancel}>
            취소
          </Button>
          <Box>
            <Typography variant="h6" component="span" sx={{ mr: 2 }}>
              총액: {formData.totalAmount?.toLocaleString()}원
            </Typography>
            <Button variant="contained" type="submit" color="primary">
              저장
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default QuotationForm;