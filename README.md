# MERN Task Manager

A fullstack cloud-based task management application for teams, built with the MERN stack (MongoDB, Express, React, Node.js).

---

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Backend API Summary](#backend-api-summary)
- [Frontend Structure](#frontend-structure)
- [Setup Instructions](#setup-instructions)
- [Usage](#usage)
- [Notes](#notes)

---

## Project Overview
This application streamlines team task management, allowing admins to assign, track, and manage tasks, while users can view, update, and complete their assigned tasks. The platform supports authentication, notifications, subtasks, and role-based access control.

---

## Features
### Backend
- User authentication (register, login, logout, JWT, protected/admin routes)
- User management (profile, password, notifications, team list, admin controls)
- Task management (CRUD, assign to users, subtasks, activities, priorities, dashboard stats)
- Notification system for task events

### Frontend
- Authentication (login, register, logout, protected routes)
- Dashboard with task summary and statistics
- Task board (view, create, update, delete, assign, subtask, mark complete)
- Team/user management (admin only)
- Notifications panel
- Responsive sidebar and navigation
- State persistence via localStorage

---

## Tech Stack
- **Frontend:** React (Vite), Redux Toolkit (RTK Query), Tailwind CSS, Headless UI, React Router
- **Backend:** Node.js, Express, MongoDB (Mongoose)

---

## Project Structure
```
MERN_TM/
  ├── client/           # Frontend React app
  │   ├── src/
  │   │   ├── components/    # Reusable UI components (some may be unused)
  │   │   ├── components/tasks/ # Task-specific components
  │   │   ├── pages/         # Main app pages
  │   │   ├── redux/         # Redux slices and store
  │   │   └── utils/         # Constants, dummy data, helpers
  ├── server/           # Backend Node/Express app
  │   ├── controllers/  # Route controllers (user, task)
  │   ├── models/       # Mongoose models (user, task, notis)
  │   ├── routes/       # API routes (user, task)
  │   ├── middleware/   # Express middleware (auth, error)
  │   ├── utils/        # DB connection, JWT helper
  │   └── scripts/      # Helper scripts
  └── README.md         # Project documentation
```

---

## Backend API Summary
### User Endpoints (`/api/user`)
- `POST /register` — Register a new user
- `POST /login` — User login
- `POST /logout` — User logout
- `GET /get-team` — Get team/user list (protected)
- `GET /notifications` — Get notifications (protected)
- `GET /get-status` — Get user task status (admin only)
- `PUT /profile` — Update user profile (protected)
- `PUT /read-noti` — Mark notification as read (protected)
- `PUT /change-password` — Change user password (protected)
- `PUT /:id` — Activate user profile (admin only)
- `DELETE /:id` — Delete user profile (admin only)

### Task Endpoints (`/api/task`)
- `POST /create` — Create a new task (protected)
- `POST /duplicate/:id` — Duplicate a task (admin only)
- `POST /activity/:id` — Post activity to a task (protected)
- `GET /dashboard` — Get dashboard statistics (protected)
- `GET /` — Get all tasks (protected)
- `GET /:id` — Get a single task (protected)
- `PUT /create-subtask/:id` — Create a subtask (admin only)
- `PUT /update/:id` — Update a task (protected)
- `PUT /change-stage/:id` — Change task stage (protected)
- `PUT /change-status/:taskId/:subTaskId` — Update subtask stage (protected)
- `PUT /:id` — Trash a task (protected)
- `PUT /:id/mark-completed` — Mark task as completed (protected)
- `DELETE /delete-restore/:id?` — Delete or restore a task (protected)

---

## Frontend Structure
- **Pages:** Dashboard, Login, Register, Tasks, TaskDetail, Trash, Users, Status
- **Components:** Navbar, Sidebar, Table, Modal, NotificationPanel, etc.
- **Task Components:** TaskCard, AddTask, BoardView, AddSubTask, etc.
- **Redux:** Auth state, API slices for user/task/auth endpoints
- **Utilities:** Constants, dummy data, helpers

---

## Setup Instructions
### Prerequisites
- Node.js (v16+ recommended)
- MongoDB (Atlas or local)

### Backend Setup
1. `cd server`
2. Create a `.env` file with:
   ```
   MONGODB_URI=your_mongodb_url
   JWT_SECRET=your_jwt_secret
   PORT=8800
   NODE_ENV=development
   ```
3. `npm install`
4. `npm start`

### Frontend Setup
1. `cd client`
2. Create a `.env` file with:
   ```
   VITE_APP_BASE_URL=http://localhost:8800
   VITE_APP_FIREBASE_API_KEY=your_firebase_api_key
   ```
3. `npm install`
4. `npm start`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

---

## Usage
- Register or log in as a user or admin
- Admins can manage users and assign tasks
- Users can view, update, and comment on tasks
- Use the dashboard to track progress and manage workflow

---

## Notes
- **Some components, pages, or files may be unused or partially implemented due to time constraints.**
- The codebase is organized for clarity and extensibility, and can be further customized for your needs.