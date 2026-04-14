# 🎯 drafted.jobs — Autonomous AI Job Scouting Platform

> An industrial-grade, AI-powered job hunting platform that autonomously scouts job boards, scores opportunities against your resume using LLMs, and delivers precision-matched leads directly to your dashboard — all wrapped in a native desktop experience.

---

## 🧠 What Problem Does It Solve?

Job hunting is broken. You spend hours manually scrolling through LinkedIn, Indeed, Naukri, and Glassdoor — only to find roles that are either irrelevant, expired, or require experience you don't have. Most candidates apply blindly and never hear back.

**drafted.jobs** solves this by:

- **Automating discovery** — A Playwright-powered browser agent autonomously scrapes 7+ job platforms simultaneously, so you don't have to.
- **Scoring with AI** — Every discovered job is scored against your resume using NVIDIA NIM LLMs (e.g., `meta/llama-3.1-70b-instruct`). Only high-match roles (>50%) land in your vault.
- **Eliminating noise** — The AI enforces strict scoring rules: wrong tech stack? Capped at 50%. Seniority mismatch? Capped at 30%. No false positives.
- **Centralizing tracking** — A Kanban board lets you track every application from "Spotted" to "Offer".
- **Forging resumes** — A built-in Resume Forge lets you tailor your resume to each role with AI assistance, then export as PDF.

---

## 🏗️ Architecture

```
drafted.jobs/
├── frontend/              # Next.js 16 + Electron desktop shell
│   ├── app/
│   │   ├── (dashboard)/   # All protected app routes
│   │   │   ├── page.tsx          # Draft Deck (Main dashboard)
│   │   │   ├── board/            # Kanban application tracker
│   │   │   ├── vault/            # Job intelligence vault
│   │   │   ├── resume-forge/     # AI resume builder
│   │   │   ├── logs/             # Live scout mission logs
│   │   │   ├── connect/          # Platform connection setup
│   │   │   ├── connections/      # Manage connected accounts
│   │   │   ├── drafting/         # Scout mission control
│   │   │   ├── profile/          # User profile & skill config
│   │   │   └── settings/         # App settings
│   │   ├── login/                # Auth pages
│   │   └── register/
│   ├── components/        # Reusable UI components (shadcn/ui base)
│   ├── lib/
│   │   └── redux/         # Global state (jobs, pipeline, profile)
│   ├── hooks/             # Custom React hooks
│   └── electron/
│       ├── main.js        # Electron main process + IPC handlers
│       └── preload.js     # Secure context bridge
│
├── backend/               # FastAPI Python backend
│   └── app/
│       ├── core/          # Config, DB, security, Redis, WebSockets
│       └── modules/
│           ├── user/      # Auth, JWT, user management
│           ├── job/       # Job model, repository, CRUD
│           ├── browser/   # Scout engine (Playwright + AI scoring)
│           ├── pipeline/  # Mission orchestration (SSE streaming)
│           ├── resume/    # Resume CRUD, PDF parsing
│           ├── ai/        # Tactical recommendations via LLM
│           └── notification/ # Alert engine
│
```

---

## ⚙️ Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Desktop Shell | Electron 41 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui + Radix UI |
| State Management | Redux Toolkit + React Redux |
| Animations | Framer Motion |
| Charts | Recharts |
| PDF Export | `@react-pdf/renderer`, `html2pdf.js` |
| Drag & Drop | `@dnd-kit`, `@hello-pangea/dnd` |
| Forms | React Hook Form + Zod |
| Packaging | Electron Builder (NSIS for Windows) |

### Backend
| Layer | Technology |
|---|---|
| Framework | FastAPI 0.109 |
| Language | Python 3.x |
| ORM | SQLAlchemy 2.0 + Alembic |
| Database | PostgreSQL (prod) / SQLite (dev) |
| Browser Automation | Playwright 1.41 |
| AI / LLM | NVIDIA NIM API (OpenAI-compatible) |
| Auth | JWT via python-jose + bcrypt |
| Real-time | SSE (Server-Sent Events) + WebSockets |
| Caching | Redis |
| Parsing | PyPDF, python-docx, BeautifulSoup4 |

---

## 🕵️ The Scout Engine

The core of the platform lives in `backend/app/modules/browser/scout.py` — a `JobScoutService` class powered by Playwright.

**How a scout mission works:**

1. **Intent Distillation** — The user's role + skills are sent to the LLM to generate a surgical search query (e.g., `"Full Stack Developer NodeJS React TypeScript MongoDB"`).
2. **Multi-Platform Sweep** — The agent navigates to configured job boards (LinkedIn, Indeed, Naukri, Foundit, Glassdoor, AmbitionBox, Google Jobs) using the user's existing Chrome profile (via remote debugging on port `9223`).
3. **Card Extraction** — Job cards are scraped using platform-specific CSS selectors and JavaScript evaluation.
4. **Deep Detail Drill** — For each card, the agent clicks to open the job detail panel/popup and extracts the full job description (up to 15,000 characters).
5. **AI Scoring** — Each job is scored 0–100 against the candidate's resume using the NVIDIA NIM LLM with strict invariants:
   - Wrong primary stack → capped at 50%
   - Senior role for junior candidate → capped at 30%
   - Score < 40 → automatically skipped
6. **Vault Storage** — Qualifying jobs are saved to the database with score, reason, tech stack, and salary estimate.
7. **Live Streaming** — All events are streamed to the frontend in real-time via **Server-Sent Events (SSE)**, displayed in the Logs page.

**Supported Platforms:**

| Platform | Search Strategy |
|---|---|
| LinkedIn | Last 24h filter, side-panel JD extraction |
| Indeed | `fromage=1` (fresh), modal-based JD |
| Naukri | Slug-based URL, popup tab JD |
| Foundit | Experience-range filtering |
| Glassdoor | Keyword + city search |
| AmbitionBox | Tag-based query |
| Google Jobs | `ibp=htl;jobs` widget, AI link analysis |

---

## 🖥️ Key Features

| Feature | Description |
|---|---|
| **Draft Deck** | Central command dashboard with metrics, activity chart, AI recommendations |
| **Scout Mission** | Launch multi-platform autonomous job search with live SSE log feed |
| **Job Vault** | Filterable, sortable database of all AI-scored job leads |
| **Kanban Board** | Track applications through: Spotted → Applied → Interview → Offer → Rejected |
| **Resume Forge** | Edit, tailor, and export resume as PDF with live preview |
| **Platform Connect** | Link job board profiles via guided browser session |
| **Neural Lockout** | During active missions, a full-page overlay prevents browser interference |
| **Visual Pulse** | Green ripple animations highlight each element the AI is scanning |
| **Mission Continuity** | Interrupted/hijacked sessions resume from the exact platform & page |
| **Native Notifications** | Electron system notifications when high-match jobs are found |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Python 3.10+
- Google Chrome installed
- PostgreSQL (or SQLite for dev)
- NVIDIA NIM API Key (optional — falls back to keyword scoring)
- Redis (optional — for caching)

### 1. Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
source .venv/bin/activate        # Linux/Mac

pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Set: DATABASE_URL, SECRET_KEY, NVIDIA_API_KEY, MODEL_NAME

uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
```

### 2. Frontend (Web Dev)

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

### 3. Frontend + Electron (Desktop Dev)

```bash
cd frontend
npm run edev
# Launches Next.js dev server AND Electron window simultaneously
```

### 4. Production Build (Windows Desktop App)

```bash
cd frontend
npm run dist
# Output: dist/DraftedJobs Setup *.exe
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql://user:pass@localhost/drafted_jobs
SECRET_KEY=your-super-secret-jwt-key
NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxxxxx
MODEL_NAME=meta/llama-3.1-70b-instruct
```

### Frontend (`frontend/.env`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 📡 API Overview

All endpoints are prefixed with `/api/v1/`.

| Router | Prefix | Responsibility |
|---|---|---|
| `user` | `/api/v1/user` | Registration, login, JWT auth |
| `jobs` | `/api/v1/jobs` | CRUD for job leads, vault queries |
| `browser` | `/api/v1/browser` | Scout session control, live SSE stream |
| `pipeline` | `/api/v1/pipeline` | Mission orchestration state |
| `resume` | `/api/v1/resume` | Resume fetch, update, PDF generation |
| `ai` | `/api/v1/ai` | Tactical recommendations |
| `notification` | `/api/v1/notification` | Alert management |

---

## 🔒 Security

- **JWT Authentication** — HTTP-only cookies managed natively by Electron's session layer for seamless auth across IPC boundaries.
- **Context Isolation** — Electron's `contextIsolation: true` with a secure `preload.js` bridge; no `nodeIntegration`.
- **CORS** — Locked to `localhost:3000` and the `app://mission` custom protocol.
- **Password Hashing** — bcrypt via `passlib`.

---

## 📦 Desktop Distribution

The app is distributed as a native installer using **Electron Builder**:

| Platform | Format |
|---|---|
| Windows | NSIS Installer (`.exe`) — x64 |
| Linux | `.tar.gz`, `.deb` |
| macOS | `.dmg`, `.zip` |

The Electron shell registers a custom `app://` protocol to serve the static Next.js export, with intelligent SPA fallback routing.

---

## 📁 Database Models

| Model | Purpose |
|---|---|
| `User` | User account, credentials, profile |
| `Job` | Discovered job lead with AI score, status |
| `Resume` | User resume content (structured JSON) |
| `ScoutSession` | Active/completed scout mission state |
| `AiRecommendation` | Tactical LLM suggestions |
| `Notification` | System alert records |

---

## 🤝 Contributing

This is a private mission-critical project. Contact the team at [team@drafted.jobs](mailto:team@drafted.jobs) before submitting changes.

---

## 📄 License

Copyright © 2024 Drafted Jobs. All rights reserved.
