# CareerOS

CareerOS is a resume and job-application workbench. It puts a resume and a target role in the same workflow so you can inspect gaps, revise the document, and practise the interview questions that follow from those gaps.

The project is intentionally built around concrete tasks rather than generic AI marketing: upload a document, compare it with a role, review ATS signals, make revisions, and keep previous runs as checkpoints.

## What it does

- **Resume workspace** — upload a PDF or DOCX resume and optionally add a target job description.
- **Role comparison** — turn the resume/job-description pair into a structured report with overall, ATS, and role-match signals.
- **ATS keyword scan** — separate terms already present in the resume from terms that are missing or weakly represented.
- **Revision guidance** — review strengths, weak evidence, suggested changes, and before/after bullet structures.
- **Interview practice** — answer a short question set by voice or text and review response structure and technical depth.
- **Revision history** — keep analysis checkpoints in browser storage and compare previous runs.
- **PDF export** — export a completed backend report when a feedback ID is available.

## Architecture

CareerOS uses a small event-driven application stack:

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, Socket.IO client.
- **API:** Node.js and Express.
- **Background work:** BullMQ backed by Redis.
- **Database:** PostgreSQL with pgvector for stored vector data and similarity work.
- **Object storage:** MinIO for uploaded resume files.
- **Live status:** Socket.IO job updates from the backend to the workspace.
- **Document analysis:** Gemini is used by the backend where model-assisted analysis is required.

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

Set the required model key before bringing up the stack:

```sh
export GEMINI_API_KEY=your_key_here
```

Then build and start the services:

```sh
docker compose up --build
```

For backend-only development, copy the documented environment template first:

```sh
cd Backend
cp .env.example .env
npm ci
npx prisma generate
npm start
```

### Prisma compatibility

The backend is intentionally pinned to Prisma `6.19.0`. Its current schema and runtime use the Prisma 6 `prisma-client-js` configuration and construct `PrismaClient` without a driver adapter. Moving to Prisma 7 should therefore be handled as an explicit migration rather than an automatic dependency bump.

CI verifies the frontend production build, backend dependency install, Prisma client generation, an API startup smoke test against Redis, and the Docker Compose build.

## Useful routes

- `/` — product overview
- `/app` — resume workspace
- `/keywords` — ATS keyword comparison
- `/interview` — interview practice
- `/history` — saved local reports
- `/settings` — career profile preferences
- `/about` — architecture and design principles
- `/support` — troubleshooting notes

## Data and claims

CareerOS does not present fabricated usage counts, ratings, pricing tiers, compliance certifications, or enterprise guarantees. Product copy should describe behavior that exists in the repository or can be verified from the running application.

Saved revision history and preferences are browser-local unless a backend feature explicitly persists them elsewhere. Do not include private resume content in public bug reports.

## Contributing

1. Create a branch from `main`.
2. Make a focused change.
3. Run the relevant build/lint checks.
4. Open a pull request that explains the user-facing effect and any known limitations.

For bugs, include the page, exact error, browser/OS, backend state, and a reproducible sequence without private resume data.

## License

See the repository license file for the project’s licensing terms.
