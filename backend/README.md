# Document Storage Backend

A Node.js/Express backend service for the Document Storage application.

## Prerequisites

- Node.js (v16 or higher)
- Docker Desktop
- MongoDB (via Docker)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   Create a `.env` file with the following variables:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/document-storage
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_bucket_name
```

3. Start MongoDB using Docker:
```bash
docker run -d -p 27017:27017 --name document-storage-mongo mongo:latest
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/users` - Get all users (admin only)
- `GET /api/documents` - Get user documents
- `POST /api/documents` - Upload new document
- `DELETE /api/documents/:id` - Delete document

## Technologies Used

- Node.js
- Express
- TypeScript
- MongoDB
- AWS S3 for document storage
- JWT for authentication
