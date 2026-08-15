# CareerOS

CareerOS is a job-search workbench built around one starting point: your resume. Upload a PDF or DOCX, let CareerOS extract an evidence-based career profile, search live openings, inspect why a role fits, and carry a selected job into application and interview preparation without uploading the resume again.

The product is intentionally built around concrete tasks rather than generic AI marketing. It does not invent job listings, experience, metrics, usage counts, ratings, certifications, or enterprise claims.

## Core flow

1. **Upload a resume** — CareerOS extracts readable text from PDF or DOCX files.
2. **Build a career profile** — the backend identifies realistic target roles, evidenced skills, seniority, location, and defensible experience signals.
3. **Find live jobs** — CareerOS can search configured Adzuna, Greenhouse, and Lever sources.
4. **Explain the match** — job cards show recognized requirements already evidenced in the resume and requirements that still need evidence. The discovery feed does not manufacture an AI percentage when no real comparison exists.
5. **Prepare an application** — selecting a job reuses the stored resume, creates a role-specific analysis job, and produces revision and interview guidance.

Manual job-description paste remains available for users who already have a specific role, but it is no longer the default workflow.

## What it does

- **Resume-to-job discovery** — upload a resume and move directly into relevant live openings when a job source is configured.
- **Career profile extraction** — derive searchable target roles and skills from resume evidence without adding unsupported claims.
- **Evidence-backed matching** — show matched skills and missing/unclear evidence rather than padding the UI with decorative scores.
- **Role comparison** — compare the same stored resume with a selected job and calculate role-specific signals.
- **ATS review** — inspect parsing, structure, and role-specific missing terms when a target role exists.
- **Revision guidance** — review strengths, weak evidence, suggested changes, and before/after bullet structures.
- **Interview practice** — answer a short question set by voice or text and review response structure and technical depth.
- **Revision history** — keep analysis checkpoints in browser storage and compare previous runs.
- **PDF export** — export a completed backend report when a feedback ID is available.

## Live job sources

CareerOS does not fall back to fabricated listings. At least one live provider must be configured on the backend for the job-discovery feed.

Supported provider configuration:

- **Adzuna** — cross-company search using `ADZUNA_APP_ID` and `ADZUNA_APP_KEY`.
- **Greenhouse** — public published-job boards configured through `GREENHOUSE_JOB_BOARDS`.
- **Lever** — public published-posting sites configured through `LEVER_JOB_SITES`.

Greenhouse and Lever values use the format `Display Company|board-token` and can be comma-separated. See `Backend/.env.example` for the complete environment template.

## Architecture

CareerOS uses a small event-driven application stack:

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, Socket.IO client.
- **API:** Node.js and Express.
- **Background work:** BullMQ backed by Redis.
- **Database:** PostgreSQL with pgvector for stored vector data and role similarity work.
- **Object storage:** MinIO for uploaded resume files.
- **Live status:** Socket.IO job updates with a polling fallback in the application workspace.
- **Document parsing:** `pdf-parse` for PDFs and Mammoth for DOCX documents.
- **Model-assisted analysis:** Gemini JSON generation plus 768-dimensional embeddings, with model names configurable through environment variables.
- **Job discovery:** provider adapters for Adzuna, Greenhouse, and Lever, followed by deterministic evidence-based ranking.

The browser-side interview page uses Web Speech APIs when the browser exposes them; typed answers remain available when speech recognition is not supported.

## Repository layout

```text
.
├── src/                  # React application
├── public/               # Static assets
├── Backend/              # Express API, worker, Prisma schema
├── docker-compose.yml    # PostgreSQL, Redis, MinIO, API, worker, frontend
├── Dockerfile            # Frontend production image
└── .github/workflows/    # CI configuration
```

## Frontend development

Requirements: Node.js and npm.

```sh
git clone https://github.com/Tahir-CS/CAREER-OS-.git
cd CAREER-OS-
npm ci
npm run dev
```

The frontend uses `http://localhost:3001/api` by default. To point it elsewhere, copy the example environment file and change `VITE_API_URL`:

```sh
cp .env.example .env
```

Production build:

```sh
npm run build
```

## Backend and local infrastructure

The local stack is defined in `docker-compose.yml` and includes PostgreSQL/pgvector, Redis, MinIO, the Express API, a BullMQ worker, and the frontend.

For backend-only development:

```sh
cd Backend
cp .env.example .env
npm ci
npx prisma generate
npm start
```

Set `GEMINI_API_KEY` before running resume analysis. To enable `/jobs`, also configure at least one live job provider in `Backend/.env`.

To run the complete local stack:

```sh
docker compose up --build
```

### Prisma compatibility

The backend is intentionally pinned to Prisma `6.19.0`. Its current schema and runtime use the Prisma 6 `prisma-client-js` configuration and construct `PrismaClient` without a driver adapter. Moving to Prisma 7 should therefore be handled as an explicit migration rather than an automatic dependency bump.

CI verifies the frontend production build, backend dependency install, Prisma client generation, resume parser imports, an API startup smoke test against Redis, and the Docker Compose build.

## Useful routes

- `/` — product overview
- `/app` — resume upload and role-specific application workspace
- `/jobs` — live resume-based job matches for a completed analysis
- `/keywords` — ATS keyword comparison
- `/interview` — interview practice
- `/history` — saved local reports
- `/settings` — career profile preferences
- `/about` — architecture and design principles
- `/support` — troubleshooting notes

## Data and claims

CareerOS does not present fabricated usage counts, ratings, pricing tiers, compliance certifications, job listings, or enterprise guarantees. Product copy should describe behavior that exists in the repository or can be verified from the running application.

Saved revision history and preferences are browser-local unless a backend feature explicitly persists them elsewhere. Resume files and analysis jobs are persisted by the backend. Do not include private resume content in public bug reports.

## Contributing

1. Create a branch from `main`.
2. Make a focused change.
3. Run the relevant build and test checks.
4. Open a pull request that explains the user-facing effect and any known limitations.

For bugs, include the page, exact error, browser/OS, backend state, and a reproducible sequence without private resume data.

## License

See the repository license file for the project’s licensing terms.
