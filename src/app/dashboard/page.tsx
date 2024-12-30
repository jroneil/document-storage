'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
} from '@mui/material';
import axios from 'axios';

interface Document {
  _id: string;
  title: string;
  description: string;
  fileType: string;
  fileSize: number;
  isPublic: boolean;
  tags: string[];
}

export default function PublicDashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get('/api/documents', {
          params: { isPublic: true, page: 1, limit: 10 }, // Fetch public documents with pagination
        });
        setDocuments(response.data.data.documents);
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };

    fetchDocuments();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Public Documents
      </Typography>
      <Grid container spacing={2}>
        {documents.map((document) => (
          <Grid item xs={12} sm={6} md={4} key={document._id}>
            <Card>
              <CardContent>
                <Typography variant="h5">{document.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {document.description}
                </Typography>
                <Typography variant="body2">
                  Type: {document.fileType} | Size: {document.fileSize} bytes
                </Typography>
                <Typography variant="body2">
                  Tags: {document.tags.join(', ')}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" href={`/documents/${document._id}`} target="_blank">
                  View Document
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}