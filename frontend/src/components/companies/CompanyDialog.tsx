import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Stack,
} from '@mui/material';
import { Company } from '../../services/companyService';

interface CompanyDialogProps {
  open: boolean;
  company: Company | null;
  onClose: () => void;
  onSave: (data: Partial<Company>) => void;
}

export const CompanyDialog: React.FC<CompanyDialogProps> = ({
  open,
  company,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    is_active: true,
  });

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        description: company.description || '',
        contact_person: company.contact_person || '',
        contact_email: company.contact_email || '',
        contact_phone: company.contact_phone || '',
        is_active: company.is_active,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        contact_person: '',
        contact_email: '',
        contact_phone: '',
        is_active: true,
      });
    }
  }, [company]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [field]: e.target.value,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {company ? 'Edit Company' : 'New Company'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Company Name"
              value={formData.name}
              onChange={handleChange('name')}
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={handleChange('description')}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Contact Person"
              value={formData.contact_person}
              onChange={handleChange('contact_person')}
              fullWidth
            />
            <TextField
              label="Contact Email"
              type="email"
              value={formData.contact_email}
              onChange={handleChange('contact_email')}
              fullWidth
            />
            <TextField
              label="Contact Phone"
              value={formData.contact_phone}
              onChange={handleChange('contact_phone')}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {company ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};