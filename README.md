# SkillPath — Learning Path & Analytics Dashboard

**A desktop application for organizing learning resources, tracking study progress, and analyzing skill development.**

SkillPath is a desktop learning management application that helps students follow structured learning paths, organize educational resources, and monitor their learning progress. Instructors can create learning paths, divide them into topics, attach learning materials, and review student progress.

Built with React, Electron, Node.js, Express.js, SQLite, and Prisma, SkillPath aims to provide a simple, organized, and reliable learning experience through a desktop application.

## 🎯 Problem Statement

Students often rely on multiple platforms and scattered resources to learn a skill. Organizing study materials, following a structured learning plan, tracking time spent on topics, and measuring overall progress can be challenging.

SkillPath addresses this problem by providing a centralized dashboard for learning resources, structured topics, study-time tracking, and learning analytics.

## ✨ Features

### 1. Student Dashboard
- View available learning paths.
- Track overall learning progress.
- See completed and pending topics.
- View total study time.
- Access learning materials from a centralized dashboard.

### 2. Learning Path Management
- Create, edit, and delete learning paths.
- Divide learning paths into individual topics.
- Assign estimated durations to topics.
- Attach PDFs, documents, videos, and external links.
- Mark topics as completed.

### 3. Study Time Tracking
- Start, pause, and resume a study timer.
- Track time spent on individual topics.
- Save study sessions to the local database.
- Display total study time for each learning path.

### 4. Learning Analytics
- Display learning progress as percentages.
- Compare completed and pending topics.
- Visualize time spent on different topics.
- Show total learning time for each learning path.

### 5. Instructor Dashboard
- Create and manage learning paths.
- Add topics, estimated durations, and resources.
- View student progress summaries.
- Review topic completion and study-time statistics.

### 6. Resource Import
- Import learning-resource or publication records from CSV files.
- Organize imported resources and associate them with learning topics.

CSV import will be implemented first. Direct Excel and BibTeX import can be added as future improvements if time permits.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | Build the user interface |
| JavaScript | Frontend and backend programming |
| Electron | Build the desktop application |
| Node.js | Run the backend |
| Express.js | Build REST APIs |
| SQLite | Local relational database |
| Prisma ORM | Database models, queries, and migrations |
| Vite | Frontend development and build tooling |
| Tailwind CSS | Interface styling |
| Recharts | Learning analytics and charts, if needed |

## 🏗️ Application Architecture

SkillPath uses a layered architecture in which the frontend communicates with the backend through REST APIs.

```text
┌──────────────────────────────┐
│       Electron Desktop       │
│                              │
│        React + Vite          │
│       User Interface         │
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
│           SQLite             │
│      Local Data Storage      │
└──────────────────────────────┘
```

- **Electron** provides the desktop window and application lifecycle.
- **React** renders the user interface.
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

The initial database will include these core models:

| Model | Responsibility |
|---|---|
| User | Store basic user details and role |
| LearningPath | Store learning-path information |
| Topic | Store topics and estimated durations |
| Resource | Store resource types, titles, and paths or URLs |
| Progress | Track learner completion status |
| StudySession | Record time spent studying |

Prisma will define the relationships between these models and manage database queries and migrations.

SQLite is selected to keep setup simple and allow the application to work locally without requiring a separate database server.

## 🔌 Planned REST API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/paths` | Retrieve learning paths |
| POST | `/api/paths` | Create a learning path |
| GET | `/api/paths/:id` | Retrieve a path and its topics |
| PUT | `/api/paths/:id` | Update a learning path |
| DELETE | `/api/paths/:id` | Delete a learning path |
| POST | `/api/paths/:id/topics` | Add a topic |
| PUT | `/api/topics/:id` | Update a topic |
| PATCH | `/api/topics/:id/progress` | Update topic completion |
| POST | `/api/topics/:id/sessions` | Save a study session |
| GET | `/api/analytics/summary` | Retrieve learning analytics |

These endpoints represent the planned API design and may be adjusted during development.

## 🚀 Development Roadmap

### Phase 1 — Setup
- Set up React and Vite.
- Configure Electron to open the application window.
- Create the Express server.
- Test the frontend-to-backend connection.

### Phase 2 — Database and Backend
- Configure Prisma with SQLite.
- Define database models and relationships.
- Implement CRUD operations for learning paths and topics.
- Test REST APIs using Postman.

### Phase 3 — Frontend
- Build the student dashboard.
- Create learning-path and topic pages.
- Add resource links and document access.
- Connect the interface to the backend.

### Phase 4 — Progress Tracking
- Implement topic completion.
- Build the study timer.
- Save study sessions in SQLite.
- Calculate learning-path completion percentages.

### Phase 5 — Analytics and Instructor Features
- Build progress charts.
- Display study time by topic.
- Add instructor controls.
- Show student progress summaries.

### Phase 6 — Import and Packaging
- Implement CSV resource import.
- Test input validation and database persistence.
- Package the desktop application using Electron.
- Verify that saved data persists across application restarts.

## 🔒 Security and Reliability

- Enable Electron's `contextIsolation`.
- Disable `nodeIntegration` in the renderer.
- Use a controlled preload script for any required desktop capabilities.
- Validate API inputs on the backend.
- Handle invalid requests and database errors.
- Restrict the local Express server to localhost.
- Store the packaged application's SQLite database in a writable application-data directory.
- Manage the backend process through Electron's application lifecycle.

## 📦 Running the Project

During development, the React frontend, Express backend, and Electron desktop window will run together through the configured development scripts.

The exact installation and run commands will be documented after the project setup is complete.

The packaged application will launch its desktop interface and manage the local backend and database as part of the application workflow.

## 🌱 Future Improvements

- Import BibTeX publication records.
- Support direct Excel file import.
- Add search and filtering for learning resources.
- Introduce learning-path prerequisites and milestones.
- Export learning-progress reports.
- Add optional data synchronization in a future version.

## 🎓 Learning Outcomes

This project demonstrates practical experience with:

- Desktop application development using Electron.
- Frontend development with React and JavaScript.
- REST API development using Node.js and Express.js.
- Relational database design using SQL and SQLite.
- Database modeling and migrations using Prisma ORM.
- Data visualization and progress analytics.
- Application architecture, validation, and error handling.

## 👨‍💻 Project Status

**Status:** In Development

SkillPath is being developed as a college project focused on building a practical desktop learning application with a manageable scope, persistent data storage, useful analytics, and potential for future expansion.
