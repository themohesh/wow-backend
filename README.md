# Job Match Platform - Backend

A Node.js/Express backend for a job matching platform using AI-powered matching between candidates and job listings.

## Features

- Authentication (JWT-based) for candidates and employers
- Profile management for candidates and employers
- Resume upload and processing for candidates
- Job posting and management for employers
- AI-powered matching using vector embeddings
- Recommendations for both candidates and employers

## Tech Stack

- Node.js with TypeScript
- Express.js for the API
- MySQL for data storage
- OpenAI Embeddings API for semantic matching
- JWT for authentication
- Multer for file uploads

## Getting Started

### Prerequisites

- Node.js (v14+)
- MySQL (v8+)
- OpenAI API key (for embeddings)

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/job-match-backend.git
cd job-match-backend
```

## Install dependencies

npm install

## Set up environment variables

cp .env.example .env

----->

# Server Configuration

PORT=8000
NODE_ENV=development

# JWT Configuration

JWT_SECRET=mahesh
JWT_EXPIRES_IN=24h

# Database Configuration

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=jobs
DB_PORT=3306

# OpenAI API Configuration (for embeddings)

OPENAI_API_KEY=your_openai_api_key_here

# Upload Directory

UPLOAD_DIR=uploads/

-------------->

## For development:

npm run dev

## API Endpoints

## Authentication

POST /api/auth/register - Register a new user
POST /api/auth/login - Login user
GET /api/auth/me - Get current user info

## Candidate

POST /api/candidate/profile - Create candidate profile
PUT /api/candidate/profile - Update candidate profile
GET /api/candidate/profile - Get candidate profile
POST /api/candidate/resume - Upload resume
GET /api/candidate/matches - Get matching jobs

## Employer

POST /api/employer/profile - Create employer profile
PUT /api/employer/profile - Update employer profile
GET /api/employer/profile - Get employer profile
GET /api/employer/jobs - Get employer jobs

## Jobs

GET /api/jobs - Get all jobs
GET /api/jobs/:id - Get job by ID
POST /api/jobs - Create job (employer only)
PUT /api/jobs/:id - Update job (employer only)
DELETE /api/jobs/:id - Delete job (employer only)

## Matching

GET /api/matching/jobs - Get matching jobs (candidate only)
POST /api/matching/jobs/:jobId/apply - Apply to job (candidate only)
GET /api/matching/jobs/:jobId/candidates - Get matching candidates (employer only)
POST /api/matching/jobs/:jobId/candidates/:candidateId/interest - Show interest in candidate (employer only)

## Database Schema

The database consists of the following tables:

users - Stores user credentials and type (candidate/employer)
candidate_profiles - Stores candidate profiles with skills, experience, etc.
employer_profiles - Stores employer profiles with company details
job_listings - Stores job listings posted by employers
matches - Stores match data between candidates and jobs
