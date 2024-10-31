import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Grid,
} from '@mui/material';

interface PriceTableMappingFormProps {
  headers: string[];
  onComplete: (mappings: { [key: string]: string }) => void;
  onBack: () => void;
}

const requiredFields = [
  { key: 'name', label: '품목명' },
  { key: 'unit', label: '단위' },
  { key: 'unitPrice', label: '단가' },
  { key: 'mediaType', label: '매체 유형' },
];

const optionalFields = [
  { key: 'description', label: '설명' },
  { key: 'note', label: '비고' },
  { key: 'category', label: '카테고리' },
];

const PriceTableMappingForm: React.FC<PriceTableMappingFormProps> = ({
  headers,
  onComplete,
  onBack,
}) => {
  const [mappings, setMappings] = useState<{ [key: string]: string }>({});

  const handleMappingChange = (field: string, value: string) => {
    setMappings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    // 필수 필드가 모두 매핑되었는지 확인
    const isValid = requiredFields.every((field) => mappings[field.key]);
    if (!isValid) return;

    onComplete(mappings);
  };

  const renderFieldMapping = (field: { key: string; label: string }, required: boolean) => (
    <Grid item xs={12} sm={6} key={field.key}>
      <FormControl fullWidth required={required}>
        <InputLabel>{field.label}</InputLabel>
        <Select
          value={mappings[field.key] || ''}
          label={field.label}
          onChange={(e) => handleMappingChange(field.key, e.target.value as string)}
        >
          <MenuItem value="">
            <em>선택 안함</em>
          </MenuItem>
          {headers.map((header) => (
            <MenuItem key={header} value={header}>
              {header}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
  );

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        엑셀 필드 매핑
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        엑셀 파일의 각 열을 해당하는 필드와 매핑해주세요.
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            필수 필드
          </Typography>
        </Grid>
        {requiredFields.map((field) => renderFieldMapping(field, true))}

        <Grid item xs={12} sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            선택 필드
          </Typography>
        </Grid>
        {optionalFields.map((field) => renderFieldMapping(field, false))}
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack}>
          이전
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!requiredFields.every((field) => mappings[field.key])}
        >
          다음
        </Button>
      </Box>
    </Box>
  );
};

export default PriceTableMappingForm;