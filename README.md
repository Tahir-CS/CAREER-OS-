# CareerOS (AI Resume Analyzer)

## Overview
CareerOS is an enterprise-grade, event-driven web application that leverages AI to analyze resumes, provide feedback, and perform Semantic Job Matching (RAG). It features a robust, distributed backend for file uploads and AI analysis, and a stunning modern frontend built with React, TypeScript, and Tailwind CSS.

## Features
- **Semantic Job Matching (RAG)**: Uses `pgvector` and `text-embedding-004` to calculate the mathematical cosine similarity between a candidate's resume and a target Job Description.
- **Dual-Agent AI Pipeline**: Two Gemini AI agents work in sequence (Agent 1: ATS Parser, Agent 2: Synthesis & Rewrite).
- **Real-Time UI**: Instant WebSocket (`socket.io`) updates stream processing status to the frontend.
- **Cost-Saving Cache**: Redis MD5 hashing prevents redundant LLM API calls.
- **Admin Observability**: BullMQ Queue monitoring dashboard powered by `@bull-board/express`.
- **Premium Visualization**: Radar charts and Circular Gauges powered by `recharts`.

## Technologies Used
- **Frontend**: Vite, React, TypeScript, Tailwind CSS, Recharts, Socket.io-client.
- **Backend API**: Node.js, Express, Prisma ORM, BullMQ, Socket.io.
- **Infrastructure (Docker Compose)**:
  - **PostgreSQL (`pgvector`)**: Relational data and AI Embeddings.
  - **Redis**: Rate-limiting, caching, and background job queues.
  - **MinIO**: S3-compatible local storage for PDF/DOCX resumes.
- **DevOps**: GitHub Actions (CI/CD), Sentry.io (Error Tracking), Docker.

## Local Installation (Docker)

To run the entire production-like infrastructure locally, all you need is Docker!

### Steps
```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd Ai-RESUME-ANALYZER

# Step 3: Start the infrastructure (Postgres, Redis, MinIO)
docker-compose up -d

# Step 4: Run Prisma migrations
cd Backend
npx prisma db push

# Step 5: Add your Gemini API Key in Backend/.env
GEMINI_API_KEY=your_google_ai_key

# Step 6: Start the Backend API & Background Worker
npm start
node src/worker.js

# Step 7: Start the Frontend
cd ..
npm run dev
```

## Admin Dashboard
To monitor the background AI workers, navigate to `http://localhost:3001/admin/queues` once the backend is running.

## Contributing
Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch-name`).
3. Make your changes and commit them (`git commit -m "Add feature"`).
4. Push to the branch (`git push origin feature-branch-name`).
5. Open a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Contact
For questions or support, please contact [Tahir](mailto:mtahirbutt1005@gmail.com).
