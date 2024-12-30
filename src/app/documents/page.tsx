'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface Document {
  _id: string;
  title: string;
  description: string;
  fileType: string;
  fileSize: number;
  tags: string[];
  metadata: Record<string, string>;
  uploadedBy: {
    name: string;
  };
  createdAt: string;
}

interface MetadataField {
  _id: string;
  name: string;
  label: string;
  type: string;
}

export default function PublicDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [metadataFields, setMetadataFields] = useState<MetadataField[]>([]);

  useEffect(() => {
    fetchDocuments();
    fetchMetadataFields();
  }, [search]);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('/api/documents/public', {
        params: { search },
      });
      setDocuments(response.data.data.documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchMetadataFields = async () => {
    try {
      const response = await axios.get('/api/metadata-fields');
      setMetadataFields(response.data.data);
    } catch (error) {
      console.error('Error fetching metadata fields:', error);
    }
  };

  const handleView = async (document: Document) => {
    try {
      const response = await axios.get(`/api/documents/${document._id}`);
      setSelectedDocument(response.data.data);
      setViewDialogOpen(true);
    } catch (error) {
      console.error('Error fetching document details:', error);
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const response = await axios.get(`/api/documents/${document._id}`);
      window.open(response.data.data.downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Public Documents
        </Typography>
        <TextField
          fullWidth
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {documents.map((document) => (
          <Grid item xs={12} sm={6} md={4} key={document._id}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <DocumentIcon sx={{ mr: 1 }} />
                  <Typography variant="h6" noWrap>
                    {document.title}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {document.description}
                </Typography>
                <Box sx={{ mb: 1 }}>
                  {document.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(document.fileSize)} • {document.fileType.toUpperCase()}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => handleView(document)}>
                  View Details
                </Button>
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownload(document)}
                >
                  Download
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedDocument && (
          <>
            <DialogTitle>{selectedDocument.title}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {selectedDocument.description}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Metadata</Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                    <Grid container spacing={2}>
                      {metadataFields.map((field) => (
                        <Grid item xs={6} key={field._id}>
                          <Typography variant="caption" color="text.secondary">
                            {field.label}
                          </Typography>
                          <Typography>
                            {selectedDocument.metadata[field.name] || 'N/A'}
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Tags</Typography>
                  <Box sx={{ mt: 1 }}>
                    {selectedDocument.tags.map((tag) => (
                      <Chip key={tag} label={tag} sx={{ mr: 0.5, mb: 0.5 }} />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleDownload(selectedDocument)}>
                Download
              </Button>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}