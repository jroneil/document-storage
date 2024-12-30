import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import documentRoutes from './routes/document.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import metadataRoutes from './routes/metadata.routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/documents', documentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/metadata-fields', metadataRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

start();