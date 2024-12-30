'use client';
import BreadcrumbsComponent from '@/components/Breadcrumbs';
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import axios from 'axios';
import { styled } from '@mui/material/styles';

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

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [metadataFields, setMetadataFields] = useState<MetadataField[]>([]);
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMetadataFields();
  }, []);

  const fetchMetadataFields = async () => {
    try {
      const response = await axios.get('/api/metadata-fields');
      const activeFields = response.data.data.filter(
        (field: MetadataField) => field.isActive
      );
      setMetadataFields(activeFields);
      
      // Initialize metadata with default values
      const defaultMetadata: Record<string, string> = {};
      activeFields.forEach((field: MetadataField) => {
        if (field.defaultValue) {
          defaultMetadata[field.name] = field.defaultValue;
        }
      });
      setMetadata(defaultMetadata);
    } catch (error) {
      console.error('Error fetching metadata fields:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
      
      if (!['xlsx', 'xls', 'pdf', 'csv', 'html', 'mp4', 'zip'].includes(fileType || '')) {
        setError('Invalid file type. Please upload a supported file.');
        return;
      }
      
      if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
        setError('File size exceeds 50MB limit.');
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleMetadataChange = (fieldName: string, value: string) => {
    setMetadata(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    // Validate required metadata fields
    const missingFields = metadataFields
      .filter(field => field.required && !metadata[field.name])
      .map(field => field.label);

    if (missingFields.length > 0) {
      setError(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('isPublic', String(isPublic));
    formData.append('tags', JSON.stringify(tags));
    formData.append('metadata', JSON.stringify(metadata));

    try {
      await axios.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Document uploaded successfully!');
      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      setIsPublic(false);
      setTags([]);
      setMetadata({});
    } catch (error) {
      setError('Error uploading document. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
  
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
    <BreadcrumbsComponent />
      <Typography variant="h5" gutterBottom>
      
        Upload Document
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          component="label"
          variant="contained"
          startIcon={<UploadIcon />}
          sx={{ mb: 2 }}
        >
          Select File
          <VisuallyHiddenInput type="file" onChange={handleFileChange} />
        </Button>

        {file && (
          <Typography variant="body2" color="text.secondary">
            Selected file: {file.name}
          </Typography>
        )}

        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={3}
        />

        <Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              label="Add Tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              size="small"
            />
            <Button onClick={handleAddTag} variant="outlined">
              Add
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleRemoveTag(tag)}
              />
            ))}
          </Box>
        </Box>

        {metadataFields.map((field) => (
          <FormControl key={field._id}>
            <InputLabel>{field.label}</InputLabel>
            {field.type === 'select' ? (
              <Select
                value={metadata[field.name] || ''}
                label={field.label}
                onChange={(e) => handleMetadataChange(field.name, e.target.value)}
                required={field.required}
              >
                {field.options?.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            ) : field.type === 'boolean' ? (
              <FormControlLabel
                control={
                  <Switch
                    checked={metadata[field.name] === 'true'}
                    onChange={(e) =>
                      handleMetadataChange(field.name, String(e.target.checked))
                    }
                  />
                }
                label={field.label}
              />
            ) : (
              <TextField
                type={field.type}
                value={metadata[field.name] || ''}
                onChange={(e) => handleMetadataChange(field.name, e.target.value)}
                required={field.required}
                label={field.label}
              />
            )}
          </FormControl>
        ))}

        <FormControlLabel
          control={
            <Switch
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
          }
          label="Make document public"
        />

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Upload Document'}
        </Button>
      </Box>
    </Paper>
    </>
  );
}