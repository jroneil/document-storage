'use client';

import { useState, useEffect } from 'react';
import {
  Box,
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
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

interface Document {
  _id: string;
  title: string;
  description: string;
  fileType: string;
  fileSize: number;
  isPublic: boolean;
  tags: string[];
  metadata: Record<string, string>;
  uploadedBy: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface MetadataField {
  _id: string;
  name: string;
  label: string;
  type: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [metadataFields, setMetadataFields] = useState<MetadataField[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchDocuments();
    fetchMetadataFields();
  }, [page, rowsPerPage, search]);

  const fetchDocuments = async () => {
    console.log("I am here")
    try {
      const response = await axios.get('/api/documents', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search,
        },
      });
      setDocuments(response.data.data.documents);
      setTotal(response.data.data.pagination.total);
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

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await axios.delete(`/api/documents/${id}`);
        fetchDocuments();
      } catch (error) {
        console.error('Error deleting document:', error);
      }
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
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
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
          size="small"
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell>Uploaded By</TableCell>
              <TableCell>Public</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((document) => (
              <TableRow key={document._id}>
                <TableCell>{document.title}</TableCell>
                <TableCell>{document.fileType.toUpperCase()}</TableCell>
                <TableCell>{formatFileSize(document.fileSize)}</TableCell>
                <TableCell>
                  {document.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />
                  ))}
                </TableCell>
                <TableCell>{document.uploadedBy.name}</TableCell>
                <TableCell>
                  <Chip
                    label={document.isPublic ? 'Public' : 'Private'}
                    color={document.isPublic ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleView(document)} size="small">
                    <ViewIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDownload(document)} size="small">
                    <DownloadIcon />
                  </IconButton>
                  {(user?.role === 'admin' ||
                    document.uploadedBy.email === user?.email) && (
                    <IconButton
                      onClick={() => handleDelete(document._id)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

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
    </Box>
  );
}