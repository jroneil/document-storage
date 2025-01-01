import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes'; // Correct import path
import documentRoutes from './routes/document.routes';
import userRoutes from './routes/user.routes';
import metadataRoutes from './routes/metadata.routes';
import listEndpoints from 'express-list-endpoints';

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
function listRoutes(app: express.Application) {
  return app._router.stack
    .filter((r: any) => r.route)
    .map((r: any) => {
      return {
        path: r.route.path,
        methods: Object.keys(r.route.methods).join(', ').toUpperCase(),
      };
    });
}
const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('Endpoints:');
      console.table(listEndpoints(app));
  });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

start();