import React, { useState } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Chip,
  Stack,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { companyService, MediaType } from '../../services/companyService';

interface MediaTypeListProps {
  companyId: number;
  mediaTypes: MediaType[];
  onUpdate: () => void;
}

interface MediaTypeDialogProps {
  open: boolean;
  mediaType: MediaType | null;
  onClose: () => void;
  onSave: (data: Partial<MediaType>) => void;
}

const MediaTypeDialog: React.FC<MediaTypeDialogProps> = ({
  open,
  mediaType,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: mediaType?.name || '',
    description: mediaType?.description || '',
    is_active: mediaType?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {mediaType ? 'Edit Media Type' : 'New Media Type'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Media Type Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              multiline
              rows={3}
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
            {mediaType ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export const MediaTypeList: React.FC<MediaTypeListProps> = ({
  companyId,
  mediaTypes,
  onUpdate,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMediaType, setSelectedMediaType] = useState<MediaType | null>(null);

  const handleOpenDialog = (mediaType?: MediaType) => {
    setSelectedMediaType(mediaType || null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMediaType(null);
  };

  const handleSave = async (data: Partial<MediaType>) => {
    try {
      if (selectedMediaType) {
        await companyService.updateMediaType(selectedMediaType.id, data);
      } else {
        await companyService.createMediaType(companyId, data);
      }
      handleCloseDialog();
      onUpdate();
    } catch (error) {
      console.error('Failed to save media type:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this media type?')) {
      try {
        await companyService.deleteMediaType(id);
        onUpdate();
      } catch (error) {
        console.error('Failed to delete media type:', error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Media Type
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mediaTypes.map((mediaType) => (
              <TableRow key={mediaType.id}>
                <TableCell>{mediaType.name}</TableCell>
                <TableCell>{mediaType.description || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={mediaType.is_active ? 'Active' : 'Inactive'}
                    color={mediaType.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(mediaType)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(mediaType.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <MediaTypeDialog
        open={openDialog}
        mediaType={selectedMediaType}
        onClose={handleCloseDialog}
        onSave={handleSave}
      />
    </Box>
  );
};