# Team Task Manager — Team Task Manager

> A full-stack team task management platform built by **Jay Prakash**

![Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20React%20%7C%20MySQL-5EEAD4?style=flat-square)
![Author](https://img.shields.io/badge/Author-Jay%20Prakash-818CF8?style=flat-square)
![Deploy](https://img.shields.io/badge/Deploy-Railway-00b4d8?style=flat-square)

---

## Features

- **Authentication** — JWT-based signup/login with role selection (Admin / Member)
- **Role-Based Access Control** — Admins manage everything; members see and update their own tasks
- **Project Management** — Create projects, add/remove team members per project
- **Task Management** — Full CRUD with priority, due dates, and assignment
- **Status Tracking** — Kanban-style statuses: Pending → In Progress → Completed
- **Dashboard** — Live stats: total, pending, in progress, completed, overdue tasks
- **Overdue Detection** — Tasks past due date are automatically flagged

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MySQL 8 (via mysql2/promise) |
| Auth | JWT + bcryptjs |
| Deployment | Railway |

---

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your DB credentials and JWT_SECRET in .env
mysql -u root -p < schema.sql
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm run dev
```

---

## Environment Variables

**Backend `.env`**
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=taskmanager
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
PORT=5000
```

**Frontend `.env`**
```
VITE_API_URL=http://localhost:5000/api
```

---

## Deployment (Railway)

1. Push to GitHub
2. Create a new Railway project
3. Add a MySQL plugin — copy the `DATABASE_URL` variables
4. Deploy backend service — set env vars from above
5. Deploy frontend service — set `VITE_API_URL` to backend URL
6. Done ✅

The backend includes `railway.toml` for zero-config Railway deployment.

---

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/signup` | — | Register user |
| POST | `/api/auth/login` | — | Login & get token |
| GET | `/api/auth/me` | ✅ | Get current user |
| GET | `/api/users` | ✅ | List all users |
| GET | `/api/projects` | ✅ | List projects |
| POST | `/api/projects` | Admin | Create project |
| DELETE | `/api/projects/:id` | Admin | Delete project |
| POST | `/api/projects/:id/members` | Admin | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Admin | Remove member |
| GET | `/api/tasks` | ✅ | List tasks |
| POST | `/api/tasks` | Admin | Create task |
| PUT | `/api/tasks/:id` | Admin | Update task |
| PATCH | `/api/tasks/:id/status` | ✅ | Update status |
| DELETE | `/api/tasks/:id` | Admin | Delete task |
| GET | `/api/dashboard` | ✅ | Dashboard stats |

---

## Author

**Jay Prakash**  
Full-Stack Developer  
Built with Node.js, React, and MySQL

---

*© 2025 Jay Prakash. All rights reserved.*
