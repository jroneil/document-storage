'use client';

import { useState, useEffect } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';

interface MetadataField {
  _id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  required: boolean;
  options?: string[];
  defaultValue?: string;
  isActive: boolean;
}

export default function MetadataFieldsPage() {
  const [fields, setFields] = useState<MetadataField[]>([]);
  const [open, setOpen] = useState(false);
  const [editingField, setEditingField] = useState<MetadataField | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    type: 'text',
    required: false,
    options: [] as string[],
    defaultValue: '',
    isActive: true,
  });
  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const response = await axios.get('/api/metadata-fields');
      setFields(response.data.data);
    } catch (error) {
      console.error('Error fetching metadata fields:', error);
    }
  };

  const handleOpen = (field?: MetadataField) => {
    if (field) {
      setEditingField(field);
      setFormData({
        name: field.name,
        label: field.label,
        type: field.type,
        required: field.required,
        options: field.options || [],
        defaultValue: field.defaultValue || '',
        isActive: field.isActive,
      });
    } else {
      setEditingField(null);
      setFormData({
        name: '',
        label: '',
        type: 'text',
        required: false,
        options: [],
        defaultValue: '',
        isActive: true,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingField(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingField) {
        await axios.put(`/api/metadata-fields/${editingField._id}`, formData);
      } else {
        await axios.post('/api/metadata-fields', formData);
      }
      fetchFields();
      handleClose();
    } catch (error) {
      console.error('Error saving metadata field:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this field?')) {
      try {
        await axios.delete(`/api/metadata-fields/${id}`);
        fetchFields();
      } catch (error) {
        console.error('Error deleting metadata field:', error);
      }
    }
  };

  const handleAddOption = () => {
    if (newOption && !formData.options.includes(newOption)) {
      setFormData({
        ...formData,
        options: [...formData.options, newOption],
      });
      setNewOption('');
    }
  };

  const handleRemoveOption = (option: string) => {
    setFormData({
      ...formData,
      options: formData.options.filter((opt) => opt !== option),
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <h1>Metadata Fields</h1>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Field
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Label</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Required</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((field) => (
              <TableRow key={field._id}>
                <TableCell>{field.name}</TableCell>
                <TableCell>{field.label}</TableCell>
                <TableCell>{field.type}</TableCell>
                <TableCell>{field.required ? 'Yes' : 'No'}</TableCell>
                <TableCell>{field.isActive ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(field)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(field._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingField ? 'Edit Metadata Field' : 'New Metadata Field'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Field Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={!!editingField}
            />
            <TextField
              label="Display Label"
              value={formData.label}
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
            />
            <FormControl>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                label="Type"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as MetadataField['type'],
                  })
                }
              >
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="select">Select</MenuItem>
                <MenuItem value="boolean">Boolean</MenuItem>
              </Select>
            </FormControl>

            {formData.type === 'select' && (
              <Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    label="Add Option"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                  />
                  <Button onClick={handleAddOption}>Add</Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.options.map((option) => (
                    <Chip
                      key={option}
                      label={option}
                      onDelete={() => handleRemoveOption(option)}
                    />
                  ))}
                </Box>
              </Box>
            )}

            <TextField
              label="Default Value"
              value={formData.defaultValue}
              onChange={(e) =>
                setFormData({ ...formData, defaultValue: e.target.value })
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.required}
                  onChange={(e) =>
                    setFormData({ ...formData, required: e.target.checked })
                  }
                />
              }
              label="Required"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}