# AI Resume Analyzer - Complete Project Map

**Generated:** April 12, 2026  
**Project:** Ai-RESUME-ANALYZER  
**Repository:** Tahir-CS/Ai-RESUME-ANALYZER (main branch)

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Structure](#architecture--structure)
3. [Frontend Structure](#frontend-structure)
4. [Backend Structure](#backend-structure)
5. [All Functions & Classes](#all-functions--classes)
6. [API Endpoints](#api-endpoints)
7. [Dependencies](#dependencies)
8. [Unused/Disabled Features](#unuseddisabled-features)
9. [Code Quality Issues](#code-quality-issues)
10. [Recommendations](#recommendations)

---

## 🎯 Project Overview

**Purpose:** AI-powered resume analyzer that uses Google Gemini AI to analyze resumes and provide feedback with scores and improvement suggestions.

**Tech Stack:**
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Shadcn UI
- **Backend:** Express.js + Node.js (ES Modules)
- **AI Engine:** Google Gemini 1.5 Flash
- **File Processing:** Mammoth (DOCX), pdf-parse (disabled)
- **PDF Generation:** Puppeteer

**Key Features:**
1. Resume file upload (DOCX, PDF support)
2. AI-powered resume analysis
3. Resume score calculation (0-100)
4. ATS compatibility analysis
5. Bullet point improvement suggestions
6. PDF feedback report generation
7. Rate limiting on backend
8. CORS-enabled API

---

## 🏗️ Architecture & Structure

```
Ai-RESUME-ANALYZER/
├── Frontend (Vite + React)
│   └── src/
│       ├── components/          (React components)
│       ├── pages/              (Page components)
│       ├── hooks/              (Custom hooks)
│       ├── lib/                (Utilities)
│       └── assets/             (Static assets)
│
├── Backend (Express.js)
│   └── Backend/src/
│       ├── controllers/        (Route handlers)
│       ├── routes/            (API routes)
│       ├── middleware/        (Multer file upload)
│       └── utils/             (Helper functions)
│
└── Configuration Files
    ├── package.json (Frontend)
    ├── Backend/package.json (Backend)
    └── Environment configs (Vite, TypeScript, Tailwind, etc.)
```

---

## 🎨 Frontend Structure

### **Frontend Root** (`src/`)

#### **Components** (`src/components/`)

1. **Header.tsx**
   - **Location:** `src/components/Header.tsx`
   - **Type:** Functional Component
   - **Purpose:** Top navigation bar with app branding
   - **Functions:**
     - `Header()` - Returns navigation JSX with logo and sign-in button
   - **Dependencies:** lucide-react, shadcn Button component
   - **Used By:** Index.tsx

2. **ResumeUploader.tsx**
   - **Location:** `src/components/ResumeUploader.tsx`
   - **Type:** Functional Component with Drag & Drop
   - **Purpose:** File upload interface for resumes
   - **Functions:**
     - `ResumeUploader()` - Main component
     - `handleFileChange()` - Inline file input handler
     - `handleDrop()` - Drag-drop handler
     - `handleDragOver()` - Drag visual feedback
     - `handleDragLeave()` - Reset drag state
   - **Interface:** `ResumeUploaderProps { onAnalyze: (file: File) => void }`
   - **Features:**
     - Drag & drop support
     - File browser support
     - File validation message
     - Orange warning state during drag
   - **Accepted Files:** `.pdf, .doc, .docx, .txt`
   - **Used By:** Index.tsx

3. **AnalysisDisplay.tsx**
   - **Location:** `src/components/AnalysisDisplay.tsx`
   - **Type:** Functional Component
   - **Purpose:** Display detailed resume analysis results
   - **Components:**
     - `ScoreGauge()` - Circular progress score visualization
     - `AnalysisDisplay()` - Main display component
   - **Interfaces:**
     ```typescript
     ScoreGaugeProps { score: number }
     AnalysisDisplayProps {
       analysis: Analysis
       onReset: () => void
       onExport: () => void
     }
     Analysis {
       score: number
       summary: string
       strengths: string[]
       weaknesses: string[]
       improvementSuggestions: string[]
       bulletPointRewrites: BulletRewrite[]
       atsAnalysis: ATSAnalysis
     }
     ```
   - **Display Sections:**
     1. Resume Score (gauge)
     2. ATS Score (gauge)
     3. Strengths (list)
     4. Areas for Improvement (list)
     5. Improvement Suggestions (list)
     6. Bullet Point Rewrites (before/after/why)
     7. ATS Issues (if any)
     8. Action buttons (Reset, Export)
   - **Used By:** Index.tsx

4. **UI Components** (`src/components/ui/`)
   - Shadcn/ui component library (pre-built components)
   - Includes: button, card, accordion, alert, dialog, etc.

#### **Pages** (`src/pages/`)

1. **Index.tsx** (Main Page)
   - **Location:** `src/pages/Index.tsx`
   - **Type:** Main page component
   - **Purpose:** Dashboard/home page combining upload and analysis display
   - **State Variables:**
     - `analysis` - Resume analysis data
     - `feedbackId` - Server feedback ID for download
     - `isLoading` - Loading state
   - **Functions:**
     - `Index()` - Main component
     - `handleAnalyze(file: File)` - Calls `/api/upload-resume` endpoint
     - `handleReset()` - Clears analysis state
     - `handleExport()` - Calls `/api/feedback/:id/download` to get PDF
   - **Mock Data:** `mockAnalysis` object (for testing)
   - **Features:**
     - Form validation
     - Error handling with toast notifications
     - Loading spinner during analysis
     - Conditional rendering based on state
   - **API Calls:**
     - POST `http://localhost:3001/api/upload-resume` (with FormData)
     - GET `http://localhost:3001/api/feedback/:id/download`

2. **NotFound.tsx**
   - **Location:** `src/pages/NotFound.tsx`
   - **Status:** Exists but not implemented/used

#### **Hooks** (`src/hooks/`)
- `use-mobile.tsx` - Mobile device detection hook
- `use-toast.ts` - Toast notification hook (from Shadcn)

#### **Utilities** (`src/lib/`)
- `utils.ts` - General utility functions (Shadcn helper)

#### **Root Files**
- `App.jsx` - **Status: OUTDATED** (Vite template, not used)
- `App.tsx` - **MISSING** (Should exist but not found)
- `main.tsx` - Sets up React root with Index page
- `index.css` - Global styles
- `vite-env.d.ts` - Vite type definitions

---

## 🖥️ Backend Structure

### **Backend Root** (`Backend/src/`)

#### **Controllers** (`Backend/src/controllers/`)

**1. resume.controller.js**
- **Location:** `Backend/src/controllers/resume.controller.js`
- **Type:** Express controller with 3 route handlers
- **Dependencies:**
  - `@google/generative-ai` - Gemini AI
  - `fileExtractor.js` - Text extraction
  - `promptBuilder.js` - Prompt construction
  - `pdfGenerator.js` - PDF conversion
  - dotenv - Environment variables

**Functions:**

1. **`analyzeResume(req, res)`**
   - **Type:** Async route handler
   - **HTTP Method:** POST
   - **Endpoint:** `/api/upload-resume`
   - **Input:**
     - `req.file` - Uploaded file (multer middleware)
     - `req.body.jobDescription` - Optional job description
   - **Process:**
     1. Validates file exists
     2. Determines file type (PDF or DOCX)
     3. Calls `extractTextFromPDF()` or `extractTextFromDOCX()`
     4. Builds prompt using `buildAnalysisPrompt()`
     5. Sends to Gemini API (`model.generateContent()`)
     6. Parses JSON response
     7. Stores feedback in `feedbackStore`
   - **Output:** JSON with `{ success: true, feedbackId, analysis }`
   - **Error Handling:** Try-catch with 500 error response
   - **Status:** ✅ Active

2. **`getFeedback(req, res)`**
   - **Type:** Async route handler
   - **HTTP Method:** GET
   - **Endpoint:** `/api/feedback/:id`
   - **Input:** `req.params.id` - Feedback ID
   - **Process:**
     1. Retrieves feedback from `feedbackStore` Map
     2. Returns analysis object if found
   - **Output:** JSON with `{ success: true, feedback }`
   - **Error Handling:** Returns 404 if not found
   - **Status:** ✅ Active

3. **`downloadFeedback(req, res)`**
   - **Type:** Async route handler
   - **HTTP Method:** GET
   - **Endpoint:** `/api/feedback/:id/download`
   - **Input:** `req.params.id` - Feedback ID
   - **Process:**
     1. Retrieves feedback from `feedbackStore`
     2. Calls `generatePDFFeedback(feedback)`
     3. Sets response headers for PDF download
     4. Sends PDF buffer to client
   - **Output:** PDF file with analysis report
   - **Error Handling:** Try-catch with error logging
   - **Status:** ✅ Active

**Global State:**
- `genAI` - Gemini API instance
- `model` - Gemini 1.5 Flash model
- `feedbackStore` - In-memory Map storing feedback (⚠️ No persistence)

#### **Routes** (`Backend/src/routes/`)

**resume.routes.js**
- **Location:** `Backend/src/routes/resume.routes.js`
- **Type:** Express router configuration
- **Routes:**
  ```
  POST   /api/upload-resume        → analyzeResume
  GET    /api/feedback/:id          → getFeedback
  GET    /api/feedback/:id/download → downloadFeedback
  ```
- **Middleware:** `upload.single('resume')` on POST route

#### **Middleware** (`Backend/src/middleware/`)

**multer.js**
- **Location:** `Backend/src/middleware/multer.js`
- **Type:** File upload configuration
- **Exports:** `upload` - Configured multer instance
- **Configuration:**
  - **Storage:** Disk storage at `src/uploads/`
  - **Filename:** `{timestamp}-{originalname}`
  - **Accepted Types:** PDF, DOCX
  - **File Size Limit:** 5MB
  - **File Filter:** Validates MIME types
- **Functions:**
  - `storage` object - Disk storage config
  - `fileFilter(req, file, cb)` - MIME type validator
- **Error Handling:** Returns error if type invalid

#### **Utilities** (`Backend/src/utils/`)

**1. fileExtractor.js**
- **Location:** `Backend/src/utils/fileExtractor.js`
- **Type:** Text extraction utility
- **Functions:**

  1. **`extractTextFromPDF(filePath)`**
     - **Status:** ❌ DISABLED (returns empty string)
     - **Original Logic:** Uses pdf-parse library
     - **Issue:** Commented out for unknown reason
     - **Impact:** PDFs cannot be analyzed

  2. **`extractTextFromDOCX(filePath)`**
     - **Status:** ✅ Active
     - **Library:** Mammoth
     - **Process:**
       1. Reads file buffer with `fs.readFile()`
       2. Calls `mammoth.extractRawText({ buffer })`
       3. Returns `result.value` string
     - **Error Handling:** Throw error with message

**2. promptBuilder.js**
- **Location:** `Backend/src/utils/promptBuilder.js`
- **Type:** Prompt construction utility
- **Exports:** 1 function
- **Functions:**

  **`buildAnalysisPrompt(resumeText, jobDescription = '')`**
  - **Type:** Pure function (no side effects)
  - **Input:**
    - `resumeText` - Extracted resume text
    - `jobDescription` - Optional job description (default: empty)
  - **Output:** String with complete prompt for Gemini
  - **Features:**
    - Conditional job description inclusion
    - Sets up JSON response format
    - Requests specific analysis sections:
      1. Key strengths/weaknesses
      2. Content & grammar improvements
      3. ATS compatibility check
      4. Bullet point rewrites (before/after)
      5. Structured JSON output
    - Enforces JSON-only response (no markdown/formatting)
  - **Status:** ✅ Active

**3. pdfGenerator.js**
- **Location:** `Backend/src/utils/pdfGenerator.js`
- **Type:** PDF generation utility
- **Dependencies:** Puppeteer
- **Exports:** 1 function
- **Functions:**

  **`generatePDFFeedback(feedback)`**
  - **Type:** Async function
  - **Input:** `feedback` object with:
    - `analysis` - Analysis data
    - `resumeText` - Resume text
    - `jobDescription` - Job description
    - `timestamp` - Creation timestamp
  - **Process:**
    1. Constructs HTML template from feedback data
    2. Launches Puppeteer browser
    3. Creates new page
    4. Sets HTML content
    5. Generates PDF with margins
    6. Closes browser
    7. Returns PDF buffer
  - **HTML Sections:**
    - Header with timestamp
    - Overall score gauge
    - Key strengths
    - Areas for improvement
    - Improvement suggestions
    - Bullet point rewrites
    - ATS analysis section
  - **Styling:** Inline CSS with professional styling
  - **PDF Format:** Letter size with 20px margins
  - **Error Handling:** Try-catch with error logging
  - **Status:** ✅ Active

#### **Server Entry Point**

**Backend/src/index.js**
- **Location:** `Backend/src/index.js`
- **Type:** Express.js server setup
- **Key Setup:**
  1. **Environment:** Loads `.env` with dotenv
  2. **CORS:** Custom origin checker from `ALLOWED_ORIGINS` env var
     - Defaults: `['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000']`
  3. **Rate Limiting:** 100 requests per 15 minutes per IP
  4. **Body Parsing:** JSON and URL encoded
  5. **Routes:** Uses `resumeRoutes` at `/api` prefix
  6. **Error Handler:** Global error middleware
  7. **Port:** 3001 (default)
- **Features:**
  - Credentialed CORS
  - Development-mode error messages
  - Comprehensive error logging

#### **Utility Scripts**

**checkModels.js**
- **Location:** `Backend/checkModels.js`
- **Type:** Utility script (not production code)
- **Purpose:** Lists available Gemini models
- **Function:** `main()` async function
- **Libraries:** @google/genai, dotenv
- **Usage:** `node checkModels.js`
- **Status:** Debug utility only

---

## 📞 API Endpoints

### **Base URL:** `http://localhost:3001/api`

| Method | Endpoint | Handler | Purpose |
|--------|----------|---------|---------|
| POST | `/upload-resume` | `analyzeResume()` | Upload & analyze resume |
| GET | `/feedback/:id` | `getFeedback()` | Retrieve analysis feedback |
| GET | `/feedback/:id/download` | `downloadFeedback()` | Download PDF report |

### **Endpoint Details**

#### **1. POST /api/upload-resume**
```
Headers: multipart/form-data
Body:
  - resume: File (PDF or DOCX)
  - jobDescription: string (optional)

Response (Success):
{
  "success": true,
  "feedbackId": "1750451332862",
  "analysis": {
    "score": 85,
    "summary": "...",
    "strengths": [...],
    "weaknesses": [...],
    "improvementSuggestions": [...],
    "bulletPointRewrites": [...],
    "atsAnalysis": {
      "score": 75,
      "issues": [...],
      "missingKeywords": [...],
      "formatWarnings": [...]
    }
  }
}

Response (Error):
{
  "success": false,
  "message": "Error message",
  "error": "Optional detailed error"
}

Possible Errors:
- 400: No file uploaded
- 400: Invalid file type (only PDF/DOCX)
- 400: File too large (>5MB)
- 500: Text extraction failed
- 500: Gemini API error
```

#### **2. GET /api/feedback/:id**
```
URL Parameters:
  - id: Feedback ID (from upload response)

Response (Success):
{
  "success": true,
  "feedback": { analysis object }
}

Response (Error):
{
  "success": false,
  "message": "Feedback not found"
}

Possible Errors:
- 404: Feedback ID not found (expired or invalid)
- 500: Internal error
```

#### **3. GET /api/feedback/:id/download**
```
URL Parameters:
  - id: Feedback ID

Response (Success):
[PDF Buffer] with headers:
  - Content-Type: application/pdf
  - Content-Disposition: attachment; filename=resume-feedback-{id}.pdf

Response (Error):
{
  "success": false,
  "message": "Error message"
}

Possible Errors:
- 404: Feedback ID not found
- 500: PDF generation failed (Puppeteer error)
```

---

## 📦 Dependencies

### **Frontend Dependencies** (`package.json`)

**UI & Styling:**
- `@radix-ui/*` - Headless UI components (28 packages)
- `tailwindcss` - Utility CSS framework
- `class-variance-authority` - CSS utility helper
- `clsx` - Class name utility
- `lucide-react` - Icon library
- `cmdk` - Command menu component

**Form & Data:**
- `@hookform/resolvers` - Form validation
- `react-hook-form` - Form management
- `@tanstack/react-query` - Data fetching
- `zod` - Schema validation

**Utilities:**
- `date-fns` - Date manipulation
- `embla-carousel-react` - Carousel component
- `input-otp` - OTP input component
- `jsonrepair` - JSON repair utility
- `recharts` - Charts/graphs library
- `react-textarea-autosize` - Auto-sizing textarea
- `react-resizable-panels` - Resizable layout

**Dev Tools:**
- `vite` - Build tool
- `eslint` - Code linting
- `typescript` - Type safety

### **Backend Dependencies** (`Backend/package.json`)

**Core:**
- `express@^4.18.2` - Web framework
- `node` - JavaScript runtime

**AI:**
- `@google/generative-ai@^0.2.0` - Gemini API (⚠️ Old version)
- `@google/genai@^1.5.1` - Alternative Gemini API

**File Processing:**
- `mammoth@^1.6.0` - DOCX text extraction ✅ Active
- `pdf-parse@^1.1.1` - PDF text extraction ❌ Disabled

**PDF Generation:**
- `puppeteer@^24.10.2` - PDF generation via headless browser

**Middleware & Utilities:**
- `cors@^2.8.5` - Cross-Origin Resource Sharing
- `multer@^2.0.0-rc.4` - File upload handling
- `express-rate-limit@^7.1.5` - Rate limiting
- `dotenv@^16.3.1` - Environment variables
- `uuid@^9.0.1` - Unique ID generation

**Dev Tools:**
- `nodemon@^3.0.2` - Auto-restart during development

---

## ⚠️ Unused/Disabled Features

### **1. PDF Parsing** 🔴 **CRITICAL**
- **File:** `Backend/src/utils/fileExtractor.js`
- **Status:** Disabled (returns empty string)
- **Function:** `extractTextFromPDF()`
- **Reason:** Unknown (commented out)
- **Impact:** PDFs cannot be analyzed despite multer accepting them
- **Code:**
  ```javascript
  export const extractTextFromPDF = async (filePath) => {
    // PDF extraction disabled for now
    return '';
    /*
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdf(dataBuffer);
      return data.text;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
    */
  };
  ```
- **Dependency:** `pdf-parse` is installed but unused

### **2. Legacy Frontend App.jsx** 🟡 **DEAD CODE**
- **File:** `src/App.jsx`
- **Status:** Outdated Vite template (not used)
- **Content:** Default counter demo
- **Impact:** No functional impact
- **Recommendation:** Delete

### **3. NotFound Page** 🟡 **UNUSED**
- **File:** `src/pages/NotFound.tsx`
- **Status:** Created but never referenced
- **Impact:** No routing implemented for 404

### **4. checkModels.js Utility** 🟡 **DEBUG ONLY**
- **File:** `Backend/checkModels.js`
- **Purpose:** List available Gemini models
- **Usage:** Manual CLI script only
- **In-Memory Data Storage** 🔴 **CRITICAL**

### **5. In-Memory Feedback Store** 🔴 **PRODUCTION RISK**
- **Location:** `Backend/src/controllers/resume.controller.js`
- **Storage:** JavaScript Map object: `feedbackStore`
- **Persistence:** ❌ None (lost on server restart)
- **Issue:** 
  - No database integration
  - Data lost between deployments
  - Scalability issue (doesn't scale across multiple instances)
  - Users cannot retrieve feedback after server restart

---

## 🚨 Code Quality Issues

### **Critical Issues** 🔴

1. **PDF Parsing Disabled**
   - Users upload PDFs but receive empty analysis
   - Silently fails (returns empty string without error)
   - **Fix:** Uncomment and test pdf-parse functionality

2. **In-Memory Data Storage**
   - Feedback lost on server restart/deployment
   - Not suitable for production
   - **Fix:** Integrate database (MongoDB, PostgreSQL, etc.)

3. **Outdated Google Generative AI Version**
   - Package: `@google/generative-ai@^0.2.0` (very old)
   - Should be latest (currently 0.12.0+)
   - **Fix:** Update: `npm install @google/generative-ai@latest`

4. **No API Request Validation**
   - `jobDescription` from request body not validated
   - No XSS protection on user inputs
   - **Fix:** Add input sanitization (e.g., xss library)

5. **No Error Typing**
   - `error` variable not explicitly typed
   - Error messages could leak sensitive info
   - **Fix:** Implement proper error types and sanitization

### **High Priority** 🟠

1. **CORS Hard-coded Origins**
   - Comment shows frontend URLs but accessible from anywhere by default
   - **Fix:** Enforce strict ALLOWED_ORIGINS environment variable

2. **No Input Validation for Resume Text**
   - Gemini receives unlimited text
   - Could cause API quota issues
   - **Fix:** Add text length limits (max 50,000 chars recommended)

3. **Duplicate Gemini API Packages**
   - Both `@google/generative-ai` AND `@google/genai` installed
   - Only `@google/generative-ai` is used
   - **Fix:** Remove `@google/genai` from dependencies

4. **Frontend API Hardcoded**
   - Backend URL hardcoded as `http://localhost:3001/api`
   - Won't work in production
   - **Fix:** Use environment variables

### **Medium Priority** 🟡

1. **No Type Safety in Backend**
   - Controllers use plain JavaScript (not TypeScript)
   - Difficult to maintain
   - **Fix:** Convert to TypeScript

2. **Missing Error Boundaries (Frontend)**
   - React components lack error boundary
   - Unhandled errors crash app
   - **Fix:** Add React Error Boundary component

3. **No Loading States Feedback**
   - Long analysis time (waiting for Gemini) with minimal feedback
   - **Fix:** Add progress indicators, estimated time, or streaming

4. **Unused UI Components**
   - Many shadcn UI components imported but not used
   - Increases bundle size
   - **Fix:** Remove unused component imports

---

## 📊 Code Statistics

### **File Breakdown**

| Category | File | LOC | Type | Status |
|----------|------|-----|------|--------|
| **Backend** | index.js | ~50 | Config | ✅ Active |
| | resume.controller.js | ~100 | Main Logic | ✅ Active |
| | resume.routes.js | ~10 | Routes | ✅ Active |
| | multer.js | ~30 | Config | ✅ Active |
| | fileExtractor.js | ~30 | Utility | ⚠️ Partial |
| | promptBuilder.js | ~30 | Utility | ✅ Active |
| | pdfGenerator.js | ~80 | Utility | ✅ Active |
| | checkModels.js | ~25 | Debug | 🟡 Debug |
| | **Backend Total** | **~355** | | |
| **Frontend** | main.tsx | ~5 | Entry | ✅ Active |
| | pages/Index.tsx | ~150 | Page | ✅ Active |
| | components/Header.tsx | ~20 | Component | ✅ Active |
| | components/ResumeUploader.tsx | ~80 | Component | ✅ Active |
| | components/AnalysisDisplay.tsx | ~180 | Component | ✅ Active |
| | pages/NotFound.tsx | ~10 | Page | 🟡 Unused |
| | App.jsx | ~30 | Component | 🟡 Dead |
| | **Frontend Total** | **~475** | | |
| **Config Files** | Various configs | ~100 | Config | ✅ |
| **TOTAL** | | **~930** | | |

### **Unused/Disabled Code**

- `extractTextFromPDF()` - Entire function disabled (20 LOC)
- `App.jsx` - Entire template unused (30 LOC)
- `NotFound.tsx` - Page never routed (10 LOC)
- **Total Dead Code:** ~60 LOC

---

## 👥 Function Reference Map

### **Backend Functions**

```
Backend/src/controllers/resume.controller.js
├── analyzeResume(req, res)              ✅ Active - POST /api/upload-resume
├── getFeedback(req, res)                ✅ Active - GET /api/feedback/:id
└── downloadFeedback(req, res)           ✅ Active - GET /api/feedback/:id/download

Backend/src/utils/fileExtractor.js
├── extractTextFromPDF(filePath)         ❌ DISABLED
└── extractTextFromDOCX(filePath)        ✅ Active

Backend/src/utils/promptBuilder.js
└── buildAnalysisPrompt(resumeText, jobDescription)  ✅ Active

Backend/src/utils/pdfGenerator.js
└── generatePDFFeedback(feedback)        ✅ Active

Backend/src/middleware/multer.js
├── storage (config object)
└── fileFilter(req, file, cb)

Backend/src/routes/resume.routes.js
└── router configuration

Backend/src/index.js
└── Express app setup

Backend/checkModels.js
└── main()                               🟡 Debug Utility
```

### **Frontend Components**

```
src/pages/Index.tsx
└── Index()
    ├── handleAnalyze(file)
    ├── handleReset()
    └── handleExport()

src/components/Header.tsx
└── Header()

src/components/ResumeUploader.tsx
└── ResumeUploader({ onAnalyze })
    ├── handleFileChange()
    ├── handleDrop()
    ├── handleDragOver()
    └── handleDragLeave()

src/components/AnalysisDisplay.tsx
├── ScoreGauge({ score })
└── AnalysisDisplay({ analysis, onReset, onExport })

src/main.tsx
└── React root setup

src/App.jsx
└── App()                                🟡 Dead Code
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (React/Vite)                                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Index.tsx                                                   │
│    ↓                                                         │
│  User selects file → ResumeUploader.tsx                     │
│    ↓                                                         │
│  handleAnalyze() → FormData + POST request                  │
│    ↓                                                         │
│    │ HTTP POST /api/upload-resume                          │
│    │                                                         │
└────┼─────────────────────────────────────────────────────────┘
     │
     ↓
┌─────────────────────────────────────────────────────────────┐
│ BACKEND (Express.js)                                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  resumeRoutes.js                                            │
│    ↓                                                         │
│  resume.controller.js → analyzeResume()                     │
│    ↓                                                         │
│  multer → File upload to src/uploads/                       │
│    ↓                                                         │
│  fileExtractor.js                                           │
│    ├─ extractTextFromDOCX() [✅ Works]                      │
│    └─ extractTextFromPDF() [❌ Returns empty]               │
│    ↓                                                         │
│  promptBuilder.js → buildAnalysisPrompt()                   │
│    ↓                                                         │
│  Gemini API (Google's servers)                              │
│    ↓                                                         │
│  Parse JSON response → Store in feedbackStore               │
│    ↓                                                         │
│    │ HTTP Response: { feedbackId, analysis }               │
│    │                                                         │
└────┼─────────────────────────────────────────────────────────┘
     │
     ↓
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (React/Vite)                                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  setAnalysis() + setFeedbackId()                            │
│    ↓                                                         │
│  AnalysisDisplay.tsx renders results                        │
│    ├─ Shows resume score (gauge)                           │
│    ├─ Shows ATS score (gauge)                              │
│    ├─ Lists strengths/weaknesses                           │
│    ├─ Shows improvement suggestions                        │
│    ├─ Shows bullet point rewrites                          │
│    └─ Buttons: Reset | Export PDF                          │
│                                                              │
│  User clicks Export → handleExport()                        │
│    ↓                                                         │
│    │ HTTP GET /api/feedback/:id/download                   │
│    │                                                         │
└────┼─────────────────────────────────────────────────────────┘
     │
     ↓
┌─────────────────────────────────────────────────────────────┐
│ BACKEND (Express.js)                                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  downloadFeedback()                                         │
│    ↓                                                         │
│  pdfGenerator.js → generatePDFFeedback()                    │
│    ├─ Create HTML from feedback data                       │
│    ├─ Launch Puppeteer browser                             │
│    ├─ Render HTML to PDF                                   │
│    └─ Return PDF buffer                                    │
│    ↓                                                         │
│    │ HTTP Response: PDF file                               │
│    │                                                         │
└────┼─────────────────────────────────────────────────────────┘
     │
     ↓
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (Browser)                                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Blob → Download PDF file                                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Recommendations for Improvement

### **Priority 1 - Fix Critical Issues** 🔴

1. **Enable PDF Parsing**
   ```javascript
   // Backend/src/utils/fileExtractor.js
   // Uncomment the PDF extraction code and test
   ```
   **Impact:** Users can analyze PDFs
   **Effort:** 10 minutes

2. **Add Database Integration**
   - Replace in-memory `feedbackStore` with MongoDB/PostgreSQL
   - Store feedback with timestamps and user IDs
   - **Impact:** Data persistence, production-ready
   - **Effort:** 4-6 hours

3. **Fix API URL Configuration**
   ```typescript
   // src/pages/Index.tsx
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
   ```
   **Impact:** Works in production
   **Effort:** 15 minutes

### **Priority 2 - Improve Code Quality** 🟠

1. **Convert Backend to TypeScript**
   - Add type safety to controllers and utilities
   - **Impact:** Reduced bugs, better maintainability
   - **Effort:** 8-10 hours

2. **Update Gemini API**
   - `npm update @google/generative-ai`
   - Remove duplicate `@google/genai` package
   - **Impact:** Latest features, bug fixes
   - **Effort:** 30 minutes

3. **Add Input Validation**
   ```javascript
   // Add validation middleware
   const validateResumeUpload = (req, res, next) => {
     if (!req.body.jobDescription) return next();
     if (req.body.jobDescription.length > 10000) {
       return res.status(400).json({ 
         success: false, 
         message: 'Job description too long' 
       });
     }
     next();
   };
   ```
   **Impact:** Better error handling
   **Effort:** 1 hour

### **Priority 3 - Enhance Features** 🟡

1. **Add Authentication**
   - JWT-based auth for user accounts
   - Preserve feedback history per user
   - **Impact:** Multi-user support
   - **Effort:** 6-8 hours

2. **Add Progress Indicators**
   - Show real-time analysis progress
   - Display Gemini API response streaming
   - **Impact:** Better UX for long analyses
   - **Effort:** 4-5 hours

3. **Implement Error Boundaries**
   ```typescript
   // src/components/ErrorBoundary.tsx
   import React from 'react';
   
   export class ErrorBoundary extends React.Component {
     // Error boundary implementation
   }
   ```
   **Impact:** Better error handling in UI
   **Effort:** 2 hours

4. **Clean Up Dead Code**
   - Delete `src/App.jsx` (use main app at Index.tsx)
   - Remove unused shadcn components from imports
   - Delete `package.json` dependencies for removed packages
   - **Impact:** Smaller bundle size, cleaner codebase
   - **Effort:** 30 minutes

---

## 📝 Summary Table

| Component | Location | Status | Functions | Lines |
|-----------|----------|--------|-----------|-------|
| **Backend Controllers** | `Backend/src/controllers/` | ✅ Active | 3 | ~100 |
| **Backend Routes** | `Backend/src/routes/` | ✅ Active | 1 | ~10 |
| **Backend Middleware** | `Backend/src/middleware/` | ✅ Active | 1 | ~30 |
| **Backend Utils** | `Backend/src/utils/` | ⚠️ Partial | 4 | ~60 |
| **Backend Entry** | `Backend/src/index.js` | ✅ Active | 1 | ~50 |
| **Frontend Pages** | `src/pages/` | ⚠️ Partial | 1 | ~150 |
| **Frontend Components** | `src/components/` | ✅ Active | 3 | ~280 |
| **Frontend Entry** | `src/main.tsx` | ✅ Active | 1 | ~5 |
| **Dead Code** | Various | ❌ Unused | 2 | ~50 |
| **Total** | | | **19** | **~735** |

---

## 🔗 Quick Links

- **Backend Entry**: `Backend/src/index.js`
- **API Routes**: `Backend/src/routes/resume.routes.js`
- **Main Controller**: `Backend/src/controllers/resume.controller.js`
- **Frontend Entry**: `src/pages/Index.tsx`
- **UI Components**: `src/components/`
- **Dependencies**: Check `package.json` and `Backend/package.json`

---

## 📞 Environment Configuration

**Required Environment Variables:**

```bash
# Backend/.env
GEMINI_API_KEY=your_api_key_here
PORT=3001
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
NODE_ENV=development

# Frontend/.env (Vite)
VITE_API_URL=http://localhost:3001/api
```

---

**Document Generated:** April 12, 2026  
**Last Updated:** Initial Generation  
**Next Review:** After implementing Priority 1 fixes

