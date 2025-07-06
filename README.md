#  AIQ Power Plant Visualizer

A full-stack web application for visualizing power plant data by state, with authentication, file upload to S3, and real-time data sync.

---

## 🛠 Tech Stack

* **Frontend**: Next.js (App Router) + Tailwind CSS
* **Backend**: NestJS (Node.js + TypeScript)
* **Authentication**: JWT (Bearer Token)
* **Storage**: AWS S3 (for file uploads)

---

## 🔧 Setup Instructions

### 1. Clone the repository

```bash
https://github.com/ZainabuGit/aiq-takehometest
cd aiq-takehometest
```

### 2. Install Dependencies

#### Frontend

```bash
cd frontendtw
npm install
```

#### Backend

```bash
cd backend
npm install
```

---

## Environment Variables

### Backend `.env` file

```
PORT=8000
JWT_SECRET=secretKey

AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=your-region
AWS_BUCKET_NAME=your-s3-bucket
```

---

## Run the App

###  Backend

```bash
cd backend
npm run start
```

Open Swagger: [http://localhost:8000/api](http://localhost:8000/api)

### Frontend

```bash
cd frontend
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## Authentication

### Login

* Default credentials:

```json
{
  "username": "admin",
  "password": "password123"
}
```

* Use `/auth/login` to receive a JWT token.
* Frontend stores the token and uses it for all secure routes.

---

## Upload CSV to S3

* Navigate to home page
* Upload a `.csv` file via "Upload Power Plant Data" section
* File is sent to: `POST /upload/uploadtoS3`
* Backend handles upload to AWS S3

---

## Sync Data

* After uploading, click "🔄 Sync from S3"
* This will trigger backend to process uploaded file into your memory

---

## Visualizer

* Choose a state (e.g., TX, CA)
* Set number of top plants
* Click **Fetch Data**
* Table updates with top N plants based on Net Generation (MWh)

---

## Features

* Secure JWT-based login
* Protected API endpoints
* Upload CSV to AWS S3
* Responsive & clean UI with Tailwind
* Swagger docs for API testing

---

## Testing

Use Swagger UI to test:

* `POST /auth/login`
* `POST /upload/uploadtoS3`
* `GET /powerplants?state=TX&top=5`

---

## Folder Structure

```
frontend/
  ├── src/app/
  └── Tailwind + React UI

backend/
  ├── auth/
  ├── upload/
  ├── powerplants/
```

---

## Future Enhancements

* Register endpoint
* Public URLs for uploaded files
* Charts/visuals (Recharts/D3)
* Role-based access control

---

## Author

Developed as part of an AIQ Architect role technical assignment.

---


