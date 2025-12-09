# Quick Start Guide

## Prerequisites

- Node.js 20+
- Docker & Docker Compose

## Setup Steps

### 1. Start MySQL Database

```powershell
cd server
docker-compose up -d
```

Wait for MySQL to be ready (about 20-30 seconds).

### 2. Install Backend Dependencies

```powershell
# In server directory
npm install
```

### 3. Configure Environment (Optional)

If you want to use UploadThing for file uploads:

```powershell
# In server directory
cp .env.example .env
# Edit .env and add your UPLOADTHING_TOKEN
```

Get your token from https://uploadthing.com

### 4. Setup Database Schema

```powershell
# In server directory
npm run db:push
```

### 5. Start Backend Server

```powershell
# In server directory
npm run dev
```

Backend will run on http://localhost:3001

### 6. Install Frontend Dependencies

```powershell
# In root directory (open a new terminal)
cd ..
npm install
```

### 7. Start Frontend

```powershell
# In root directory
npm run dev
```

Frontend will run on http://localhost:3000

## Usage

1. Open http://localhost:3000 in your browser
2. Edit the JSON Schema in the left panel
3. Click "Format & Save" to update the form
4. Fill out the form in the middle panel
5. See bound data in the right panel
6. Click "Submit" to submit the form
7. Click "View Submissions" to see all submissions

## Custom Renderers

The application includes three custom renderers:

- **Star Rating**: Fields ending with `rating` (e.g., `serviceRating`)
- **Age Slider**: Fields ending with `age` (e.g., `age`)
- **File Upload**: Fields with `format: "data-url"` (e.g., `profilePicture`)

## Stopping the Application

```powershell
# Stop frontend and backend (Ctrl+C in each terminal)

# Stop MySQL container
cd server
docker-compose down
```

## Troubleshooting

### MySQL Connection Issues

If you get database connection errors:

1. Wait a bit longer for MySQL to start
2. Check if container is running: `docker ps`
3. Restart container: `docker-compose restart`

### Port Already in Use

If ports 3000 or 3001 are already in use:

- Frontend: Edit `vite.config.ts` and change the port
- Backend: Edit `server/src/index.ts` and change the port

### TypeScript Errors

TypeScript errors in the editor are expected until dependencies are installed.
Run `npm install` in both root and server directories.
