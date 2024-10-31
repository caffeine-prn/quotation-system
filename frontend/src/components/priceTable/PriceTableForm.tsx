import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  TextField,
  Paper,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { PriceTable, PriceTableItem } from '../../types/priceTable';

interface PriceTableFormProps {
  initialData?: PriceTable;
  onSubmit: (data: Partial<PriceTable>) => void;
  onCancel: () => void;
}

const INITIAL_ITEM: PriceTableItem = {
  id: '',
  name: '',
  unit: '',
  unitPrice: 0,
  mediaType: '',
  category: '',
};

const PriceTableForm: React.FC<PriceTableFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<PriceTable>>(
    initialData || {
      name: '',
      version: '1.0',
      effectiveDate: new Date().toISOString().split('T')[0],
      items: [{ ...INITIAL_ITEM }],
    }
  );

  const handleBasicInfoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (
    index: number,
    field: keyof PriceTableItem,
    value: any
  ) => {
    const newItems = [...(formData.items || [])];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'unitPrice' ? Number(value) : value,
    };
    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }));
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...(prev.items || []), { ...INITIAL_ITEM }],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: (prev.items || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          기본 정보
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="name"
              label="단가표명"
              value={formData.name}
              onChange={handleBasicInfoChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="version"
              label="버전"
              value={formData.version}
              onChange={handleBasicInfoChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="effectiveDate"
              label="적용일자"
              type="date"
              value={formData.effectiveDate}
              onChange={handleBasicInfoChange}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">단가 항목</Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddItem}
          >
            항목 추가
          </Button>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>품목명</TableCell>
                <TableCell>단위</TableCell>
                <TableCell>단가</TableCell>
                <TableCell>매체 유형</TableCell>
                <TableCell>카테고리</TableCell>
                <TableCell>설명</TableCell>
                <TableCell>비고</TableCell>
                <TableCell width={50}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.items?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <TextField
                      size="small"
                      value={item.name}
                      onChange={(e) =>
                        handleItemChange(index, 'name', e.target.value)
                      }
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={item.unit}
                      onChange={(e) =>
                        handleItemChange(index, 'unit', e.target.value)
                      }
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(index, 'unitPrice', e.target.value)
                      }
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={item.mediaType}
                      onChange={(e) =>
                        handleItemChange(index, 'mediaType', e.target.value)
                      }
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={item.category}
                      onChange={(e) =>
                        handleItemChange(index, 'category', e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(index, 'description', e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={item.note}
                      onChange={(e) =>
                        handleItemChange(index, 'note', e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveItem(index)}
                      disabled={formData.items?.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="outlined" onClick={onCancel}>
            취소
          </Button>
          <Button variant="contained" type="submit">
            저장
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PriceTableForm;