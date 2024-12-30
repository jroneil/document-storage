# Document Storage Application

A full-stack document storage and management system built with Next.js 13 and Node.js.

## Project Structure

```
document-storage/
├── backend/           # Express backend API
└── src/              # Next.js frontend
```

## Features

- User authentication and authorization
- Document upload and management
- Admin dashboard for user management
- AWS S3 integration for secure document storage
- Responsive design

## Prerequisites

- Node.js (v16 or higher)
- Docker Desktop
- MongoDB (via Docker)
- AWS Account (for S3 storage)

## Quick Start

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   Create a `.env` file with:
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

4. Start MongoDB:
```bash
docker run -d -p 27017:27017 --name document-storage-mongo mongo:latest
```

5. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. From the project root:
```bash
npm install
```

2. Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

3. Start the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Technologies Used

### Frontend
- Next.js 13
- TypeScript
- Tailwind CSS
- React Query
- NextAuth.js

### Backend
- Node.js
- Express
- TypeScript
- MongoDB
- AWS S3
- JWT Authentication
Email: admin@example.com
Password: admin123
