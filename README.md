# SkillPath — Personal Learning Path & Analytics Dashboard

**A modern, production-ready desktop application for students to organize educational resources, track focused study time with a persistent timer, and visualize learning analytics.**

SkillPath is a student-only desktop application built with **Electron, React 19, Node.js, Express.js, Prisma ORM, and SQLite**, with rich data visualization powered by **Recharts**.

---

## 🎯 Key Capabilities & Features

### 1. 📊 Student Dashboard
- **Learning Overview Cards**: Instant insights on total paths, total topics, completed topics, and total focused study minutes.
- **"Continue Learning" Feed**: Jump straight back into in-progress paths with progress meters and quick links to the next incomplete topic.
- **Recent Study Activity**: Persistent log of your latest study sessions recorded by the timer.
- **Quick Actions**: One-click shortcuts to create paths, browse curriculum, or import resources.

### 2. 🗺️ Learning Path Management
- **Full CRUD Support**: Create, customize, edit, and delete structured learning paths.
- **Dynamic Filtering & Search**: Instant client-side search by path title and description, with status filters (*All*, *In Progress*, *Completed*, *Not Started*).
- **Progress Tracking**: Real-time progress bar recalculations based on completed topic records in SQLite.

### 3. 📝 Structured Topic Management
- **Topic Breakdown**: Organize paths into sequential topics with custom descriptions and estimated completion durations (in minutes).
- **Topic Study View**: A dedicated, distraction-free study space for each topic with focus prompts and next/previous topic navigation.
- **Instant Completion Toggle**: Mark topics complete or incomplete with single-click persistence.

### 4. ⏱️ Timestamp-Based Study Timer
- **High-Accuracy Timing**: Uses real timestamps rather than volatile setInterval counters to ensure precision.
- **Lifecycle Controls**: Start, Pause, Resume, and Stop & Save sessions.
- **Crash & Interruption Recovery**: If the application closes unexpectedly, active sessions are automatically detected on next launch with options to Resume, Save, or Discard.
- **Session History**: Completed study durations are logged as persistent `StudySession` records associated with the topic.

### 5. 📚 Educational Resource Management & CSV Import
- **Multi-Type Resources**: Attach Websites, Video Tutorials, PDF references, and Documents to any topic.
- **Safe External Link Handling**: External URLs open securely in the system default browser via Electron's shell API.
- **Bulk CSV Import**: Import resources in bulk with a built-in CSV parser, automatic column validation, duplicate detection, and preview table. Supports downloading a sample CSV template directly from the app.

### 6. 📈 Visual Analytics & Insights (Recharts)
- **Weekly Study Time Chart**: Daily bar chart of focused minutes across the past 7 days.
- **Estimated vs. Actual Duration Chart**: Side-by-side comparison of planned durations versus actual studied minutes.
- **Time by Learning Path**: Distribution of attention across different subjects.
- **Path Completion Summary**: Overall goal attainment percentages calculated dynamically from SQLite.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Desktop Shell** | Electron 45 | Secure desktop runtime with `contextIsolation: true` & custom `preload.js` |
| **Frontend Framework** | React 19 | Responsive component architecture with React Router 7 (`HashRouter`) |
| **Styling** | Custom CSS / Modern Dark Theme | Modern, professional typography, card hierarchy, and responsive spacing |
| **Icons** | Lucide React | Consistent, lightweight vector icons |
| **Charts** | Recharts | Responsive, animated data visualizations |
| **Backend API** | Node.js + Express.js | Modular REST API with centralized error handling |
| **Database** | SQLite | Lightweight local relational database |
| **ORM** | Prisma ORM 6 | Schema modeling, automated migrations, and seed scripts |
| **Desktop Packaging**| electron-builder | Standalone native desktop distribution packaging |

---

## 🏗️ Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   Electron Desktop                      │
│                                                        │
│   ┌────────────────────────────────────────────────┐   │
│   │          React 19 Frontend (Vite)              │   │
│   │   • Dashboard        • Learning Paths          │   │
│   │   • Topic Study      • Study Timer             │   │
│   │   • Analytics        • Resource Library (CSV)  │   │
│   └───────────────────────┬────────────────────────┘   │
│                           │                             │
│                           │ HTTP REST (Port 5001)       │
│                           ▼                             │
│   ┌────────────────────────────────────────────────┐   │
│   │        Express Backend (Node.js)               │   │
│   │   • Routes & Controllers                       │   │
│   │   • Services & Validation                      │   │
│   │   • Centralized Error Middleware               │   │
│   └───────────────────────┬────────────────────────┘   │
│                           │                             │
│                           ▼                             │
│   ┌────────────────────────────────────────────────┐   │
│   │         Prisma Client (ORM)                    │   │
│   └───────────────────────┬────────────────────────┘   │
│                           │                             │
│                           ▼                             │
│   ┌────────────────────────────────────────────────┐   │
│   │         Local SQLite Database (dev.db)         │   │
│   │  (Packaged: Application Support/skillpath.db)   │   │
│   └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 18.x (tested on Node v24)
- **npm** >= 9.x

### 1. Clone the Repository
```bash
git clone https://github.com/YogyeBerry/Desktop-AD-Project.git
cd Desktop-AD-Project
```

### 2. Install Dependencies
Install dependencies for the root workspace, backend, and frontend:
```bash
# Root dependencies (Electron, concurrently, electron-builder)
npm install

# Backend dependencies (Express, Prisma, SQLite, cors, dotenv)
cd backend && npm install && cd ..

# Frontend dependencies (React 19, Vite, Recharts, Lucide)
cd frontend && npm install && cd ..
```

### 3. Initialize Database & Seed Sample Data
```bash
cd backend
npx prisma migrate dev --name init
npm run prisma:seed
cd ..
```

---

## 💻 Running in Development

### Option A: Launch Everything with One Command
```bash
# Starts Express backend and React frontend concurrently
npm run dev

# Or launch Backend, Frontend, and Electron all together:
npm run dev:all
```

### Option B: Run Services Individually
```bash
# Terminal 1 — Backend (Port 5001)
npm run start:backend

# Terminal 2 — Frontend (Port 5173)
npm run start:frontend

# Terminal 3 — Electron Desktop App
npm run electron
```

---

## 📦 Building & Packaging the Desktop Application

The application is configured with `electron-builder` to produce an independent, standalone desktop package that launches its own backend and manages its local database in a writable OS application-data directory.

```bash
# 1. Build frontend and generate Prisma client
npm run build

# 2. Package standalone desktop application (into dist-electron/)
npm run pack

# 3. Create platform installer / distributable
npm run dist
```

Generated outputs appear in:
`dist-electron/mac-arm64/SkillPath.app` (macOS) or corresponding platform targets.

---

## 🔌 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API status and health check |
| `GET` | `/api/paths` | List all learning paths with topics and progress |
| `GET` | `/api/paths/:id` | Get single learning path with topics & sessions |
| `POST` | `/api/paths` | Create a learning path `{ title, description }` |
| `PUT` | `/api/paths/:id` | Update a learning path `{ title, description }` |
| `DELETE` | `/api/paths/:id` | Delete learning path (cascades to topics) |
| `POST` | `/api/paths/:id/topics` | Add topic to path `{ title, description, estimatedDuration }` |
| `PUT` | `/api/topics/:id` | Update topic details |
| `DELETE` | `/api/topics/:id` | Delete topic |
| `PATCH` | `/api/topics/:id/progress` | Update topic completion `{ isCompleted: boolean }` |
| `GET` | `/api/resources` | List all educational resources |
| `POST` | `/api/topics/:id/resources` | Add resource to topic `{ title, type, url, filePath }` |
| `POST` | `/api/resources/import` | Batch import resources from CSV |
| `PUT` | `/api/resources/:id` | Update resource details |
| `DELETE` | `/api/resources/:id` | Delete resource |
| `GET` | `/api/sessions` | List all study sessions across topics |
| `GET` | `/api/topics/:id/sessions` | List study sessions for a specific topic |
| `POST` | `/api/topics/:id/sessions` | Record a completed study session `{ startTime, endTime, durationSeconds }` |
| `GET` | `/api/analytics/summary` | Summary stats (paths, topics, completion %, total study time) |
| `GET` | `/api/analytics/weekly` | Daily study minutes for the past 7 days |
| `GET` | `/api/analytics/paths` | Study duration and completion metrics per path |
| `GET` | `/api/analytics/topics` | Planned estimated vs actual study duration per topic |

---

## 🧪 Testing

Run automated API and database integration tests:
```bash
npm test --prefix backend
```

Test results cover all CRUD operations, foreign key cascades, progress toggling, session logging, and analytics calculations.

---

## 📄 License
ISC License. Built as an open portfolio and college project demonstration.
