# SkillPath — Personal Learning Path & Analytics Dashboard

**A desktop application to organize learning resources, track study time, and visualize personal learning progress.**

SkillPath is a student-focused desktop application that helps learners create structured learning paths, organize educational resources, track study sessions, and monitor their progress.

Built using React, Electron, Node.js, Express.js, SQLite, and Prisma, SkillPath provides a centralized workspace for managing personal learning goals and understanding how time is spent across different topics.

## 🎯 Problem Statement

Students often use multiple platforms and scattered resources to learn new skills. Organizing materials, following a structured plan, tracking time spent on individual topics, and measuring progress can be challenging.

SkillPath addresses this problem by providing a single desktop application where students can create learning paths, access learning materials, record study sessions, and view learning analytics.

## ✨ Features

### 1. Student Dashboard
- View all personal learning paths.
- See overall learning progress.
- Track total study time.
- View recently studied topics.
- Identify completed and pending topics.

### 2. Learning Path Management
- Create, edit, and delete personal learning paths.
- Add topics to each learning path.
- Set estimated completion times for topics.
- Organize learning resources under relevant topics.
- Track completion status for individual topics.

### 3. Learning Resource Management
- Attach links to educational videos and websites.
- Store references to PDFs and documents.
- Open learning materials from the relevant topic.
- Keep learning resources organized by learning path.

### 4. Study Time Tracking
- Start, pause, and resume a study timer.
- Track time spent on individual topics.
- Save study sessions to the local database.
- View total study time for each topic and learning path.

### 5. Learning Analytics
- Display completion percentages for learning paths.
- Compare completed and pending topics.
- Visualize time spent on different topics.
- View total learning time.
- Compare actual study time with estimated topic duration.

### 6. Resource Import
- Import learning-resource records from CSV files.
- Organize imported resources and associate them with relevant topics.

CSV import will be implemented after the core application works. Direct Excel and BibTeX support may be added later if time permits.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | Build the user interface |
| JavaScript | Frontend and backend programming |
| Electron | Build the desktop application |
| Node.js | Run the backend |
| Express.js | Create REST API endpoints |
| SQLite | Store application data locally |
| Prisma ORM | Define database models and execute queries |
| Vite | Frontend development and build tooling |
| Tailwind CSS | Style the interface |
| Recharts | Display analytics charts, if needed |

## 🏗️ Application Architecture

SkillPath follows a layered architecture that separates the desktop interface, backend API, and database.

```text
┌──────────────────────────────┐
│       Electron Desktop       │
│                              │
│         React + Vite         │
│       Student Interface      │
└──────────────┬───────────────┘
               │
               │ HTTP / REST API
               ▼
┌──────────────────────────────┐
│       Node.js + Express      │
│                              │
│          API Routes          │
│         Controllers          │
│         Business Logic       │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│          Prisma ORM          │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│            SQLite            │
│       Local Data Storage     │
└──────────────────────────────┘
```

- **Electron** provides the desktop window and application lifecycle.
- **React** renders the student interface.
- **Express.js** handles API requests and application logic.
- **Prisma** manages database operations.
- **SQLite** stores learning paths, topics, resources, progress, and study sessions.

## 📂 Project Structure

```text
skillpath/
├── electron/
│   ├── main.js
│   └── preload.js
│
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── hooks/
│       ├── App.jsx
│       ├── App.css
│       └── main.jsx
│
├── server/
│   ├── package.json
│   └── src/
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       ├── middleware/
│       └── app.js
│
├── prisma/
│   └── schema.prisma
│
├── package.json
└── README.md
```

All application code will use JavaScript with `.js` and `.jsx` extensions. No TypeScript or `.cjs` files are required.

## 🗃️ Database Design

The initial database will include the following core models:

| Model | Responsibility |
|---|---|
| LearningPath | Stores personal learning paths and descriptions |
| Topic | Stores topics, estimated durations, and learning-path relationships |
| Resource | Stores resource titles, types, and file paths or URLs |
| Progress | Tracks topic completion status |
| StudySession | Records study sessions and elapsed time |

Prisma will define relationships between these models and handle database queries and migrations.

SQLite is selected to keep setup simple and allow the application to work locally without a separate database server.

## 🔌 Planned REST API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/paths` | Retrieve all learning paths |
| POST | `/api/paths` | Create a learning path |
| GET | `/api/paths/:id` | Retrieve a path and its topics |
| PUT | `/api/paths/:id` | Update a learning path |
| DELETE | `/api/paths/:id` | Delete a learning path |
| POST | `/api/paths/:id/topics` | Add a topic |
| PUT | `/api/topics/:id` | Update a topic |
| DELETE | `/api/topics/:id` | Delete a topic |
| PATCH | `/api/topics/:id/progress` | Update topic completion |
| POST | `/api/topics/:id/resources` | Add a learning resource |
| POST | `/api/topics/:id/sessions` | Save a study session |
| GET | `/api/analytics/summary` | Retrieve learning analytics |

These endpoints describe the planned API and may change during implementation.

## 🚀 Development Roadmap

### Phase 1 — Project Setup
- Set up React and Vite.
- Configure Electron to open the application window.
- Set up the Express backend.
- Test communication between the frontend and backend.

### Phase 2 — Database and Backend
- Configure Prisma with SQLite.
- Define database models and relationships.
- Implement CRUD operations for learning paths and topics.
- Test REST APIs using Postman.

### Phase 3 — Student Interface
- Build the dashboard.
- Create learning-path and topic pages.
- Add forms for creating and editing learning paths.
- Add resource management and document links.
- Connect the interface to the Express API.

### Phase 4 — Progress Tracking
- Implement topic completion.
- Build the study timer.
- Save study sessions in SQLite.
- Calculate learning-path completion percentages.

### Phase 5 — Analytics
- Build simple progress charts.
- Display study time by topic.
- Compare estimated durations with actual study time.
- Add dashboard summaries.

### Phase 6 — Import and Packaging
- Implement CSV resource import.
- Test input validation and persistent storage.
- Package the application using Electron.
- Verify that data remains available after restarting the packaged application.

## 🔒 Security and Reliability

- Enable Electron's `contextIsolation`.
- Disable `nodeIntegration` in the renderer.
- Use a controlled preload script for required desktop capabilities.
- Validate incoming API requests.
- Handle invalid inputs and database errors.
- Restrict the local Express server to localhost.
- Store the packaged application's SQLite database in a writable application-data directory.
- Manage the backend process through Electron's application lifecycle.

## 📦 Running the Project

During development, the React frontend, Express backend, and Electron desktop window will run together through configured development scripts.

Installation and execution commands will be documented after the project configuration is complete.

The packaged application will launch its desktop interface, manage the local backend, and preserve learning data between sessions.

## 🌱 Future Improvements

- Import Excel spreadsheets and BibTeX publication records.
- Add resource search and filtering.
- Introduce learning-path prerequisites and milestones.
- Export personal learning-progress reports.
- Add optional cloud synchronization.
- Introduce a teacher dashboard in a future version if required.

## 🎓 Learning Outcomes

This project demonstrates practical experience with:

- Desktop application development using Electron.
- Frontend development with React and JavaScript.
- REST API development using Node.js and Express.js.
- Relational database design using SQL and SQLite.
- Database modeling and migrations using Prisma ORM.
- Data visualization and learning analytics.
- Application architecture, input validation, and error handling.

## 👨‍💻 Project Status

**Status:** In Development

SkillPath is being developed as a student-focused desktop learning application with personal learning-path management, persistent study-time tracking, and progress analytics.
